import React, { useState, useEffect } from 'react';
import { Search, Terminal, TrendingUp, AlertCircle, FileText, Settings, X } from 'lucide-react';
import styles from './CommandPalette.module.css';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');

  // Handle Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open is usually handled by parent, but we can emit an event or use context
          // Here we assume parent is handling the shortcut, we just listen to close on Esc
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { icon: TrendingUp, label: "Predict next month's profit", category: "AI Actions" },
    { icon: AlertCircle, label: "Find inventory at risk", category: "AI Actions" },
    { icon: FileText, label: "Explain my cash flow", category: "AI Actions" },
    { icon: Terminal, label: "Generate a marketing plan", category: "AI Actions" },
    { icon: Settings, label: "Settings", category: "System" },
  ];

  const filteredCommands = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.palette} onClick={e => e.stopPropagation()}>
        <div className={styles.searchHeader}>
          <Search className={styles.searchIcon} size={20} />
          <input 
            type="text"
            className={styles.searchInput}
            placeholder="What do you want to know or do?"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.results}>
          {filteredCommands.length > 0 ? (
            <div className={styles.group}>
              <div className={styles.groupLabel}>Suggestions</div>
              {filteredCommands.map((cmd, idx) => (
                <div key={idx} className={styles.commandItem}>
                  <cmd.icon size={18} className={styles.cmdIcon} />
                  <span>{cmd.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              <p>No commands found for "{query}"</p>
              <span className={styles.aiHint}>Press Enter to ask AI CEO directly</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
