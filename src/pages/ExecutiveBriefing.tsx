import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Users, ArrowRight, Play, Square, DollarSign } from 'lucide-react';
import styles from './ExecutiveBriefing.module.css';
import { useBusinessData } from '../context/BusinessDataContext';

const summaryText = "Good morning! Your Business Health Score is 86/100. Revenue increased by 12% this month, but customer retention fell by 5%. If you reduce slow-moving inventory and increase marketing for Product A, AI predicts a 17% increase in quarterly profit with 89% confidence.";

interface Props {
  onNavigate?: (page: string) => void;
}

export const ExecutiveBriefing: React.FC<Props> = ({ onNavigate }) => {
  const { healthScore, totalRevenue, activeCustomers, monthlyExpenses, cashFlow } = useBusinessData();
  const [displayedText, setDisplayedText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSynthesisRef, setSpeechSynthesisRef] = useState<SpeechSynthesisUtterance | null>(null);

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(summaryText.slice(0, i));
      i++;
      if (i > summaryText.length) {
        clearInterval(intervalId);
      }
    }, 30);
    return () => clearInterval(intervalId);
  }, []);

  const toggleVoice = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(summaryText);
      // Optional: change voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.lang === 'en-US');
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setSpeechSynthesisRef(utterance);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
    return `₹${value}`;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Executive Briefing</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Generated today at 09:00 AM</p>
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

      <div className={styles.metricsGrid}>
        <motion.div 
          className={`glass-panel ${styles.metricCard}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className={styles.metricHeader}>
            <Activity className={styles.metricIcon} style={{ color: 'var(--accent-info)' }} />
            <span className={styles.metricLabel}>Health Score</span>
          </div>
          <div className={styles.metricValue}>{healthScore}<span className={styles.metricSub}>/100</span></div>
          <div className={styles.metricTrend} style={{ color: 'var(--accent-success)' }}>Dynamic Live Score</div>
        </motion.div>

        <motion.div 
          className={`glass-panel ${styles.metricCard}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className={styles.metricHeader}>
            <DollarSign className={styles.metricIcon} style={{ color: 'var(--accent-success)' }} />
            <span className={styles.metricLabel}>Total Revenue</span>
          </div>
          <div className={styles.metricValue}>{formatCurrency(totalRevenue)}</div>
          <div className={styles.metricTrend}>Driven by Active Customers ({activeCustomers})</div>
        </motion.div>

        <motion.div 
          className={`glass-panel ${styles.metricCard}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className={styles.metricHeader}>
            <TrendingUp className={styles.metricIcon} style={{ color: 'var(--accent-warning)' }} />
            <span className={styles.metricLabel}>Cash Flow</span>
          </div>
          <div className={styles.metricValue}>{formatCurrency(cashFlow)}</div>
          <div className={styles.metricTrend} style={{ color: 'var(--text-secondary)' }}>Expenses: {formatCurrency(monthlyExpenses)}</div>
        </motion.div>
      </div>

      <motion.div 
        className={styles.actionSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Suggested Next Actions</h2>
        <div className={styles.actionCards}>
          <div className={`glass-panel ${styles.actionCard}`}>
            <div className={styles.actionCardTop}>
              <span className={styles.actionPriority}>High Priority</span>
              <span className={styles.actionConfidence}>89% Confidence</span>
            </div>
            <h3>Reduce Slow-Moving Inventory</h3>
            <p>Liquidating bottom 10% SKU performers will free up ₹45k in cash flow.</p>
            <button className={styles.actionBtn} onClick={() => onNavigate?.('action-center')}>Execute Strategy <ArrowRight size={16} /></button>
          </div>
          
          <div className={`glass-panel ${styles.actionCard}`}>
            <div className={styles.actionCardTop}>
              <span className={styles.actionPriority} style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-info)' }}>Medium Priority</span>
              <span className={styles.actionConfidence}>75% Confidence</span>
            </div>
            <h3>Increase Marketing for Product A</h3>
            <p>Reallocating ₹5,000 to Product A ads is projected to yield a 3x ROI.</p>
            <button className={styles.actionBtn} onClick={() => onNavigate?.('success-roadmap')}>Review Campaign <ArrowRight size={16} /></button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
