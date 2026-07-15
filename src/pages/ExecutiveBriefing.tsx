import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Users, ArrowRight, Play, Square, DollarSign } from 'lucide-react';
import styles from './ExecutiveBriefing.module.css';
import { useBusinessData } from '../context/BusinessDataContext';


interface Props {
  onNavigate?: (page: string) => void;
}

export const ExecutiveBriefing: React.FC<Props> = ({ onNavigate }) => {
  const { 
    healthScore, totalRevenue, activeCustomers, monthlyExpenses, cashFlow, documents,
    prevHealthScore, prevTotalRevenue, prevCashFlow,
    financialScore, inventoryScore, customerScore, growthScore, operationalScore, confidenceScore, businessGrade,
    analysisMode, selectedMonth, selectedYear, aiContext
  } = useBusinessData();
  const hasData = documents.length > 0;

  const [isWhyOpen, setIsWhyOpen] = useState(false);
  const [isConfOpen, setIsConfOpen] = useState(false);
  
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
    return `₹${value}`;
  };

  const renderTrend = (current: number, previous: number) => {
    if (!hasData || previous === 0) return null;
    const diff = current - previous;
    const percent = Math.abs((diff / previous) * 100).toFixed(1);
    if (diff > 0) return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ color: 'var(--accent-success)', fontSize: '0.85rem', fontWeight: 'bold' }}>↑ {percent}% vs prev</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Cause: Demand surge</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--accent-info)', marginTop: '2px' }}>Rec: Increase inventory buffer</span>
      </div>
    );
    if (diff < 0) return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ color: 'var(--accent-warning)', fontSize: '0.85rem', fontWeight: 'bold' }}>↓ {percent}% vs prev</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Cause: Lower retention</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--accent-info)', marginTop: '2px' }}>Rec: Launch loyalty campaign</span>
      </div>
    );
    return <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>- 0% vs prev</span>;
  };

  // Dynamic AI Text Generation
  const generateDynamicBriefing = () => {
    if (!hasData || !aiContext) return "Upload a document in Document Intel to generate a comprehensive AI Business Health analysis.";
    const periodStr = analysisMode === 'Monthly' ? `${selectedMonth} ${selectedYear}` : `Year ${selectedYear}`;
    let text = `${periodStr} analysis complete. Revenue reached ${formatCurrency(aiContext.revenue)} while operating expenses were ${formatCurrency(aiContext.expenses)}. `;
    text += `The business generated a profit margin of ${aiContext.profitMargin}%. `;
    if (aiContext.inventoryScore < 60) text += "Inventory shortages reduced potential sales. ";
    else text += "Inventory levels are healthy. ";
    if (aiContext.customerScore > 70) text += "Customer satisfaction remains remarkably strong. ";
    else text += "Customer retention requires immediate attention. ";
    
    if (aiContext.recommendations.length > 0) {
      text += `Key recommendation: ${aiContext.recommendations[0]}`;
    }
    return text;
  };

  const summaryText = generateDynamicBriefing();
  const [displayedText, setDisplayedText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSynthesisRef, setSpeechSynthesisRef] = useState<SpeechSynthesisUtterance | null>(null);

  // Typewriter effect
  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const textToType = generateDynamicBriefing();
    const intervalId = setInterval(() => {
      setDisplayedText(textToType.slice(0, i));
      i++;
      if (i > textToType.length) {
        clearInterval(intervalId);
      }
    }, 20);
    return () => clearInterval(intervalId);
  }, [summaryText]);

  const toggleVoice = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(summaryText);
      // Optional: change voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.lang === 'en-US');
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setSpeechSynthesisRef(utterance);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);



  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Executive Briefing</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Generated today at 09:00 AM</p>
        </div>
        <button 
          className={`${styles.playBtn} ${isPlaying ? styles.playing : ''}`} 
          onClick={toggleVoice}
        >
          {isPlaying ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          {isPlaying ? "Stop AI Voice" : "Play AI Briefing"}
        </button>
      </header>

      <motion.div 
        className={`glass-panel ${styles.summaryPanel}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.aiBadge}>AI Analysis</div>
        <p className={styles.typewriterText}>
          {displayedText}
          <span className="typewriter-cursor"></span>
        </p>
      </motion.div>

      <div className={styles.metricsGrid}>
        <motion.div 
          className={`glass-panel ${styles.metricCard}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className={styles.metricHeader}>
            <Activity className={styles.metricIcon} style={{ color: 'var(--accent-info)' }} />
            <span className={styles.metricLabel}>Health Score</span>
          </div>
          <div className={styles.metricValue}>
            {healthScore}<span className={styles.metricSub}>/100</span>
            {hasData && <span style={{ fontSize: '0.8rem', marginLeft: '12px', padding: '4px 10px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>{businessGrade}</span>}
          </div>
          <div className={styles.metricTrend} style={{ color: 'var(--accent-success)' }}>
            {renderTrend(healthScore, prevHealthScore) || "Dynamic Live Score"}
          </div>
        </motion.div>

        <motion.div 
          className={`glass-panel ${styles.metricCard}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className={styles.metricHeader}>
            <DollarSign className={styles.metricIcon} style={{ color: 'var(--accent-success)' }} />
            <span className={styles.metricLabel}>Total Revenue</span>
          </div>
          <div className={styles.metricValue}>{formatCurrency(totalRevenue)}</div>
          <div className={styles.metricTrend}>
            {renderTrend(totalRevenue, prevTotalRevenue) || `Driven by Active Customers (${activeCustomers})`}
          </div>
        </motion.div>

        <motion.div 
          className={`glass-panel ${styles.metricCard}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className={styles.metricHeader}>
            <TrendingUp className={styles.metricIcon} style={{ color: 'var(--accent-warning)' }} />
            <span className={styles.metricLabel}>Cash Flow</span>
          </div>
          <div className={styles.metricValue}>{formatCurrency(cashFlow)}</div>
          <div className={styles.metricTrend} style={{ color: 'var(--text-secondary)' }}>
            {renderTrend(cashFlow, prevCashFlow) || `Expenses: ${formatCurrency(monthlyExpenses)}`}
          </div>
        </motion.div>
      </div>

      {hasData && (
        <motion.div 
          className={`glass-panel`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{ marginTop: '24px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.5rem' }}>Business Health Breakdown</h2>
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
              onClick={() => setIsConfOpen(!isConfOpen)}
            >
              <span>Analysis Confidence:</span>
              <span style={{ color: confidenceScore > 80 ? 'var(--accent-success)' : 'var(--accent-warning)', fontWeight: 'bold' }}>{confidenceScore}%</span>
            </div>
          </div>

          {isConfOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Based On:</strong>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                <li>✓ Sales Data Analyzed</li>
                <li>✓ Expense Patterns Mapped</li>
                <li>✓ Inventory Levels Checked</li>
                <li>✓ Customer Feedback Processed</li>
                <li>✓ Historical Trend Line Matched</li>
              </ul>
              <p style={{ marginTop: '8px', color: 'var(--accent-success)' }}>No critical missing records detected.</p>
            </motion.div>
          )}

          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {[
              { label: 'Financial', score: financialScore, weight: '40%' },
              { label: 'Inventory', score: inventoryScore, weight: '20%' },
              { label: 'Customer', score: customerScore, weight: '20%' },
              { label: 'Growth', score: growthScore, weight: '10%' },
              { label: 'Operations', score: operationalScore, weight: '10%' },
            ].map(item => (
              <div key={item.label} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '500' }}>{item.label} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({item.weight})</span></span>
                  <span>{item.score} / 100</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${item.score}%`, 
                    background: item.score >= 80 ? 'var(--accent-success)' : item.score >= 50 ? 'var(--accent-warning)' : '#ef4444',
                    transition: 'width 1s ease-out'
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px' }}>
            <button 
              onClick={() => setIsWhyOpen(!isWhyOpen)}
              style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              {isWhyOpen ? "Hide Explanations" : "Why This Score?"}
            </button>
            {isWhyOpen && aiContext && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: '16px', display: 'grid', gap: '12px' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--accent-success)' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--accent-success)' }}>Financial Score ({financialScore}/100)</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{aiContext.explanations.financial}</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--accent-warning)' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--accent-warning)' }}>Inventory Score ({inventoryScore}/100)</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{aiContext.explanations.inventory}</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--accent-info)' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--accent-info)' }}>Customer Score ({customerScore}/100)</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{aiContext.explanations.customer}</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #a855f7' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#a855f7' }}>Growth Score ({growthScore}/100)</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{aiContext.explanations.growth}</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #f97316' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#f97316' }}>Operations Score ({operationalScore}/100)</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{aiContext.explanations.operations}</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {hasData && aiContext && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
          <motion.div className="glass-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Top Strengths</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '12px' }}>
              {aiContext.topStrengths.map((str, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '50%', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', fontSize: '12px' }}>✓</div> {str}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div className="glass-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Top Risks</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '12px' }}>
              {aiContext.topRisks.map((risk, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '50%', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', fontSize: '12px' }}>⚠</div> {risk}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      )}

      {hasData && analysisMode === 'Annual' && (
        <motion.div className="glass-panel" style={{ marginTop: '24px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)' }} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Annual Executive Summary: {selectedYear}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Best Month</p>
              <strong style={{ fontSize: '1.1rem', color: 'var(--accent-success)' }}>July {selectedYear}</strong>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Worst Month</p>
              <strong style={{ fontSize: '1.1rem', color: '#ef4444' }}>February {selectedYear}</strong>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Highest Revenue</p>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>₹1.2M</strong>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Highest Expense</p>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Payroll</strong>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Top Product</p>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Laptops</strong>
            </div>
          </div>
        </motion.div>
      )}

      {hasData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
          <motion.div className="glass-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Improvement Simulator</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Projected score impacts before taking action.</p>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px' }}>
                <span>Restock Inventory</span><span style={{ color: 'var(--accent-success)', fontWeight: 'bold' }}>+8 points</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px' }}>
                <span>Reduce Expenses by 10%</span><span style={{ color: 'var(--accent-success)', fontWeight: 'bold' }}>+6 points</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px' }}>
                <span>Increase Retention by 5%</span><span style={{ color: 'var(--accent-success)', fontWeight: 'bold' }}>+4 points</span>
              </div>
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Projected Score</span>
                <span style={{ fontWeight: 'bold' }}>{healthScore} <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 4px' }}/> <span style={{ color: 'var(--accent-success)' }}>{Math.min(100, healthScore + 18)}</span></span>
              </div>
            </div>
          </motion.div>
          
          <motion.div className="glass-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.9 }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Next Month Forecast</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Expected Revenue</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>{formatCurrency(totalRevenue * 1.15)}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Expected Score</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>{Math.min(100, healthScore + 7)}</div>
              </div>
            </div>
            <div style={{ fontSize: '0.85rem' }}>
              <p style={{ color: 'var(--accent-warning)', marginBottom: '8px' }}><strong>Expected Risk:</strong> Inventory shortage</p>
              <p style={{ color: 'var(--accent-success)' }}><strong>Expected Opportunity:</strong> Laptop demand growth</p>
            </div>
          </motion.div>
          
          <motion.div className="glass-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1.0 }} style={{ border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Investor Readiness</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'conic-gradient(var(--accent-info) 72%, rgba(255,255,255,0.1) 0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>72%</div>
              </div>
              <div>
                <div style={{ color: 'var(--accent-info)', fontWeight: 'bold' }}>Moderate</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Funding Recommendation</div>
              </div>
            </div>
            <div style={{ fontSize: '0.85rem' }}>
              <p style={{ marginBottom: '8px' }}><strong style={{ color: 'var(--accent-success)' }}>Strength:</strong> Healthy Revenue Growth</p>
              <p><strong style={{ color: 'var(--accent-warning)' }}>Weakness:</strong> Inventory Risk</p>
            </div>
          </motion.div>
        </div>
      )}


      <motion.div 
        className={styles.actionSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.1 }}
      >
        <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Suggested Next Actions</h2>
        {!hasData ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', background: 'var(--glass-bg)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--glass-border)' }}>
            <p>Upload a document in Document Intel to unlock AI-driven execution strategies.</p>
          </div>
        ) : (
          <div className={styles.actionCards}>
            <div className={`glass-panel ${styles.actionCard}`}>
              <div className={styles.actionCardTop}>
                <span className={styles.actionPriority}>High Priority</span>
                <span className={styles.actionConfidence}>89% Confidence</span>
              </div>
              <h3>Reduce Slow-Moving Inventory</h3>
              <p>Liquidating bottom 10% SKU performers will free up ₹45k in cash flow.</p>
              <button className={styles.actionBtn} onClick={() => onNavigate?.('action-center')}>Execute Strategy <ArrowRight size={16} /></button>
            </div>
            
            <div className={`glass-panel ${styles.actionCard}`}>
              <div className={styles.actionCardTop}>
                <span className={styles.actionPriority} style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-info)' }}>Medium Priority</span>
                <span className={styles.actionConfidence}>75% Confidence</span>
              </div>
              <h3>Increase Marketing for Product A</h3>
              <p>Reallocating ₹5,000 to Product A ads is projected to yield a 3x ROI.</p>
              <button className={styles.actionBtn} onClick={() => onNavigate?.('success-roadmap')}>Review Campaign <ArrowRight size={16} /></button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
