import React, { useState } from 'react';
import { Star, TrendingUp, CheckCircle } from 'lucide-react';
import { challenges, currentUser } from '../data/mockData';
import { ChallengeList, QuickStats } from '../components/challenge/ChallengeList';

export const ChallengePage: React.FC = () => {
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const completed = challenges.filter(c => c.completed);
  const total = challenges.length;
  const progress = Math.round((completed.length / total) * 100);

  const earnedXP = completed.reduce((sum, c) => sum + c.reward.xp, 0);
  const earnedCoins = completed.reduce((sum, c) => sum + c.reward.coins, 0);

  const handleChallengeClick = (challengeId: string) => {
    setSelectedChallenge(challengeId);
    setShowDetail(true);
  };

  const selected = challenges.find(c => c.id === selectedChallenge);

  return (
    <div style={{ padding: '0 0 80px' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 20px', background: 'linear-gradient(180deg, #14141e, var(--bg))', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)' }}>🏆 Thử thách</h1>
          <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Hoàn thành thử thách, nhận phần thưởng khủng</p>
        </div>

        {/* Overall Progress */}
        <div style={{ padding: 16, background: 'linear-gradient(145deg, rgba(255,215,0,0.08), rgba(255,107,53,0.05))', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 18, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 2 }}>Tiến độ tổng thể</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#ffd700' }}>
                {completed.length}/{total} <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>thử thách</span>
              </div>
            </div>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: `conic-gradient(#ffd700 0% ${progress}%, var(--bg4) ${progress}% 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#ffd700' }}>{progress}%</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, padding: '8px 12px', background: 'rgba(46,213,115,0.1)', border: '1px solid rgba(46,213,115,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={14} color="#2ed573" />
              <div><div style={{ fontSize: 11, color: '#2ed573', fontWeight: 700 }}>+{earnedXP.toLocaleString()} XP</div><div style={{ fontSize: 9, color: 'var(--text4)' }}>Đã nhận</div></div>
            </div>
            <div style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Star size={14} color="#ffd700" />
              <div><div style={{ fontSize: 11, color: '#ffd700', fontWeight: 700 }}>+{earnedCoins.toLocaleString()} Coins</div><div style={{ fontSize: 9, color: 'var(--text4)' }}>Đã nhận</div></div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <div style={{ marginBottom: 20 }}>
          <QuickStats totalWorkouts={currentUser.stats.totalWorkouts} totalMinutes={currentUser.stats.totalMinutes} avgHeartRate={currentUser.stats.avgHeartRate} totalCalories={currentUser.stats.totalCalories} streak={currentUser.streak} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Danh sách thử thách</h2>
          </div>
          <ChallengeList challenges={challenges} onChallengeClick={(c) => handleChallengeClick(c.id)} />
        </div>
      </div>

      {/* Challenge Detail Modal */}
      {showDetail && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowDetail(false)}>
          <div style={{ width: '100%', maxWidth: 480, background: 'var(--bg-card)', borderRadius: '24px 24px 0 0', padding: 24, animation: 'slideInRight 0.3s ease-out' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${selected.color}20`, border: `1px solid ${selected.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                  {selected.icon === 'flame' ? '🔥' : selected.icon === 'zap' ? '⚡' : selected.icon === 'swords' ? '⚔️' : selected.icon === 'heart-pulse' ? '💓' : '🏆'}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>{selected.title}</h3>
                  <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'capitalize' }}>Thử thách {selected.type}</div>
                </div>
              </div>
              <button onClick={() => setShowDetail(false)} style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.5 }}>{selected.description}</p>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>Tiến độ</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: selected.completed ? '#2ed573' : 'var(--text)' }}>{selected.current}/{selected.target} {selected.unit}</span>
              </div>
              <div style={{ height: 10, background: 'var(--bg4)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min((selected.current / selected.target) * 100, 100)}%`, background: selected.completed ? '#2ed573' : selected.color, borderRadius: 5, boxShadow: `0 0 8px ${selected.color}60`, transition: 'width 1s ease-out' }} />
              </div>
            </div>
            {selected.completed && (
              <div style={{ padding: '12px 16px', background: 'rgba(46,213,115,0.1)', border: '1px solid rgba(46,213,115,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <CheckCircle size={18} color="#2ed573" />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#2ed573' }}>Đã hoàn thành!</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, padding: '10px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#ffd700' }}>+{selected.reward.xp}</div>
                <div style={{ fontSize: 10, color: 'var(--text4)' }}>XP thưởng</div>
              </div>
              <div style={{ flex: 1, padding: '10px', background: 'rgba(255,165,2,0.1)', border: '1px solid rgba(255,165,2,0.15)', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#ffa502' }}>+{selected.reward.coins}</div>
                <div style={{ fontSize: 10, color: 'var(--text4)' }}>Coins thưởng</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
