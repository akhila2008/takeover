import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Database, Zap, Shield, FileText, Target, Users, TrendingUp, BarChart2, Cloud, Clock, PieChart, FileSearch } from 'lucide-react';
import styles from './UniversalModule.module.css';

interface UniversalModuleProps {
  title: string;
}

export const UniversalModule: React.FC<UniversalModuleProps> = ({ title }) => {
  // Define custom configurations for different modules
  const moduleConfigs: Record<string, any> = {
    'Success Roadmap': {
      subtitle: 'Tracking milestones and strategic objectives.',
      metrics: [
        { label: 'Milestone Progress', value: '78%', icon: <Target size={18} /> },
        { label: 'Active Initiatives', value: '14', icon: <TrendingUp size={18} /> },
        { label: 'Blockers', value: '0', icon: <Shield size={18} /> }
      ],
      feed: [
        { title: 'Q3 Objectives aligned', desc: 'All departments have confirmed OKRs.', time: '1h ago', icon: <Target size={16} /> },
        { title: 'New milestone reached', desc: 'Revenue target for EU region hit early.', time: '4h ago', icon: <Activity size={16} /> }
      ],
      bars: [30, 40, 45, 60, 75, 80, 85, 90, 95, 100]
    },
    'Business Mood': {
      subtitle: 'AI sentiment analysis of customer and employee feedback.',
      metrics: [
        { label: 'Customer Sentiment', value: '8.4/10', icon: <Users size={18} /> },
        { label: 'Employee Morale', value: 'High', icon: <Activity size={18} /> },
        { label: 'Mentions Analyzed', value: '45k', icon: <Database size={18} /> }
      ],
      feed: [
        { title: 'Sentiment Spike Detected', desc: 'Positive mentions up 12% following V2 release.', time: '30m ago', icon: <TrendingUp size={16} /> },
        { title: 'Feedback Loop Closed', desc: 'Support team addressed critical Reddit thread.', time: '2h ago', icon: <Shield size={16} /> }
      ],
      bars: [50, 45, 60, 55, 70, 65, 80, 75, 90, 85]
    },
    'Forecast Center': {
      subtitle: 'Predictive modeling and revenue forecasting.',
      metrics: [
        { label: 'Projected Revenue', value: '₹2.4M', icon: <BarChart2 size={18} /> },
        { label: 'Confidence Score', value: '94%', icon: <Zap size={18} /> },
        { label: 'Market Variance', value: 'Low', icon: <Cloud size={18} /> }
      ],
      feed: [
        { title: 'Forecast updated', desc: 'Incorporated latest supply chain metrics.', time: '15m ago', icon: <Database size={16} /> },
        { title: 'Trend Warning', desc: 'Competitor pricing may affect Q4 conversions.', time: '3h ago', icon: <Activity size={16} /> }
      ],
      bars: [10, 20, 35, 40, 50, 65, 75, 80, 90, 100]
    },
    'Document Intel': {
      subtitle: 'AI extraction and contract analysis engine.',
      metrics: [
        { label: 'Docs Processed', value: '3,402', icon: <FileText size={18} /> },
        { label: 'Risks Flagged', value: '12', icon: <Shield size={18} /> },
        { label: 'Extraction Acc.', value: '99.8%', icon: <Zap size={18} /> }
      ],
      feed: [
        { title: 'Vendor Contract Scanned', desc: 'Liability clause flagged for manual review.', time: '5m ago', icon: <FileSearch size={16} /> },
        { title: 'Batch Processing Complete', desc: '1,000 invoices successfully categorized.', time: '1h ago', icon: <Database size={16} /> }
      ],
      bars: [80, 85, 82, 88, 90, 85, 92, 95, 88, 96]
    },
    'Benchmarking': {
      subtitle: 'Comparative analysis against industry standards.',
      metrics: [
        { label: 'Market Position', value: 'Top 15%', icon: <TrendingUp size={18} /> },
        { label: 'Cost Efficiency', value: 'A+', icon: <PieChart size={18} /> },
        { label: 'Growth Delta', value: '+4.2%', icon: <Activity size={18} /> }
      ],
      feed: [
        { title: 'Competitor Analysis', desc: 'New pricing data ingested from competitors.', time: '40m ago', icon: <Database size={16} /> },
        { title: 'Efficiency Score', desc: 'We are currently outperforming sector average by 12%.', time: '5h ago', icon: <Target size={16} /> }
      ],
      bars: [45, 50, 50, 60, 55, 65, 70, 75, 70, 85]
    },
    'Time Machine': {
      subtitle: 'Historical data replay and versioning control.',
      metrics: [
        { label: 'Snapshots', value: '1,048', icon: <Database size={18} /> },
        { label: 'Storage Used', value: '4.2 TB', icon: <Cloud size={18} /> },
        { label: 'Restore Time', value: '< 2s', icon: <Clock size={18} /> }
      ],
      feed: [
        { title: 'Daily Snapshot Complete', desc: 'All core databases successfully versioned.', time: '12h ago', icon: <Database size={16} /> },
        { title: 'Historical Query', desc: 'Data from Q1 2024 was successfully restored to sandbox.', time: '1d ago', icon: <Activity size={16} /> }
      ],
      bars: [100, 95, 90, 85, 80, 75, 70, 65, 60, 55]
    }
  };

  // Fallback configuration if a module isn't explicitly defined above
  const defaultConfig = {
    subtitle: 'Advanced module active and monitoring data streams.',
    metrics: [
      { label: 'Processing Load', value: `${40 + (title.length * 2)}%`, icon: <Activity size={18} /> },
      { label: 'Data Points Analyzed', value: `${1200 + (title.length * 150)}k`, icon: <Database size={18} /> },
      { label: 'System Efficiency', value: `${85 + (title.length % 10)}%`, icon: <Zap size={18} /> }
    ],
    feed: [
      { title: 'Security scan completed', desc: 'No anomalies detected in the last 24h.', time: '2m ago', icon: <Shield size={16} /> },
      { title: 'Report generated', desc: 'Weekly summary is ready for review.', time: '1h ago', icon: <FileText size={16} /> },
      { title: 'Model re-calibrated', desc: 'AI parameters updated for higher accuracy.', time: '3h ago', icon: <Zap size={16} /> }
    ],
    bars: [40, 65, 45, 80, 55, 90, 75, 100, 60, 85]
  };

  const config = moduleConfigs[title] || defaultConfig;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{title}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{config.subtitle}</p>
        </div>
      </header>

      <div className={styles.metricsGrid}>
        {config.metrics.map((m: any, i: number) => (
          <motion.div 
            key={`${title}-metric-${i}`}
            className={`glass-panel ${styles.metricCard}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className={styles.metricHeader}>
              <span className={styles.metricIcon}>{m.icon}</span>
              <span className={styles.metricLabel}>{m.label}</span>
            </div>
            <div className={styles.metricValue}>{m.value}</div>
            <div className={styles.metricTrend}>Optimal status</div>
          </motion.div>
        ))}
      </div>

      <div className={styles.mainDashboard}>
        <motion.div 
          key={`${title}-chart`}
          className={`glass-panel ${styles.chartArea}`}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.panelHeader}>
            <h3>Real-Time Analytics</h3>
            <span className={styles.liveBadge}>LIVE</span>
          </div>
          
          <div className={styles.mockChartContainer}>
            <div className={styles.chartLines}>
              <div className={styles.line}></div>
              <div className={styles.line}></div>
              <div className={styles.line}></div>
              <div className={styles.line}></div>
            </div>
            <div className={styles.bars}>
              {config.bars.map((height: number, i: number) => (
                <motion.div 
                  key={`${title}-bar-${i}`} 
                  className={styles.bar} 
                  style={{ height: `${height}%` }}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 0.5 + (i * 0.05), duration: 0.8, type: 'spring' }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div 
          key={`${title}-feed`}
          className={`glass-panel ${styles.feedArea}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className={styles.panelHeader}>
            <h3>Recent System Activity</h3>
          </div>
          <div className={styles.activityFeed}>
            {config.feed.map((item: any, i: number) => (
              <div className={styles.feedItem} key={i}>
                <div className={styles.feedIcon} style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)' }}>
                  {item.icon}
                </div>
                <div className={styles.feedContent}>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
                <span className={styles.feedTime}>{item.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
