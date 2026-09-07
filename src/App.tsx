import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { HomePage } from './pages/HomePage';
import { BattlePassPage } from './pages/BattlePassPage';
import { BattlePage } from './pages/BattlePage';
import { ChallengePage } from './pages/ChallengePage';
import { ProfilePage } from './pages/ProfilePage';
import { WelcomePage } from './pages/WelcomePage';
import { BottomNav } from './components/navigation/BottomNav';
import { ToastContainer } from './components/ui';

const AppShell: React.FC = () => {
  const { isOnboarded, toasts, dismissToast } = useUser();

  if (isOnboarded === null) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', maxWidth: 480, margin: '0 auto', position: 'relative',
      boxShadow: '0 0 50px rgba(255, 107, 53, 0.12), 0 0 20px rgba(0, 0, 0, 0.8)',
      borderLeft: '1px solid rgba(255, 107, 53, 0.2)',
      borderRight: '1px solid rgba(255, 107, 53, 0.2)'
    }}>
      <Routes>
        <Route path="/" element={isOnboarded ? <HomePage /> : <WelcomePage />} />
        <Route path="/challenge" element={isOnboarded ? <ChallengePage /> : <WelcomePage />} />
        <Route path="/battle" element={<BattlePage />} />
        <Route path="/battle-pass" element={<BattlePassPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      {isOnboarded && <BottomNav />}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppShell />
      </UserProvider>
    </BrowserRouter>
  );
};
