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
import { UserProfile } from './pages/UserProfile';

// ONE-TIME CLEANUP: Remove August data from LocalStorage since Supabase sync failed
try {
  const saved = localStorage.getItem('takeover_business_data');
  if (saved) {
    let parsed = JSON.parse(saved);
    if (parsed && Array.isArray(parsed.documents)) {
      parsed.documents = parsed.documents.filter((d: any) => d.month !== 'August');
      localStorage.setItem('takeover_business_data', JSON.stringify(parsed));
    }
  }
} catch (e) {
  console.error(e);
}


function App() {
  const [activePage, setActivePage] = useState('executive-briefing');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
      } else {
        // Fallback for development if Supabase isn't hooked up
        const localMock = localStorage.getItem('takeover_auth_mock');
        setIsAuthenticated(!!localMock);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsAuthenticated(true);
      } else {
        const localMock = localStorage.getItem('takeover_auth_mock');
        setIsAuthenticated(!!localMock);
      }
    });

    return () => subscription.unsubscribe();
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
        return <UserProfile />;
      case 'business-dna':
      case 'settings':
        return <Profile />;
      case 'document-intel':
        return <DocumentIntel onNavigate={setActivePage} />;
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
