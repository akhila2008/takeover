import React, { useState, useEffect } from 'react';
import { Mail, User, Shield, Key } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import styles from './UserProfile.module.css';

export const UserProfile: React.FC = () => {
  const [user, setUser] = useState<{ name: string; email: string; role: string }>({
    name: 'CEO',
    email: 'ceo@takeover.ai',
    role: 'Administrator'
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.full_name || 'CEO',
          email: session.user.email || 'ceo@takeover.ai',
          role: 'Administrator'
        });
      } else {
        const localMock = localStorage.getItem('takeover_auth_mock');
        if (localMock) {
          const parsed = JSON.parse(localMock);
          setUser({
            name: parsed.fullName || 'CEO',
            email: parsed.email || 'ceo@takeover.ai',
            role: 'Administrator'
          });
        }
      }
    });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className="gradient-text">User Profile</h1>
        <p>Manage your personal account details and security.</p>
      </div>

      <div className={styles.card}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=100`} alt={user.name} />
          </div>
          <div className={styles.info}>
            <h2>{user.name}</h2>
            <p><Shield size={16} /> {user.role}</p>
          </div>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.field}>
            <label>Full Name</label>
            <div>
              <User size={16} style={{ display: 'inline', marginRight: '8px', color: '#9ca3af' }}/>
              {user.name}
            </div>
          </div>
          
          <div className={styles.field}>
            <label>Email Address</label>
            <div>
              <Mail size={16} style={{ display: 'inline', marginRight: '8px', color: '#9ca3af' }}/>
              {user.email}
            </div>
          </div>

          <div className={styles.field}>
            <label>Account Role</label>
            <div>
              <Key size={16} style={{ display: 'inline', marginRight: '8px', color: '#9ca3af' }}/>
              {user.role}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
