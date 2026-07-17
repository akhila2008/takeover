import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, Loader2, Database, X, BarChart3, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './DocumentIntel.module.css';
import { useBusinessData } from '../context/BusinessDataContext';
import * as pdfjsLib from 'pdfjs-dist';

// Use CDN for worker to avoid Vite build issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;


interface Props {
  onNavigate?: (page: string) => void;
}

export const DocumentIntel: React.FC<Props> = ({ onNavigate }) => {
  const { 
    documents, addDocument, updateDocumentStatus, 
    updateMetricsFromDocument, removeDocument, generateSnapshot,
    selectedMonth, selectedYear, analysisMode, isLoaded, beginAnalysis, analysisProgress, setAnalysisProgress
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

  const isAnalyzing = filteredDocs.some(d => d.status === 'parsing') || (analysisProgress.stage !== 'idle' && analysisProgress.stage !== 'complete');
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

  const processFile = async (file: File) => {
    const docId = `doc-${Date.now()}`;
    const fileDate = new Date(file.lastModified || Date.now());
    const day = fileDate.getDate();

    // Directly use the currently selected month and year from the dashboard!
    const month = selectedMonth;
    const year = selectedYear;

    let rawContent: string | undefined = undefined;

    // Read file content for data extraction
    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          // Group items by Y coordinate (rounded to nearest 5 to avoid slight misalignment)
          const linesMap = new Map<number, any[]>();
          textContent.items.forEach((item: any) => {
            if (!item.str || item.str.trim() === '') return;
            const y = Math.round(item.transform[5] / 5) * 5;
            if (!linesMap.has(y)) linesMap.set(y, []);
            linesMap.get(y)!.push(item);
          });

          // Sort Y coordinates descending (PDF Y=0 is at bottom)
          const sortedY = Array.from(linesMap.keys()).sort((a, b) => b - a);

          sortedY.forEach(y => {
            const itemsOnLine = linesMap.get(y)!;
            // Sort by X coordinate ascending
            itemsOnLine.sort((a, b) => a.transform[4] - b.transform[4]);
            
            // Join with commas to simulate CSV structure
            const lineStr = itemsOnLine.map(item => {
                const str = item.str.trim();
                return str.includes(',') ? `"${str}"` : str;
            }).join(',');
            
            fullText += lineStr + '\n';
          });
        }
        rawContent = fullText;
      } else if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
        const arrayBuffer = await file.arrayBuffer();
        // Dynamically import xlsx to avoid huge bundle load up front
        const xlsx = await import('xlsx');
        const workbook = xlsx.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        rawContent = xlsx.utils.sheet_to_csv(worksheet);
      } else {
        rawContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });
      }
    } catch (err) {
      console.error("Failed to read file content:", err);
      alert(`Failed to parse file: ${file.name}. Please ensure it is a valid, uncorrupted file.`);
      return;
    }

    let fileHash = '';
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(file.name + file.size + (rawContent ? rawContent.substring(0, 1000) : ''));
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (err) {
      console.warn("Failed to generate hash, falling back to name/size", err);
      fileHash = file.name + '-' + file.size;
    }

    const newDoc = {
      id: docId,
      name: file.name,
      type: file.type || 'application/octet-stream',
      status: 'analyzed' as const,
      dateUploaded: new Date().toISOString(),
      day,
      month,
      year,
      rawContent,
      hash: fileHash
    };

    addDocument(newDoc);
    updateMetricsFromDocument(file.name);
    
    // Start processing simulation without navigating
    beginAnalysis(newDoc);
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
      setAnalysisProgress({ isAnalyzing: false, stage: 'idle', progressPercent: 0 });
    }, 400); // 400ms transition delay
  };

  const handleUploadAnother = () => {
    setAnalysisProgress({ isAnalyzing: false, stage: 'idle', progressPercent: 0 });
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
                        Processing Analysis...
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
