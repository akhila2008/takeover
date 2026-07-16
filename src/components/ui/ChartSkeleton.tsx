import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

export const ChartSkeleton: React.FC = () => {
  return (
    <motion.div 
      className="glass-panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ 
        height: '100%', 
        minHeight: '250px',
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.02)'
      }}
    >
      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
      >
        <BarChart3 size={32} color="rgba(255,255,255,0.2)" />
        <div style={{ width: '120px', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px' }} />
        <div style={{ width: '80px', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
      </motion.div>
    </motion.div>
  );
};
