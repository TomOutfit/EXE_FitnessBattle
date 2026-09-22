import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Maximize2,
  Sparkles,
  Flame,
  UserCheck,
  Layers,
  Crown,
} from 'lucide-react';
import { useUser } from '../../context/UserContext';

interface PhoneSimulatorProps {
  children: React.ReactNode;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { switchAccount, refillStamina, buyRuby, addXP, addCoins, showToast } = useUser();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [enable3DTilt, setEnable3DTilt] = useState(true);
  const [activePersona, setActivePersona] = useState<'tomoutfit' | 'vip' | 'newbie'>('tomoutfit');

  const phoneRef = useRef<HTMLDivElement | null>(null);
  const [tiltStyle, setTiltStyle] = useState({
    transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg)',
    glareOpacity: 0,
    glareX: 50,
    glareY: 50,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enable3DTilt || isFullscreen || !phoneRef.current) return;
    const rect = phoneRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 12;
    const rotateY = ((x - centerX) / centerX) * 14;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTiltStyle({
      transform: `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`,
      glareOpacity: 0.15,
      glareX,
      glareY,
    });
  };

  const handleMouseLeave = () => {
    if (!enable3DTilt || isFullscreen) return;
    setTiltStyle({
      transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      glareOpacity: 0,
      glareX: 50,
      glareY: 50,
    });
  };

  const handleSelectPersona = (type: 'tomoutfit' | 'vip' | 'newbie') => {
    setActivePersona(type);
    if (type === 'tomoutfit') {
      switchAccount('tomoutfit@fitnessbattle.vn');
      showToast('Đã chọn Persona: TomOutfit (Active Rank #28)', 'success');
    } else if (type === 'vip') {
      switchAccount('vip@fitnessbattle.vn');
      showToast('Đã chọn Persona: VIP Master (Whale User)', 'success');
    } else {
      localStorage.setItem('fb_onboarded', 'false');
      window.location.reload();
    }
  };

  return (
    <div style={{
      width: '100%',
      minHeight: 'calc(100vh - 72px)',
      background: 'radial-gradient(ellipse at 50% 30%, #1A1A35 0%, #0D0E18 70%, #080910 100%)',
      padding: isFullscreen ? 0 : '40px 24px 80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 40,
      flexWrap: 'wrap',
      position: 'relative',
    }}>
      {/* 3D Interactive Phone Wrapper */}
      <div
        ref={phoneRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          width: isFullscreen ? '100vw' : 410,
          height: isFullscreen ? '100vh' : 840,
          maxHeight: isFullscreen ? '100vh' : '90vh',
          borderRadius: isFullscreen ? 0 : 48,
          background: '#0F0F23',
          position: 'relative',
          padding: isFullscreen ? 0 : 12,
          boxShadow: isFullscreen
            ? 'none'
            : '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(255, 107, 53, 0.25), inset 0 0 2px 2px rgba(255, 255, 255, 0.15)',
          border: isFullscreen ? 'none' : '4px solid #2B2D42',
          transform: isFullscreen ? 'none' : tiltStyle.transform,
          transition: 'transform 0.1s ease-out, width 0.3s ease, height 0.3s ease',
          transformStyle: 'preserve-3d',
          zIndex: 10,
        }}
      >
        {/* Dynamic Glare Effect */}
        {!isFullscreen && (
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 44,
            background: `radial-gradient(circle at ${tiltStyle.glareX}% ${tiltStyle.glareY}%, rgba(255, 255, 255, ${tiltStyle.glareOpacity}), transparent 60%)`,
            pointerEvents: 'none',
            zIndex: 50,
          }} />
        )}

        {/* Smartphone Screen Viewport */}
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: isFullscreen ? 0 : 38,
          background: '#0F0F23',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          border: isFullscreen ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          {/* Top Status Bar with Dynamic Notch */}
          {!isFullscreen && (
            <div style={{
              height: 38,
              background: '#0F0F23',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 20px',
              fontSize: 11,
              fontWeight: 700,
              color: '#FFFFFF',
              zIndex: 40,
              flexShrink: 0,
              borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
            }}>
              <span>9:41</span>

              {/* Dynamic Island Pill */}
              <div style={{
                width: 100,
                height: 20,
                borderRadius: 12,
                background: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 0 10px rgba(0,0,0,0.8)',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2ED573', boxShadow: '0 0 6px #2ED573' }} />
                <span style={{ fontSize: 9, color: '#A29BFE', fontWeight: 800 }}>FITNESS AI</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* Render Actual App inside Phone Screen */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
          }}>
            {children}
          </div>

          {/* Bottom Home Indicator Bar */}
          {!isFullscreen && (
            <div style={{
              height: 18,
              background: '#0F0F23',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <div style={{
                width: 120,
                height: 4,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.4)',
              }} />
            </div>
          )}
        </div>
      </div>

      {/* Control Deck for Investors & Judges */}
      {!isFullscreen && (
        <div style={{
          width: 380,
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          zIndex: 10,
        }}>
          {/* Header Banner */}
          <div style={{
            background: 'linear-gradient(145deg, #1A1A35, #14142B)',
            padding: '20px 24px',
            borderRadius: 20,
            border: '1px solid rgba(255, 107, 53, 0.3)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #5352ED, #7070FF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>Bảng Thử Nghiệm Nhà Đầu Tư</div>
                <div style={{ fontSize: 11, color: '#8E94A5' }}>Interactive Investor & Judge Sandbox</div>
              </div>
            </div>
            <p style={{ fontSize: 12.5, lineHeight: 1.5, color: '#B0B0C3' }}>
              Trải nghiệm trực tiếp 100% tính năng ứng dụng di động ngay trên màn hình máy tính với độ chân thực tuyệt đối.
            </p>
          </div>

          {/* 1. Persona Switcher */}
          <div style={{
            background: 'rgba(20, 20, 40, 0.8)',
            backdropFilter: 'blur(12px)',
            padding: '18px 20px',
            borderRadius: 18,
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#FF8E53', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              👤 Chọn Vai Trò Trải Nghiệm (Personas)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { id: 'tomoutfit', label: 'TomOutfit (Active Member)', desc: 'Level 15 • 350 Ruby • Rank #28', icon: Flame, color: '#FF6B35' },
                { id: 'vip', label: 'VIP Master (Whale User)', desc: 'Level 45 • 1850 Ruby • Khung Rồng Lửa', icon: Crown, color: '#FFA502' },
                { id: 'newbie', label: 'Người Mới (Day 1 Onboarding)', desc: 'Tạo tài khoản & Chọn avatar từ đầu', icon: UserCheck, color: '#2ED573' },
              ].map((p) => {
                const isCur = activePersona === p.id;
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPersona(p.id as any)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: isCur ? 'rgba(255, 107, 53, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                      border: isCur ? `1.5px solid ${p.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: `${p.color}20`,
                      border: `1px solid ${p.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={16} color={p.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{p.label}</div>
                      <div style={{ fontSize: 11, color: '#8E94A5' }}>{p.desc}</div>
                    </div>
                    {isCur && <span style={{ fontSize: 11, color: p.color, fontWeight: 900 }}>ĐANG CHỌN</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Quick Teleport Shortcuts */}
          <div style={{
            background: 'rgba(20, 20, 40, 0.8)',
            backdropFilter: 'blur(12px)',
            padding: '18px 20px',
            borderRadius: 18,
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#00E5FF', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ⚡ Chuyển Nhanh Màn Hình (Teleport)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: '🏠 Trang Chủ', path: '/' },
                { label: '⚔️ Đấu Trường 1v1', path: '/battle' },
                { label: '👁️ Camera AI Pose', path: '/exercise-camera?type=pushup' },
                { label: '⚡ Battle Pass', path: '/battle-pass' },
                { label: '💎 Cửa Hàng Ruby', path: '/shop' },
                { label: '📊 Bảng Xếp Hạng', path: '/ranking' },
              ].map(item => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: location.pathname === item.path ? 'rgba(0, 229, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: location.pathname === item.path ? '1px solid #00E5FF' : '1px solid rgba(255,255,255,0.08)',
                    color: location.pathname === item.path ? '#00E5FF' : '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Cashflow & Stats Booster */}
          <div style={{
            background: 'rgba(20, 20, 40, 0.8)',
            backdropFilter: 'blur(12px)',
            padding: '18px 20px',
            borderRadius: 18,
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#2ED573', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              💰 Mô Phỏng Dòng Tiền (Monetization Boost)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button
                onClick={() => { buyRuby(100); showToast('+100 Ruby được nạp!', 'success'); }}
                style={{
                  padding: '6px 12px', borderRadius: 8,
                  background: 'rgba(255, 71, 87, 0.15)', border: '1px solid #FF4757',
                  color: '#FF6B81', fontSize: 11.5, fontWeight: 800, cursor: 'pointer',
                }}
              >
                +100 Ruby (💎)
              </button>
              <button
                onClick={() => { addCoins(1000); showToast('+1.000 Coins được nạp!', 'success'); }}
                style={{
                  padding: '6px 12px', borderRadius: 8,
                  background: 'rgba(247, 201, 72, 0.15)', border: '1px solid #F7C948',
                  color: '#F7C948', fontSize: 11.5, fontWeight: 800, cursor: 'pointer',
                }}
              >
                +1.000 Coins (🪙)
              </button>
              <button
                onClick={() => { addXP(500); showToast('+500 XP kinh nghiệm!', 'success'); }}
                style={{
                  padding: '6px 12px', borderRadius: 8,
                  background: 'rgba(83, 82, 237, 0.15)', border: '1px solid #5352ED',
                  color: '#A29BFE', fontSize: 11.5, fontWeight: 800, cursor: 'pointer',
                }}
              >
                +500 XP
              </button>
              <button
                onClick={refillStamina}
                style={{
                  padding: '6px 12px', borderRadius: 8,
                  background: 'rgba(46, 213, 115, 0.15)', border: '1px solid #2ED573',
                  color: '#2ED573', fontSize: 11.5, fontWeight: 800, cursor: 'pointer',
                }}
              >
                Hồi Full Stamina ⚡
              </button>
            </div>
          </div>

          {/* 4. Display Controls */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <Maximize2 size={16} />
              <span>Bung Toàn Màn Hình</span>
            </button>

            <button
              onClick={() => setEnable3DTilt(!enable3DTilt)}
              style={{
                padding: '12px 16px',
                borderRadius: 14,
                background: enable3DTilt ? 'rgba(83, 82, 237, 0.2)' : 'rgba(255,255,255,0.08)',
                border: enable3DTilt ? '1px solid #5352ED' : '1px solid rgba(255,255,255,0.15)',
                color: enable3DTilt ? '#A29BFE' : '#8E94A5',
                fontSize: 13,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              <Layers size={16} />
              <span>3D Tilt: {enable3DTilt ? 'BẬT' : 'TẮT'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
