import React from 'react';
import { ChevronRight, Zap } from 'lucide-react';
import { leaderboard } from '../data/mockData';
import { Avatar, Button } from '../components/ui';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
  const dayPart = hour < 12 ? '👋' : hour < 18 ? '💪' : '🌙';

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Top Header */}

      {/* Top Header */}
      <div style={{ background: 'linear-gradient(180deg, #14141e, var(--bg))', padding: '16px 20px 0', position: 'sticky', top: 0, zIndex: 50 }}>
        
        {/* User Info */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            onClick={() => navigate('/profile')}
          >
            <Avatar src={user.avatar} alt={user.name} size={44} online level={user.level} ring="#ff6b35" />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {greeting} {dayPart}
                {user.isVIP && <span style={{ fontSize: 10, padding: '2px 6px', background: 'linear-gradient(135deg, #ffd700, #ff6b35)', borderRadius: 10, color: '#000', fontWeight: 900 }}>VIP</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                {user.name} • Level {user.level} • {(user.totalPoints).toLocaleString()} pts
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/profile')} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: 16 }}>👤</span>
          </button>
        </div>

        {/* Currency & Stamina Resource Bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {/* Stamina Bar */}
          <div style={{ flex: 1.2, padding: '6px 10px', background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={14} color="var(--primary)" />
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)' }}>{user.stamina}/{user.maxStamina} HP</span>
            </div>
            {!user.isVIP && (
              <button onClick={() => navigate('/battle-pass')} style={{ fontSize: 9, padding: '2px 6px', background: 'var(--gradient-primary)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>+VIP</button>
            )}
          </div>

          {/* Ruby Currency */}
          <div style={{ flex: 1, padding: '6px 10px', background: 'rgba(83,82,237,0.1)', border: '1px solid rgba(83,82,237,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => navigate('/battle')}>
            <span style={{ fontSize: 14 }}>💎</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#5352ed' }}>{user.ruby} Ruby</span>
          </div>

          {/* Coins / Points Expiry */}
          <div style={{ flex: 1, padding: '6px 10px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14 }}>🪙</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#ffd700' }}>{user.coins} Xu</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px', marginTop: 16 }}>

        {/* CORE ACTION BANNER: START 1V1 BATTLE */}
        <div style={{ marginBottom: 16, padding: '18px', background: 'linear-gradient(135deg, rgba(255,107,53,0.18), rgba(83,82,237,0.12))', border: '2px solid rgba(255,107,53,0.4)', borderRadius: 18, cursor: 'pointer', boxShadow: '0 6px 20px rgba(255,107,53,0.2)' }} onClick={() => navigate('/battle')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 0 14px rgba(255,107,53,0.4)' }}>
                ⚔️
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', marginBottom: 2 }}>Thi Đấu 1v1 (60 giây)</div>
                <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700 }}>Chọn đối thủ & bắt đầu thi đấu</div>
              </div>
            </div>
            <ChevronRight size={22} color="var(--primary)" />
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <button onClick={() => navigate('/challenge')} style={{ flex: 1, padding: '14px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
            <span style={{ fontSize: 18 }}>🎯</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Thử thách</span>
          </button>
          <button onClick={() => navigate('/battle-pass')} style={{ flex: 1, padding: '14px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
            <span style={{ fontSize: 18 }}>👑</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Nâng cấp</span>
          </button>
        </div>



        {/* Ranking Preview */}
        <div style={{ padding: 16, background: 'linear-gradient(145deg, #1a1a28, #14141e)', border: '1px solid var(--border)', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>🏆 Bảng Xếp Hạng Top Server</h3>
            <button onClick={() => navigate('/profile')} style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Xem thêm</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {leaderboard.slice(0, 3).map((entry) => (
              <div key={entry.userId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: entry.rank === 1 ? 'rgba(255,215,0,0.08)' : 'var(--bg-card2)', borderRadius: 10 }}>
                <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>{entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}</span>
                <Avatar src={entry.avatar} alt={entry.userName} size={32} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{entry.userName}</span>
                  {entry.isVIP && <span style={{ marginLeft: 4, fontSize: 10, color: '#ff4757' }}>👑 VIP</span>}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#ffd700' }}>{entry.points.toLocaleString()} pts</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

