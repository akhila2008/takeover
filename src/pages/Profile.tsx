import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Building2, ShoppingCart, Code, Briefcase, Landmark, Target, TrendingUp, Shield, Rocket } from 'lucide-react';
import styles from './Profile.module.css';
import { supabase } from '../lib/supabaseClient';

export const Profile: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    businessType: '',
    scale: '',
    goals: [] as string[]
  });
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('id', 'default')
          .single();
          
        if (data && !error) {
          setFormData({
            companyName: data.company_name || '',
            industry: data.industry || '',
            businessType: data.business_type || '',
            scale: data.scale || '',
            goals: data.goals || []
          });
        }
      } catch (err) {
        console.error('Failed to load profile from Supabase', err);
        // Fallback to local storage
        const saved = localStorage.getItem('takeover_business_profile');
        if (saved) setFormData(JSON.parse(saved));
      }
    };
    
    fetchProfile();
  }, []);

  const businessTypes = [
    { id: 'SaaS', icon: <Code size={24} />, label: 'SaaS / Software' },
    { id: 'E-commerce', icon: <ShoppingCart size={24} />, label: 'E-commerce' },
    { id: 'Agency', icon: <Briefcase size={24} />, label: 'Agency / Services' },
    { id: 'Retail', icon: <Building2 size={24} />, label: 'Retail / Brick & Mortar' },
    { id: 'Enterprise', icon: <Landmark size={24} />, label: 'Enterprise / B2B' }
  ];

  const scaleTypes = [
    { id: 'Startup', label: 'Startup', desc: '1 - 10 Employees' },
    { id: 'Mid-Market', label: 'Mid-Market', desc: '11 - 200 Employees' },
    { id: 'Enterprise', label: 'Enterprise', desc: '201+ Employees' }
  ];

  const strategicGoals = [
    { id: 'Hyper-Growth', label: 'Hyper-Growth', icon: <Rocket size={16} /> },
    { id: 'Maximize Profit', label: 'Maximize Profit', icon: <TrendingUp size={16} /> },
    { id: 'Risk Mitigation', label: 'Risk Mitigation', icon: <Shield size={16} /> },
    { id: 'Market Expansion', label: 'Market Expansion', icon: <Target size={16} /> }
  ];

  const handleGoalToggle = (goalId: string) => {
    setFormData(prev => {
      const isSelected = prev.goals.includes(goalId);
      if (isSelected) {
        return { ...prev, goals: prev.goals.filter(g => g !== goalId) };
      } else {
        return { ...prev, goals: [...prev.goals, goalId] };
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Persist to local storage as backup
    localStorage.setItem('takeover_business_profile', JSON.stringify(formData));
    
    // Save to Supabase
    try {
      await supabase.from('business_profiles').upsert({
        id: 'default',
        company_name: formData.companyName,
        industry: formData.industry,
        business_type: formData.businessType,
        scale: formData.scale,
        goals: formData.goals
      }, { onConflict: 'id' });
    } catch (err) {
      console.error('Failed to save to Supabase', err);
    }
    
    setIsSaving(false);
    setShowSuccess(true);
    window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Business Profile successfully updated and synced with AI.' }));
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Business Profile</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Configure your company DNA to calibrate the AI engine.</p>
        </div>
        <button 
          className={`${styles.saveBtn} ${showSuccess ? styles.successBtn : ''}`}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <span className={styles.spinner}></span>
          ) : showSuccess ? (
            'Saved!'
          ) : (
            <><Save size={18} /> Save Changes</>
          )}
        </button>
      </header>

      <div className={styles.grid}>
        {/* Left Column - Core Details */}
        <div className={styles.column}>
          <motion.div 
            className={`glass-panel ${styles.card}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2>General Information</h2>
            <div className={styles.formGroup}>
              <label>Company Name</label>
              <input 
                type="text" 
                className={styles.input} 
                value={formData.companyName}
                placeholder="Enter company name"
                onChange={e => setFormData({...formData, companyName: e.target.value})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Industry</label>
              <input 
                type="text" 
                className={styles.input} 
                value={formData.industry}
                placeholder="e.g. Technology, Retail, etc."
                onChange={e => setFormData({...formData, industry: e.target.value})}
              />
            </div>
          </motion.div>

          <motion.div 
            className={`glass-panel ${styles.card}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2>Company Scale</h2>
            <div className={styles.scaleGrid}>
              {scaleTypes.map(scale => (
                <div 
                  key={scale.id}
                  className={`${styles.scaleOption} ${formData.scale === scale.id ? styles.selected : ''}`}
                  onClick={() => setFormData({...formData, scale: scale.id})}
                >
                  <div className={styles.radio}>
                    {formData.scale === scale.id && <div className={styles.radioInner} />}
                  </div>
                  <div>
                    <h4>{scale.label}</h4>
                    <p>{scale.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Types & Goals */}
        <div className={styles.column}>
          <motion.div 
            className={`glass-panel ${styles.card}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2>Business Type</h2>
            <p className={styles.desc}>This informs the AI's financial and operational models.</p>
            <div className={styles.typeGrid}>
              {businessTypes.map(type => (
                <div 
                  key={type.id}
                  className={`${styles.typeCard} ${formData.businessType === type.id ? styles.selectedCard : ''}`}
                  onClick={() => setFormData({...formData, businessType: type.id})}
                >
                  <div className={styles.typeIcon}>{type.icon}</div>
                  <span>{type.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className={`glass-panel ${styles.card}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2>Primary Strategic Goals</h2>
            <p className={styles.desc}>Select the areas the AI should prioritize in its suggestions.</p>
            <div className={styles.goalsWrap}>
              {strategicGoals.map(goal => (
                <button
                  key={goal.id}
                  className={`${styles.goalPill} ${formData.goals.includes(goal.id) ? styles.selectedPill : ''}`}
                  onClick={() => handleGoalToggle(goal.id)}
                >
                  {goal.icon} {goal.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
