import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Flame, Zap, Swords, Trophy, CheckCircle, Clock, Gift, Coins, Check } from 'lucide-react';

export const ChallengePage: React.FC = () => {
  const { challenges, claimChallenge } = useUser();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const filteredChallenges = challenges.filter(c => c.type === activeTab);

  const getChallengeIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case 'flame':
        return <Flame size={28} color={color} />;
      case 'zap':
        return <Zap size={28} color={color} />;
      case 'swords':
        return <Swords size={28} color={color} />;
      default:
        return <Trophy size={28} color={color} />;
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days} ngày`;
    if (hours > 0) return `${hours} giờ`;
    return '1 giờ';
  };

  return (
    <div style={{ padding: 16, maxWidth: 640, margin: '0 auto', paddingBottom: 90 }}>
      {/* Header */}
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF', margin: '0 0 16px 0' }}>
        🏆 Thử thách
      </h1>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          background: '#1A1A2E',
          borderRadius: 12,
          padding: 4,
          marginBottom: 16
        }}
      >
        <button
          onClick={() => setActiveTab('daily')}
          style={{
            flex: 1,
            padding: '10px 0',
            border: 'none',
            borderRadius: 10,
            background: activeTab === 'daily' ? '#FF6B35' : 'transparent',
            color: activeTab === 'daily' ? '#FFFFFF' : '#6B6B80',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Hàng ngày
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          style={{
            flex: 1,
            padding: '10px 0',
            border: 'none',
            borderRadius: 10,
            background: activeTab === 'weekly' ? '#FF6B35' : 'transparent',
            color: activeTab === 'weekly' ? '#FFFFFF' : '#6B6B80',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Tuần này
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          style={{
            flex: 1,
            padding: '10px 0',
            border: 'none',
            borderRadius: 10,
            background: activeTab === 'monthly' ? '#FF6B35' : 'transparent',
            color: activeTab === 'monthly' ? '#FFFFFF' : '#6B6B80',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Tháng này
        </button>
      </div>

      {/* Challenge List */}
      {filteredChallenges.length === 0 ? (
        <div
          style={{
            background: '#1A1A2E',
            borderRadius: 16,
            padding: '48px 16px',
            border: '1px solid #25253D',
            textAlign: 'center',
            marginTop: 20
          }}
        >
          <Trophy size={64} color="#6B6B80" style={{ margin: '0 auto 16px' }} />
          <div style={{ fontSize: 16, color: '#B0B0C3' }}>
            Không có thử thách nào
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredChallenges.map((challenge) => {
            const color = challenge.color || '#FF6B35';
            const pct = Math.min(100, Math.round((challenge.current / challenge.target) * 100));

            return (
              <div
                key={challenge.id}
                style={{
                  background: '#1A1A2E',
                  borderRadius: 16,
                  padding: 16,
                  border: '1px solid #25253D'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      background: `${color}25`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16,
                      flexShrink: 0
                    }}
                  >
                    {getChallengeIcon(challenge.icon, color)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>
                        {challenge.title}
                      </div>
                      {challenge.completed && (
                        <CheckCircle size={20} color="#2ED573" />
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: '#B0B0C3', marginTop: 4 }}>
                      {challenge.description}
                    </div>
                  </div>
                </div>

                {/* Progress bar info */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#FFFFFF' }}>
                      {challenge.current}/{challenge.target} {challenge.unit}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color }}>
                      {pct}%
                    </span>
                  </div>

                  <div style={{ height: 10, background: '#25253D', borderRadius: 5, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: color,
                        borderRadius: 5,
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>

                {/* Bottom Rewards & Action */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Gift size={16} color="#F7C948" />
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#FF6B35' }}>
                        +{challenge.reward.xp} XP
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Coins size={16} color="#F7C948" />
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#F7C948' }}>
                        +{challenge.reward.coins} Coins
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {challenge.completed ? (
                      challenge.claimed ? (
                        <div
                          style={{
                            background: '#25253D',
                            color: '#6B6B80',
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '6px 12px',
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <Check size={14} /> Đã nhận
                        </div>
                      ) : (
                        <button
                          onClick={() => claimChallenge(challenge.id)}
                          style={{
                            background: 'linear-gradient(135deg, #2ED573 0%, #7BED9F 100%)',
                            border: 'none',
                            color: '#000000',
                            fontSize: 12,
                            fontWeight: 700,
                            padding: '6px 14px',
                            borderRadius: 10,
                            cursor: 'pointer'
                          }}
                        >
                          Nhận thưởng
                        </button>
                      )
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          background: '#25253D',
                          padding: '4px 10px',
                          borderRadius: 12
                        }}
                      >
                        <Clock size={14} color="#6B6B80" />
                        <span style={{ fontSize: 11, color: '#6B6B80' }}>
                          {getTimeRemaining(challenge.expiresAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
