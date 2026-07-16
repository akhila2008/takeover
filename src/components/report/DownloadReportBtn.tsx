import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { pdf } from '@react-pdf/renderer';
import { useBusinessData } from '../../context/BusinessDataContext';
import { BusinessReportDocument } from './BusinessReportDocument';
import styles from './DownloadReportBtn.module.css';

interface Props {
  className?: string;
}

export const DownloadReportBtn: React.FC<Props> = ({ className = '' }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { aiContext } = useBusinessData();

  const handleDownload = async () => {
    if (!aiContext) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'No AI Analysis data available to generate report.' }));
      return;
    }

    setIsGenerating(true);

    try {
      // 1. Capture charts
      const chartIds = [
        'chart-revenueTrend',
        'chart-profitExpense',
        'chart-salesGrowth',
        'chart-inventory',
        'chart-revenueSources',
        'chart-cashFlow'
      ];

      const capturedCharts: Record<string, string> = {};

      for (const id of chartIds) {
        const el = document.getElementById(id);
        if (el) {
          // Increase scale for better PDF quality
          const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false });
          capturedCharts[id.replace('chart-', '')] = canvas.toDataURL('image/png');
        }
      }

      // 2. Generate PDF blob
      const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const companyName = localStorage.getItem('takeover_business_profile') 
        ? JSON.parse(localStorage.getItem('takeover_business_profile')!).companyName || 'Acme Corp'
        : 'Acme Corp';

      const blob = await pdf(
        <BusinessReportDocument 
          companyName={companyName}
          date={dateStr}
          aiContext={aiContext}
          charts={capturedCharts}
        />
      ).toBlob();

      // 3. Download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileDate = new Date().toISOString().split('T')[0];
      link.download = `Business_Report_${fileDate}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Business Report downloaded successfully.' }));
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Failed to generate PDF report.' }));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.button
      className={`${styles.btn} ${className}`}
      onClick={handleDownload}
      disabled={isGenerating || !aiContext}
      whileHover={!isGenerating && aiContext ? { scale: 1.05 } : {}}
      whileTap={!isGenerating && aiContext ? { scale: 0.95 } : {}}
    >
      {isGenerating ? <Loader2 size={16} className={styles.spinner} /> : <Download size={16} />}
      {isGenerating ? 'Generating...' : 'Download Report'}
    </motion.button>
  );
};
