import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { useBusinessData } from '../../context/BusinessDataContext';
import { Dropdown } from '../ui/Dropdown';
import styles from './TimeFilterBar.module.css';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const YEARS = Array.from({ length: 31 }, (_, i) => 2020 + i); // 2020 to 2050

interface Props {
  onNavigate?: (page: string) => void;
}

export const TimeFilterBar: React.FC<Props> = ({ onNavigate }) => {
  const { analysisMode, setAnalysisMode, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear } = useBusinessData();

  const handlePrevMonth = () => {
    const currentIndex = MONTHS.indexOf(selectedMonth);
    if (currentIndex === 0) {
      setSelectedMonth('December');
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(MONTHS[currentIndex - 1]);
    }
  };

  const handleNextMonth = () => {
    const currentIndex = MONTHS.indexOf(selectedMonth);
    
    if (currentIndex === 11) {
      setSelectedMonth('January');
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(MONTHS[currentIndex + 1]);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftGroup}>
        <button 
          className={`${styles.modeBtn} ${analysisMode === 'Monthly' ? styles.active : ''}`}
          onClick={() => setAnalysisMode('Monthly')}
        >
          Monthly
        </button>
        <button 
          className={`${styles.modeBtn} ${analysisMode === 'Annual' ? styles.active : ''}`}
          onClick={() => setAnalysisMode('Annual')}
        >
          Annual
        </button>
      </div>
      
      <div className={styles.centerGroup}>
        <button className={styles.navBtn} onClick={analysisMode === 'Monthly' ? handlePrevMonth : () => setSelectedYear(selectedYear - 1)}>
          <ChevronLeft size={18} />
        </button>
        
        <div className={styles.currentPeriod}>
          <Calendar size={16} className={styles.calendarIcon} />
          {analysisMode === 'Monthly' ? (
            <div className={styles.selectGroup}>
              <Dropdown 
                value={selectedMonth} 
                onChange={val => setSelectedMonth(val as string)}
                options={MONTHS.map((m) => ({ value: m, label: m }))}
              />
              <Dropdown 
                value={selectedYear} 
                onChange={val => setSelectedYear(val as number)}
                options={YEARS.map(y => ({ value: y, label: y.toString() }))}
              />
            </div>
          ) : (
            <div className={styles.selectGroup}>
              <Dropdown 
                value={selectedYear} 
                onChange={val => setSelectedYear(val as number)}
                options={YEARS.map(y => ({ value: y, label: y.toString() }))}
              />
              <span>Overview</span>
            </div>
          )}
        </div>
        
        <button 
          className={styles.navBtn} 
          onClick={
            analysisMode === 'Monthly' 
              ? handleNextMonth 
              : () => setSelectedYear(selectedYear + 1)
          }
        >
          <ChevronRight size={18} />
        </button>
      </div>
      
      <div className={styles.rightGroup}>
        <button className={styles.actionBtn} onClick={() => onNavigate?.('business-history')}>
          <History size={16} />
          <span>History</span>
        </button>
      </div>
    </div>
  );
};
