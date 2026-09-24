import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Flame,
  Smartphone,
  Cpu,
  TrendingUp,
  Download,
  Menu,
  X,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const WebNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Tổng Quan Dự Án', icon: Flame },
    { path: '/demo', label: 'Trải Nghiệm Trực Tuyến', icon: Smartphone, highlight: true },
    { path: '/ai-tech', label: 'Công Nghệ AI Vision', icon: Cpu },
    { path: '/business', label: 'Mô Hình Kinh Doanh', icon: TrendingUp },
    { path: '/download', label: 'Tải Ứng Dụng', icon: Download },
  ];

  const currentPath = location.pathname;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: 'rgba(15, 15, 35, 0.88)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 107, 53, 0.2)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 24px',
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand Logo */}
        <div
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #FF6B35, #FF4757)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(255, 107, 53, 0.5)',
          }}>
            <Flame size={26} color="#FFFFFF" />
          </div>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{
                fontSize: 20,
                fontWeight: 900,
                letterSpacing: '-0.5px',
                background: 'linear-gradient(135deg, #FFFFFF, #FF8E53)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                FITNESS BATTLE
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: 6,
                background: 'rgba(255, 107, 53, 0.2)',
                border: '1px solid rgba(255, 107, 53, 0.5)',
                color: '#FF8E53',
              }}>
                EXE
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#8E94A5', fontWeight: 500 }}>
              Gamified Fitness Arena & AI Referee
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }} className="desktop-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  background: isActive
                    ? 'rgba(255, 107, 53, 0.15)'
                    : item.highlight
                    ? 'rgba(83, 82, 237, 0.15)'
                    : 'transparent',
                  border: isActive
                    ? '1px solid #FF6B35'
                    : item.highlight
                    ? '1px solid rgba(83, 82, 237, 0.4)'
                    : '1px solid transparent',
                  color: isActive
                    ? '#FF6B35'
                    : item.highlight
                    ? '#A29BFE'
                    : '#B0B0C3',
                  fontSize: 13,
                  fontWeight: isActive || item.highlight ? 700 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.highlight && !isActive && (
                  <span style={{
                    fontSize: 9,
                    fontWeight: 900,
                    padding: '1px 5px',
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #FF4757, #FFA502)',
                    color: '#fff',
                    marginLeft: 2,
                    boxShadow: '0 0 8px rgba(255, 71, 87, 0.5)',
                  }}>
                    LIVE
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }} className="desktop-nav">
          <button
            onClick={() => navigate('/demo')}
            style={{
              padding: '9px 18px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #FF6B35, #FF4757)',
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 18px rgba(255, 107, 53, 0.4)',
              transition: 'transform 0.15s ease',
            }}
          >
            <Sparkles size={16} />
            <span>Thử Nghiệm Trực Tuyến</span>
          </button>

          <a
            href="https://play.google.com/apps/testing/com.fitnessbattle.fitness_battle"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 14px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              fontSize: 12.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              textDecoration: 'none',
            }}
          >
            <span>Google Play</span>
            <ExternalLink size={13} />
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="mobile-toggle"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          background: '#14142B',
          borderBottom: '1px solid var(--border)',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: isActive ? 'rgba(255,107,53,0.15)' : 'rgba(255,255,255,0.05)',
                  border: isActive ? '1px solid #FF6B35' : '1px solid transparent',
                  color: isActive ? '#FF6B35' : '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  textAlign: 'left',
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
