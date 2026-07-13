import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Dna, 
  TrendingUp, 
  AlertTriangle,
  Lightbulb,
  CheckSquare,
  Map,
  Smile,
  BarChart2,
  FileText,
  ChevronLeft,
  ChevronRight,
  BrainCircuit
} from 'lucide-react';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activePage: string;
  setActivePage: (page: string) => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Executive Briefing' },
  { icon: BrainCircuit, label: 'AI CEO Mode' },
  { icon: Activity, label: 'Digital Twin' },
  { icon: Dna, label: 'Business DNA' },
  { icon: TrendingUp, label: 'What-If Simulator' },
  { icon: AlertTriangle, label: 'Risk Radar' },
  { icon: CheckSquare, label: 'Action Center' },
  { icon: Map, label: 'Success Roadmap' },
  { icon: FileText, label: 'Document Intel' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, activePage, setActivePage }) => {
  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <BrainCircuit className={styles.logoIcon} />
          {isOpen && <span className={styles.logoText}>AI<span className={styles.logoHighlight}>CEO</span></span>}
        </div>
        <button 
          className={styles.toggleBtn}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item, index) => (
          <a 
            href="#" 
            key={index} 
            className={`${styles.navItem} ${activePage === item.label ? styles.active : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActivePage(item.label);
            }}
          >
            <item.icon className={styles.navIcon} size={20} />
            {isOpen && <span className={styles.navLabel}>{item.label}</span>}
          </a>
        ))}
      </nav>
    </aside>
  );
};
