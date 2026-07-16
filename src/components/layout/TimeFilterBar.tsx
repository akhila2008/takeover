import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { useBusinessData } from '../../context/BusinessDataContext';
import { Dropdown } from '../ui/Dropdown';
import styles from './TimeFilterBar.module.css';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const nowIST = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
const currentYear = nowIST.getFullYear();
const currentMonthIndex = nowIST.getMonth();
const YEARS = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => 1950 + i);

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
    
    // Prevent going into the future if we're in the current year
    if (selectedYear === currentYear && currentIndex >= currentMonthIndex) {
      return;
    }

    if (currentIndex === 11) {
      // Prevent going into a future year
      if (selectedYear >= currentYear) return;
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
                options={MONTHS.map((m, index) => {
                  const isFutureMonth = selectedYear === currentYear && index > currentMonthIndex;
                  return isFutureMonth ? null : { value: m, label: m };
                }).filter(Boolean) as { value: string, label: string }[]}
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
              : () => {
                  if (selectedYear < currentYear) {
                    setSelectedYear(selectedYear + 1);
                  }
                }
          }
          style={{ opacity: (analysisMode === 'Monthly' && selectedYear === currentYear && MONTHS.indexOf(selectedMonth) >= currentMonthIndex) || (analysisMode === 'Annual' && selectedYear >= currentYear) ? 0.3 : 1, cursor: (analysisMode === 'Monthly' && selectedYear === currentYear && MONTHS.indexOf(selectedMonth) >= currentMonthIndex) || (analysisMode === 'Annual' && selectedYear >= currentYear) ? 'not-allowed' : 'pointer' }}
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
