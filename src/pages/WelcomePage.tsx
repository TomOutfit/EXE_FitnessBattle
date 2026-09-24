import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import {
  Eye,
  EyeOff,
  Zap,
  User,
  Mail,
  Lock,
  Check,
  Activity
} from 'lucide-react';
import { GradientButton, AppCard } from '../components/ui';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useUser();

  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login States
  const [loginEmail, setLoginEmail] = useState('demo@fitnessbattle.vn');
  const [loginPassword, setLoginPassword] = useState('demo123456');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');

  // Register States
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [fitnessLevel, setFitnessLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [selectedEmoji, setSelectedEmoji] = useState('⚡');
  const [selectedColor, setSelectedColor] = useState('b6e3f4');
  const [regError, setRegError] = useState('');

  const emojiList = ['⚡', '🔥', '👑', '🦾', '🥊', '🏃', '🦁', '💎'];
  const colorList = [
    { code: 'b6e3f4', label: 'Cyan Neon' },
    { code: 'ffd5dc', label: 'Crimson' },
    { code: 'd1f7c4', label: 'Emerald' },
    { code: 'ffdfba', label: 'Solar Gold' },
    { code: 'e2d1f9', label: 'Cyber Violet' }
  ];

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Vui lòng nhập đầy đủ Email và Mật khẩu');
      return;
    }

    const res = login(loginEmail.trim(), loginPassword);
    if (res.success) {
      navigate('/home');
    } else {
      setLoginError(res.error || 'Đăng nhập thất bại');
    }
  };

  const handleNextStep = () => {
    setRegError('');
    if (regStep === 1) {
      if (!regName.trim() || !regEmail.trim() || !regPassword) {
        setRegError('Vui lòng điền đầy đủ thông tin tài khoản');
        return;
      }
      if (regPassword.length < 6) {
        setRegError('Mật khẩu phải có tối thiểu 6 ký tự');
        return;
      }
      if (regPassword !== regConfirmPassword) {
        setRegError('Mật khẩu xác nhận không khớp');
        return;
      }
      setRegStep(2);
    } else if (regStep === 2) {
      setRegStep(3);
    }
  };

  const handleRegister = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setRegError('');

    const res = register(regName.trim(), regEmail.trim(), regPassword, fitnessLevel);
    if (res.success) {
      navigate('/home');
    } else {
      setRegError(res.error || 'Đăng ký thất bại');
    }
  };

  const fillQuickAccount = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setLoginError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 50% 15%, #181938 0%, #0F0F23 60%, #080812 100%)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 20px 60px',
        maxWidth: 500,
        margin: '0 auto',
        boxSizing: 'border-box',
        color: '#FFFFFF',
      }}
    >
      {/* Top App Brand & Logo */}
      <div style={{ textAlign: 'center', marginTop: 8, marginBottom: 22 }}>
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: 22,
            background: 'linear-gradient(135deg, #FF6B35 0%, #FF4757 100%)',
            boxShadow: '0 8px 30px rgba(255, 107, 53, 0.45), inset 0 0 4px rgba(255,255,255,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            fontSize: 32,
          }}
        >
          ⚡
        </div>
        <h1
          style={{
            fontSize: 23,
            fontWeight: 900,
            letterSpacing: '1px',
            color: '#FFFFFF',
            margin: 0,
            textTransform: 'uppercase',
          }}
        >
          FITNESS BATTLE
        </h1>
        <div style={{ fontSize: 12.5, color: '#A29BFE', marginTop: 4, fontWeight: 600 }}>
          Đấu Trường Thể Lực 1v1 & Trọng Tài AI Vision
        </div>
      </div>

      {/* Tab Switcher */}
      <div
        style={{
          display: 'flex',
          background: '#16162E',
          borderRadius: 14,
          padding: 4,
          border: '1px solid rgba(255, 107, 53, 0.25)',
          marginBottom: 20,
        }}
      >
        <button
          onClick={() => { setTab('login'); setLoginError(''); }}
          style={{
            flex: 1,
            padding: '11px 0',
            border: 'none',
            borderRadius: 12,
            background: tab === 'login' ? 'linear-gradient(135deg, #FF6B35, #FF8E53)' : 'transparent',
            color: tab === 'login' ? '#FFFFFF' : '#8E94A5',
            fontWeight: 800,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: tab === 'login' ? '0 4px 14px rgba(255, 107, 53, 0.4)' : 'none',
          }}
        >
          ĐĂNG NHẬP
        </button>
        <button
          onClick={() => { setTab('register'); setRegError(''); }}
          style={{
            flex: 1,
            padding: '11px 0',
            border: 'none',
            borderRadius: 12,
            background: tab === 'register' ? 'linear-gradient(135deg, #FF6B35, #FF8E53)' : 'transparent',
            color: tab === 'register' ? '#FFFFFF' : '#8E94A5',
            fontWeight: 800,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: tab === 'register' ? '0 4px 14px rgba(255, 107, 53, 0.4)' : 'none',
          }}
        >
          ĐĂNG KÝ MỚI
        </button>
      </div>

      {/* ── TAB 1: LOGIN ──────────────────────────────────────────────────────── */}
      {tab === 'login' && (
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Email */}
          <div>
            <label style={{ fontSize: 12, color: '#B0B0C3', display: 'block', marginBottom: 6, fontWeight: 600 }}>Email Đăng Nhập</label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#1D1D38',
                borderRadius: 12,
                padding: '0 14px',
                border: '1px solid #2B2D4F',
              }}
            >
              <Mail size={18} color="#8E94A5" />
              <input
                type="email"
                placeholder="demo@fitnessbattle.vn"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: '13px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: 12, color: '#B0B0C3', display: 'block', marginBottom: 6, fontWeight: 600 }}>Mật Khẩu</label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#1D1D38',
                borderRadius: 12,
                padding: '0 14px',
                border: '1px solid #2B2D4F',
              }}
            >
              <Lock size={18} color="#8E94A5" />
              <input
                type={showLoginPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={{
                  flex: 1,
                  padding: '13px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                style={{ background: 'transparent', border: 'none', color: '#8E94A5', cursor: 'pointer' }}
              >
                {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div
            onClick={() => setRememberMe(!rememberMe)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', margin: '2px 0' }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                background: rememberMe ? '#FF6B35' : '#1D1D38',
                border: rememberMe ? 'none' : '1px solid #6B6B80',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {rememberMe && <Check size={13} color="#FFFFFF" />}
            </div>
            <span style={{ fontSize: 12.5, color: '#B0B0C3' }}>Ghi nhớ đăng nhập trên thiết bị này</span>
          </div>

          {loginError && (
            <div style={{ color: '#FF4757', fontSize: 12.5, fontWeight: 700, padding: '8px 12px', background: 'rgba(255, 71, 87, 0.12)', borderRadius: 10, border: '1px solid rgba(255, 71, 87, 0.3)' }}>
              ⚠️ {loginError}
            </div>
          )}

          {/* Submit */}
          <GradientButton
            text="ĐĂNG NHẬP NGAY"
            type="submit"
            fullWidth
            gradient="linear-gradient(135deg, #FF6B35, #FF4757)"
            style={{ marginTop: 6 }}
          />

          {/* Quick Demo Accounts Selection */}
          <AppCard style={{ marginTop: 18, padding: 14, background: 'rgba(20, 20, 42, 0.85)', border: '1px solid rgba(255, 107, 53, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Zap size={16} color="#FF6B35" />
              <span style={{ fontSize: 11.5, fontWeight: 800, color: '#FF8E53', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Đăng Nhập Nhanh Theo Cấp Độ (1-Click Demo)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {/* 1. Beginner */}
              <div
                onClick={() => fillQuickAccount('newbie@fitnessbattle.vn', 'newbie123456')}
                style={{
                  padding: '9px 12px',
                  borderRadius: 10,
                  background: loginEmail === 'newbie@fitnessbattle.vn' ? 'rgba(46, 213, 115, 0.2)' : '#191932',
                  border: loginEmail === 'newbie@fitnessbattle.vn' ? '1px solid #2ED573' : '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🌱</span>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#2ED573' }}>
                      Người Mới Bắt Đầu (Level 1)
                    </div>
                    <div style={{ fontSize: 10.5, color: '#8E94A5' }}>
                      newbie@fitnessbattle.vn • Khởi đầu nhẹ nhàng
                    </div>
                  </div>
                </div>
                <span style={{ color: '#2ED573', fontSize: 11, fontWeight: 800 }}>Chọn ➔</span>
              </div>

              {/* 2. Intermediate */}
              <div
                onClick={() => fillQuickAccount('tomoutfit@fitnessbattle.vn', 'tomoutfit123')}
                style={{
                  padding: '9px 12px',
                  borderRadius: 10,
                  background: loginEmail === 'tomoutfit@fitnessbattle.vn' ? 'rgba(255, 107, 53, 0.2)' : '#191932',
                  border: loginEmail === 'tomoutfit@fitnessbattle.vn' ? '1px solid #FF6B35' : '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>⚡</span>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#FF8E53' }}>
                      Trung Cấp - TomOutfit (Level 15)
                    </div>
                    <div style={{ fontSize: 10.5, color: '#8E94A5' }}>
                      tomoutfit@fitnessbattle.vn • Rank #28 • 350 Ruby
                    </div>
                  </div>
                </div>
                <span style={{ color: '#FF8E53', fontSize: 11, fontWeight: 800 }}>Chọn ➔</span>
              </div>

              {/* 3. Advanced / Whale */}
              <div
                onClick={() => fillQuickAccount('vip@fitnessbattle.vn', 'vip123456')}
                style={{
                  padding: '9px 12px',
                  borderRadius: 10,
                  background: loginEmail === 'vip@fitnessbattle.vn' ? 'rgba(255, 215, 0, 0.18)' : '#191932',
                  border: loginEmail === 'vip@fitnessbattle.vn' ? '1px solid #FFD700' : '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>👑</span>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#FFD700' }}>
                      Tập Lâu Năm - VIP Master (Level 45)
                    </div>
                    <div style={{ fontSize: 10.5, color: '#8E94A5' }}>
                      vip@fitnessbattle.vn • Rank #3 • 1850 Ruby
                    </div>
                  </div>
                </div>
                <span style={{ color: '#FFD700', fontSize: 11, fontWeight: 800 }}>Chọn ➔</span>
              </div>
            </div>
          </AppCard>
        </form>
      )}

      {/* ── TAB 2: REGISTER WITH FITNESS LEVEL SURVEY ─────────────────────────── */}
      {tab === 'register' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Step Progress Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            {[
              { step: 1, title: 'Tài Khoản' },
              { step: 2, title: 'Trình Độ Thể Lực' },
              { step: 3, title: 'Avatar' }
            ].map(s => {
              const isDone = regStep > s.step;
              const isCur = regStep === s.step;
              return (
                <div
                  key={s.step}
                  onClick={() => { if (isDone) setRegStep(s.step as any); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    cursor: isDone ? 'pointer' : 'default',
                    opacity: isCur || isDone ? 1 : 0.45
                  }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: isCur ? '#FF6B35' : isDone ? '#2ED573' : '#2B2D4F',
                    color: '#fff', fontSize: 11, fontWeight: 900,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {isDone ? '✓' : s.step}
                  </div>
                  <span style={{ fontSize: 11.5, fontWeight: isCur ? 800 : 600, color: isCur ? '#FF8E53' : isDone ? '#2ED573' : '#8E94A5' }}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* STEP 1: ACCOUNT CREDENTIALS */}
          {regStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Name */}
              <div>
                <label style={{ fontSize: 12, color: '#B0B0C3', display: 'block', marginBottom: 4, fontWeight: 600 }}>Họ & Tên</label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#1D1D38', borderRadius: 12, padding: '0 14px', border: '1px solid #2B2D4F' }}>
                  <User size={18} color="#8E94A5" />
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    style={{ flex: 1, padding: '12px 10px', background: 'transparent', border: 'none', color: '#FFFFFF', fontSize: 14, outline: 'none' }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ fontSize: 12, color: '#B0B0C3', display: 'block', marginBottom: 4, fontWeight: 600 }}>Email</label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#1D1D38', borderRadius: 12, padding: '0 14px', border: '1px solid #2B2D4F' }}>
                  <Mail size={18} color="#8E94A5" />
                  <input
                    type="email"
                    placeholder="user@fitnessbattle.vn"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    style={{ flex: 1, padding: '12px 10px', background: 'transparent', border: 'none', color: '#FFFFFF', fontSize: 14, outline: 'none' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ fontSize: 12, color: '#B0B0C3', display: 'block', marginBottom: 4, fontWeight: 600 }}>Mật Khẩu</label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#1D1D38', borderRadius: 12, padding: '0 14px', border: '1px solid #2B2D4F' }}>
                  <Lock size={18} color="#8E94A5" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    placeholder="Tối thiểu 6 ký tự"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    style={{ flex: 1, padding: '12px 10px', background: 'transparent', border: 'none', color: '#FFFFFF', fontSize: 14, outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    style={{ background: 'transparent', border: 'none', color: '#8E94A5', cursor: 'pointer' }}
                  >
                    {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ fontSize: 12, color: '#B0B0C3', display: 'block', marginBottom: 4, fontWeight: 600 }}>Xác Nhận Mật Khẩu</label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#1D1D38', borderRadius: 12, padding: '0 14px', border: '1px solid #2B2D4F' }}>
                  <Lock size={18} color="#8E94A5" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    style={{ flex: 1, padding: '12px 10px', background: 'transparent', border: 'none', color: '#FFFFFF', fontSize: 14, outline: 'none' }}
                  />
                </div>
              </div>

              {regError && (
                <div style={{ color: '#FF4757', fontSize: 12.5, fontWeight: 700, padding: '8px 12px', background: 'rgba(255, 71, 87, 0.12)', borderRadius: 10, border: '1px solid rgba(255, 71, 87, 0.3)' }}>
                  ⚠️ {regError}
                </div>
              )}

              <GradientButton
                text="TIẾP TỤC: CHỌN TRÌNH ĐỘ ➔"
                onClick={handleNextStep}
                fullWidth
                gradient="linear-gradient(135deg, #FF6B35, #FF4757)"
                style={{ marginTop: 8 }}
              />
            </div>
          )}

          {/* STEP 2: FITNESS LEVEL SELECTION (GÓP Ý NGƯỜI DÙNG) */}
          {regStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'rgba(255, 107, 53, 0.12)', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(255, 107, 53, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FF8E53', fontWeight: 800, fontSize: 13, marginBottom: 4 }}>
                  <Activity size={16} />
                  <span>Khảo Sát Kinh Nghiệm Tập Luyện Của Bạn</span>
                </div>
                <p style={{ fontSize: 12, color: '#B0B0C3', margin: 0, lineHeight: 1.5 }}>
                  Hệ thống AI sẽ điều chỉnh chế độ chấm điểm, số lượng reps mục tiêu và đối thủ ghép trận 1v1 phù hợp nhất với thể lực của bạn.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Level 1: Beginner */}
                <div
                  onClick={() => setFitnessLevel('beginner')}
                  style={{
                    padding: '16px',
                    borderRadius: 16,
                    background: fitnessLevel === 'beginner' ? 'linear-gradient(135deg, rgba(46, 213, 115, 0.18), rgba(20, 40, 30, 0.8))' : '#191932',
                    border: fitnessLevel === 'beginner' ? '2px solid #2ED573' : '1px solid #2B2D4F',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: fitnessLevel === 'beginner' ? '0 0 20px rgba(46, 213, 115, 0.25)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 22 }}>🌱</span>
                      <span style={{ fontSize: 15, fontWeight: 900, color: '#2ED573' }}>
                        Chưa Từng Tập / Mới Bắt Đầu (Newbie)
                      </span>
                    </div>
                    {fitnessLevel === 'beginner' && (
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#2ED573', color: '#000', fontSize: 12, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        ✓
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12.5, color: '#B0B0C3', margin: '0 0 8px', lineHeight: 1.45 }}>
                    Mục tiêu xây dựng thói quen đều đặn, khởi đầu nhẹ nhàng với camera AI hướng dẫn sửa góc khuỷu tay chuẩn.
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, background: 'rgba(46, 213, 115, 0.15)', color: '#2ED573', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                      Khởi đầu Level 1
                    </span>
                    <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.06)', color: '#A29BFE', padding: '2px 8px', borderRadius: 6 }}>
                      Mục tiêu 5-10 Reps/ngày
                    </span>
                  </div>
                </div>

                {/* Level 2: Intermediate */}
                <div
                  onClick={() => setFitnessLevel('intermediate')}
                  style={{
                    padding: '16px',
                    borderRadius: 16,
                    background: fitnessLevel === 'intermediate' ? 'linear-gradient(135deg, rgba(255, 107, 53, 0.18), rgba(40, 25, 20, 0.8))' : '#191932',
                    border: fitnessLevel === 'intermediate' ? '2px solid #FF6B35' : '1px solid #2B2D4F',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: fitnessLevel === 'intermediate' ? '0 0 20px rgba(255, 107, 53, 0.25)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 22 }}>⚡</span>
                      <span style={{ fontSize: 15, fontWeight: 900, color: '#FF8E53' }}>
                        Đã Tập Một Thời Gian (Intermediate)
                      </span>
                    </div>
                    {fitnessLevel === 'intermediate' && (
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#FF6B35', color: '#fff', fontSize: 12, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        ✓
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12.5, color: '#B0B0C3', margin: '0 0 8px', lineHeight: 1.45 }}>
                    Đã quen tư thế chuẩn, sẵn sàng tham gia Đấu Trường PvP 1v1 trong 60 giây và tích lũy chuỗi Streak leo hạng.
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, background: 'rgba(255, 107, 53, 0.2)', color: '#FF8E53', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                      Tặng thẳng Level 5 • +60 Ruby
                    </span>
                    <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.06)', color: '#A29BFE', padding: '2px 8px', borderRadius: 6 }}>
                      Mục tiêu 15-25 Reps/ngày
                    </span>
                  </div>
                </div>

                {/* Level 3: Advanced / Pro */}
                <div
                  onClick={() => setFitnessLevel('advanced')}
                  style={{
                    padding: '16px',
                    borderRadius: 16,
                    background: fitnessLevel === 'advanced' ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.18), rgba(40, 35, 15, 0.8))' : '#191932',
                    border: fitnessLevel === 'advanced' ? '2px solid #FFD700' : '1px solid #2B2D4F',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: fitnessLevel === 'advanced' ? '0 0 20px rgba(255, 215, 0, 0.25)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 22 }}>👑</span>
                      <span style={{ fontSize: 15, fontWeight: 900, color: '#FFD700' }}>
                        Đã Tập Lâu Năm / Vận Động Viên (Pro Athlete)
                      </span>
                    </div>
                    {fitnessLevel === 'advanced' && (
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#FFD700', color: '#000', fontSize: 12, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        ✓
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12.5, color: '#B0B0C3', margin: '0 0 8px', lineHeight: 1.45 }}>
                    Thể lực sung mãn, cơ bắp dẻo dai. Thách đấu các giải đấu Titan Boss Raid và tranh Top 10 Bảng Xếp Hạng.
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, background: 'rgba(255, 215, 0, 0.2)', color: '#FFD700', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                      Mở khóa Level 15 • +150 Ruby
                    </span>
                    <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.06)', color: '#A29BFE', padding: '2px 8px', borderRadius: 6 }}>
                      Mục tiêu 40+ Reps/ngày
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setRegStep(1)}
                  style={{
                    flex: 1, padding: '13px', borderRadius: 14,
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  ← Quay Lại
                </button>
                <GradientButton
                  text="TIẾP TỤC: CHỌN AVATAR ➔"
                  onClick={handleNextStep}
                  style={{ flex: 2 }}
                  gradient="linear-gradient(135deg, #FF6B35, #FF4757)"
                />
              </div>
            </div>
          )}

          {/* STEP 3: AVATAR CUSTOMIZATION & COMPLETE */}
          {regStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Preview Avatar */}
              <div style={{ textAlign: 'center', background: '#191932', borderRadius: 18, padding: '20px', border: '1px solid #2B2D4F' }}>
                <div style={{
                  width: 86, height: 86, borderRadius: '50%',
                  background: `#${selectedColor}`,
                  margin: '0 auto 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 42,
                  boxShadow: `0 0 25px #${selectedColor}60`,
                  border: '3px solid #fff'
                }}>
                  {selectedEmoji}
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{regName || 'Chiến Binh Mới'}</div>
                <div style={{ fontSize: 12, color: fitnessLevel === 'advanced' ? '#FFD700' : fitnessLevel === 'intermediate' ? '#FF8E53' : '#2ED573', fontWeight: 800, marginTop: 4 }}>
                  {fitnessLevel === 'advanced' ? '👑 Cấp độ: Đã tập lâu năm (Level 15)' : fitnessLevel === 'intermediate' ? '⚡ Cấp độ: Đã tập một thời gian (Level 5)' : '🌱 Cấp độ: Mới bắt đầu (Level 1)'}
                </div>
              </div>

              {/* Emoji Grid */}
              <div>
                <label style={{ fontSize: 12, color: '#B0B0C3', display: 'block', marginBottom: 8, fontWeight: 600 }}>
                  Chọn Biểu Tượng Nhận Diện:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {emojiList.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setSelectedEmoji(em)}
                      style={{
                        padding: '10px',
                        borderRadius: 12,
                        background: selectedEmoji === em ? 'rgba(255, 107, 53, 0.25)' : '#1D1D38',
                        border: selectedEmoji === em ? '2px solid #FF6B35' : '1px solid #2B2D4F',
                        fontSize: 22,
                        cursor: 'pointer',
                        transition: 'transform 0.15s'
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Grid */}
              <div>
                <label style={{ fontSize: 12, color: '#B0B0C3', display: 'block', marginBottom: 8, fontWeight: 600 }}>
                  Chọn Màu Sắc Nền:
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {colorList.map(col => (
                    <div
                      key={col.code}
                      onClick={() => setSelectedColor(col.code)}
                      style={{
                        flex: 1,
                        height: 36,
                        borderRadius: 10,
                        background: `#${col.code}`,
                        cursor: 'pointer',
                        border: selectedColor === col.code ? '3px solid #FFFFFF' : '2px solid transparent',
                        boxShadow: selectedColor === col.code ? `0 0 12px #${col.code}` : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setRegStep(2)}
                  style={{
                    flex: 1, padding: '13px', borderRadius: 14,
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  ← Quay Lại
                </button>
                <GradientButton
                  text="HOÀN TẤT & VÀO ĐẤU TRƯỜNG ⚡"
                  onClick={handleRegister}
                  style={{ flex: 2 }}
                  gradient="linear-gradient(135deg, #2ED573, #10AC84)"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
