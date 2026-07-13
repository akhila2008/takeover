import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, Loader2, Database } from 'lucide-react';
import styles from './DocumentIntel.module.css';
import { useBusinessData } from '../context/BusinessDataContext';

export const DocumentIntel: React.FC = () => {
  const { documents, addDocument, updateDocumentStatus, updateMetricsFromDocument } = useBusinessData();
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    addDocument({
      id: docId,
      name: file.name,
      type: file.type || 'application/octet-stream',
      status: 'parsing',
      dateUploaded: new Date().toISOString()
    });

    // Simulate Parsing Delay (2.5 seconds to feel realistic)
    setTimeout(() => {
      updateDocumentStatus(docId, 'analyzed');
      updateMetricsFromDocument(file.name);
    }, 2500);
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

  return (
    <div className={styles.container}>
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
            {documents.length === 0 ? (
              <div className={styles.emptyState}>
                No documents uploaded yet.
              </div>
            ) : (
              <div className={styles.docItems}>
                {documents.map(doc => (
                  <div key={doc.id} className={styles.docItem}>
                    <div className={styles.docIcon}>
                      <FileText size={20} />
                    </div>
                    <div className={styles.docInfo}>
                      <p className={styles.docName} title={doc.name}>{doc.name}</p>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
