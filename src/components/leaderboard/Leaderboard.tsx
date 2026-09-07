import React from 'react';
import type { LeaderboardEntry } from '../../types';
import { Avatar } from '../ui';
import { getRankColor, getRankTitle } from '../../utils';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries }) => {
  const top3 = entries.filter(e => e.rank <= 3);
  const rest = entries.filter(e => e.rank > 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top 3 Podium */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, padding: '20px 12px 8px', background: 'linear-gradient(180deg, rgba(255,215,0,0.06) 0%, transparent 100%)', borderRadius: 20, border: '1px solid rgba(255,215,0,0.1)' }}>
        {top3.sort((a, b) => a.rank - b.rank).map((entry) => (
          <PodiumCard key={entry.userId} entry={entry} />
        ))}
      </div>

      {/* Rest of list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rest.map((entry, i) => (
          <LeaderboardRow key={entry.userId} entry={entry} index={i} />
        ))}
      </div>
    </div>
  );
};

const PodiumCard: React.FC<{ entry: LeaderboardEntry }> = ({ entry }) => {
  const heights = [70, 90, 60];
  const posOrder = [2, 1, 3];
  const pos = posOrder.indexOf(entry.rank);
  const h = heights[pos];
  const medals = ['🥈', '🥇', '🥉'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
      <Avatar src={entry.avatar} alt={entry.userName} size={pos === 1 ? 52 : 44} />
      <div style={{ fontSize: pos === 1 ? 16 : 13, fontWeight: 700, color: entry.isCurrentUser ? 'var(--primary)' : 'var(--text)', textAlign: 'center' }}>{entry.userName.split(' ')[0]}</div>
      <div style={{ fontSize: 10, color: 'var(--text3)' }}>Lv.{entry.level}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, height: 24 }}>{medals[pos]}</div>
      <div style={{
        width: '100%', height: h, borderRadius: '12px 12px 4px 4px',
        background: entry.rank === 1 ? 'linear-gradient(180deg, #ffd700cc, #b8860b88)' : entry.rank === 2 ? 'linear-gradient(180deg, #c0c0c0cc, #88888888)' : 'linear-gradient(180deg, #cd7f32cc, #8b451388)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 8,
        border: entry.rank === 1 ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(255,255,255,0.05)',
      }}>
        <span style={{ fontSize: 14, fontWeight: 900, color: entry.rank === 1 ? '#fff' : 'rgba(255,255,255,0.7)' }}>{entry.points.toLocaleString()}</span>
      </div>
    </div>
  );
};

const LeaderboardRow: React.FC<{ entry: LeaderboardEntry; index: number }> = ({ entry, index }) => {
  const rankColor = getRankColor(entry.rank);
  const isCurrentUser = entry.isCurrentUser;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
      borderRadius: 14, background: isCurrentUser ? 'rgba(255,107,53,0.08)' : 'var(--bg-card)',
      border: `1px solid ${isCurrentUser ? 'rgba(255,107,53,0.2)' : 'var(--border)'}`,
      animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
    }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: entry.rank <= 10 ? `${rankColor}22` : 'var(--bg4)', border: `1px solid ${rankColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: entry.rank <= 10 ? rankColor : 'var(--text4)', flexShrink: 0 }}>
        {entry.rank}
      </div>
      <Avatar src={entry.avatar} alt={entry.userName} size={38} level={entry.level} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: isCurrentUser ? 'var(--primary)' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {entry.userName}{isCurrentUser && <span style={{ color: 'var(--primary)', fontSize: 11 }}> (Bạn)</span>}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text3)' }}>{getRankTitle(entry.rank)}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{entry.points.toLocaleString()}</div>
        <div style={{ fontSize: 10, color: 'var(--text4)' }}>điểm</div>
      </div>
    </div>
  );
};

interface WeeklyChartProps {
  data: number[];
  label: string;
  color?: string;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data, label, color = 'var(--primary)' }) => {
  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const max = Math.max(...data, 1);
  const today = new Date().getDay();
  const lastDay = today === 0 ? 6 : today - 1;

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>Tổng: {data.reduce((a, b) => a + b, 0).toLocaleString()}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
        {data.map((val, i) => {
          const pct = (val / max) * 100;
          const isLast = i === lastDay;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: '100%', height: `${Math.max(pct, 4)}%`, background: isLast ? `linear-gradient(180deg, ${color}, ${color}88)` : `${color}55`, borderRadius: 4, minHeight: 4, boxShadow: isLast ? `0 0 8px ${color}40` : 'none', transition: 'height 0.5s ease-out' }} />
              <span style={{ fontSize: 9, fontWeight: 500, color: isLast ? color : 'var(--text4)' }}>{days[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
