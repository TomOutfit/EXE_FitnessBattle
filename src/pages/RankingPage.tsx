import React, { useState } from 'react';
import { Trophy, Flame, Crown, Dumbbell, Footprints, Award } from 'lucide-react';
import { leaderboard, pushupLeaderboard, pullupLeaderboard, walkingLeaderboard, currentUser } from '../data/mockData';
import { WeeklyChart } from '../components/leaderboard/Leaderboard';
import { Avatar } from '../components/ui';
import { useUser } from '../context/UserContext';
import { getRankColor, getRankTitle } from '../utils';

export const RankingPage: React.FC = () => {
  const { user } = useUser();
  const [boardCategory, setBoardCategory] = useState<'overall' | 'pushup' | 'pullup' | 'walking'>('overall');

  const topEntry = leaderboard.find(e => e.isCurrentUser) || {
    rank: user.rank || 47,
    points: user.totalPoints || 4820,
    level: user.level || 12,
    userName: user.name || 'Bạn',
    avatar: user.avatar,
    isVIP: user.isVIP
  };

  // Select dataset based on category
  const currentEntries = boardCategory === 'overall'
    ? leaderboard
    : boardCategory === 'pushup'
    ? pushupLeaderboard
    : boardCategory === 'pullup'
    ? pullupLeaderboard
    : walkingLeaderboard;

  const top3 = currentEntries.slice(0, 3);
  const rest = currentEntries.slice(3);

  return (
    <div style={{ padding: '0 0 80px', maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 20px', background: 'linear-gradient(180deg, #14141e, var(--bg))', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ marginBottom: 14 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={24} color="#ffd700" /> Bảng Xếp Hạng
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>Vinh danh những chiến binh thể lực hàng đầu toàn server</p>
        </div>

        {/* Season Banner */}
        <div
          style={{
            padding: '14px 18px',
            background: 'linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,107,53,0.08))',
            border: '1px solid rgba(255,215,0,0.25)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#ffd700', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Crown size={16} /> Mùa Giải #7 • Chiến Binh Titan
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Còn 12 ngày • Tự động đặt lại ngày 02/08</div>
          </div>
          <div
            style={{
              padding: '6px 14px',
              background: 'rgba(255,215,0,0.15)',
              border: '1px solid rgba(255,215,0,0.3)',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 800,
              color: '#ffd700',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Flame size={14} color="#ff6b35" /> Top 10%
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {[
            { id: 'overall', label: 'Toàn Mùa', icon: <Trophy size={14} /> },
            { id: 'pushup', label: 'Hít Đất', icon: <Flame size={14} /> },
            { id: 'pullup', label: 'Kéo Xà', icon: <Dumbbell size={14} /> },
            { id: 'walking', label: 'Đi Bộ', icon: <Footprints size={14} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setBoardCategory(tab.id as any)}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                background: boardCategory === tab.id ? 'var(--gradient-primary)' : 'var(--bg-card)',
                border: `1px solid ${boardCategory === tab.id ? 'transparent' : 'var(--border)'}`,
                color: boardCategory === tab.id ? '#fff' : 'var(--text3)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                boxShadow: boardCategory === tab.id ? '0 4px 12px rgba(255,107,53,0.3)' : 'none'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* Your Standing Card */}
        <div
          style={{
            marginBottom: 20,
            padding: 16,
            background: 'linear-gradient(135deg, rgba(255,107,53,0.12), rgba(255,71,87,0.06))',
            border: '1px solid rgba(255,107,53,0.25)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 14
          }}
        >
          <Avatar src={user.avatar || topEntry.avatar} alt={user.name} size={46} level={user.level} isVIP={user.isVIP} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              {user.name || 'Bạn'}
              {user.isVIP && <span style={{ fontSize: 10, background: 'rgba(255,215,0,0.2)', color: '#ffd700', padding: '1px 6px', borderRadius: 6 }}>VIP</span>}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
              Hạng {topEntry.rank} • Top 12% toàn server
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#ff6b35' }}>#{topEntry.rank}</div>
            <div style={{ fontSize: 11, color: 'var(--text4)' }}>
              {'points' in topEntry ? `${topEntry.points.toLocaleString()} pts` : `${(topEntry as any).bestScore} lần`}
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div
          style={{
            marginBottom: 24,
            padding: '24px 16px 12px',
            background: 'linear-gradient(180deg, rgba(255,215,0,0.08) 0%, rgba(20,20,30,0.6) 100%)',
            borderRadius: 20,
            border: '1px solid rgba(255,215,0,0.15)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 10
          }}
        >
          {/* Top 2 (Silver) */}
          {top3[1] && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Avatar src={top3[1].avatar} alt={top3[1].userName} size={46} />
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textAlign: 'center', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {top3[1].userName}
              </div>
              <div style={{ fontSize: 18 }}>🥈</div>
              <div
                style={{
                  width: '100%',
                  height: 70,
                  borderRadius: '12px 12px 4px 4px',
                  background: 'linear-gradient(180deg, rgba(192,192,192,0.8), rgba(128,128,128,0.3))',
                  border: '1px solid rgba(192,192,192,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>
                  {'points' in top3[1] ? top3[1].points.toLocaleString() : (top3[1] as any).bestScore}
                </span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)' }}>
                  {'points' in top3[1] ? 'pts' : 'kỷ lục'}
                </span>
              </div>
            </div>
          )}

          {/* Top 1 (Gold) */}
          {top3[0] && (
            <div style={{ flex: 1.15, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <div style={{ position: 'relative' }}>
                <Avatar src={top3[0].avatar} alt={top3[0].userName} size={56} isVIP />
                <Crown size={18} color="#ffd700" style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)' }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#ffd700', textAlign: 'center', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {top3[0].userName}
              </div>
              <div style={{ fontSize: 20 }}>🥇</div>
              <div
                style={{
                  width: '100%',
                  height: 95,
                  borderRadius: '14px 14px 4px 4px',
                  background: 'linear-gradient(180deg, rgba(255,215,0,0.9), rgba(184,134,11,0.4))',
                  border: '1px solid rgba(255,215,0,0.6)',
                  boxShadow: '0 0 16px rgba(255,215,0,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>
                  {'points' in top3[0] ? top3[0].points.toLocaleString() : (top3[0] as any).bestScore}
                </span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
                  {'points' in top3[0] ? 'pts' : 'kỷ lục'}
                </span>
              </div>
            </div>
          )}

          {/* Top 3 (Bronze) */}
          {top3[2] && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Avatar src={top3[2].avatar} alt={top3[2].userName} size={46} />
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textAlign: 'center', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {top3[2].userName}
              </div>
              <div style={{ fontSize: 18 }}>🥉</div>
              <div
                style={{
                  width: '100%',
                  height: 50,
                  borderRadius: '12px 12px 4px 4px',
                  background: 'linear-gradient(180deg, rgba(205,127,50,0.8), rgba(139,69,19,0.3))',
                  border: '1px solid rgba(205,127,50,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>
                  {'points' in top3[2] ? top3[2].points.toLocaleString() : (top3[2] as any).bestScore}
                </span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)' }}>
                  {'points' in top3[2] ? 'pts' : 'kỷ lục'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Weekly Chart */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Award size={16} color="var(--primary)" /> Thống Kê Hoạt Động Tuần
            </h2>
          </div>
          <WeeklyChart data={currentUser.stats.weeklyMinutes} label="Phút tập luyện trong tuần" color="var(--primary)" />
        </div>

        {/* Rest of Leaderboard */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>Bảng Xếp Hạng Chi Tiết</h2>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>{currentEntries.length} Chiến binh</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rest.map((entry) => {
              const rankColor = getRankColor(entry.rank);
              const isCurrentUser = (entry as any).isCurrentUser;
              const scoreDisplay = 'points' in entry
                ? `${entry.points.toLocaleString()} pts`
                : `${(entry as any).bestScore} ${(entry as any).type === 'walking' ? 'bước' : 'lần'}`;

              return (
                <div
                  key={entry.userId + entry.rank}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 14,
                    background: isCurrentUser ? 'rgba(255,107,53,0.1)' : 'var(--bg-card)',
                    border: `1px solid ${isCurrentUser ? 'rgba(255,107,53,0.3)' : 'var(--border)'}`,
                    transition: 'all 0.2s'
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: entry.rank <= 10 ? `${rankColor}20` : 'var(--bg4)',
                      border: `1px solid ${rankColor}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 900,
                      color: entry.rank <= 10 ? rankColor : 'var(--text4)',
                      flexShrink: 0
                    }}
                  >
                    {entry.rank}
                  </div>
                  <Avatar src={entry.avatar} alt={entry.userName} size={40} isVIP={(entry as any).isVIP} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isCurrentUser ? 'var(--primary)' : 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {entry.userName}
                      {isCurrentUser && <span style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 800 }}>(Bạn)</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                      {'level' in entry ? `Cấp ${entry.level} • ${getRankTitle(entry.rank)}` : `Độ chuẩn xác: ${(entry as any).avgAccuracy}%`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>{scoreDisplay}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
