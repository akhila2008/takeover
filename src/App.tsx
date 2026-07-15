import React, { useState } from 'react';
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

import { BusinessDataProvider } from './context/BusinessDataContext';
import { DocumentIntel } from './pages/DocumentIntel';
import { BusinessHistory } from './pages/BusinessHistory';
import { PeriodComparison } from './pages/PeriodComparison';

function App() {
  const [activePage, setActivePage] = useState('executive-briefing');

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

  return (
    <BusinessDataProvider>
      <Toast />
      <MainLayout activePage={activePage} setActivePage={setActivePage}>
        {renderContent()}
      </MainLayout>
    </BusinessDataProvider>
  );
}

export default App;
