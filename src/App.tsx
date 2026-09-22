import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { WebNavbar } from './components/layout/WebNavbar';
import { WebFooter } from './components/layout/WebFooter';
import { StartupShowcasePage } from './pages/StartupShowcasePage';
import { LiveDemoPage } from './pages/LiveDemoPage';
import { AITechnologyPage } from './pages/AITechnologyPage';
import { BusinessModelPage } from './pages/BusinessModelPage';
import { DownloadPage } from './pages/DownloadPage';
import { MobileAppContainer } from './components/mobile/MobileAppContainer';

const WebLayout: React.FC = () => {
  const location = useLocation();
  const isMobileScreen = typeof window !== 'undefined' && window.innerWidth < 768;
  const isDemoRoute = location.pathname.startsWith('/demo');
  const isMobileDirectRoute = location.pathname.startsWith('/app');

  // If user is directly on a small mobile device screen and not in a showcase subpage, show Mobile App
  if (isMobileScreen && !['/overview', '/ai-tech', '/business', '/download'].includes(location.pathname)) {
    return <MobileAppContainer />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#090A14',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top 3D Cyber Header */}
      <WebNavbar />

      {/* Main Routed Content */}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<StartupShowcasePage />} />
          <Route path="/overview" element={<StartupShowcasePage />} />
          <Route path="/demo/*" element={<LiveDemoPage />} />
          <Route path="/ai-tech" element={<AITechnologyPage />} />
          <Route path="/business" element={<BusinessModelPage />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/app/*" element={<MobileAppContainer />} />
          <Route path="*" element={<LiveDemoPage />} />
        </Routes>
      </main>

      {/* Footer on non-simulator pages */}
      {!isDemoRoute && !isMobileDirectRoute && <WebFooter />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <HashRouter>
      <UserProvider>
        <WebLayout />
      </UserProvider>
    </HashRouter>
  );
};
