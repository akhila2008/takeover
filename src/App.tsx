import React, { useState, useEffect } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { ExecutiveBriefing } from './pages/ExecutiveBriefing';
import { DigitalTwin } from './pages/DigitalTwin';
import { WhatIfSimulator } from './pages/WhatIfSimulator';
import { RiskRadar } from './pages/RiskRadar';
import { AiCeoMode } from './pages/AiCeoMode';
import { ComingSoon } from './components/ComingSoon';
import { Toast } from './components/ui/Toast';
import { ActionCenter } from './pages/ActionCenter';
import { UniversalModule } from './pages/UniversalModule';
import { Profile } from './pages/Profile';
import { LoginModal } from './components/ui/LoginModal';

import { BusinessDataProvider } from './context/BusinessDataContext';
import { DocumentIntel } from './pages/DocumentIntel';
import { BusinessHistory } from './pages/BusinessHistory';
import { PeriodComparison } from './pages/PeriodComparison';
import { supabase } from './lib/supabaseClient';

function App() {
  const [activePage, setActivePage] = useState('executive-briefing');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. Check Supabase first
        const { data, error } = await supabase
          .from('business_profiles')
          .select('company_name')
          .eq('id', 'default')
          .single();
          
        if (data && data.company_name) {
          setIsAuthenticated(true);
          return;
        }
      } catch (err) {
        console.log('Supabase check failed, falling back to local storage');
      }

      // 2. Fallback to local storage
      const saved = localStorage.getItem('takeover_business_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.companyName || parsed.company_name) {
          setIsAuthenticated(true);
          return;
        }
      }

      // 3. Not authenticated
      setIsAuthenticated(false);
    };

    checkAuth();
  }, []);

  const renderContent = () => {
    const slugifiedPage = activePage.toLowerCase().replace(/\s+/g, '-');
    const prettyTitle = activePage.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    switch (slugifiedPage) {
      case 'executive-briefing':
        return <ExecutiveBriefing onNavigate={setActivePage} />;
      case 'action-center':
        return <ActionCenter />;
      case 'ai-ceo-mode':
        return <AiCeoMode />;
      case 'digital-twin':
        return <DigitalTwin />;
      case 'what-if-simulator':
        return <WhatIfSimulator />;
      case 'risk-radar':
        return <RiskRadar />;
      case 'profile':
      case 'business-dna':
      case 'settings':
        return <Profile />;
      case 'document-intel':
        return <DocumentIntel />;
      case 'period-comparison':
        return <PeriodComparison />;
      case 'business-history':
        return <BusinessHistory />;
      default:
        return <UniversalModule title={prettyTitle} />;
    }
  };

  // Show nothing while checking auth state to prevent flash
  if (isAuthenticated === null) return null;

  return (
    <BusinessDataProvider>
      <Toast />
      {!isAuthenticated && <LoginModal onComplete={() => setIsAuthenticated(true)} />}
      <MainLayout activePage={activePage} setActivePage={setActivePage}>
        {renderContent()}
      </MainLayout>
    </BusinessDataProvider>
  );
}

export default App;
