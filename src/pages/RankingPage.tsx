import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Trophy } from 'lucide-react';

export const RankingPage: React.FC = () => {
  const { user, leaderboard } = useUser();
  const [activeTab, setActiveTab] = useState<'season' | 'weekly'>('season');

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];
  const restList = leaderboard.slice(3);

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
            gap: 6,
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
          marginBottom: 20
        }}
      >
        <button
          onClick={() => setActiveTab('season')}
          style={{
            flex: 1,
            padding: '10px 0',
            border: 'none',
            borderRadius: 10,
            background: activeTab === 'season' ? '#FF6B35' : 'transparent',
            color: activeTab === 'season' ? '#FFFFFF' : '#6B6B80',
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
          gap: 12,
          height: 230,
          marginBottom: 24,
          padding: '0 8px'
        }}
      >
        {/* 2nd Place */}
        {top2 && (
          <TopThreePedestal
            entry={top2}
            rank={2}
            height={70}
            color="#C0C0C0"
            emoji="🥈"
          />
        )}

        {/* 1st Place */}
        {top1 && (
          <TopThreePedestal
            entry={top1}
            rank={1}
            height={95}
            color="#FFD700"
            emoji="🥇"
          />
        )}

        {/* 3rd Place */}
        {top3 && (
          <TopThreePedestal
            entry={top3}
            rank={3}
            height={50}
            color="#CD7F32"
            emoji="🥉"
          />
        )}
      </div>

      {/* Rest of Leaderboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {restList.map((entry) => {
          const isMe = entry.isCurrentUser || entry.userId === user.id;

          return (
            <div
              key={entry.userId}
              style={{
                background: isMe ? 'rgba(255, 107, 53, 0.15)' : '#1A1A2E',
                borderRadius: 16,
                padding: '12px 16px',
                border: isMe ? '1px solid #FF6B35' : '1px solid #25253D',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {/* Rank Badge */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: isMe ? '#FF6B35' : '#25253D',
                  color: isMe ? '#FFFFFF' : '#B0B0C3',
                  fontWeight: 700,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {entry.rank}
              </div>

              {/* Avatar */}
              <img
                src={entry.avatar}
                alt={entry.userName}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  marginLeft: 12,
                  border: entry.isVIP ? '2px solid #F7C948' : '2px solid transparent',
                  background: '#25253D',
                  flexShrink: 0
                }}
              />

              {/* Name & Level */}
              <div style={{ marginLeft: 12, flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: isMe ? '#FF6B35' : '#FFFFFF',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {entry.userName}
                  </span>
                  {entry.isVIP && <span style={{ fontSize: 13 }}>💎</span>}
                </div>
                <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
                  Level {entry.level}
                </div>
              </div>

              {/* Points */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF' }}>
                  {entry.points.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: '#6B6B80' }}>
                  điểm
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface TopThreePedestalProps {
  entry: any;
  rank: number;
  height: number;
  color: string;
  emoji: string;
}

const TopThreePedestal: React.FC<TopThreePedestalProps> = ({
  entry,
  rank,
  height,
  color,
  emoji
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 90 }}>
      {/* Avatar */}
      <img
        src={entry.avatar}
        alt={entry.userName}
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          border: `2px solid ${color}`,
          background: '#25253D',
          marginBottom: 4
        }}
      />
      {/* Name */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#FFFFFF',
          textAlign: 'center',
          maxWidth: 80,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {entry.userName}
      </div>
      {/* Points */}
      <div style={{ fontSize: 11, color: '#B0B0C3', marginBottom: 6 }}>
        {entry.points} điểm
      </div>
      {/* Pedestal */}
      <div
        style={{
          width: 80,
          height,
          background: `linear-gradient(180deg, ${color}CC 0%, ${color}66 100%)`,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ fontSize: 20 }}>{emoji}</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#000000' }}>
          #{rank}
        </div>
      </div>
    </div>
  );
};
