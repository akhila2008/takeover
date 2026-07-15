import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { monthlyFinancials } from '../../lib/dummyChartData';

export const ForecastChart: React.FC = () => {
  return (
    <motion.div 
      className="glass-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.1 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.2rem', margin: 0 }}>AI Forecast</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Actual vs Predicted Revenue</p>
      </div>
      <div style={{ flex: 1, minHeight: '250px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={monthlyFinancials} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
              </linearGradient>
            </defs>
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
              formatter={(value: any) => [`₹${value.toLocaleString()}`, '']}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            
            <Area type="monotone" dataKey="predicted" fill="url(#colorForecast)" stroke="none" />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              name="Actual Revenue" 
              stroke="var(--accent-info)" 
              strokeWidth={3} 
              dot={{ r: 4 }} 
              connectNulls
            />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              name="Predicted Revenue" 
              stroke="#0ea5e9" 
              strokeWidth={2} 
              strokeDasharray="5 5" 
              dot={false}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
