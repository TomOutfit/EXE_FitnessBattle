import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Trophy } from 'lucide-react';
import { AppCard, AvatarWidget } from '../components/ui';

export const RankingPage: React.FC = () => {
  const { user, leaderboard } = useUser();
  const [activeTab, setActiveTab] = useState<'all' | 'weekly'>('all');

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];
  const rest = leaderboard.slice(3);

  return (
    <div style={{ padding: 16, maxWidth: 640, margin: '0 auto', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
          📊 Bảng xếp hạng
        </h1>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: '#1A1A2E',
            padding: '6px 12px',
            borderRadius: 20,
            border: '1px solid #25253D'
          }}
        >
          <Trophy size={16} color="#F7C948" />
          <span style={{ fontWeight: 600, color: '#FFFFFF', fontSize: 13 }}>
            Hạng #{user.rank}
          </span>
        </div>
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
          onClick={() => setActiveTab('all')}
          style={{
            flex: 1,
            padding: '10px 0',
            border: 'none',
            borderRadius: 10,
            background: activeTab === 'all' ? '#FF6B35' : 'transparent',
            color: activeTab === 'all' ? '#FFFFFF' : '#6B6B80',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Toàn mùa
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
      </div>

      {/* Top 3 Podium */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: 10,
          padding: '24px 0 12px',
          marginBottom: 20
        }}
      >
        {/* 2nd Place */}
        {top2 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 95 }}>
            <AvatarWidget
              avatarUrl={top2.avatar}
              size={54}
              showBorder
              borderColor="#C0C0C0"
              isVIP={top2.isVIP}
            />
            <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', marginTop: 6, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 90 }}>
              {top2.userName}
            </div>
            <div style={{ fontSize: 11, color: '#C0C0C0', fontWeight: 600 }}>
              {top2.points.toLocaleString()} pts
            </div>
            <div
              style={{
                width: '100%',
                height: 70,
                background: 'linear-gradient(180deg, #C0C0C0 0%, rgba(192, 192, 192, 0.2) 100%)',
                borderRadius: '12px 12px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 8,
                fontSize: 22,
                fontWeight: 900,
                color: '#0D0E15'
              }}
            >
              2
            </div>
          </div>
        )}

        {/* 1st Place */}
        {top1 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 110 }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', fontSize: 18 }}>👑</span>
              <AvatarWidget
                avatarUrl={top1.avatar}
                size={66}
                showBorder
                borderColor="#FFD700"
                isVIP={top1.isVIP}
              />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginTop: 6, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 105 }}>
              {top1.userName}
            </div>
            <div style={{ fontSize: 12, color: '#FFD700', fontWeight: 700 }}>
              {top1.points.toLocaleString()} pts
            </div>
            <div
              style={{
                width: '100%',
                height: 95,
                background: 'linear-gradient(180deg, #FFD700 0%, rgba(255, 215, 0, 0.2) 100%)',
                borderRadius: '12px 12px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 8,
                fontSize: 26,
                fontWeight: 900,
                color: '#0D0E15'
              }}
            >
              1
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {top3 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 95 }}>
            <AvatarWidget
              avatarUrl={top3.avatar}
              size={54}
              showBorder
              borderColor="#CD7F32"
              isVIP={top3.isVIP}
            />
            <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', marginTop: 6, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 90 }}>
              {top3.userName}
            </div>
            <div style={{ fontSize: 11, color: '#CD7F32', fontWeight: 600 }}>
              {top3.points.toLocaleString()} pts
            </div>
            <div
              style={{
                width: '100%',
                height: 50,
                background: 'linear-gradient(180deg, #CD7F32 0%, rgba(205, 127, 50, 0.2) 100%)',
                borderRadius: '12px 12px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 8,
                fontSize: 20,
                fontWeight: 900,
                color: '#0D0E15'
              }}
            >
              3
            </div>
          </div>
        )}
      </div>

      {/* Rest of Leaderboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rest.map((entry) => {
          const isUser = entry.isCurrentUser;

          return (
            <AppCard
              key={entry.userId}
              color={isUser ? 'rgba(255, 107, 53, 0.15)' : '#1A1A2E'}
              style={{
                border: isUser ? '1.5px solid #FF6B35' : '1px solid #25253D',
                padding: '12px 16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* Rank Badge */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: isUser ? '#FF6B35' : '#25253D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 13,
                    color: isUser ? '#FFFFFF' : '#B0B0C3',
                    marginRight: 12
                  }}
                >
                  {entry.rank}
                </div>

                {/* Avatar */}
                <AvatarWidget
                  avatarUrl={entry.avatar}
                  size={44}
                  isVIP={entry.isVIP}
                  showBorder={entry.isVIP}
                  borderColor="#F7C948"
                />

                {/* Info */}
                <div style={{ marginLeft: 12, flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: isUser ? '#FF6B35' : '#FFFFFF' }}>
                      {entry.userName}
                    </span>
                    {entry.isVIP && (
                      <span
                        style={{
                          background: 'linear-gradient(135deg, #FF6B35, #FFD700)',
                          color: '#000',
                          fontSize: 9,
                          fontWeight: 900,
                          padding: '1px 5px',
                          borderRadius: 6
                        }}
                      >
                        VIP
                      </span>
                    )}
                    {isUser && (
                      <span
                        style={{
                          background: '#FF6B35',
                          color: '#FFFFFF',
                          fontSize: 9,
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: 6
                        }}
                      >
                        BẠN
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
                    Cấp {entry.level || 1}
                  </div>
                </div>

                {/* Points */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>
                    {entry.points.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: '#6B6B80' }}>
                    điểm
                  </div>
                </div>
              </div>
            </AppCard>
          );
        })}
      </div>
    </div>
  );
};
