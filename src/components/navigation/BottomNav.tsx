import React from 'react';
import { Home, Swords, Crown, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Trang chủ' },
  { path: '/battle', icon: Swords, label: 'Thi đấu 1v1' },
  { path: '/battle-pass', icon: Crown, label: 'Gói VIP' },
  { path: '/profile', icon: User, label: 'Hồ sơ' },
];

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(14,14,22,0.95)', backdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--border)',
      padding: '8px 0 calc(8px + env(safe-area-inset-bottom))',
      maxWidth: 480, margin: '0 auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 4, padding: '4px 0',
                background: 'none', border: 'none', cursor: 'pointer',
                position: 'relative',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 14,
                background: isActive
                  ? 'var(--gradient-primary)'
                  : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isActive ? '0 0 14px rgba(255,107,53,0.4)' : 'none',
                transition: 'all 0.2s ease',
              }}>
                <Icon size={20} color={isActive ? '#fff' : '#5a5a75'} />
              </div>

              <span style={{
                fontSize: 10, fontWeight: isActive ? 700 : 500,
                color: isActive ? '#ff6b35' : '#5a5a75',
                transition: 'all 0.2s ease',
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
