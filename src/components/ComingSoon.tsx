import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Cpu } from 'lucide-react';
import styles from './ComingSoon.module.css';

interface ComingSoonProps {
  title: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ title }) => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{title}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Module locked or under development.</p>
      </header>

      <motion.div 
        className={`glass-panel ${styles.lockScreen}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.iconWrapper}>
          <Lock size={48} className={styles.lockIcon} />
          <div className={styles.scanLine}></div>
        </div>
        
        <h2>Initializing AI Core for {title}</h2>
        <p className={styles.desc}>
          This advanced business intelligence module is currently being configured for your enterprise environment. 
          Our models are training on your historical data.
        </p>

        <div className={styles.progressArea}>
          <div className={styles.statusLine}>
            <Cpu size={16} /> Connecting to Neural Engine...
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill}></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
