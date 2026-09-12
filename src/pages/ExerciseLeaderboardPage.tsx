import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  initialPushupLeaderboardSeed,
  initialPullupLeaderboardSeed,
  initialWalkingLeaderboardSeed
} from '../data/seedData';
import { AvatarWidget } from '../components/ui';

export const ExerciseLeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pushup' | 'pullup' | 'walking'>('pushup');

  const getLeaderboard = () => {
    switch (activeTab) {
      case 'pushup':
        return {
          title: 'Hít Đất',
          icon: '💪',
          color: '#FF6B35',
          unit: 'lần',
          list: initialPushupLeaderboardSeed,
        };
      case 'pullup':
        return {
          title: 'Kéo Xà',
          icon: '🏋️',
          color: '#5352ED',
          unit: 'lần',
          list: initialPullupLeaderboardSeed,
        };
      case 'walking':
        return {
          title: 'Đi Bộ',
          icon: '🚶',
          color: '#2ED573',
          unit: 'bước',
          list: initialWalkingLeaderboardSeed,
        };
    }
  };

  const current = getLeaderboard();
  const sorted = [...current.list].sort((a, b) => b.bestScore - a.bestScore);
  const top1 = sorted[0];
  const top2 = sorted[1];
  const top3 = sorted[2];

  return (
    <div style={{ padding: 16, maxWidth: 640, margin: '0 auto', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: '#1A1A2E',
            border: '1px solid #25253D',
            borderRadius: 10,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            cursor: 'pointer',
            marginRight: 12,
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
          🏆 BXH Tập Luyện
        </h1>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          background: '#1A1A2E',
          borderRadius: 12,
          padding: 4,
          marginBottom: 16,
        }}
      >
        <button
          onClick={() => setActiveTab('pushup')}
          style={{
            flex: 1,
            padding: '10px 0',
            border: 'none',
            borderRadius: 10,
            background: activeTab === 'pushup' ? '#FF6B35' : 'transparent',
            color: activeTab === 'pushup' ? '#FFFFFF' : '#6B6B80',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          💪 Hít Đất
        </button>
        <button
          onClick={() => setActiveTab('pullup')}
          style={{
            flex: 1,
            padding: '10px 0',
            border: 'none',
            borderRadius: 10,
            background: activeTab === 'pullup' ? '#FF6B35' : 'transparent',
            color: activeTab === 'pullup' ? '#FFFFFF' : '#6B6B80',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          🏋️ Kéo Xà
        </button>
        <button
          onClick={() => setActiveTab('walking')}
          style={{
            flex: 1,
            padding: '10px 0',
            border: 'none',
            borderRadius: 10,
            background: activeTab === 'walking' ? '#FF6B35' : 'transparent',
            color: activeTab === 'walking' ? '#FFFFFF' : '#6B6B80',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          🚶 Đi Bộ
        </button>
      </div>

      {/* Header Info Card */}
      <div
        style={{
          background: `linear-gradient(135deg, ${current.color}, ${current.color}AA)`,
          borderRadius: 16,
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 16,
          color: '#FFFFFF',
        }}
      >
        <span style={{ fontSize: 40 }}>{current.icon}</span>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            Top 5 {current.title}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
            Kỷ lục cao nhất mọi thời đại
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: 12,
          padding: '20px 0 10px',
          marginBottom: 20,
        }}
      >
        {/* 2nd Place */}
        {top2 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 90 }}>
            <AvatarWidget avatarUrl={top2.avatar} size={50} showBorder borderColor="#C0C0C0" />
            <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', marginTop: 6, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 85 }}>
              {top2.userName}
            </div>
            <div style={{ fontSize: 11, color: '#C0C0C0', fontWeight: 600 }}>
              {top2.bestScore} {current.unit}
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
                fontSize: 20,
                fontWeight: 900,
                color: '#0D0E15',
              }}
            >
              2
            </div>
          </div>
        )}

        {/* 1st Place */}
        {top1 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 100 }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontSize: 16 }}>👑</span>
              <AvatarWidget avatarUrl={top1.avatar} size={62} showBorder borderColor="#FFD700" />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginTop: 6, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 95 }}>
              {top1.userName}
            </div>
            <div style={{ fontSize: 12, color: '#FFD700', fontWeight: 700 }}>
              {top1.bestScore} {current.unit}
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
                fontSize: 24,
                fontWeight: 900,
                color: '#0D0E15',
              }}
            >
              1
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {top3 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 90 }}>
            <AvatarWidget avatarUrl={top3.avatar} size={50} showBorder borderColor="#CD7F32" />
            <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', marginTop: 6, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 85 }}>
              {top3.userName}
            </div>
            <div style={{ fontSize: 11, color: '#CD7F32', fontWeight: 600 }}>
              {top3.bestScore} {current.unit}
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
                fontSize: 18,
                fontWeight: 900,
                color: '#0D0E15',
              }}
            >
              3
            </div>
          </div>
        )}
      </div>

      {/* Full Leaderboard List */}
      <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', marginBottom: 12 }}>
        📊 Bảng xếp hạng đầy đủ
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map((entry, idx) => {
          const rank = idx + 1;
          const isUser = entry.isCurrentUser;

          return (
            <div
              key={entry.userId}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: 14,
                background: isUser ? 'rgba(255, 107, 53, 0.15)' : '#1A1A2E',
                border: isUser ? '1px solid #FF6B35' : '1px solid #25253D',
              }}
            >
              {/* Rank */}
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
                  marginRight: 12,
                }}
              >
                {rank}
              </div>

              {/* Avatar */}
              <AvatarWidget avatarUrl={entry.avatar} size={40} />

              {/* Info */}
              <div style={{ marginLeft: 12, flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: isUser ? '#FF6B35' : '#FFFFFF' }}>
                    {entry.userName}
                  </span>
                  {isUser && (
                    <span
                      style={{
                        background: '#FF6B35',
                        color: '#FFFFFF',
                        fontSize: 9,
                        fontWeight: 800,
                        padding: '1px 5px',
                        borderRadius: 6,
                      }}
                    >
                      BẠN
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#6B6B80', marginTop: 2 }}>
                  {entry.totalSessions} buổi • Độ chuẩn xác {entry.avgAccuracy}%
                </div>
              </div>

              {/* Score */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: current.color }}>
                  {entry.bestScore.toLocaleString()}
                </div>
                <div style={{ fontSize: 10, color: '#6B6B80' }}>
                  {current.unit}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
