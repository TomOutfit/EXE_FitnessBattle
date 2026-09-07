import React, { useState } from 'react';
import { Star, TrendingUp, CheckCircle2, Award, Gift, ChevronRight } from 'lucide-react';
import { challenges as initialChallenges } from '../data/mockData';
import { useUser } from '../context/UserContext';
import { QuickStats } from '../components/challenge/ChallengeList';
import type { Challenge } from '../types';

export const ChallengePage: React.FC = () => {
  const { user, addXP, addCoins, showToast } = useUser();
  const [challengeList] = useState<Challenge[]>(initialChallenges);
  const [activeTab, setActiveTab] = useState<'all' | 'daily' | 'weekly' | 'special'>('all');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [claimedIds, setClaimedIds] = useState<string[]>([]);

  const completed = challengeList.filter(c => c.completed);
  const total = challengeList.length;
  const progress = Math.round((completed.length / total) * 100);

  const earnedXP = completed.reduce((sum, c) => sum + c.reward.xp, 0);
  const earnedCoins = completed.reduce((sum, c) => sum + c.reward.coins, 0);

  const filteredChallenges = activeTab === 'all' 
    ? challengeList 
    : challengeList.filter(c => c.type === activeTab);

  const handleClaimReward = (c: Challenge, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (claimedIds.includes(c.id)) {
      showToast('Bạn đã nhận phần thưởng này rồi!', 'info');
      return;
    }
    setClaimedIds(prev => [...prev, c.id]);
    addXP(c.reward.xp);
    addCoins(c.reward.coins);
    showToast(`🎉 Nhận thành công +${c.reward.xp} XP & +${c.reward.coins} Coins!`, 'success');
  };

  const iconMap: Record<string, string> = {
    flame: '🔥',
    zap: '⚡',
    swords: '⚔️',
    'heart-pulse': '💓',
    trophy: '🏆'
  };

  return (
    <div style={{ padding: '0 0 80px', maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 20px', background: 'linear-gradient(180deg, #14141e, var(--bg))', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={24} color="#ffd700" /> Thử Thách
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>Hoàn thành nhiệm vụ rèn luyện, thu thập XP và Coins nâng cấp nhân vật</p>
        </div>

        {/* Overall Progress Banner */}
        <div style={{ padding: 18, background: 'linear-gradient(145deg, rgba(255,215,0,0.08), rgba(255,107,53,0.06))', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 18, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 2 }}>Tiến độ thử thách mùa</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#ffd700' }}>
                {completed.length}/{total} <span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 500 }}>đã hoàn thành</span>
              </div>
            </div>
            <div style={{ width: 58, height: 58, borderRadius: '50%', background: `conic-gradient(#ffd700 0% ${progress}%, var(--bg4) ${progress}% 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#ffd700' }}>
                {progress}%
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, padding: '10px 14px', background: 'rgba(46,213,115,0.1)', border: '1px solid rgba(46,213,115,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={16} color="#2ed573" />
              <div>
                <div style={{ fontSize: 12, color: '#2ed573', fontWeight: 800 }}>+{earnedXP.toLocaleString()} XP</div>
                <div style={{ fontSize: 10, color: 'var(--text4)' }}>Tổng XP tích lũy</div>
              </div>
            </div>
            <div style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Star size={16} color="#ffd700" />
              <div>
                <div style={{ fontSize: 12, color: '#ffd700', fontWeight: 800 }}>+{earnedCoins.toLocaleString()} Coins</div>
                <div style={{ fontSize: 10, color: 'var(--text4)' }}>Tổng Coins tích lũy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'daily', label: 'Hàng ngày' },
            { id: 'weekly', label: 'Hàng tuần' },
            { id: 'special', label: 'Đặc biệt' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                background: activeTab === tab.id ? 'var(--gradient-primary)' : 'var(--bg-card)',
                border: `1px solid ${activeTab === tab.id ? 'transparent' : 'var(--border)'}`,
                color: activeTab === tab.id ? '#fff' : 'var(--text3)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(255,107,53,0.3)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body Content */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ marginBottom: 20 }}>
          <QuickStats
            totalWorkouts={user.stats?.totalWorkouts || 24}
            totalMinutes={user.stats?.totalMinutes || 480}
            avgHeartRate={user.stats?.avgHeartRate || 138}
            totalCalories={user.stats?.totalCalories || 3650}
            streak={user.streak || 5}
          />
        </div>

        {/* Challenge List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredChallenges.map(challenge => {
            const isClaimed = claimedIds.includes(challenge.id);
            const isReadyToClaim = challenge.completed && !isClaimed;

            return (
              <div
                key={challenge.id}
                onClick={() => setSelectedChallenge(challenge)}
                style={{
                  background: 'linear-gradient(145deg, #14141e, #1a1a28)',
                  border: `1px solid ${challenge.completed ? 'rgba(46,213,115,0.3)' : 'var(--border)'}`,
                  borderRadius: 16,
                  padding: 16,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      background: `${challenge.color}20`,
                      border: `1px solid ${challenge.color}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      flexShrink: 0
                    }}
                  >
                    {iconMap[challenge.icon] || '🏆'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>{challenge.title}</h3>
                      {challenge.completed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(46,213,115,0.15)', padding: '2px 8px', borderRadius: 8 }}>
                          <CheckCircle2 size={12} color="#2ed573" />
                          <span style={{ fontSize: 10, color: '#2ed573', fontWeight: 700 }}>Hoàn thành</span>
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.4 }}>{challenge.description}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--text4)' }}>Tiến trình</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: challenge.completed ? '#2ed573' : 'var(--text)' }}>
                      {challenge.current} / {challenge.target} {challenge.unit}
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg4)', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min((challenge.current / challenge.target) * 100, 100)}%`,
                        background: challenge.completed ? '#2ed573' : challenge.color,
                        borderRadius: 4,
                        transition: 'width 0.6s ease-out'
                      }}
                    />
                  </div>
                </div>

                {/* Rewards & Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: 'rgba(255,215,0,0.1)', borderRadius: 8 }}>
                      <Star size={12} color="#ffd700" />
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#ffd700' }}>+{challenge.reward.xp} XP</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: 'rgba(255,165,2,0.1)', borderRadius: 8 }}>
                      <Gift size={12} color="#ffa502" />
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#ffa502' }}>+{challenge.reward.coins} C</span>
                    </div>
                  </div>

                  {isReadyToClaim ? (
                    <button
                      onClick={(e) => handleClaimReward(challenge, e)}
                      style={{
                        padding: '6px 14px',
                        background: 'linear-gradient(135deg, #2ed573, #10ac84)',
                        border: 'none',
                        borderRadius: 10,
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(46,213,115,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Gift size={13} /> Nhận thưởng
                    </button>
                  ) : isClaimed ? (
                    <span style={{ fontSize: 11, color: 'var(--text4)', fontWeight: 600 }}>✓ Đã nhận</span>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--text4)', fontSize: 12 }}>
                      <span>Chi tiết</span>
                      <ChevronRight size={14} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Challenge Detail Modal */}
      {selectedChallenge && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
          onClick={() => setSelectedChallenge(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              background: 'var(--bg-card)',
              borderRadius: '24px 24px 0 0',
              padding: 24,
              border: '1px solid var(--border)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: `${selectedChallenge.color}20`,
                    border: `1px solid ${selectedChallenge.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28
                  }}
                >
                  {iconMap[selectedChallenge.icon] || '🏆'}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>{selectedChallenge.title}</h3>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                    Thử thách {selectedChallenge.type === 'daily' ? 'Hàng ngày' : selectedChallenge.type === 'weekly' ? 'Hàng tuần' : 'Đặc biệt'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedChallenge(null)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: 'var(--bg3)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text)'
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 18, lineHeight: 1.6 }}>{selectedChallenge.description}</p>

            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>Tiến trình thực hiện</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: selectedChallenge.completed ? '#2ed573' : 'var(--text)' }}>
                  {selectedChallenge.current}/{selectedChallenge.target} {selectedChallenge.unit}
                </span>
              </div>
              <div style={{ height: 10, background: 'var(--bg4)', borderRadius: 5, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min((selectedChallenge.current / selectedChallenge.target) * 100, 100)}%`,
                    background: selectedChallenge.completed ? '#2ed573' : selectedChallenge.color,
                    borderRadius: 5
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1, padding: '12px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#ffd700' }}>+{selectedChallenge.reward.xp}</div>
                <div style={{ fontSize: 11, color: 'var(--text4)' }}>XP Thưởng</div>
              </div>
              <div style={{ flex: 1, padding: '12px', background: 'rgba(255,165,2,0.1)', border: '1px solid rgba(255,165,2,0.2)', borderRadius: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#ffa502' }}>+{selectedChallenge.reward.coins}</div>
                <div style={{ fontSize: 11, color: 'var(--text4)' }}>Coins Thưởng</div>
              </div>
            </div>

            {selectedChallenge.completed && !claimedIds.includes(selectedChallenge.id) && (
              <button
                onClick={() => {
                  handleClaimReward(selectedChallenge);
                  setSelectedChallenge(null);
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #2ed573, #10ac84)',
                  border: 'none',
                  borderRadius: 14,
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(46,213,115,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <Gift size={18} /> Nhận phần thưởng ngay
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
