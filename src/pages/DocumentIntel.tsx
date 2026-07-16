import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, Loader2, Database, X, BarChart3, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './DocumentIntel.module.css';
import { useBusinessData } from '../context/BusinessDataContext';

interface Props {
  onNavigate?: (page: string) => void;
}

export const DocumentIntel: React.FC<Props> = ({ onNavigate }) => {
  const { 
    documents, addDocument, updateDocumentStatus, 
    updateMetricsFromDocument, removeDocument, generateSnapshot,
    selectedMonth, selectedYear, analysisMode, isLoaded, beginAnalysis
  } = useBusinessData();
  const [dragActive, setDragActive] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDocs = documents.filter(d => {
    if (analysisMode === 'Monthly') {
      return d.month === selectedMonth && d.year === selectedYear;
    } else {
      return d.year === selectedYear;
    }
  });

  const isAnalyzing = filteredDocs.some(d => d.status === 'parsing');
  const hasAnalyzedDocs = filteredDocs.length > 0 && !isAnalyzing;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    const docId = `doc-${Date.now()}`;
    const fileDate = new Date(file.lastModified || Date.now());
    const day = fileDate.getDate();

    // Directly use the currently selected month and year from the dashboard!
    const month = selectedMonth;
    const year = selectedYear;

    addDocument({
      id: docId,
      name: file.name,
      type: file.type || 'application/octet-stream',
      status: 'parsing',
      dateUploaded: new Date().toISOString(),
      day,
      month,
      year
    });

    // Immediately mark as analyzed so context updates
    updateDocumentStatus(docId, 'analyzed');
    updateMetricsFromDocument(file.name);
    
    // Auto-navigate to dashboard to watch progressive rendering
    if (onNavigate) {
      setIsTransitioning(true);
      setTimeout(() => {
        onNavigate('executive-briefing');
        beginAnalysis();
      }, 400); // Small delay for transition
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleViewAnalysis = () => {
    if (!onNavigate) return;
    setIsTransitioning(true);
    setTimeout(() => {
      onNavigate('executive-briefing');
    }, 400); // 400ms transition delay
  };

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 1 }}
      animate={{ opacity: isTransitioning ? 0 : 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.header}>
        <h1>Document Intelligence Hub</h1>
        <p>Upload sales reports, customer databases, expenses, or inventory PDFs. Our engine will dynamically analyze the data and update your business health metrics in real-time.</p>
      </div>

      <div className={styles.content}>
        <div className={styles.main}>
          <div 
            className={`${styles.uploadZone} ${dragActive ? styles.dragActive : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              className={styles.fileInput} 
              onChange={handleChange} 
              accept=".pdf,.csv,.xlsx,.xls"
            />
            <UploadCloud size={48} className={styles.uploadIcon} />
            <h3>Drag & Drop Documents Here</h3>
            <p>Supports PDF, CSV, and Excel spreadsheets</p>
            <button className={styles.browseBtn} onClick={() => fileInputRef.current?.click()}>
              Browse Files
            </button>
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.docList}>
            <h3><Database size={18} /> Processed Documents</h3>
            {!isLoaded ? (
              <div className={styles.emptyState}>
                <Loader2 size={16} className={styles.spinner} style={{ marginRight: 8, display: 'inline' }} />
                Loading documents...
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className={styles.emptyState}>
                No documents uploaded for this period.
              </div>
            ) : (
              <div className={styles.docItems}>
                {filteredDocs.map(doc => (
                  <div key={doc.id} className={styles.docItem}>
                    <div className={styles.docIcon}>
                      <FileText size={20} />
                    </div>
                    <div className={styles.docInfo}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <p className={styles.docName} title={doc.name}>{doc.name}</p>
                        {doc.month && <span style={{ fontSize: '0.7rem', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '2px 6px', borderRadius: '4px' }}>{doc.month} {doc.year}</span>}
                      </div>
                      <div className={styles.docStatus}>
                        {doc.status === 'parsing' ? (
                          <>
                            <Loader2 size={12} className={`${styles.spinner} ${styles.parsing}`} />
                            <span className={styles.parsing}>Analyzing Data...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle size={12} className={styles.analyzed} />
                            <span className={styles.analyzed}>Insights Extracted</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button 
                      className={styles.deleteBtn} 
                      onClick={() => removeDocument(doc.id)}
                      title="Remove document"
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <AnimatePresence>
              {(isAnalyzing || hasAnalyzedDocs) && (
                <motion.div 
                  className={styles.analysisActionContainer}
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                >
                  <motion.button
                    className={`${styles.viewAnalysisBtn} ${isAnalyzing ? styles.analyzingBtn : ''}`}
                    onClick={handleViewAnalysis}
                    disabled={isAnalyzing || isTransitioning}
                    whileHover={!isAnalyzing && !isTransitioning ? { scale: 1.03 } : {}}
                    whileTap={!isAnalyzing && !isTransitioning ? { scale: 0.98 } : {}}
                    aria-label={isAnalyzing ? 'Analyzing documents' : 'View Analysis'}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 size={18} className={styles.spinnerBtn} />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BarChart3 size={18} />
                        View Analysis
                        <ArrowRight size={18} className={styles.arrowIcon} />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
