import React, { useState } from 'react';
import { Zap, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import type { Challenge } from '../../types';
import { ProgressBar, Tag } from '../ui';
import { getChallengeTypeColor, getChallengeTypeLabel } from '../../utils';

interface ChallengeListProps {
  challenges: Challenge[];
  onChallengeClick?: (challenge: Challenge) => void;
}

export const ChallengeList: React.FC<ChallengeListProps> = ({ challenges, onChallengeClick }) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const filters = ['all', 'daily', 'weekly', 'monthly', 'special'];

  const filtered = activeFilter === 'all'
    ? challenges
    : challenges.filter(c => c.type === activeFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', background: activeFilter === f ? 'var(--gradient-primary)' : 'var(--bg-card)', border: `1px solid ${activeFilter === f ? 'transparent' : 'var(--border)'}`, color: activeFilter === f ? '#fff' : 'var(--text3)', cursor: 'pointer', transition: 'all 0.2s' }}>
            {f === 'all' ? 'Tất cả' : f === 'daily' ? 'Ngày' : f === 'weekly' ? 'Tuần' : f === 'monthly' ? 'Tháng' : 'Đặc biệt'}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((challenge, i) => (
          <ChallengeCard key={challenge.id} challenge={challenge} onClick={() => onChallengeClick?.(challenge)} style={{ animation: `fadeInUp 0.4s ease-out ${i * 0.06}s both` }} />
        ))}
      </div>
    </div>
  );
};

const ChallengeCard: React.FC<{ challenge: Challenge; onClick?: () => void; style?: React.CSSProperties }> = ({ challenge, onClick, style }) => {
  const typeColor = getChallengeTypeColor(challenge.type);
  const iconMap: Record<string, string> = { flame: '🔥', zap: '⚡', swords: '⚔️', 'heart-pulse': '💓', trophy: '🏆' };

  return (
    <div onClick={onClick} style={{ background: 'linear-gradient(145deg, #14141e, #1a1a28)', border: `1px solid ${challenge.completed ? 'rgba(46,213,115,0.25)' : 'var(--border)'}`, borderRadius: 16, padding: 16, cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden', ...style }}>
      {challenge.completed && (
        <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(46,213,115,0.15)', border: '1px solid rgba(46,213,115,0.3)', borderRadius: 8, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <CheckCircle size={10} color="#2ed573" />
          <span style={{ fontSize: 10, color: '#2ed573', fontWeight: 600 }}>Hoàn thành</span>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${challenge.color}20`, border: `1px solid ${challenge.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, boxShadow: `0 0 12px ${challenge.color}20` }}>
          {iconMap[challenge.icon] || '🏆'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{challenge.title}</h3>
          <p style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.4 }}>{challenge.description}</p>
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <ProgressBar value={challenge.current} max={challenge.target} color={challenge.completed ? '#2ed573' : challenge.color} height={7} showLabel label={`${challenge.current} / ${challenge.target} ${challenge.unit}`} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <Tag color={typeColor} size="sm">{getChallengeTypeLabel(challenge.type)}</Tag>
          {!challenge.completed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
              <Clock size={10} color="var(--text3)" />
              <span style={{ fontSize: 10, color: 'var(--text3)' }}>{formatExpiry(challenge.expiresAt)}</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Zap size={11} color="#ffd700" />
          <span style={{ fontSize: 11, color: '#ffd700', fontWeight: 600 }}>+{challenge.reward.xp}</span>
          <span style={{ fontSize: 11, color: 'var(--text4)' }}>XP</span>
          <ChevronRight size={14} color="var(--text4)" />
        </div>
      </div>
    </div>
  );
};

function formatExpiry(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = date.getTime() - now.getTime();
  if (diffMs <= 0) return 'Hết hạn';
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffMs / 86400000);
  return `${diffDays} ngày`;
}

interface QuickStatsProps {
  totalWorkouts: number;
  totalMinutes: number;
  avgHeartRate: number;
  totalCalories: number;
  streak: number;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ totalWorkouts, totalMinutes, avgHeartRate, totalCalories, streak }) => {
  return (
    <div style={{ background: 'linear-gradient(145deg, #14141e, #1a1a28)', border: '1px solid var(--border)', borderRadius: 18, padding: 18, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
      {[
        { icon: '🏋️', label: 'Tổng buổi tập', value: totalWorkouts, color: '#ff6b35' },
        { icon: '⏱️', label: 'Tổng thời gian', value: `${totalMinutes}p`, color: '#5352ed' },
        { icon: '❤️', label: 'Nhịp tim TB', value: avgHeartRate, color: '#ff4757', unit: 'bpm' },
        { icon: '🔥', label: 'Calories đốt', value: totalCalories.toLocaleString(), color: '#f7c948', unit: 'kcal' },
      ].map((stat) => (
        <div key={stat.label} style={{ padding: 12, background: 'var(--bg-card2)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 16 }}>{stat.icon}</span><span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 500 }}>{stat.label}</span></div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: stat.color }}>{stat.value}</span>
            {stat.unit && <span style={{ fontSize: 10, color: 'var(--text3)' }}>{stat.unit}</span>}
          </div>
        </div>
      ))}
      <div style={{ gridColumn: '1 / -1', padding: '12px 16px', background: 'linear-gradient(90deg, rgba(255,107,53,0.1), rgba(255,71,87,0.05))', borderRadius: 12, border: '1px solid rgba(255,107,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 28 }}>🔥</span>
          <div><div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>Chuỗi {streak} ngày liên tiếp!</div><div style={{ fontSize: 10, color: 'var(--text3)' }}>Giữ vững phong độ</div></div>
        </div>
        <div style={{ padding: '4px 12px', background: 'var(--gradient-primary)', borderRadius: 20, fontSize: 11, fontWeight: 700, color: '#fff' }}>+{streak * 10} XP</div>
      </div>
    </div>
  );
};
