import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell } from 'recharts';
import { useBusinessData } from '../../context/BusinessDataContext';

export const CashFlowChart: React.FC = () => {
  const { monthlyChartData } = useBusinessData();
  const hasData = monthlyChartData.some(d => Object.values(d).some(val => typeof val === 'number'));
  return (
    <motion.div 
      className="glass-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.0 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Net Cash Flow</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Monthly liquidity changes</p>
      </div>
      <div style={{ flex: 1, minHeight: '250px' }}>
        
      {!hasData ? (
        <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No data available for this period. Upload reports to view trends.</p>
        </div>
      ) : (
    
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis 
              stroke="var(--text-muted)" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Net Cash Flow']}
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
            <Bar dataKey="cashFlow" radius={4}>
              {
                monthlyChartData.map((entry: any, index: any) => (
                  <Cell key={`cell-${index}`} fill={entry.cashFlow >= 0 ? '#10b981' : '#ef4444'} />
                ))
              }
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
      </div>
    </motion.div>
  );
};
