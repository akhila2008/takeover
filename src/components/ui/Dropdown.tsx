import React, { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import styles from './Dropdown.module.css';

export interface DropdownOption {
  value: string | number;
  label: ReactNode;
  icon?: ReactNode;
}

interface DropdownProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: DropdownOption[];
  className?: string;
  placeholder?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({ 
  value, 
  onChange, 
  options, 
  className = '',
  placeholder = 'Select an option'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value) || null;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setFocusedIndex(0);
      } else {
        setFocusedIndex(prev => (prev + 1) % options.length);
      }
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setFocusedIndex(options.length - 1);
      } else {
        setFocusedIndex(prev => (prev - 1 + options.length) % options.length);
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && focusedIndex >= 0 && focusedIndex < options.length) {
        onChange(options[focusedIndex].value);
        setIsOpen(false);
      } else if (!isOpen) {
        setIsOpen(true);
        setFocusedIndex(options.findIndex(opt => opt.value === value));
      }
    }
  };

  const handleSelect = (val: string | number) => {
    onChange(val);
    setIsOpen(false);
  };

  // Reset focus when opened
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(options.findIndex(opt => opt.value === value));
    }
  }, [isOpen, value, options]);

  return (
    <div 
      className={`${styles.dropdownContainer} ${className}`} 
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
    >
      <div 
        className={styles.dropdownHeader}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className={styles.headerText}>
          {selectedOption?.icon}
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={styles.chevron}
        >
          <ChevronDown size={16} />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.ul 
            className={styles.dropdownMenu}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            role="listbox"
          >
            {options.map((option, idx) => {
              const isSelected = option.value === value;
              const isFocused = idx === focusedIndex;
              
              return (
                <li 
                  key={option.value.toString()}
                  className={`${styles.menuItem} ${isSelected ? styles.selected : ''} ${isFocused ? styles.focused : ''}`}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setFocusedIndex(idx)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className={styles.menuItemContent}>
                    {option.icon}
                    <span>{option.label}</span>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className={styles.checkIcon}
                    >
                      <Check size={16} />
                    </motion.div>
                  )}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};
