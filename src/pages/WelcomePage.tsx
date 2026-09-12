import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Eye, EyeOff, Zap, User, Mail, Lock, Check } from 'lucide-react';
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
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');

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

  const handleRegister = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setRegError('Vui lòng điền đầy đủ các thông tin');
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

    const res = register(regName.trim(), regEmail.trim(), regPassword);
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
        background: '#0F0F23',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 20px',
        maxWidth: 480,
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      {/* Top App Brand & Logo */}
      <div style={{ textAlign: 'center', marginTop: 12, marginBottom: 24 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 22,
            background: 'linear-gradient(135deg, #FF4757 0%, #FF6B81 100%)',
            boxShadow: '0 8px 24px rgba(255, 107, 53, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            fontSize: 36,
          }}
        >
          ⚡
        </div>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 900,
            letterSpacing: 1.5,
            color: '#FFFFFF',
            margin: 0,
          }}
        >
          FITNESS BATTLE
        </h1>
        <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 4 }}>
          Luyện tập thông minh • Đấu trường đỉnh cao
        </div>
      </div>

      {/* Tab Switcher */}
      <div
        style={{
          display: 'flex',
          background: '#1A1A2E',
          borderRadius: 14,
          padding: 4,
          border: '1px solid #25253D',
          marginBottom: 20,
        }}
      >
        <button
          onClick={() => setTab('login')}
          style={{
            flex: 1,
            padding: '12px 0',
            border: 'none',
            borderRadius: 12,
            background: tab === 'login' ? 'linear-gradient(135deg, #FF6B35, #FF8E53)' : 'transparent',
            color: tab === 'login' ? '#FFFFFF' : '#6B6B80',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          ĐĂNG NHẬP
        </button>
        <button
          onClick={() => setTab('register')}
          style={{
            flex: 1,
            padding: '12px 0',
            border: 'none',
            borderRadius: 12,
            background: tab === 'register' ? 'linear-gradient(135deg, #FF6B35, #FF8E53)' : 'transparent',
            color: tab === 'register' ? '#FFFFFF' : '#6B6B80',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          ĐĂNG KÝ MỚI
        </button>
      </div>

      {/* Tab Content */}
      {tab === 'login' && (
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Email */}
          <div>
            <label style={{ fontSize: 12, color: '#B0B0C3', display: 'block', marginBottom: 6 }}>Email</label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#25253D',
                borderRadius: 12,
                padding: '0 14px',
                border: '1px solid #25253D',
              }}
            >
              <Mail size={18} color="#6B6B80" />
              <input
                type="email"
                placeholder="demo@fitnessbattle.vn"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: '14px 12px',
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
            <label style={{ fontSize: 12, color: '#B0B0C3', display: 'block', marginBottom: 6 }}>Mật khẩu</label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#25253D',
                borderRadius: 12,
                padding: '0 14px',
                border: '1px solid #25253D',
              }}
            >
              <Lock size={18} color="#6B6B80" />
              <input
                type={showLoginPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={{
                  flex: 1,
                  padding: '14px 12px',
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
                style={{ background: 'transparent', border: 'none', color: '#6B6B80', cursor: 'pointer' }}
              >
                {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div
            onClick={() => setRememberMe(!rememberMe)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                background: rememberMe ? '#FF6B35' : '#25253D',
                border: rememberMe ? 'none' : '1px solid #6B6B80',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {rememberMe && <Check size={14} color="#FFFFFF" />}
            </div>
            <span style={{ fontSize: 13, color: '#B0B0C3' }}>Ghi nhớ đăng nhập</span>
          </div>

          {loginError && (
            <div style={{ color: '#FF4757', fontSize: 12, fontWeight: 600 }}>
              {loginError}
            </div>
          )}

          {/* Submit */}
          <GradientButton
            text="ĐĂNG NHẬP NGAY"
            type="submit"
            fullWidth
            gradient="linear-gradient(135deg, #FF6B35, #FF8E53)"
            style={{ marginTop: 8 }}
          />
        </form>
      )}

      {tab === 'register' && (
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Name */}
          <div>
            <label style={{ fontSize: 12, color: '#B0B0C3', display: 'block', marginBottom: 4 }}>Họ & Tên</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#25253D', borderRadius: 12, padding: '0 14px' }}>
              <User size={18} color="#6B6B80" />
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
            <label style={{ fontSize: 12, color: '#B0B0C3', display: 'block', marginBottom: 4 }}>Email</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#25253D', borderRadius: 12, padding: '0 14px' }}>
              <Mail size={18} color="#6B6B80" />
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
            <label style={{ fontSize: 12, color: '#B0B0C3', display: 'block', marginBottom: 4 }}>Mật khẩu</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#25253D', borderRadius: 12, padding: '0 14px' }}>
              <Lock size={18} color="#6B6B80" />
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
                style={{ background: 'transparent', border: 'none', color: '#6B6B80', cursor: 'pointer' }}
              >
                {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ fontSize: 12, color: '#B0B0C3', display: 'block', marginBottom: 4 }}>Xác nhận mật khẩu</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#25253D', borderRadius: 12, padding: '0 14px' }}>
              <Lock size={18} color="#6B6B80" />
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
            <div style={{ color: '#FF4757', fontSize: 12, fontWeight: 600 }}>
              {regError}
            </div>
          )}

          {/* Submit */}
          <GradientButton
            text="TẠO TÀI KHOẢN MỚI"
            type="submit"
            fullWidth
            gradient="linear-gradient(135deg, #FF6B35, #FF8E53)"
            style={{ marginTop: 8 }}
          />
        </form>
      )}

      {/* Quick Demo Accounts Box */}
      <AppCard style={{ marginTop: 24, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <Zap size={18} color="#5352ED" />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF' }}>
            TRUY CẬP NHANH TÀI KHOẢN MẪU
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Demo Account */}
          <div
            onClick={() => {
              setTab('login');
              fillQuickAccount('demo@fitnessbattle.vn', 'demo123456');
            }}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              background: '#25253D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>
                🏃 Demo User (Cơ Bản)
              </div>
              <div style={{ fontSize: 11, color: '#B0B0C3' }}>
                demo@fitnessbattle.vn / demo123456
              </div>
            </div>
            <span style={{ color: '#FF6B35', fontSize: 12, fontWeight: 700 }}>
              Điền ➔
            </span>
          </div>

          {/* VIP Pro Account */}
          <div
            onClick={() => {
              setTab('login');
              fillQuickAccount('vip@fitnessbattle.vn', 'vip123456');
            }}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              background: 'rgba(255, 215, 0, 0.1)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#FFD700' }}>
                👑 VIP Pro Master
              </div>
              <div style={{ fontSize: 11, color: '#B0B0C3' }}>
                vip@fitnessbattle.vn / vip123456
              </div>
            </div>
            <span style={{ color: '#FFD700', fontSize: 12, fontWeight: 700 }}>
              Điền ➔
            </span>
          </div>
        </div>
      </AppCard>
    </div>
  );
};
