import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, IndianRupee, Users, Square, Play, TrendingUp } from 'lucide-react';
import styles from './ExecutiveBriefing.module.css';
import { useBusinessData } from '../context/BusinessDataContext';

// Import all charts
import { RevenueTrendChart } from '../components/charts/RevenueTrendChart';
import { ProfitExpenseChart } from '../components/charts/ProfitExpenseChart';
import { SalesGrowthChart } from '../components/charts/SalesGrowthChart';
import { InventoryStatusChart } from '../components/charts/InventoryStatusChart';
import { CustomerAcquisitionChart } from '../components/charts/CustomerAcquisitionChart';
import { BusinessHealthGauge } from '../components/charts/BusinessHealthGauge';
import { RevenueSourcesChart } from '../components/charts/RevenueSourcesChart';
import { TopProductsChart } from '../components/charts/TopProductsChart';
import { CashFlowChart } from '../components/charts/CashFlowChart';
import { ForecastChart } from '../components/charts/ForecastChart';

interface Props {
  onNavigate?: (page: string) => void;
}

export const ExecutiveBriefing: React.FC<Props> = ({ onNavigate }) => {
  const { 
    totalRevenue, cashFlow, activeCustomers, 
    prevTotalRevenue, prevCashFlow, prevActiveCustomers,
    analysisMode, selectedMonth, selectedYear, aiContext
  } = useBusinessData();
  const hasData = aiContext !== null;

  // We are bypassing the context data just for the charts demo, but keeping the AI voice logic
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
    return `₹${value}`;
  };

  // Dynamic AI Text Generation
  const generateDynamicBriefing = () => {
    if (!hasData || !aiContext) return "Upload a document in Document Intel to generate a comprehensive AI Business Health analysis.";
    const periodStr = analysisMode === 'Monthly' ? `${selectedMonth} ${selectedYear}` : `Year ${selectedYear}`;
    let text = `${periodStr} analysis complete. Revenue reached ${formatCurrency(aiContext.revenue)} while operating expenses were ${formatCurrency(aiContext.expenses)}. `;
    text += `The business generated a profit margin of ${aiContext.profitMargin}%. `;
    if (aiContext.inventoryScore < 60) text += "Inventory shortages reduced potential sales. ";
    else text += "Inventory levels are healthy. ";
    if (aiContext.customerScore > 70) text += "Customer satisfaction remains remarkably strong. ";
    else text += "Customer retention requires immediate attention. ";
    
    if (aiContext.recommendations.length > 0) {
      text += `Key recommendation: ${aiContext.recommendations[0]}`;
    }
    return text;
  };

  const summaryText = generateDynamicBriefing();
  const [displayedText, setDisplayedText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const textToType = generateDynamicBriefing();
    const intervalId = setInterval(() => {
      setDisplayedText(textToType.slice(0, i));
      i++;
      if (i > textToType.length) {
        clearInterval(intervalId);
      }
    }, 20);
    return () => clearInterval(intervalId);
  }, [summaryText]);

  const toggleVoice = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(summaryText);
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.lang === 'en-US');
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const calculateTrend = (current: number, prev: number) => {
    if (prev === 0) return { value: 0, text: 'No prev data', isPositive: true };
    const diff = ((current - prev) / prev) * 100;
    return {
      value: Math.abs(diff).toFixed(1),
      text: `${diff >= 0 ? '↑' : '↓'} ${Math.abs(diff).toFixed(1)}% vs prev period`,
      isPositive: diff >= 0
    };
  };

  const revenueTrend = calculateTrend(totalRevenue, prevTotalRevenue);
  const profitTrend = calculateTrend(cashFlow, prevCashFlow);
  const customersTrend = calculateTrend(activeCustomers, prevActiveCustomers);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Executive Briefing</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Advanced Business Intelligence Dashboard</p>
        </div>
        <button 
          className={`${styles.playBtn} ${isPlaying ? styles.playing : ''}`} 
          onClick={toggleVoice}
        >
          {isPlaying ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          {isPlaying ? "Stop AI Voice" : "Play AI Briefing"}
        </button>
      </header>

      <motion.div 
        className={`glass-panel ${styles.summaryPanel}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.aiBadge}>AI Analysis</div>
        <p className={styles.typewriterText}>
          {displayedText}
          <span className="typewriter-cursor"></span>
        </p>
      </motion.div>

      {!hasData ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', marginTop: '24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
            No data found for the selected period. Please upload documents in Document Intel for {selectedMonth} {selectedYear} to unlock the Executive Briefing.
          </p>
        </div>
      ) : (
        <>
          {/* ROW 1: KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <motion.div className={`glass-panel ${styles.metricCard}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <div className={styles.metricHeader}>
                <IndianRupee className={styles.metricIcon} style={{ color: 'var(--accent-info)' }} />
                <span className={styles.metricLabel}>Total Revenue</span>
              </div>
              <div className={styles.metricValue}>{formatCurrency(totalRevenue)}</div>
              <div className={styles.metricTrend} style={{ color: revenueTrend.isPositive ? 'var(--accent-success)' : 'var(--accent-error)' }}>
                {revenueTrend.text}
              </div>
            </motion.div>

            <motion.div className={`glass-panel ${styles.metricCard}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <div className={styles.metricHeader}>
                <TrendingUp className={styles.metricIcon} style={{ color: 'var(--accent-success)' }} />
                <span className={styles.metricLabel}>Net Profit</span>
              </div>
              <div className={styles.metricValue}>{formatCurrency(cashFlow)}</div>
              <div className={styles.metricTrend} style={{ color: profitTrend.isPositive ? 'var(--accent-success)' : 'var(--accent-error)' }}>
                {profitTrend.text}
              </div>
            </motion.div>

            <motion.div className={`glass-panel ${styles.metricCard}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <div className={styles.metricHeader}>
                <Users className={styles.metricIcon} style={{ color: '#a855f7' }} />
                <span className={styles.metricLabel}>Active Customers</span>
              </div>
              <div className={styles.metricValue}>{activeCustomers.toLocaleString()}</div>
              <div className={styles.metricTrend} style={{ color: customersTrend.isPositive ? 'var(--accent-success)' : 'var(--accent-error)' }}>
                {customersTrend.text}
              </div>
            </motion.div>

            <BusinessHealthGauge />
          </div>

          {/* ROW 2: Revenue Trend & Profit vs Expenses */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <RevenueTrendChart />
            <ProfitExpenseChart />
          </div>

          {/* ROW 3: Sales Growth, Inventory & Revenue Sources */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <SalesGrowthChart />
            <InventoryStatusChart />
            <RevenueSourcesChart />
          </div>

          {/* ROW 4: Top Products & Customer Acquisition */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <TopProductsChart />
            <CustomerAcquisitionChart />
          </div>

          {/* ROW 5: Cash Flow & Forecast */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <CashFlowChart />
            <ForecastChart />
          </div>
        </>
      )}
    </div>
  );
};
