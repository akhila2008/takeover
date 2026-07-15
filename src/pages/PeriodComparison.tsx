import React, { useState, useMemo } from 'react';
import { GitCompare, DollarSign, Activity, TrendingUp, ShieldAlert } from 'lucide-react';
import { useBusinessData } from '../context/BusinessDataContext';
import { generateIntelligenceContext } from '../lib/IntelligenceEngine';
import { Dropdown } from '../components/ui/Dropdown';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip as RechartsTooltip, Legend } from 'recharts';
import styles from './PeriodComparison.module.css';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const nowIST = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
const currentYear = nowIST.getFullYear();
const currentMonthIndex = nowIST.getMonth();
const YEARS = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => 2020 + i);

export const PeriodComparison: React.FC = () => {
  const { documents } = useBusinessData();
  
  // Period A (default to current month)
  const [monthA, setMonthA] = useState(nowIST.toLocaleString('default', { month: 'long' }));
  const [yearA, setYearA] = useState(currentYear);
  
  // Period B (default to previous month)
  const defaultPrevMonthIdx = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
  const defaultPrevYear = currentMonthIndex === 0 ? currentYear - 1 : currentYear;
  const [monthB, setMonthB] = useState(MONTHS[defaultPrevMonthIdx]);
  const [yearB, setYearB] = useState(defaultPrevYear);

  const analyzedDocs = useMemo(() => documents.filter(d => d.status === 'analyzed'), [documents]);

  const contextA = useMemo(() => {
    return generateIntelligenceContext(analyzedDocs, analyzedDocs, monthA, yearA);
  }, [analyzedDocs, monthA, yearA]);

  const contextB = useMemo(() => {
    return generateIntelligenceContext(analyzedDocs, analyzedDocs, monthB, yearB);
  }, [analyzedDocs, monthB, yearB]);

  const radarData = useMemo(() => {
    if (!contextA || !contextB) return [];
    return [
      { subject: 'Financial', A: contextA.financialScore, B: contextB.financialScore, fullMark: 100 },
      { subject: 'Inventory', A: contextA.inventoryScore, B: contextB.inventoryScore, fullMark: 100 },
      { subject: 'Customer', A: contextA.customerScore, B: contextB.customerScore, fullMark: 100 },
      { subject: 'Growth', A: contextA.growthScore, B: contextB.growthScore, fullMark: 100 },
      { subject: 'Operations', A: contextA.operationsScore, B: contextB.operationsScore, fullMark: 100 },
    ];
  }, [contextA, contextB]);

  const formatCurrency = (val: number) => `₹${val.toLocaleString()}`;

  if (!contextA || !contextB) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <GitCompare size={32} className={styles.headerIcon} />
          <div>
            <h1>Period Comparison</h1>
            <p>Upload documents to enable comparison metrics.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <GitCompare size={32} className={styles.headerIcon} />
        <div>
          <h1>Period Comparison</h1>
          <p>Side-by-side analysis of business performance across two distinct periods.</p>
        </div>
      </div>

      <div className={styles.selectors}>
        <div className={styles.periodSelector}>
          <label>Period A (Baseline)</label>
          <div className={styles.selectGroup}>
            <Dropdown 
              value={monthA} 
              onChange={val => setMonthA(val as string)}
              options={MONTHS.map((m, index) => {
                const isFutureMonth = yearA === currentYear && index > currentMonthIndex;
                return isFutureMonth ? null : { value: m, label: m };
              }).filter(Boolean) as { value: string, label: string }[]}
            />
            <Dropdown 
              value={yearA} 
              onChange={val => setYearA(val as number)}
              options={YEARS.map(y => ({ value: y, label: y.toString() }))}
            />
          </div>
        </div>
        
        <div className={styles.vsDivider}>VS</div>
        
        <div className={styles.periodSelector}>
          <label>Period B (Comparison)</label>
          <div className={styles.selectGroup}>
            <Dropdown 
              value={monthB} 
              onChange={val => setMonthB(val as string)}
              options={MONTHS.map((m, index) => {
                const isFutureMonth = yearB === currentYear && index > currentMonthIndex;
                return isFutureMonth ? null : { value: m, label: m };
              }).filter(Boolean) as { value: string, label: string }[]}
            />
            <Dropdown 
              value={yearB} 
              onChange={val => setYearB(val as number)}
              options={YEARS.map(y => ({ value: y, label: y.toString() }))}
            />
          </div>
        </div>
      </div>

      <div className={styles.comparisonGrid}>
        {/* Column A */}
        <div className={styles.comparisonColumn}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <DollarSign size={20} className={styles.cardIcon} />
              <h3 className={styles.cardTitle}>Revenue ({monthA} {yearA})</h3>
            </div>
            <div className={styles.metricValue}>{formatCurrency(contextA.revenue)}</div>
            <div className={styles.metricLabel}>Profit Margin: {contextA.profitMargin}%</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Activity size={20} className={styles.cardIcon} />
              <h3 className={styles.cardTitle}>Health Score ({monthA} {yearA})</h3>
            </div>
            <div className={styles.metricValue}>{contextA.healthScore}/100</div>
            <div className={styles.metricLabel}>Grade: {contextA.grade}</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <TrendingUp size={20} className={styles.cardIcon} />
              <h3 className={styles.cardTitle}>Cash Flow ({monthA} {yearA})</h3>
            </div>
            <div className={styles.metricValue}>{formatCurrency(contextA.cashFlow)}</div>
            <div className={styles.metricLabel}>Operating Expenses: {formatCurrency(contextA.expenses)}</div>
          </div>
        </div>

        {/* Column B */}
        <div className={styles.comparisonColumn}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <DollarSign size={20} className={styles.cardIcon} />
              <h3 className={styles.cardTitle}>Revenue ({monthB} {yearB})</h3>
            </div>
            <div className={styles.metricValue}>{formatCurrency(contextB.revenue)}</div>
            <div className={styles.metricLabel}>
              Profit Margin: {contextB.profitMargin}% 
              ({(contextB.profitMargin - contextA.profitMargin) > 0 ? '+' : ''}{(contextB.profitMargin - contextA.profitMargin).toFixed(1)}% vs A)
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Activity size={20} className={styles.cardIcon} />
              <h3 className={styles.cardTitle}>Health Score ({monthB} {yearB})</h3>
            </div>
            <div className={styles.metricValue}>{contextB.healthScore}/100</div>
            <div className={styles.metricLabel}>
              Grade: {contextB.grade} 
              ({(contextB.healthScore - contextA.healthScore) > 0 ? '+' : ''}{contextB.healthScore - contextA.healthScore} pts vs A)
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <TrendingUp size={20} className={styles.cardIcon} />
              <h3 className={styles.cardTitle}>Cash Flow ({monthB} {yearB})</h3>
            </div>
            <div className={styles.metricValue}>{formatCurrency(contextB.cashFlow)}</div>
            <div className={styles.metricLabel}>
              Operating Expenses: {formatCurrency(contextB.expenses)}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <h3>KPI Profile Comparison</h3>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280' }} />
            <Radar name={`Period A (${monthA} ${yearA})`} dataKey="A" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.4} />
            <Radar name={`Period B (${monthB} ${yearB})`} dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
            <RechartsTooltip 
              contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
