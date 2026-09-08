import React from 'react';
import { Home, Trophy, Flag, BarChart2, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/home', icon: Home, label: 'Trang chủ' },
  { path: '/battle', icon: Trophy, label: 'Thi đấu' },
  { path: '/challenge', icon: Flag, label: 'Thử thách' },
  { path: '/ranking', icon: BarChart2, label: 'Bảng xếp hạng' },
  { path: '/profile', icon: User, label: 'Cá nhân' },
];

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'var(--bg-card)',
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.3)',
      padding: '8px 8px calc(8px + env(safe-area-inset-bottom))',
      maxWidth: 480, margin: '0 auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/home' && location.pathname === '/');
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '8px 12px',
                borderRadius: 12,
                background: isActive ? 'rgba(255, 107, 53, 0.15)' : 'transparent',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={24} color={isActive ? '#FF6B35' : '#6B6B80'} />
              <span style={{
                fontSize: 10,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#FF6B35' : '#6B6B80',
                marginTop: 4,
                textAlign: 'center',
                lineHeight: 1.2,
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

