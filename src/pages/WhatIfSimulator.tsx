import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sliders, TrendingUp, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './WhatIfSimulator.module.css';
import { useBusinessData } from '../context/BusinessDataContext';

export const WhatIfSimulator: React.FC = () => {
  const { totalRevenue, monthlyExpenses, documents, aiContext } = useBusinessData();
  const hasData = aiContext !== null;
  const [priceMultiplier, setPriceMultiplier] = useState(1);
  const [marketingBudget, setMarketingBudget] = useState(1);
  const [staffing, setStaffing] = useState(1);

  // Generate dynamic base data based on real context metrics
  const avgMonthlyRev = totalRevenue / 12;
  const avgMonthlyProfit = (totalRevenue - monthlyExpenses) / 12;

  const baseData = hasData ? [
    { month: 'Month 1', revenue: avgMonthlyRev * 0.9, profit: avgMonthlyProfit * 0.8 },
    { month: 'Month 2', revenue: avgMonthlyRev * 0.95, profit: avgMonthlyProfit * 0.9 },
    { month: 'Month 3', revenue: avgMonthlyRev, profit: avgMonthlyProfit },
    { month: 'Month 4', revenue: avgMonthlyRev * 1.05, profit: avgMonthlyProfit * 1.1 },
    { month: 'Month 5', revenue: avgMonthlyRev * 1.1, profit: avgMonthlyProfit * 1.15 },
    { month: 'Month 6', revenue: avgMonthlyRev * 1.2, profit: avgMonthlyProfit * 1.25 },
  ] : [
    { month: 'Month 1', revenue: 0, profit: 0 },
    { month: 'Month 2', revenue: 0, profit: 0 },
    { month: 'Month 3', revenue: 0, profit: 0 },
    { month: 'Month 4', revenue: 0, profit: 0 },
    { month: 'Month 5', revenue: 0, profit: 0 },
    { month: 'Month 6', revenue: 0, profit: 0 },
  ];

  // Generate simulated future data based on sliders
  const simulatedData = baseData.map(d => ({
    ...d,
    revenue: d.revenue * priceMultiplier * (1 + (marketingBudget - 1) * 0.5),
    profit: d.profit * priceMultiplier * (1 + (marketingBudget - 1) * 0.2) - (staffing - 1) * 1000,
  }));

  const expectedRevenue = Math.round(simulatedData.reduce((acc, curr) => acc + curr.revenue, 0));
  const expectedProfit = Math.round(simulatedData.reduce((acc, curr) => acc + curr.profit, 0));
  
  // Calculate risk level based on extreme changes
  const riskScore = Math.min(100, Math.max(0, 
    Math.abs(priceMultiplier - 1) * 50 + 
    Math.abs(marketingBudget - 1) * 30 + 
    Math.abs(staffing - 1) * 40
  ));
  
  const getRiskColor = (score: number) => {
    if (score > 60) return 'var(--accent-danger)';
    if (score > 30) return 'var(--accent-warning)';
    return 'var(--accent-success)';
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>What-If Simulator</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Adjust variables to predict future business outcomes.</p>
        </div>
      </header>

      <div className={styles.layout}>
        {/* Controls Panel */}
        <motion.div 
          className={`glass-panel ${styles.controlsPanel}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.panelHeader}>
            <Sliders size={20} className={styles.icon} />
            <h2>Decision Parameters</h2>
          </div>

          <div className={styles.sliderGroup}>
            <div className={styles.sliderHeader}>
              <label>Product Pricing</label>
              <span>{Math.round((priceMultiplier - 1) * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0.5" max="1.5" step="0.05" 
              value={priceMultiplier} 
              onChange={e => setPriceMultiplier(parseFloat(e.target.value))}
              className={styles.slider}
            />
          </div>

          <div className={styles.sliderGroup}>
            <div className={styles.sliderHeader}>
              <label>Marketing Budget</label>
              <span>{Math.round((marketingBudget - 1) * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0.5" max="2" step="0.1" 
              value={marketingBudget} 
              onChange={e => setMarketingBudget(parseFloat(e.target.value))}
              className={styles.slider}
            />
          </div>

          <div className={styles.sliderGroup}>
            <div className={styles.sliderHeader}>
              <label>Staffing Capacity</label>
              <span>{Math.round((staffing - 1) * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0.5" max="1.5" step="0.1" 
              value={staffing} 
              onChange={e => setStaffing(parseFloat(e.target.value))}
              className={styles.slider}
            />
          </div>

          <button className={styles.resetBtn} onClick={() => {
            setPriceMultiplier(1);
            setMarketingBudget(1);
            setStaffing(1);
          }}>
            Reset Scenario
          </button>
        </motion.div>

        {/* Results Panel */}
        <div className={styles.resultsArea}>
          <div className={styles.metricsRow}>
            <motion.div 
              className={`glass-panel ${styles.metricCard}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <DollarSign className={styles.metricIcon} style={{ color: 'var(--accent-success)' }} />
              <div className={styles.metricContent}>
                <span className={styles.metricLabel}>Projected Revenue</span>
                <span className={styles.metricValue}>₹{expectedRevenue.toLocaleString()}</span>
              </div>
            </motion.div>
            
            <motion.div 
              className={`glass-panel ${styles.metricCard}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <TrendingUp className={styles.metricIcon} style={{ color: 'var(--accent-info)' }} />
              <div className={styles.metricContent}>
                <span className={styles.metricLabel}>Projected Profit</span>
                <span className={styles.metricValue}>₹{expectedProfit.toLocaleString()}</span>
              </div>
            </motion.div>

            <motion.div 
              className={`glass-panel ${styles.metricCard}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ borderColor: getRiskColor(riskScore) }}
            >
              <AlertTriangle className={styles.metricIcon} style={{ color: getRiskColor(riskScore) }} />
              <div className={styles.metricContent}>
                <span className={styles.metricLabel}>Risk Level</span>
                <span className={styles.metricValue} style={{ color: getRiskColor(riskScore) }}>
                  {riskScore > 60 ? 'High' : riskScore > 30 ? 'Medium' : 'Low'}
                </span>
              </div>
            </motion.div>
          </div>

          <motion.div 
            className={`glass-panel ${styles.chartPanel}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3>Forecast Trajectory</h3>
            <div style={{ height: '300px', width: '100%', marginTop: '24px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simulatedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-success)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--accent-success)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="profit" stroke="var(--accent-success)" fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
