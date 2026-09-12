import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Flame, Zap, Swords, Trophy, CheckCircle, Award, Clock } from 'lucide-react';
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

  const getTimeRemaining = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    if (isNaN(expiry.getTime())) {
      return expiresAt;
    }
    const diffMs = expiry.getTime() - Date.now();
    if (diffMs <= 0) return 'Hết hạn';
    const diffDays = Math.floor(diffMs / 86400000);
    const diffHours = Math.floor((diffMs % 86400000) / 3600000);
    const diffMinutes = Math.floor((diffMs % 3600000) / 60000);

    if (diffDays > 0) return `${diffDays} ngày`;
    if (diffHours > 0) return `${diffHours} giờ`;
    return `${diffMinutes} phút`;
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
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      background: `${color}25`,
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
                    <div style={{ fontSize: 13, color: '#B0B0C3', marginTop: 3 }}>
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
                    <span style={{ color: color, fontWeight: 700 }}>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#FF6B35' }}>
                      +{ch.reward.xp} XP
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#F7C948' }}>
                      +{ch.reward.coins} Coins
                    </span>
                    {ch.reward.ruby && ch.reward.ruby > 0 && (
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#FF4757' }}>
                        💎 +{ch.reward.ruby} Ruby
                      </span>
                    )}
                  </div>

                  {isClaimed ? (
                    <div
                      style={{
                        background: '#25253D',
                        color: '#2ED573',
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '6px 14px',
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <CheckCircle size={14} color="#2ED573" />
                      Đã nhận
                    </div>
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
                    <div
                      style={{
                        background: '#25253D',
                        color: '#B0B0C3',
                        fontSize: 11,
                        fontWeight: 500,
                        padding: '5px 10px',
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Clock size={13} color="#6B6B80" />
                      <span>{getTimeRemaining(ch.expiresAt)}</span>
                    </div>
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
