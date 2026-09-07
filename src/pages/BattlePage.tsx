import React, { useState } from 'react';
import { Sword, ChevronLeft, Shield, Zap } from 'lucide-react';
import { BattleArena } from '../components/battle/BattleArena';
import { useUser } from '../context/UserContext';

const OPPONENTS = [
  { name: 'Minh Đạt', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=MinhDat&backgroundColor=b6e3f4', level: 8, rank: 1, isVIP: true },
  { name: 'Thu Hà', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=ThuHa&backgroundColor=c0aede', level: 5, rank: 2, isVIP: true },
  { name: 'Hoàng Nam', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=HoangNam&backgroundColor=ffdfbf', level: 12, rank: 12, isVIP: false },
];

const EXERCISES = [
  { id: 'gym', label: '🏋️ Gym', desc: 'Tập gym 1 phút' },
  { id: 'run', label: '🏃 Chạy bộ', desc: 'Chạy bộ 1 phút' },
  { id: 'hiit', label: '⚡ HIIT', desc: 'Tabata 1 phút' },
  { id: 'bike', label: '🚴 Đạp xe', desc: 'Đạp xe 1 phút' },
];

type Screen = 'home' | 'battle';

export const BattlePage: React.FC = () => {
  const { user, deductStamina } = useUser();
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedExercise, setSelectedExercise] = useState('gym');
  const [selectedOpp, setSelectedOpp] = useState(0);
  const [history, setHistory] = useState<Array<{ result: string; opp: string; myScore: number; oppScore: number }>>([]);

  const opp = OPPONENTS[selectedOpp];

  const handleStartBattleClick = () => {
    const ok = deductStamina(10);
    if (!ok) {
      alert('⚡ Bạn đã hết thể lực Stamina (0 HP)!\n\nNạp VIP Premium để nâng trần lên 500 HP Stamina và tiếp tục thi đấu!');
      return;
    }
    setScreen('battle');
  };

  const handleBattleRecorded = (result: string, myScore: number, oppScore: number) => {
    setHistory(h => [{ result, opp: opp.name, myScore, oppScore }, ...h].slice(0, 5));
  };

  if (screen === 'battle') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', maxWidth: 480, margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)', background: 'rgba(14,14,22,0.95)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
          <button onClick={() => setScreen('home')} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronLeft size={18} color="var(--text)" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sword size={18} color="var(--primary)" />
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>Trận Đấu 1v1 (60 GIÂY)</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(46,213,115,0.1)', border: '1px solid rgba(46,213,115,0.2)', borderRadius: 20 }}>
            <Shield size={12} color="#2ed573" />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#2ed573' }}>Anti-Cheat AI</span>
          </div>
        </div>

        <BattleArena
          opponentName={opp.name}
          opponentAvatar={opp.avatar}
          exercise={selectedExercise}
          onBattleEnd={(result, myScore, oppScore) => handleBattleRecorded(result, myScore, oppScore)}
          onPlayAgain={() => {}}
          onGoHome={() => setScreen('home')}
        />

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px', background: 'rgba(14,14,22,0.9)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Shield size={14} color="var(--text4)" />
          <span style={{ fontSize: 11, color: 'var(--text4)' }}>Bảo mật bởi Anti-Cheat AI — GPS & Micro chỉ kích hoạt khi đang đấu</span>
        </div>
      </div>
    );
  }

  // ── MAIN 1V1 SELECTION SCREEN ──
  return (
    <div style={{ padding: '0 0 100px' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 14px', background: 'linear-gradient(180deg, #14141e, var(--bg))', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ marginBottom: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', marginBottom: 4 }}>
            ⚔️ <span style={{ background: 'linear-gradient(135deg, #ff6b35, #ff4757)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Thi Đấu 1v1 Real-Time</span>
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text3)' }}>
            Tính năng cốt lõi: Thách đấu trong 60 giây — AI bảo vệ minh bạch
          </p>
        </div>

        {/* Anti-Cheat Banner */}
        <div style={{ padding: '10px 14px', background: 'rgba(46,213,115,0.08)', border: '1px solid rgba(46,213,115,0.2)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={18} color="#2ed573" />
          <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.3 }}>
            <strong style={{ color: '#2ed573' }}>Dual Sensor Anti-Cheat:</strong> Quét GPS Tốc độ + Micro Tiếng thở để chặn 100% máy lắc ảo.
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px' }}>

        {/* Stamina Info */}
        <div style={{ padding: '10px 14px', background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 12, marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={14} color="var(--primary)" />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Thể lực trận đấu:</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--primary)' }}>{user.stamina}/{user.maxStamina} HP (Tốn 10 HP/trận)</span>
        </div>

        {/* Exercise Selector */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>1. Chọn môn thi đấu</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {EXERCISES.map(ex => (
              <button key={ex.id} onClick={() => setSelectedExercise(ex.id)} style={{
                padding: '12px', background: selectedExercise === ex.id ? 'rgba(255,107,53,0.15)' : 'var(--bg-card)',
                border: `2px solid ${selectedExercise === ex.id ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: 24 }}>{ex.label.split(' ')[0]}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: selectedExercise === ex.id ? 'var(--primary)' : 'var(--text)' }}>{ex.label.split(' ').slice(1).join(' ')}</div>
                  <div style={{ fontSize: 10, color: 'var(--text4)' }}>{ex.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Opponent Selector */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>2. Chọn đối thủ thách đấu</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {OPPONENTS.map((o, i) => (
              <button key={i} onClick={() => setSelectedOpp(i)} style={{
                padding: '12px 16px', background: selectedOpp === i ? 'rgba(255,107,53,0.12)' : 'var(--bg-card)',
                border: `2px solid ${selectedOpp === i ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
                <img src={o.avatar} alt={o.name} style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg3)' }} />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {o.name}
                    {o.isVIP && <span style={{ fontSize: 9, color: '#ffd700' }}>👑 VIP</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>Level {o.level} • Rank #{o.rank}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2ed573', boxShadow: selectedOpp === i ? '0 0 8px #2ed573' : 'none' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Start Battle Button */}
        <button onClick={handleStartBattleClick} style={{
          width: '100%', padding: '16px', background: 'var(--gradient-primary)', border: 'none',
          borderRadius: 16, fontSize: 16, fontWeight: 800, color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: '0 4px 20px rgba(255,107,53,0.4)',
          transition: 'transform 0.1s',
        }}>
          <Sword size={20} />
          THÁCH ĐẤU {opp.name.toUpperCase()} — 60 GIÂY
        </button>

        {/* History */}
        {history.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Lịch sử trận đấu vừa xong</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.map((h, i) => {
                const resultLabel = h.result === 'win' ? 'Thắng' : h.result === 'opp_cheat' ? 'Thắng (đối thủ gian lận)' : h.result === 'cheat' ? 'Gian lận' : 'Thua';
                const resultColor = h.result === 'win' || h.result === 'opp_cheat' ? '#ffd700' : h.result === 'cheat' ? '#ff4757' : 'var(--text3)';
                return (
                  <div key={i} style={{ padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>
                      {h.result === 'win' || h.result === 'opp_cheat' ? '🏆' : h.result === 'cheat' ? '🚫' : '😤'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>vs {h.opp}</div>
                      <div style={{ fontSize: 10, color: resultColor }}>{resultLabel}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>{h.myScore}</div>
                      <div style={{ fontSize: 10, color: 'var(--text4)' }}>/ {h.oppScore} pts</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


