import React, { useState, useEffect } from 'react';
import { Bell, Settings, LogOut, Mic } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import styles from './Topbar.module.css';

interface TopbarProps {
  onNavigate?: (page: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onNavigate }) => {
  const [userName, setUserName] = useState('CEO');

  useEffect(() => {
    // Attempt to fetch name from session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.user_metadata?.full_name) {
        setUserName(session.user.user_metadata.full_name);
      } else {
        const localMock = localStorage.getItem('takeover_auth_mock');
        if (localMock) {
          const parsed = JSON.parse(localMock);
          if (parsed.fullName) setUserName(parsed.fullName);
        }
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('takeover_auth_mock');
    window.location.reload(); // Force reload to trigger auth check in App.tsx
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.actions} style={{ marginLeft: 'auto' }}>
        <button className={`${styles.iconBtn} ${styles.voiceBtn}`} title="AI Voice Executive" onClick={() => onNavigate?.('ai-ceo-mode')}>
          <Mic size={20} />
        </button>
        <button className={styles.iconBtn} onClick={() => onNavigate?.('action-center')}>
          <Bell size={20} />
          <span className={styles.badge}></span>
        </button>
        <button className={styles.iconBtn} onClick={() => onNavigate?.('settings')} title="Settings">
          <Settings size={20} />
        </button>
        <button className={styles.iconBtn} onClick={handleLogout} title="Log Out">
          <LogOut size={20} />
        </button>
        <div className={styles.avatar} onClick={() => onNavigate?.('profile')} style={{ cursor: 'pointer' }} title={userName}>
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=6366f1&color=fff`} alt={userName} />
        </div>
      </div>
    </header>
  );
};
