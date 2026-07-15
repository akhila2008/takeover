import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';
import styles from './RiskRadar.module.css';
import { useBusinessData } from '../context/BusinessDataContext';

const baseRisks = [
  { name: 'Financial', score: 30, status: 'safe', desc: 'Cash flow is stable.' },
  { name: 'Customer', score: 75, status: 'critical', desc: 'High churn rate detected.' },
  { name: 'Inventory', score: 60, status: 'warning', desc: 'Overstock in Q3 items.' },
  { name: 'Operational', score: 20, status: 'safe', desc: 'Systems running efficiently.' },
  { name: 'Supply Chain', score: 45, status: 'warning', desc: 'Delayed shipments from Asia.' },
  { name: 'Cybersecurity', score: 15, status: 'safe', desc: 'No active threats.' },
];

export const RiskRadar: React.FC = () => {
  const { aiContext } = useBusinessData();
  const hasData = aiContext !== null;
  
  // If no data, render 0 score risks
  const risks = hasData ? baseRisks : baseRisks.map(r => ({ ...r, score: 0, status: 'safe', desc: 'Awaiting data ingestion.' }));
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>AI Risk Radar</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Continuous evaluation of business threats.</p>
        </div>
      </header>

      <div className={styles.layout}>
        {/* Radar Visualization */}
        <motion.div 
          className={`glass-panel ${styles.radarPanel}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.radarWrapper}>
            <div className={styles.radarGrid}></div>
            <div className={styles.sweep}></div>
            
            {/* Risk Nodes */}
            {risks.map((risk, index) => {
              const angle = (index / risks.length) * 2 * Math.PI - Math.PI / 2;
              // distance from center based on score (higher score = further out or more intense)
              // Let's place them evenly for the radar effect
              const radius = 40 + (risk.score / 100) * 100;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              return (
                <div 
                  key={index} 
                  className={`${styles.riskNode} ${styles[risk.status]}`}
                  style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
                  title={`${risk.name}: ${risk.score}/100`}
                >
                  <div className={styles.nodePulse}></div>
                </div>
              );
            })}
          </div>
          
          <div className={styles.legend}>
            <span className={styles.legendItem}><span className={`${styles.dot} ${styles.safe}`}></span> Safe (0-39)</span>
            <span className={styles.legendItem}><span className={`${styles.dot} ${styles.warning}`}></span> Warning (40-69)</span>
            <span className={styles.legendItem}><span className={`${styles.dot} ${styles.critical}`}></span> Critical (70-100)</span>
          </div>
        </motion.div>

        {/* Risk Analysis Details */}
        <div className={styles.analysisPanel}>
          <h2 style={{ marginBottom: '24px' }}>Detected Threats</h2>
          {!hasData ? (
             <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', background: 'var(--glass-bg)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--glass-border)' }}>
              <p>Upload a document in Document Intel to activate the AI Risk Radar and detect anomalies.</p>
            </div>
          ) : (
            <div className={styles.riskList}>
              {risks.sort((a, b) => b.score - a.score).map((risk, idx) => (
                <motion.div 
                  key={idx}
                  className={`glass-panel ${styles.riskCard} ${styles[`card-${risk.status}`]}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className={styles.riskHeader}>
                    <div className={styles.riskTitle}>
                      {risk.status === 'critical' && <AlertTriangle size={20} />}
                      {risk.status === 'warning' && <TrendingDown size={20} />}
                      {risk.status === 'safe' && <CheckCircle size={20} />}
                      <h3>{risk.name} Risk</h3>
                    </div>
                    <span className={styles.score}>{risk.score}/100</span>
                  </div>
                  <p className={styles.desc}>{risk.desc}</p>
                  
                  {risk.status !== 'safe' && (
                    <button className={styles.mitigateBtn}>Generate Mitigation Plan</button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
