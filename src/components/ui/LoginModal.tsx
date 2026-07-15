import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import styles from './LoginModal.module.css';

interface LoginModalProps {
  onComplete: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onComplete }) => {
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setIsSubmitting(true);

    try {
      // Create default profile payload
      const payload = {
        id: 'default',
        company_name: companyName,
        industry: industry,
        business_type: 'SaaS', // Default fallback
        scale: 'Startup', // Default fallback
        goals: []
      };

      // Save to local storage for immediate access
      localStorage.setItem('takeover_business_profile', JSON.stringify(payload));
      
      // Save to Supabase
      await supabase.from('business_profiles').upsert(payload, { onConflict: 'id' });
      
      // Dispatch event for any listeners (optional but good practice based on Profile.tsx)
      window.dispatchEvent(new Event('profile-updated'));
      
      onComplete();
    } catch (err) {
      console.error('Failed to create profile', err);
      // Even if Supabase fails (e.g. no network), let the user in with local storage
      onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className={styles.overlay}>
        <motion.div 
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className={styles.iconWrapper}>
            <Rocket size={32} />
          </div>
          <h2 className={styles.title}>Welcome to AI CEO</h2>
          <p className={styles.subtitle}>
            Enter your company details to initialize your personalized business intelligence dashboard.
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Company Name *</label>
              <input 
                type="text" 
                className={styles.input}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corp"
                required
                autoFocus
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Industry (Optional)</label>
              <input 
                type="text" 
                className={styles.input}
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Technology, Retail"
              />
            </div>

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={isSubmitting || !companyName.trim()}
            >
              {isSubmitting ? (
                <div className={styles.spinner} />
              ) : (
                <>
                  Initialize Dashboard
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
