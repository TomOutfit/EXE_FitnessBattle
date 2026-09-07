import React from 'react';
import { leaderboard, currentUser } from '../data/mockData';
import { Leaderboard, WeeklyChart } from '../components/leaderboard/Leaderboard';
import { Avatar, Tag } from '../components/ui';

export const RankingPage: React.FC = () => {
  const topEntry = leaderboard.find(e => e.userId === 'user-1');

  return (
    <div style={{ padding: '0 0 80px' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 20px', background: 'linear-gradient(180deg, #14141e, var(--bg))', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ marginBottom: 4 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)' }}>🏆 Xếp hạng</h1>
          <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Top chiến binh của Fitness Battle</p>
        </div>

        {/* Season Banner */}
        <div style={{ marginTop: 14, padding: '14px 16px', background: 'linear-gradient(90deg, rgba(255,215,0,0.1), rgba(255,107,53,0.08))', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ffd700', marginBottom: 2 }}>Mùa giải #7</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>Còn 12 ngày • Reset: 2/8/2026</div>
          </div>
          <div style={{ padding: '6px 14px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 20, fontSize: 11, fontWeight: 700, color: '#ffd700' }}>Top 10% 🔥</div>
        </div>

        {/* Your Rank */}
        {topEntry && (
          <div style={{ marginTop: 12, padding: 14, background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.15)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar src={topEntry.avatar} alt={topEntry.userName} size={42} level={topEntry.level} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>Vị trí của bạn</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Top {Math.max(1, Math.ceil((topEntry.rank / leaderboard.length) * 100))}% toàn server</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--primary)' }}>#{topEntry.rank}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>{topEntry.points.toLocaleString()} pts</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '16px 20px' }}>
        {/* Weekly Chart */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>📊 Biểu đồ tuần</h2>
          <WeeklyChart data={currentUser.stats.weeklyMinutes} label="Phút tập" color="var(--primary)" />
        </div>

        {/* Leaderboard */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Bảng xếp hạng</h2>
            <Tag color="#5352ed" size="sm">Mùa #7</Tag>
          </div>
          <Leaderboard entries={leaderboard} />
        </div>
      </div>
    </div>
  );
};
