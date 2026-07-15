import React from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import styles from './DigitalTwin.module.css';
import { useBusinessData } from '../context/BusinessDataContext';

const baseDnaData = [
  { subject: 'Growth', A: 85, fullMark: 100 },
  { subject: 'Innovation', A: 90, fullMark: 100 },
  { subject: 'Efficiency', A: 65, fullMark: 100 },
  { subject: 'Loyalty', A: 75, fullMark: 100 },
  { subject: 'Marketing', A: 80, fullMark: 100 },
  { subject: 'Stability', A: 70, fullMark: 100 },
];

export const DigitalTwin: React.FC = () => {
  const { documents } = useBusinessData();
  const hasData = documents.length > 0;
  
  const dnaData = hasData ? baseDnaData : baseDnaData.map(d => ({ ...d, A: 0 }));
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Business Digital Twin</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Live representation and DNA profile of your company.</p>
        </div>
        <div className={styles.statusBadge}>
          <div className={styles.pulseDot}></div>
          Live Sync Active
        </div>
      </header>

      {!hasData ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '16px' }}>No business data detected.</p>
          <p>Please upload your financial documents in the Document Intel hub to generate your Digital Twin.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {/* DNA Visualization */}
          <motion.div 
            className={`glass-panel ${styles.dnaPanel}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.panelHeader}>
              <h2>Business DNA Profile</h2>
              <span className={styles.personalityTag}>Growth Machine</span>
            </div>
            
            <div className={styles.dnaVisualization}>
              {/* Animated CSS DNA Helix representation */}
              <div className={styles.helixContainer}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className={styles.helixStrand} style={{ animationDelay: `${i * -0.2}s` }}>
                    <div className={styles.dot1}></div>
                    <div className={styles.line}></div>
                    <div className={styles.dot2}></div>
                  </div>
                ))}
              </div>
              <div className={styles.radarContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dnaData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }} />
                    <Radar name="Business DNA" dataKey="A" stroke="var(--accent-primary)" fill="var(--accent-primary)" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className={styles.dnaInsights}>
              <div className={styles.insightItem}>
                <h4>Core Strength</h4>
                <p>High Innovation rate allows rapid product launches.</p>
              </div>
              <div className={styles.insightItem}>
                <h4>Area of Focus</h4>
                <p>Operational Efficiency is lagging behind industry benchmarks.</p>
              </div>
            </div>
          </motion.div>

          {/* Digital Twin Ecosystem Map */}
          <motion.div 
            className={`glass-panel ${styles.ecosystemPanel}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className={styles.panelHeader}>
              <h2>Live Ecosystem</h2>
            </div>
            <div className={styles.ecosystemMap}>
              {/* Visual nodes representing the business parts */}
              <div className={`${styles.node} ${styles.centerNode}`}>
                HQ
                <div className={styles.nodeRipple}></div>
              </div>
              
              <div className={`${styles.node} ${styles.supplierNode}`}>Suppliers</div>
              <div className={`${styles.node} ${styles.inventoryNode}`}>Inventory (85%)</div>
              <div className={`${styles.node} ${styles.salesNode}`}>Sales</div>
              <div className={`${styles.node} ${styles.customerNode}`}>Customers</div>
              
              {/* Connecting lines */}
              <svg className={styles.connections}>
                <line x1="50%" y1="50%" x2="20%" y2="20%" className={styles.connectionLine} />
                <line x1="50%" y1="50%" x2="80%" y2="20%" className={styles.connectionLine} />
                <line x1="50%" y1="50%" x2="20%" y2="80%" className={styles.connectionLine} />
                <line x1="50%" y1="50%" x2="80%" y2="80%" className={styles.connectionLine} />
              </svg>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
