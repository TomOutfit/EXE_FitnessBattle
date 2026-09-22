import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { HomePage } from '../../pages/HomePage';
import { BattlePassPage } from '../../pages/BattlePassPage';
import { BattlePage } from '../../pages/BattlePage';
import { ChallengePage } from '../../pages/ChallengePage';
import { ProfilePage } from '../../pages/ProfilePage';
import { WelcomePage } from '../../pages/WelcomePage';
import { ExerciseTrackPage } from '../../pages/ExerciseTrackPage';
import { ExerciseCameraPage } from '../../pages/ExerciseCameraPage';
import { GPSWalkingPage } from '../../pages/GPSWalkingPage';
import { BattleCameraPage } from '../../pages/BattleCameraPage';
import { RankingPage } from '../../pages/RankingPage';
import { ExerciseLeaderboardPage } from '../../pages/ExerciseLeaderboardPage';
import { ShopPage } from '../../pages/ShopPage';
import { MembershipPage } from '../../pages/MembershipPage';
import { DeleteAccountPage } from '../../pages/DeleteAccountPage';
import { BottomNav } from '../navigation/BottomNav';
import { ToastContainer } from '../ui';

export const MobileAppContainer: React.FC = () => {
  const { isOnboarded, toasts, dismissToast } = useUser();

  if (isOnboarded === null) {
    return (
      <div style={{ minHeight: '100%', background: '#0F0F23', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #25253D', borderTopColor: '#FF6B35', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100%',
      background: '#0F0F23',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ flex: 1, paddingBottom: isOnboarded ? 72 : 0 }}>
        <Routes>
          <Route path="/" element={isOnboarded ? <HomePage /> : <WelcomePage />} />
          <Route path="/home" element={isOnboarded ? <HomePage /> : <WelcomePage />} />
          <Route path="/auth" element={<WelcomePage />} />
          <Route path="/exercise" element={<ExerciseTrackPage />} />
          <Route path="/exercise-camera" element={<ExerciseCameraPage />} />
          <Route path="/gps-walking" element={<GPSWalkingPage />} />
          <Route path="/walking-tracker" element={<GPSWalkingPage />} />
          <Route path="/challenge" element={isOnboarded ? <ChallengePage /> : <WelcomePage />} />
          <Route path="/battle" element={<BattlePage />} />
          <Route path="/battle-camera" element={<BattleCameraPage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/exercise-ranking" element={<ExerciseLeaderboardPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/battle-pass" element={<BattlePassPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/delete-account" element={<DeleteAccountPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {isOnboarded && <BottomNav />}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
