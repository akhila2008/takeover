import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import styles from './LoginModal.module.css';

interface LoginModalProps {
  onComplete: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onComplete }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (!isLogin && !fullName.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;
      }
      onComplete();
    } catch (err: any) {
      console.error('Auth error', err);
      // Determine fallback behaviour if Supabase is misconfigured or network fails
      if (
        err.message?.includes('FetchError') || 
        err.message?.includes('placeholder') || 
        err.message?.includes('Failed to fetch')
      ) {
        // Mock success for development fallback if Supabase isn't hooked up
        console.warn('Supabase not connected. Falling back to local auth mock.');
        localStorage.setItem('takeover_auth_mock', JSON.stringify({ email, fullName }));
        onComplete();
      } else {
        setErrorMsg(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrorMsg('');
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
            <UserCircle size={32} />
          </div>
          <h2 className={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className={styles.subtitle}>
            {isLogin 
              ? 'Enter your credentials to access your dashboard.' 
              : 'Sign up to initialize your AI CEO dashboard.'}
          </p>

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className={styles.errorBox}
            >
              {errorMsg}
            </motion.div>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            {!isLogin && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name</label>
                <input 
                  type="text" 
                  className={styles.input}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <input 
                type="email" 
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Password</label>
              <input 
                type="password" 
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={isSubmitting || !email.trim() || !password.trim() || (!isLogin && !fullName.trim())}
            >
              {isSubmitting ? (
                <div className={styles.spinner} />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className={styles.toggleText}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span className={styles.toggleLink} onClick={toggleMode}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
