import React from 'react';
import { motion } from 'framer-motion';
import { useBusinessData } from '../../context/BusinessDataContext';
import { CheckCircle, Loader2 } from 'lucide-react';

export const AnalysisTimeline: React.FC = () => {
  const { analysisProgress } = useBusinessData();
  const { isAnalyzing, stage, progressPercent } = analysisProgress;

  if (!isAnalyzing && stage !== 'complete') return null;

  const steps = [
    { id: 'reading', label: 'Reading Document...' },
    { id: 'kpis', label: 'Calculating KPIs...' },
    { id: 'charts', label: 'Building Charts...' },
    { id: 'insights', label: 'Generating Insights...' },
    { id: 'summary', label: 'Preparing Summary...' },
  ];

  const getStepStatus = (stepId: string) => {
    const stageOrder = ['idle', 'reading', 'kpis', 'charts', 'insights', 'summary', 'complete'];
    const currentIndex = stageOrder.indexOf(stage);
    const stepIndex = stageOrder.indexOf(stepId);
    
    if (currentIndex > stepIndex) return 'complete';
    if (currentIndex === stepIndex) return 'active';
    return 'pending';
  };

  return (
    <motion.div 
      className="glass-panel"
      initial={{ opacity: 0, y: -20, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
      style={{ marginBottom: '24px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          {stage === 'complete' ? <CheckCircle size={20} color="var(--accent-success)" /> : <Loader2 size={20} className="spin" color="var(--accent-primary)" />}
          {stage === 'complete' ? 'Analysis Complete' : 'AI Analysis in Progress...'}
        </h3>
        <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
          {progressPercent}%
        </div>
      </div>
      
      {/* Progress Bar */}
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', marginBottom: '24px' }}>
        <motion.div 
          style={{ height: '100%', background: 'var(--accent-primary)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ ease: "easeOut", duration: 0.5 }}
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between' }}>
        {steps.map((step) => {
          const status = getStepStatus(step.id);
          return (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: status === 'pending' ? 0.4 : 1 }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
            >
              {status === 'complete' ? (
                <CheckCircle size={16} color="var(--accent-success)" />
              ) : status === 'active' ? (
                <Loader2 size={16} color="var(--accent-primary)" className="spin" />
              ) : (
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' }} />
              )}
              <span style={{ color: status === 'complete' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
