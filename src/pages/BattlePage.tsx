import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { premiumArenas } from '../data/mockData';
import { Zap, Swords, ChevronRight, History, Award, Users, Clock, Info } from 'lucide-react';

export const BattlePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, battles, joinBattle } = useUser();
  const [activeTab, setActiveTab] = useState<'battles' | 'arenas' | 'history'>('battles');
  const [showExerciseSheet, setShowExerciseSheet] = useState(false);

  const getBattleTypeBadge = (type: string) => {
    switch (type) {
      case 'ranked':
        return { label: 'XẾP HẠNG', color: '#FF6B35' };
      case 'friendly':
        return { label: 'GIAO HỮU', color: '#5352ED' };
      case 'challenge':
        return { label: 'THÁCH ĐẤU', color: '#F7C948' };
      default:
        return { label: 'TRẬN ĐẤU', color: '#6B6B80' };
    }
  };

  const getArenaStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return { label: 'MỞ', color: '#2ED573' };
      case 'countdown':
        return { label: 'SẮP BẮT ĐẦU', color: '#F7C948' };
      case 'live':
        return { label: 'ĐANG DIỄN RA', color: '#FF4757' };
      default:
        return { label: 'KẾT THÚC', color: '#6B6B80' };
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 640, margin: '0 auto', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
          ⚔️ Đấu Trường
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
          <Zap size={18} color="#5352ED" />
          <span style={{ fontWeight: 600, color: '#FFFFFF', fontSize: 14 }}>
            {user.stamina}
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
          onClick={() => setActiveTab('battles')}
          style={{
            flex: 1,
            padding: '10px 0',
            border: 'none',
            borderRadius: 10,
            background: activeTab === 'battles' ? '#FF6B35' : 'transparent',
            color: activeTab === 'battles' ? '#FFFFFF' : '#6B6B80',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Trận đấu
        </button>
        <button
          onClick={() => setActiveTab('arenas')}
          style={{
            flex: 1,
            padding: '10px 0',
            border: 'none',
            borderRadius: 10,
            background: activeTab === 'arenas' ? '#FF6B35' : 'transparent',
            color: activeTab === 'arenas' ? '#FFFFFF' : '#6B6B80',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Đấu trường
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            flex: 1,
            padding: '10px 0',
            border: 'none',
            borderRadius: 10,
            background: activeTab === 'history' ? '#FF6B35' : 'transparent',
            color: activeTab === 'history' ? '#FFFFFF' : '#6B6B80',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Lịch sử
        </button>
      </div>

      {/* Tab 1: Trận đấu */}
      {activeTab === 'battles' && (
        <div>
          {/* Start Camera Battle Banner */}
          <div
            onClick={() => setShowExerciseSheet(true)}
            style={{
              background: 'linear-gradient(135deg, #FF4757 0%, #FF6B81 100%)',
              borderRadius: 20,
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 107, 53, 0.4)',
              marginBottom: 24
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
                flexShrink: 0
              }}
            >
              <Swords size={32} color="#FFFFFF" />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>
                ⚔️ BẮT ĐẦU ĐẤU CAMERA
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                Mở camera 2 người chơi
              </div>
            </div>

            <div
              style={{
                padding: 8,
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ChevronRight size={20} color="#FFFFFF" />
            </div>
          </div>

          {/* Quick Battle Section */}
          <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', marginBottom: 12 }}>
            ⚡ Tạo trận nhanh
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <button
              onClick={() => setShowExerciseSheet(true)}
              style={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
                border: 'none',
                borderRadius: 12,
                padding: '14px',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.25)'
              }}
            >
              <Award size={18} color="#FFFFFF" />
              Xếp hạng
            </button>

            <button
              onClick={() => setShowExerciseSheet(true)}
              style={{
                background: 'linear-gradient(135deg, #5352ED 0%, #7070FF 100%)',
                border: 'none',
                borderRadius: 12,
                padding: '14px',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(83, 82, 237, 0.25)'
              }}
            >
              <Users size={18} color="#FFFFFF" />
              Giao hữu
            </button>
          </div>

          {/* Available Lobby List */}
          <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', marginBottom: 12 }}>
            🎮 Phòng chờ
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {battles.map((battle) => {
              const typeBadge = getBattleTypeBadge(battle.type);
              const isActive = battle.status === 'active';

              return (
                <div
                  key={battle.id}
                  style={{
                    background: '#1A1A2E',
                    borderRadius: 16,
                    padding: 16,
                    border: '1px solid #25253D'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: typeBadge.color,
                        background: `${typeBadge.color}25`,
                        padding: '4px 8px',
                        borderRadius: 8
                      }}
                    >
                      {typeBadge.label}
                    </span>

                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: isActive ? '#2ED573' : '#F7C948',
                        background: isActive ? 'rgba(46, 213, 115, 0.2)' : 'rgba(247, 201, 72, 0.2)',
                        padding: '4px 8px',
                        borderRadius: 8
                      }}
                    >
                      {isActive ? 'ĐANG CHƠI' : 'CHỜ'}
                    </span>
                  </div>

                  <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>
                    {battle.title}
                  </div>

                  <div style={{ fontSize: 13, color: '#B0B0C3', marginBottom: 12 }}>
                    🏃 {battle.exerciseType} • ⏱️ {battle.duration} phút
                  </div>

                  {/* Players VS */}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                    <img
                      src={battle.players[0]?.avatar}
                      alt={battle.players[0]?.userName}
                      style={{ width: 32, height: 32, borderRadius: '50%', background: '#25253D' }}
                    />
                    <span style={{ fontSize: 13, color: '#FFFFFF', marginLeft: 8, fontWeight: 500 }}>
                      {battle.players[0]?.userName}
                    </span>

                    <span style={{ margin: '0 12px', fontWeight: 700, color: '#6B6B80', fontSize: 12 }}>
                      VS
                    </span>

                    <img
                      src={battle.players[1]?.avatar}
                      alt={battle.players[1]?.userName}
                      style={{ width: 32, height: 32, borderRadius: '50%', background: '#25253D' }}
                    />
                    <span style={{ fontSize: 13, color: '#FFFFFF', marginLeft: 8, fontWeight: 500 }}>
                      {battle.players[1]?.userName}
                    </span>
                  </div>

                  {/* Reward & Join button */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 12, color: '#FF6B35', fontWeight: 500 }}>
                      +{battle.reward.xp} XP • +{battle.reward.coins} Coins
                    </div>

                    {!isActive && (
                      <button
                        onClick={() => {
                          joinBattle(battle.id);
                          navigate('/battle-camera?type=pushup');
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
                          border: 'none',
                          borderRadius: 8,
                          padding: '6px 14px',
                          color: '#FFFFFF',
                          fontWeight: 600,
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        Tham gia
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Đấu trường Premium */}
      {activeTab === 'arenas' && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', marginBottom: 12 }}>
            💎 Đấu trường Premium
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {premiumArenas.map((arena) => {
              const statusBadge = getArenaStatusBadge(arena.status);
              const isLive = arena.status === 'live';

              return (
                <div
                  key={arena.id}
                  style={{
                    background: isLive
                      ? 'linear-gradient(135deg, #FF4757 0%, #FF6B81 100%)'
                      : '#1A1A2E',
                    borderRadius: 16,
                    padding: 16,
                    border: isLive ? 'none' : '1px solid #25253D'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ fontSize: 24, marginRight: 12 }}>🏆</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>
                        {arena.name}
                      </div>
                      <div style={{ fontSize: 12, color: isLive ? 'rgba(255,255,255,0.85)' : '#B0B0C3' }}>
                        {arena.description}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: statusBadge.color,
                        background: `${statusBadge.color}25`,
                        padding: '4px 10px',
                        borderRadius: 12
                      }}
                    >
                      {statusBadge.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: isLive ? 'rgba(255,255,255,0.7)' : '#6B6B80' }}>
                        Phần thưởng
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#F7C948' }}>
                        {arena.prizePool} Ruby
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: isLive ? 'rgba(255,255,255,0.7)' : '#6B6B80' }}>
                        Phí vào cửa
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: 14 }}>💎</span>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>
                          {arena.entryRuby}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: isLive ? 'rgba(255,255,255,0.85)' : '#B0B0C3' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={14} color={isLive ? '#FFFFFF' : '#6B6B80'} />
                      <span>{arena.participants}/{arena.maxParticipants}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={14} color={isLive ? '#FFFFFF' : '#6B6B80'} />
                      <span>{arena.duration} phút</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Lịch sử */}
      {activeTab === 'history' && (
        <div
          style={{
            background: '#1A1A2E',
            borderRadius: 16,
            padding: '32px 16px',
            border: '1px solid #25253D',
            textAlign: 'center'
          }}
        >
          <History size={48} color="#6B6B80" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: '#FFFFFF', marginBottom: 4 }}>
            {user.winCount + user.loseCount > 0 ? `Đã hoàn thành ${user.winCount + user.loseCount} trận` : 'Chưa có trận đấu nào'}
          </div>
          <div style={{ fontSize: 13, color: '#B0B0C3' }}>
            {user.winCount + user.loseCount > 0 ? `Tỉ lệ thắng: ${Math.round((user.winCount / (user.winCount + user.loseCount)) * 100)}% (${user.winCount}W - ${user.loseCount}L)` : 'Tham gia trận đấu để xem lịch sử tại đây'}
          </div>
        </div>
      )}

      {/* Exercise Selection Bottom Sheet Modal */}
      {showExerciseSheet && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
          onClick={() => setShowExerciseSheet(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 640,
              background: '#0F0F23',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: '16px 20px 32px',
              borderTop: '1px solid #25253D',
              boxShadow: '0 -8px 24px rgba(0,0,0,0.5)'
            }}
          >
            {/* Handle bar */}
            <div
              style={{
                width: 40,
                height: 4,
                background: '#6B6B80',
                borderRadius: 2,
                margin: '0 auto 16px'
              }}
            />

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>
                ⚔️ CHỌN BÀI TẬP ĐẤU
              </div>
              <div style={{ fontSize: 14, color: '#B0B0C3' }}>
                Chọn bài tập để bắt đầu trận đấu camera
              </div>
            </div>

            {/* Exercise Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {/* Push-up */}
              <div
                onClick={() => {
                  setShowExerciseSheet(false);
                  navigate('/battle-camera?type=pushup');
                }}
                style={{
                  background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
                  borderRadius: 16,
                  padding: 16,
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    marginRight: 16
                  }}
                >
                  💪
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
                    Hít Đất (Push-up)
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                    Hít đất • Đối thủ bên phải
                  </div>
                </div>
              </div>

              {/* Pull-up */}
              <div
                onClick={() => {
                  setShowExerciseSheet(false);
                  navigate('/battle-camera?type=pullup');
                }}
                style={{
                  background: 'linear-gradient(135deg, #5352ED 0%, #7070FF 100%)',
                  borderRadius: 16,
                  padding: 16,
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(83, 82, 237, 0.3)'
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    marginRight: 16
                  }}
                >
                  🏋️
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
                    Kéo Xà (Pull-up)
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                    Kéo xà • Đối thủ bên phải
                  </div>
                </div>
              </div>

              {/* Squat */}
              <div
                onClick={() => {
                  setShowExerciseSheet(false);
                  navigate('/battle-camera?type=squat');
                }}
                style={{
                  background: 'linear-gradient(135deg, #FFA502 0%, #FFBE3D 100%)',
                  borderRadius: 16,
                  padding: 16,
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255, 165, 2, 0.3)'
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    marginRight: 16
                  }}
                >
                  🦵
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
                    Squat
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                    Squat • Đối thủ bên phải
                  </div>
                </div>
              </div>
            </div>

            {/* Info notice */}
            <div
              style={{
                background: '#1A1A2E',
                borderRadius: 12,
                padding: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 16
              }}
            >
              <div
                style={{
                  padding: 6,
                  borderRadius: 8,
                  background: 'rgba(255, 107, 53, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Info size={18} color="#FF6B35" />
              </div>
              <div style={{ fontSize: 12, color: '#B0B0C3', lineHeight: 1.4 }}>
                Camera bên trái là bạn, bên phải là đối thủ.<br />
                Kết nối 2 thiết bị để chơi cùng nhau!
              </div>
            </div>

            {/* Cancel */}
            <button
              onClick={() => setShowExerciseSheet(false)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#6B6B80',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                padding: '8px 0'
              }}
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
