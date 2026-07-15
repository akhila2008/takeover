import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronRight, Download, Activity, Database, X } from 'lucide-react';
import styles from './BusinessHistory.module.css';
import { supabase } from '../lib/supabaseClient';
import { useBusinessData } from '../context/BusinessDataContext';

export const BusinessHistory: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { generateSnapshot } = useBusinessData();
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean, type: 'monthly' | 'annual', data: any, year: string }>({ isOpen: false, type: 'monthly', data: null, year: '' });

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_reports_history')
        .select('*')
        .eq('business_id', 'default')
        .order('created_at', { ascending: false });
        
      if (data && !error) {
        setReports(data);
      }
      setLoading(false);
    };
    
    fetchHistory();
  }, []);

  const groupedReports = useMemo(() => {
    const groups: Record<string, { annual: any | null, monthly: any[] }> = {};
    
    reports.forEach(report => {
      const period = report.selected_period || '';
      const isAnnual = /^\d{4}$/.test(period.trim());
      const yearMatch = period.match(/\d{4}$/);
      const year = yearMatch ? yearMatch[0] : 'Unknown';
      
      if (!groups[year]) {
        groups[year] = { annual: null, monthly: [] };
      }
      
      if (isAnnual) {
        groups[year].annual = report;
      } else {
        groups[year].monthly.push(report);
      }
    });

    return groups;
  }, [reports]);

  const openModal = (year: string, type: 'monthly' | 'annual', data: any) => {
    if (type === 'annual' && !data) {
      alert(`No annual analysis snapshot has been generated yet for ${year}.`);
      return;
    }
    if (type === 'monthly' && (!data || data.length === 0)) {
      alert(`No monthly analysis snapshots found for ${year}.`);
      return;
    }
    setModalConfig({ isOpen: true, type, data, year });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const ReportCard = ({ report }: { report: any }) => (
    <div className={`glass-panel ${styles.card}`} style={{ marginBottom: '16px' }}>
      <div className={styles.cardHeader}>
        <span className={styles.periodBadge}>{report.selected_period}</span>
        <span className={styles.dateText}>{new Date(report.analysis_date).toLocaleDateString()}</span>
      </div>
      
      <div className={styles.cardBody}>
        <div className={styles.scoreRow}>
          <Activity size={20} style={{ color: 'var(--accent-info)' }} />
          <span className={styles.scoreLabel}>Overall Health:</span>
          <span className={styles.scoreValue}>{report.health_score}/100</span>
        </div>
        
        {report.financial_score !== undefined && report.financial_score !== 0 && (
          <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '12px', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>FIN {report.financial_score}</span>
            <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>INV {report.inventory_score}</span>
            <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>CUS {report.customer_score}</span>
            <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>GRO {report.growth_score}</span>
            <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>OPS {report.operational_score}</span>
          </div>
        )}

        <p className={styles.summary} style={{ marginTop: '12px' }}>{report.executive_summary}</p>
      </div>
      
      <div className={styles.cardFooter}>
        <button className={styles.viewBtn}>View Full Report <ChevronRight size={16} /></button>
        <button className={styles.downloadBtn} title="Download PDF"><Download size={16} /></button>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Analysis History</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View previous AI snapshots and historical reports</p>
        </div>
        <button 
          className={styles.generateBtn} 
          onClick={async () => {
            await generateSnapshot();
            const { data } = await supabase
              .from('ai_reports_history')
              .select('*')
              .eq('business_id', 'default')
              .order('created_at', { ascending: false });
            if (data) setReports(data);
          }}
        >
          <Database size={18} />
          Create Snapshot
        </button>
      </header>

      <div className={styles.content}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>Loading historical records...</div>
        ) : Object.keys(groupedReports).length === 0 ? (
          <div className={styles.emptyState}>
            <Calendar size={48} className={styles.emptyIcon} />
            <h2>No History Found</h2>
            <p>Complete an AI analysis to automatically generate a snapshot.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {Object.entries(groupedReports)
              .sort((a, b) => Number(b[0]) - Number(a[0]))
              .map(([year, data], idx) => (
                <motion.div 
                  key={year} 
                  className={`glass-panel ${styles.yearCard}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                >
                  <div className={styles.yearCardHeader}>
                    <Calendar size={24} style={{ color: 'var(--accent-primary)' }} />
                    <h2 className={styles.yearTitle}>{year}</h2>
                  </div>
                  
                  <div className={styles.yearCardBody}>
                    <div 
                      className={styles.yearActionItem}
                      onClick={() => openModal(year, 'monthly', data.monthly)}
                    >
                      <span>Monthly Analysis</span>
                      <ChevronRight size={18} className={styles.actionIcon} />
                    </div>
                    <div 
                      className={styles.yearActionItem}
                      onClick={() => openModal(year, 'annual', data.annual)}
                    >
                      <span>Annual Analysis</span>
                      <ChevronRight size={18} className={styles.actionIcon} />
                    </div>
                  </div>
                </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalConfig.isOpen && (
          <motion.div 
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div 
              className={styles.modalContent}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2 className="gradient-text">
                  {modalConfig.year} {modalConfig.type === 'monthly' ? 'Monthly Analyses' : 'Annual Analysis'}
                </h2>
                <button className={styles.closeBtn} onClick={closeModal}><X size={24} /></button>
              </div>
              
              <div className={styles.modalScrollArea}>
                {modalConfig.type === 'monthly' ? (
                  modalConfig.data.map((report: any) => (
                    <ReportCard key={report.id} report={report} />
                  ))
                ) : (
                  <ReportCard report={modalConfig.data} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
