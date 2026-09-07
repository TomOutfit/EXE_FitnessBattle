import React, { useState } from 'react';
import { Zap, Swords, Trophy, ChevronRight, Sparkles, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';

const AVATARS = [
  { seed: 'Warrior', color: 'b6e3f4', emoji: '🏃' },
  { seed: 'Runner', color: 'c0aede', emoji: '⚡' },
  { seed: 'Fighter', color: 'ffdfbf', emoji: '🥊' },
  { seed: 'Champion', color: 'ffd5dc', emoji: '🏆' },
  { seed: 'Sprint', color: 'd1f4e0', emoji: '💨' },
  { seed: 'Titan', color: 'ffd5dc', emoji: '🔥' },
];

const FEATURES = [
  { icon: Swords, color: '#ff6b35', title: 'Battle 1v1', desc: 'Thách đấu bạn bè, so tài thể lực thực tế' },
  { icon: Zap, color: '#ffd700', title: 'AI Coach', desc: 'Kế hoạch tập luyện cá nhân hóa từ AI' },
  { icon: Trophy, color: '#5352ed', title: 'Bảng Xếp Hạng', desc: 'Leo rank, so kè với cộng đồng mỗi mùa' },
];

type Step = 'hero' | 'login' | 'register' | 'avatar';

export const WelcomePage: React.FC = () => {
  const { completeOnboarding, login } = useUser();
  const [step, setStep] = useState<Step>('hero');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [isLoading, setIsLoading] = useState(false);



  const handleLogin = () => {
    if (!email.trim() || !password) {
      setLoginError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    const result = login(email.trim(), password);
    if (!result.success) {
      setLoginError(result.error || 'Đăng nhập thất bại.');
    }
  };

  const handleRegisterNext = () => {
    if (name.trim().length < 2) return;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setLoginError('Vui lòng nhập email hợp lệ.');
      return;
    }
    if (password.length < 6) {
      setLoginError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    setLoginError('');
    setStep('avatar');
  };

  const handleEnterApp = () => {
    setIsLoading(true);
    const av = AVATARS[selectedAvatar];
    completeOnboarding({ name: name.trim(), avatarSeed: av.seed, avatarColor: av.color, avatarEmoji: av.emoji, email: email.trim(), password });
  };

  const av = AVATARS[selectedAvatar];

  const inputStyle = (hasError = false, hasValue = false) => ({
    width: '100%' as const,
    padding: '14px 16px',
    background: 'var(--bg-card)',
    border: `2px solid ${hasError ? '#ff4757' : hasValue ? 'var(--primary)' : 'var(--border)'}`,
    borderRadius: 14,
    fontSize: 16,
    color: 'var(--text)',
    outline: 'none',
    boxShadow: hasValue && !hasError ? '0 0 0 3px rgba(255,107,53,0.12)' : 'none',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto', position: 'relative', overflow: 'hidden' }}>

      {/* ── STEP 1: HERO ── */}
      {step === 'hero' && (
        <>
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {[...Array(12)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute', borderRadius: '50%',
                background: `rgba(${i % 2 === 0 ? '255,107,53' : '83,82,237'}, ${0.04 + i * 0.008})`,
                width: `${60 + i * 18}px`, height: `${60 + i * 18}px`,
                left: `${(i * 87) % 100}%`, top: `${(i * 53) % 100}%`,
                animation: `float ${3 + i * 0.4}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }} />
            ))}
          </div>

          <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,53,0.2), transparent)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80, gap: 0 }}>
            <div 
              style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, boxShadow: '0 0 40px rgba(255,107,53,0.4), 0 0 80px rgba(255,107,53,0.2)', marginBottom: 16 }}
            >
              ⚔️
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, background: 'linear-gradient(135deg, #ff6b35, #ff4757, #ffd700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>
              Fitness Battle
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2ed573' }} />
              <span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 500 }}>Gamified Fitness — Thể thao không còn nhàm chán</span>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 40px', position: 'relative' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 340 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Minh Đạt', pts: '2,450', rank: '🏆 Rank #1', c: '#ffd700', bg: 'rgba(255,215,0,0.08)' },
                  { label: 'Thu Hà', pts: '2,100', rank: '⚔️ Rank #2', c: '#5352ed', bg: 'rgba(83,82,237,0.08)' },
                  { label: 'Bạn', pts: '1,200', rank: '🔥 Rank #47', c: '#ff6b35', bg: 'rgba(255,107,53,0.08)' },
                ].map((p, i) => (
                  <div key={i} style={{ padding: '14px 16px', background: p.bg, border: `1px solid ${p.c}30`, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12, boxShadow: `0 4px 20px ${p.c}15`, animation: `slideInRight 0.5s ease-out ${0.4 + i * 0.15}s both` }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${p.c}20`, border: `1px solid ${p.c}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      {i === 0 ? '🏅' : i === 1 ? '⚡' : '👤'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{p.label}</div>
                      <div style={{ fontSize: 11, color: p.c }}>{p.rank}</div>
                    </div>
                    <div style={{ textAlign: 'right' as const }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: p.c }}>{p.pts}</div>
                      <div style={{ fontSize: 10, color: 'var(--text4)' }}>điểm</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 56, height: 56, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#fff', boxShadow: '0 0 24px rgba(255,107,53,0.5)', zIndex: 2 }}>
                ⚔️
              </div>
            </div>
          </div>

          <div style={{ padding: '0 24px 8px', display: 'flex', flexDirection: 'column', gap: 8, animation: 'fadeInUp 0.6s ease-out 0.7s both' }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${f.color}18`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color={f.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 1 }}>{f.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{f.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ padding: '16px 24px 40px', animation: 'fadeInUp 0.6s ease-out 0.9s both', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={() => setStep('register')} style={{ width: '100%', padding: '16px', background: 'var(--gradient-primary)', border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 800, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 20px rgba(255,107,53,0.4)' }}>
              Tạo tài khoản mới <ChevronRight size={18} />
            </button>
            <button onClick={() => { setLoginError(''); setStep('login'); }} style={{ width: '100%', padding: '14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 16, fontSize: 15, fontWeight: 700, color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              Đăng nhập
            </button>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text4)' }}>Miễn phí tải • Không cần thẻ tín dụng</p>
          </div>
        </>
      )}

      {/* ── STEP 2: LOGIN ── */}
      {step === 'login' && (
        <div style={{ padding: '40px 24px 0', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <button onClick={() => { setStep('hero'); setLoginError(''); setEmail(''); setPassword(''); }} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, fontWeight: 600, color: 'var(--text3)', cursor: 'pointer', marginBottom: 24 }}>
            ← Quay lại
          </button>

          <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', marginBottom: 4, lineHeight: 1.2 }}>Chào mừng trở lại!</h2>
          <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 28 }}>Đăng nhập để tiếp tục thi đấu</p>

          {loginError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.25)', borderRadius: 12, marginBottom: 16, animation: 'fadeInUp 0.2s ease-out' }}>
              <AlertCircle size={16} color="#ff4757" />
              <span style={{ fontSize: 12, color: '#ff4757', fontWeight: 600 }}>{loginError}</span>
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Email</label>
            <input
              type="email" value={email} onChange={e => { setEmail(e.target.value); setLoginError(''); }}
              placeholder="VD: minh.dat@email.com" autoFocus
              style={inputStyle(false, email.length > 0)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setLoginError(''); }}
                placeholder="Nhập mật khẩu"
                style={{ ...inputStyle(false, password.length > 0), paddingRight: 44 }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <button onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                {showPassword ? <EyeOff size={18} color="var(--text4)" /> : <Eye size={18} color="var(--text4)" />}
              </button>
            </div>
          </div>

          <div style={{ flex: 1 }} />

          <button onClick={handleLogin} style={{ width: '100%', padding: '16px', background: 'var(--gradient-primary)', border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 800, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 20px rgba(255,107,53,0.4)' }}>
            Đăng nhập
          </button>

          <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'var(--text4)' }}>
            Chưa có tài khoản? <button onClick={() => { setStep('register'); setLoginError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: 12, padding: 0 }}>Đăng ký ngay</button>
          </p>
        </div>
      )}

      {/* ── STEP 3: REGISTER ── */}
      {step === 'register' && (
        <div style={{ padding: '40px 24px 0', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <button onClick={() => { setStep('hero'); setLoginError(''); setEmail(''); setPassword(''); setName(''); }} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, fontWeight: 600, color: 'var(--text3)', cursor: 'pointer', marginBottom: 24 }}>
            ← Quay lại
          </button>

          <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', marginBottom: 4, lineHeight: 1.2 }}>Tạo tài khoản mới</h2>
          <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 28 }}>Tham gia cùng cộng đồng chiến binh ngay hôm nay</p>

          {loginError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.25)', borderRadius: 12, marginBottom: 16, animation: 'fadeInUp 0.2s ease-out' }}>
              <AlertCircle size={16} color="#ff4757" />
              <span style={{ fontSize: 12, color: '#ff4757', fontWeight: 600 }}>{loginError}</span>
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Tên chiến binh</label>
            <input
              type="text" value={name} onChange={e => { setName(e.target.value); setLoginError(''); }}
              placeholder="VD: Minh Đạt" maxLength={20} autoFocus
              style={inputStyle(false, name.length >= 2)}
            />
            <div style={{ textAlign: 'right', marginTop: 4, fontSize: 11, color: name.length >= 2 ? '#2ed573' : 'var(--text4)' }}>
              {name.length}/20 ký tự
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Email</label>
            <input
              type="email" value={email} onChange={e => { setEmail(e.target.value); setLoginError(''); }}
              placeholder="VD: minh.dat@email.com"
              style={inputStyle(false, email.length > 0)}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setLoginError(''); }}
                placeholder="Ít nhất 6 ký tự"
                style={{ ...inputStyle(false, password.length >= 6), paddingRight: 44 }}
              />
              <button onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                {showPassword ? <EyeOff size={18} color="var(--text4)" /> : <Eye size={18} color="var(--text4)" />}
              </button>
            </div>
          </div>

          {name.length >= 2 && (
            <div style={{ padding: '14px 16px', background: 'linear-gradient(90deg, rgba(255,107,53,0.1), rgba(83,82,237,0.05))', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, animation: 'fadeInUp 0.3s ease-out' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Level 1 • Tân binh</div>
              </div>
            </div>
          )}

          <div style={{ flex: 1 }} />

          <button onClick={handleRegisterNext} disabled={name.trim().length < 2}
            style={{ width: '100%', padding: '16px', background: name.trim().length < 2 ? 'var(--bg4)' : 'var(--gradient-primary)', border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 800, color: name.trim().length < 2 ? 'var(--text4)' : '#fff', cursor: name.trim().length < 2 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
            Tiếp tục <ChevronRight size={18} />
          </button>

          <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'var(--text4)' }}>
            Đã có tài khoản? <button onClick={() => { setStep('login'); setLoginError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: 12, padding: 0 }}>Đăng nhập ngay</button>
          </p>
        </div>
      )}

      {/* ── STEP 4: AVATAR ── */}
      {step === 'avatar' && (
        <div style={{ padding: '40px 24px 0', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <button onClick={() => setStep('register')} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, fontWeight: 600, color: 'var(--text3)', cursor: 'pointer', marginBottom: 24 }}>
            ← Quay lại
          </button>

          <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', marginBottom: 8, lineHeight: 1.2 }}>Chọn Avatar của bạn</h2>
          <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 32 }}>Sẵn sàng gia nhập đấu trường, {name}!</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
            {AVATARS.map((a, i) => (
              <button key={i} onClick={() => setSelectedAvatar(i)} style={{
                padding: '16px 12px',
                background: selectedAvatar === i ? 'rgba(255,107,53,0.15)' : 'var(--bg-card)',
                border: `2px solid ${selectedAvatar === i ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: selectedAvatar === i ? '0 0 0 4px rgba(255,107,53,0.15), 0 0 16px rgba(255,107,53,0.15)' : 'none',
              }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: `linear-gradient(135deg, #${a.color}, #${a.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                  {a.emoji}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: selectedAvatar === i ? 'var(--primary)' : 'var(--text3)' }}>{a.seed}</span>
              </button>
            ))}
          </div>

          <div style={{ padding: '14px 16px', background: 'linear-gradient(90deg, rgba(255,107,53,0.1), rgba(83,82,237,0.05))', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, animation: 'fadeInUp 0.3s ease-out' }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: `linear-gradient(135deg, #${av.color}, #${av.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
              {av.emoji}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{name}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>{av.emoji} {av.seed}</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2ed573' }} />
              <span style={{ fontSize: 12, color: '#2ed573', fontWeight: 600 }}>Sẵn sàng!</span>
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {isLoading ? (
            <div style={{ padding: '16px', borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)' }}>Đang tạo tài khoản...</span>
            </div>
          ) : (
            <button onClick={handleEnterApp} style={{ width: '100%', padding: '16px', background: 'var(--gradient-primary)', border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 800, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 20px rgba(255,107,53,0.4)' }}>
              <Sparkles size={18} /> Vào Đấu Trường
            </button>
          )}

          <p style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: 'var(--text4)' }}>Gợi ý: Có thể đổi Avatar sau trong Hồ sơ</p>
        </div>
      )}
    </div>
  );
};
