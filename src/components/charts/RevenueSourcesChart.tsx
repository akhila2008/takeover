import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useBusinessData } from '../../context/BusinessDataContext';

export const RevenueSourcesChart: React.FC = () => {
  const { revenueSourcesData } = useBusinessData();
  const hasData = revenueSourcesData && revenueSourcesData.length > 0;
  return (
    <motion.div 
      className="glass-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Revenue Sources</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Income by channel</p>
      </div>
      <div style={{ flex: 1, minHeight: '250px' }}>
        
      {!hasData ? (
        <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No data available for this period. Upload reports to view trends.</p>
        </div>
      ) : (
    
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={revenueSourcesData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              stroke="rgba(0,0,0,0.2)"
            >
              {revenueSourcesData.map((entry: any, index: any) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
              formatter={(value: any) => [`${value}%`, 'Share']}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      )}
      </div>
    </motion.div>
  );
};
