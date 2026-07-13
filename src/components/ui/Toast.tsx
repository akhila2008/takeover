import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';
import styles from './Toast.module.css';

export const Toast: React.FC = () => {
  const [toast, setToast] = useState<{message: string, id: number} | null>(null);

  useEffect(() => {
    const handleToast = (e: any) => {
      setToast({ message: e.detail, id: Date.now() });
      setTimeout(() => {
        setToast(null);
      }, 4000);
    };
    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          className={styles.toast}
          initial={{ opacity: 0, y: -50, scale: 0.9, x: '-50%' }}
          animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
          exit={{ opacity: 0, y: -20, scale: 0.9, x: '-50%' }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.glow}></div>
          <Info size={20} className={styles.icon} />
          <span className={styles.message}>{toast.message}</span>
          <button className={styles.closeBtn} onClick={() => setToast(null)}>
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
