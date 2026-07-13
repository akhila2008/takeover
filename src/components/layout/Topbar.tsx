import React from 'react';
import { Search, Bell, Settings, User, Mic } from 'lucide-react';
import styles from './Topbar.module.css';

interface TopbarProps {
  onNavigate?: (page: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onNavigate }) => {
  return (
    <header className={styles.topbar}>
      <div className={styles.searchContainer}>
        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Ask AI CEO or press Cmd + K..." 
            className={styles.searchInput}
          />
          <div className={styles.shortcutKey}>⌘ K</div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={`${styles.iconBtn} ${styles.voiceBtn}`} title="AI Voice Executive" onClick={() => onNavigate?.('ai-ceo-mode')}>
          <Mic size={20} />
        </button>
        <button className={styles.iconBtn} onClick={() => onNavigate?.('action-center')}>
          <Bell size={20} />
          <span className={styles.badge}></span>
        </button>
        <button className={styles.iconBtn} onClick={() => onNavigate?.('settings')}>
          <Settings size={20} />
        </button>
        <div className={styles.avatar} onClick={() => onNavigate?.('profile')} style={{ cursor: 'pointer' }}>
          <img src="https://ui-avatars.com/api/?name=CEO&background=6366f1&color=fff" alt="User" />
        </div>
      </div>
    </header>
  );
};
