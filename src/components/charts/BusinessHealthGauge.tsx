import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { useBusinessData } from '../../context/BusinessDataContext';

export const BusinessHealthGauge: React.FC = () => {
  const { healthScore } = useBusinessData();
  const data = [
    { name: 'Health', value: healthScore, fill: 'var(--accent-success)' }
  ];

  return (
    <motion.div 
      className="glass-panel"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Health Score</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Overall Business Health</p>
      </div>
      <div style={{ height: '180px', width: '100%', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="70%" 
            outerRadius="100%" 
            barSize={15} 
            data={data} 
            startAngle={180} 
            endAngle={0}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background={{ fill: 'rgba(255,255,255,0.1)' }}
              dataKey="value"
              cornerRadius={10}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{healthScore}</span>
          <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>%</span>
        </div>
      </div>
      <div style={{ color: 'var(--accent-success)', fontSize: '0.85rem', fontWeight: 'bold' }}>Optimal Performance</div>
    </motion.div>
  );
};
