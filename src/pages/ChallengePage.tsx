import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Flame, Zap, Swords, Trophy, CheckCircle, Award } from 'lucide-react';
import { AppCard, ProgressBar } from '../components/ui';

export const ChallengePage: React.FC = () => {
  const { challenges, claimChallenge } = useUser();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const getIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case 'flame':
        return <Flame size={28} color={color} />;
      case 'zap':
        return <Zap size={28} color={color} />;
      case 'swords':
        return <Swords size={28} color={color} />;
      case 'trophy':
        return <Trophy size={28} color={color} />;
      default:
        return <Award size={28} color={color} />;
    }
  };

  const filtered = challenges.filter(c => c.type === activeTab);

  return (
    <div style={{ padding: 16, maxWidth: 640, margin: '0 auto', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
          🏆 Thử thách
        </h1>
      </div>

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

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6B6B80' }}>
          <Trophy size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <div style={{ fontSize: 16, color: '#B0B0C3' }}>
            Không có thử thách nào
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((ch) => {
            const color = ch.color || '#FF6B35';
            const progress = ch.current / Math.max(1, ch.target);
            const isCompleted = ch.completed || progress >= 1;
            const isClaimed = ch.claimed;

            return (
              <AppCard key={ch.id}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 16,
                      background: `${color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 14,
                      flexShrink: 0
                    }}
                  >
                    {getIcon(ch.icon, color)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>
                        {ch.title}
                      </span>
                      {isCompleted && (
                        <CheckCircle size={18} color="#2ED573" />
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
                      {ch.description}
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Label */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: '#FFFFFF', fontWeight: 600 }}>
                      {ch.current}/{ch.target} {ch.unit}
                    </span>
                    <span style={{ color: '#B0B0C3' }}>
                      {Math.min(100, Math.round(progress * 100))}%
                    </span>
                  </div>
                  <ProgressBar
                    progress={progress}
                    color={color}
                    height={8}
                  />
                </div>

                {/* Reward & Claim button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#FF6B35' }}>
                      +{ch.reward.xp} XP
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#F7C948' }}>
                      +{ch.reward.coins} Coins
                    </span>
                  </div>

                  {isClaimed ? (
                    <span
                      style={{
                        background: '#25253D',
                        color: '#6B6B80',
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '6px 14px',
                        borderRadius: 10
                      }}
                    >
                      ✓ Đã nhận
                    </span>
                  ) : isCompleted ? (
                    <button
                      onClick={() => claimChallenge(ch.id)}
                      style={{
                        background: 'linear-gradient(135deg, #2ED573 0%, #7BED9F 100%)',
                        border: 'none',
                        borderRadius: 10,
                        padding: '8px 16px',
                        color: '#0D0E15',
                        fontWeight: 800,
                        fontSize: 12,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(46, 213, 115, 0.35)'
                      }}
                    >
                      NHẬN THƯỞNG
                    </button>
                  ) : (
                    <span
                      style={{
                        background: '#25253D',
                        color: '#B0B0C3',
                        fontSize: 12,
                        fontWeight: 500,
                        padding: '6px 12px',
                        borderRadius: 10
                      }}
                    >
                      Đang thực hiện
                    </span>
                  )}
                </div>
              </AppCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
