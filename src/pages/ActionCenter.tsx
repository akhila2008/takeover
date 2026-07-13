import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, CircleDashed, ArrowRight, TrendingUp, AlertTriangle, Play } from 'lucide-react';
import styles from './ActionCenter.module.css';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  confidence: number;
  type: 'AI Suggestion' | 'Manual' | 'Automated';
}

export const ActionCenter: React.FC = () => {
  const [suggestedTasks] = useState<Task[]>([
    {
      id: 'task-1',
      title: 'Reduce Slow-Moving Inventory',
      description: 'Liquidating bottom 10% SKU performers will free up ₹45k in cash flow.',
      priority: 'High',
      confidence: 89,
      type: 'AI Suggestion'
    },
    {
      id: 'task-2',
      title: 'Increase Marketing for Product A',
      description: 'Reallocating ₹5,000 to Product A ads is projected to yield a 3x ROI.',
      priority: 'Medium',
      confidence: 75,
      type: 'AI Suggestion'
    }
  ]);

  const [activeTasks] = useState<Task[]>([
    {
      id: 'task-3',
      title: 'Server Infrastructure Migration',
      description: 'Scaling down redundant servers to optimize cloud spend by 15%.',
      priority: 'High',
      confidence: 94,
      type: 'Automated'
    }
  ]);

  const [completedTasks] = useState<Task[]>([
    {
      id: 'task-4',
      title: 'Q2 Pricing Optimization',
      description: 'Dynamic pricing adjustment resulted in a 4% margin increase.',
      priority: 'High',
      confidence: 99,
      type: 'Automated'
    }
  ]);

  const renderTaskCard = (task: Task, columnType: 'suggested' | 'active' | 'completed') => (
    <motion.div 
      key={task.id}
      className={`glass-panel ${styles.taskCard}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.01 }}
    >
      <div className={styles.cardHeader}>
        <span className={`${styles.priorityBadge} ${styles[task.priority.toLowerCase()]}`}>
          {task.priority} Priority
        </span>
        <span className={styles.confidenceScore}>
          {task.confidence}% Conf.
        </span>
      </div>
      
      <h3 className={styles.taskTitle}>{task.title}</h3>
      <p className={styles.taskDesc}>{task.description}</p>
      
      <div className={styles.cardFooter}>
        <span className={styles.taskType}>{task.type}</span>
        
        {columnType === 'suggested' && (
          <button className={styles.actionBtn}>Execute <Play size={14} fill="currentColor" /></button>
        )}
        {columnType === 'active' && (
          <span className={styles.statusLabel} style={{ color: 'var(--accent-info)' }}>
            <CircleDashed size={14} className="spin" /> In Progress
          </span>
        )}
        {columnType === 'completed' && (
          <span className={styles.statusLabel} style={{ color: 'var(--accent-success)' }}>
            <CheckCircle2 size={14} /> Done
          </span>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Action Center</h1>
          <p style={{ color: 'var(--text-secondary)' }}>AI-Driven Execution & Task Management</p>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statBox}>
            <TrendingUp size={16} style={{ color: 'var(--accent-success)' }} />
            <span>3 Active</span>
          </div>
          <div className={styles.statBox}>
            <AlertTriangle size={16} style={{ color: 'var(--accent-warning)' }} />
            <span>2 Pending</span>
          </div>
        </div>
      </header>

      <div className={styles.kanbanBoard}>
        {/* Column 1: Suggested */}
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <h2>AI Suggested</h2>
            <span className={styles.countBadge}>{suggestedTasks.length}</span>
          </div>
          <div className={styles.taskList}>
            {suggestedTasks.map(t => renderTaskCard(t, 'suggested'))}
          </div>
        </div>

        {/* Column 2: In Execution */}
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <h2 style={{ color: 'var(--accent-info)' }}>In Execution</h2>
            <span className={styles.countBadge} style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-info)' }}>{activeTasks.length}</span>
          </div>
          <div className={styles.taskList}>
            {activeTasks.map(t => renderTaskCard(t, 'active'))}
          </div>
        </div>

        {/* Column 3: Completed */}
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <h2 style={{ color: 'var(--text-secondary)' }}>Completed</h2>
            <span className={styles.countBadge} style={{ background: 'rgba(255, 255, 255, 0.1)' }}>{completedTasks.length}</span>
          </div>
          <div className={styles.taskList}>
            {completedTasks.map(t => renderTaskCard(t, 'completed'))}
          </div>
        </div>
      </div>
    </div>
  );
};
