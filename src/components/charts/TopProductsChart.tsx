import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useBusinessData } from '../../context/BusinessDataContext';

export const TopProductsChart: React.FC = () => {
  const { topProductsData } = useBusinessData();
  const hasData = topProductsData && topProductsData.length > 0;
  return (
    <motion.div 
      className="glass-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.9 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Top Selling Products</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Highest grossing items (Top 10)</p>
      </div>
      <div style={{ flex: 1, minHeight: '350px' }}>
        
      {!hasData ? (
        <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No data available for this period. Upload reports to view trends.</p>
        </div>
      ) : (
    
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topProductsData} layout="vertical" margin={{ top: 10, right: 10, left: 40, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
            <XAxis type="number" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
            <YAxis 
              dataKey="name" 
              type="category" 
              stroke="var(--text-muted)" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              width={100}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Sales']}
            />
            <Bar dataKey="sales" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      )}
      </div>
    </motion.div>
  );
};
