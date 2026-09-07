import React, { useEffect, useState } from 'react';
import { Zap, TrendingUp, Star, Trophy, RotateCcw, Home, XCircle, CheckCircle } from 'lucide-react';
import { Avatar } from '../ui';
import { useUser } from '../../context/UserContext';

export type BattleResultType = 'win' | 'lose' | 'cheat' | 'opp_cheat';

interface BattleResultProps {
  myScore: number;
  oppScore: number;
  myAvatar: string;
  myName: string;
  oppAvatar: string;
  oppName: string;
  result: BattleResultType;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const BattleResult: React.FC<BattleResultProps> = ({
  myScore, oppScore, myAvatar, myName, oppAvatar, oppName, result, onPlayAgain, onGoHome,
}) => {
  const { user } = useUser();
  const [visible, setVisible] = useState(false);
  const [xpCount, setXpCount] = useState(0);
  const [ptsCount, setPtsCount] = useState(0);

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const isWin = result === 'win' || result === 'opp_cheat';
  const isCheat = result === 'cheat';
  const oppCheated = result === 'opp_cheat';

  const xpGained = isCheat ? 0 : Math.floor(myScore * 1.5);
  const ptsGained = isCheat ? -50 : isWin ? Math.floor(myScore * 2) : Math.floor(myScore * 0.3);
  const streakChange = isWin ? 1 : isCheat ? 0 : -Math.min(user.streak, 2);

  // Animate counters
  useEffect(() => {
    if (!visible) return;
    const duration = 1200;
    const steps = 40;
    const xpStep = xpGained / steps;
    const ptsStep = ptsGained / steps;
    let current = 0;
    const iv = setInterval(() => {
      current++;
      setXpCount(Math.round(Math.min(current * xpStep, xpGained)));
      setPtsCount(Math.round(Math.min(current * ptsStep, ptsGained)));
      if (current >= steps) clearInterval(iv);
    }, duration / steps);
    return () => clearInterval(iv);
  }, [visible, xpGained, ptsGained]);

  const config = {
    win: {
      emoji: '🏆', title: 'Chiến thắng!', subtitle: 'Xuất sắc! Bạn đã giành chiến thắng!',
      titleColor: '#ffd700', bgGradient: 'linear-gradient(145deg, rgba(255,215,0,0.15), rgba(255,215,0,0.03))',
      borderColor: 'rgba(255,215,0,0.3)', glowColor: 'rgba(255,215,0,0.3)',
    },
    opp_cheat: {
      emoji: '🏆', title: 'Chiến thắng!', subtitle: 'Đối thủ bị phát hiện gian lận. Bạn thắng!',
      titleColor: '#ffd700', bgGradient: 'linear-gradient(145deg, rgba(255,215,0,0.15), rgba(255,215,0,0.03))',
      borderColor: 'rgba(255,215,0,0.3)', glowColor: 'rgba(255,215,0,0.3)',
    },
    lose: {
      emoji: '😤', title: 'Thua trận', subtitle: 'Không sao! Luyện tập thêm và thử lại nhé.',
      titleColor: '#ff4757', bgGradient: 'linear-gradient(145deg, rgba(255,71,87,0.12), rgba(255,71,87,0.03))',
      borderColor: 'rgba(255,71,87,0.25)', glowColor: 'rgba(255,71,87,0.2)',
    },
    cheat: {
      emoji: '🚫', title: 'Gian lận bị phát hiện!', subtitle: 'GPS không khớp Micro. Trận bị hủy. Không điểm.',
      titleColor: '#ff4757', bgGradient: 'linear-gradient(145deg, rgba(255,71,87,0.12), rgba(255,71,87,0.03))',
      borderColor: 'rgba(255,71,87,0.25)', glowColor: 'rgba(255,71,87,0.2)',
    },
  };

  const c = config[result];

  return (
    <div style={{
      padding: '24px 20px 20px',
      display: 'flex', flexDirection: 'column', gap: 16,
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
    }}>

      {/* Hero Banner */}
      <div style={{
        textAlign: 'center', padding: '24px 16px 20px',
        background: c.bgGradient, border: `1px solid ${c.borderColor}`,
        borderRadius: 20, boxShadow: `0 8px 32px ${c.glowColor}`,
      }}>
        <div style={{ fontSize: 72, marginBottom: 8, animation: 'bounce 1s infinite' }}>{c.emoji}</div>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: c.titleColor, marginBottom: 6 }}>{c.title}</h2>
        <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.5 }}>{c.subtitle}</p>
      </div>

      {/* Score Recap */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden',
      }}>
        {/* Me */}
        <div style={{ flex: 1, padding: '16px 12px', textAlign: 'center', borderRight: '1px solid var(--border)' }}>
          <Avatar src={myAvatar} alt={myName} size={48} online ring={isCheat ? '#ff4757' : isWin ? '#ffd700' : 'var(--primary)'} />
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginTop: 6, marginBottom: 4 }}>{myName}</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: isCheat ? '#ff4757' : isWin ? '#ffd700' : 'var(--primary)' }}>
            {myScore}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text3)' }}>điểm</div>
        </div>

        {/* VS + Result */}
        <div style={{ width: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '12px 0' }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text3)' }}>⚔️</div>
          <div style={{
            padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700,
            background: isCheat ? 'rgba(255,71,87,0.15)' : isWin ? 'rgba(46,213,115,0.15)' : 'rgba(255,71,87,0.15)',
            color: isCheat ? '#ff4757' : isWin ? '#2ed573' : '#ff4757',
          }}>
            {isCheat ? 'HỦY' : isWin ? 'WIN' : 'LOSE'}
          </div>
        </div>

        {/* Opponent */}
        <div style={{ flex: 1, padding: '16px 12px', textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
          <Avatar src={oppAvatar} alt={oppName} size={48} ring={oppCheated ? '#ff4757' : '#5352ed'} />
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginTop: 6, marginBottom: 4 }}>{oppName}</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#5352ed' }}>{oppScore}</div>
          <div style={{ fontSize: 10, color: 'var(--text3)' }}>điểm</div>
        </div>
      </div>

      {/* Rewards */}
      {!isCheat ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {/* XP Gained */}
          <div style={{ padding: '14px 12px', background: 'rgba(46,213,115,0.08)', border: '1px solid rgba(46,213,115,0.2)', borderRadius: 14, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 6 }}>
              <Zap size={14} color="#2ed573" />
              <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>XP Nhận Được</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#2ed573' }}>+{xpCount}</div>
          </div>

          {/* Points Gained */}
          <div style={{ padding: '14px 12px', background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 14, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 6 }}>
              <Star size={14} color="#ffd700" />
              <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>Điểm Nhận Được</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#ffd700' }}>
              {ptsCount > 0 ? '+' : ''}{ptsCount.toLocaleString()}
            </div>
          </div>

          {/* Streak */}
          <div style={{ padding: '14px 12px', background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 14, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 6 }}>
              <TrendingUp size={14} color="#ff6b35" />
              <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>Streak</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#ff6b35' }}>
              {streakChange > 0 ? '+' : ''}{streakChange} 🔥
            </div>
          </div>

          {/* W/L Record */}
          <div style={{ padding: '14px 12px', background: 'rgba(83,82,237,0.08)', border: '1px solid rgba(83,82,237,0.2)', borderRadius: 14, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 6 }}>
              <Trophy size={14} color="#5352ed" />
              <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>Thành Tích</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#5352ed' }}>
              {user.winCount + (isWin ? 1 : 0)}W-{user.loseCount + (result === 'lose' ? 1 : 0)}L
            </div>
          </div>
        </div>
      ) : (
        /* Cheat Warning */
        <div style={{ padding: '14px 16px', background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.25)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <XCircle size={18} color="#ff4757" />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#ff4757', marginBottom: 2 }}>Cảnh báo: Gian lận</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>GPS không khớp với tín hiệu Micro. Gian lận nhiều lần → khóa tài khoản.</div>
          </div>
        </div>
      )}

      {/* Anti-Cheat Verification */}
      <div style={{ padding: '10px 14px', background: 'rgba(46,213,115,0.06)', border: '1px solid rgba(46,213,115,0.15)', borderRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={14} color="#2ed573" />
          <span style={{ fontSize: 11, color: '#2ed573', fontWeight: 600 }}>Anti-Cheat xác nhận:</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          {[
            { label: 'GPS', ok: !isCheat },
            { label: 'Micro', ok: !isCheat },
            { label: 'Đối thủ GPS', ok: !oppCheated },
          ].map((check, i) => (
            <div key={i} style={{ flex: 1, padding: '6px 8px', background: check.ok ? 'rgba(46,213,115,0.1)' : 'rgba(255,71,87,0.1)', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: check.ok ? '#2ed573' : '#ff4757' }}>{check.ok ? '✓' : '✗'}</div>
              <div style={{ fontSize: 9, color: 'var(--text3)' }}>{check.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onGoHome} style={{ flex: 1, padding: '13px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
          <Home size={16} color="var(--text2)" />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text2)' }}>Về Trang Chủ</span>
        </button>
        <button onClick={onPlayAgain} style={{ flex: 1.4, padding: '13px', background: 'var(--gradient-primary)', border: 'none', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,107,53,0.3)' }}>
          <RotateCcw size={16} color="#fff" />
          <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Đấu Lại</span>
        </button>
      </div>
    </div>
  );
};
