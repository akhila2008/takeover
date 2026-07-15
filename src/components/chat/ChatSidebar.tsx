import React, { useState, useMemo } from 'react';
import { Plus, Search, MessageSquare, Trash2, Edit2, Check, X } from 'lucide-react';
import styles from './ChatSidebar.module.css';
import type { Conversation } from '../../lib/chatService';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  isOpen: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  isOpen
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(c => c.title.toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  const groups = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const result = {
      Today: [] as Conversation[],
      Yesterday: [] as Conversation[],
      'Previous 7 Days': [] as Conversation[],
      Older: [] as Conversation[]
    };

    filtered.forEach(c => {
      const d = new Date(c.updated_at);
      if (d >= today) result.Today.push(c);
      else if (d >= yesterday) result.Yesterday.push(c);
      else if (d >= lastWeek) result['Previous 7 Days'].push(c);
      else result.Older.push(c);
    });

    return result;
  }, [filtered]);

  const startEdit = (e: React.MouseEvent, c: Conversation) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditValue(c.title);
  };

  const saveEdit = (e: React.MouseEvent | React.KeyboardEvent, id: string) => {
    e.stopPropagation();
    if (editValue.trim()) {
      onRename(id, editValue.trim());
    }
    setEditingId(null);
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      onDelete(id);
    }
  };

  return (
    <div className={`${styles.sidebar} ${!isOpen ? styles.collapsed : ''}`}>
      <div className={styles.sidebarInner}>
        <div className={styles.header}>
          <button className={styles.newChatBtn} onClick={onNew}>
            <Plus size={18} /> New Chat
          </button>
        </div>

        <div className={styles.searchContainer}>
          <Search size={16} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search chats..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.list}>
          {Object.entries(groups).map(([groupName, groupConvos]) => {
            if (groupConvos.length === 0) return null;
            return (
              <div key={groupName}>
                <div className={styles.groupTitle}>{groupName}</div>
                {groupConvos.map(c => (
                  <div 
                    key={c.id} 
                    className={`${styles.convoItem} ${activeId === c.id ? styles.active : ''}`}
                    onClick={() => onSelect(c.id)}
                  >
                    <MessageSquare size={16} className={styles.convoIcon} />
                    
                    {editingId === c.id ? (
                      <input 
                        autoFocus
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveEdit(e, c.id)}
                        onClick={e => e.stopPropagation()}
                        className={styles.editInput}
                      />
                    ) : (
                      <div className={styles.convoTitle}>{c.title}</div>
                    )}

                    {editingId === c.id ? (
                      <div className={styles.convoActions} style={{ opacity: 1 }}>
                        <button className={styles.actionBtn} onClick={e => saveEdit(e, c.id)}><Check size={14} /></button>
                        <button className={styles.actionBtn} onClick={cancelEdit}><X size={14} /></button>
                      </div>
                    ) : (
                      <div className={styles.convoActions}>
                        <button className={styles.actionBtn} onClick={e => startEdit(e, c)} title="Rename"><Edit2 size={14} /></button>
                        <button className={`${styles.actionBtn} ${styles.danger}`} onClick={e => handleDelete(e, c.id)} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '2rem', fontSize: '0.875rem' }}>
              No conversations found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
