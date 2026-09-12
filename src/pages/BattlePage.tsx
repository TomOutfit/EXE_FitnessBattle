import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { initialPremiumArenasSeed as premiumArenas } from '../data/seedData';
import { Zap, Swords, ChevronRight, Award, Handshake } from 'lucide-react';
import { AppCard, GradientButton, AvatarWidget } from '../components/ui';

export const BattlePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, battles, joinBattle, showToast } = useUser();
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

      {/* ==================== BATTLES TAB ==================== */}
      {activeTab === 'battles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Main Action Banner */}
          <div
            onClick={() => setShowExerciseSheet(true)}
            style={{
              background: 'linear-gradient(135deg, #FF4757 0%, #FF6B81 100%)',
              borderRadius: 20,
              padding: 4,
              boxShadow: '0 8px 24px rgba(255, 71, 87, 0.35)',
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                color: '#FFFFFF'
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
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
                <div style={{ fontSize: 17, fontWeight: 800 }}>
                  ⚔️ BẮT ĐẦU ĐẤU CAMERA
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.85)', marginTop: 2 }}>
                  Mở camera 2 người chơi • AI đếm Reps
                </div>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ChevronRight size={20} color="#FFFFFF" />
              </div>
            </div>
          </div>

          {/* Quick Battle Creation */}
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', marginBottom: 12 }}>
              ⚡ Tạo trận nhanh
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <GradientButton
                text="Xếp hạng"
                icon={<Award size={18} />}
                gradient="linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)"
                onPressed={() => setShowExerciseSheet(true)}
              />
              <GradientButton
                text="Giao hữu"
                icon={<Handshake size={18} />}
                gradient="linear-gradient(135deg, #5352ED 0%, #7070FF 100%)"
                onPressed={() => setShowExerciseSheet(true)}
              />
            </div>
          </div>

          {/* Available Waiting Rooms */}
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', marginBottom: 12 }}>
              🎮 Phòng chờ
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {battles.map((battle) => {
                const badge = getBattleTypeBadge(battle.type);
                const isWaiting = battle.status === 'waiting';

                return (
                  <AppCard key={battle.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span
                        style={{
                          background: `${badge.color}25`,
                          color: badge.color,
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 8
                        }}
                      >
                        {badge.label}
                      </span>
                      <span
                        style={{
                          background: isWaiting ? 'rgba(247, 201, 72, 0.2)' : 'rgba(46, 213, 115, 0.2)',
                          color: isWaiting ? '#F7C948' : '#2ED573',
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 8
                        }}
                      >
                        {isWaiting ? 'CHỜ ĐỐI THỦ' : 'ĐANG THI ĐẤU'}
                      </span>
                    </div>

                    <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>
                      {battle.title}
                    </div>

                    <div style={{ fontSize: 13, color: '#B0B0C3', marginBottom: 14 }}>
                      🏃 {battle.exerciseType} • ⏱️ {battle.duration} phút
                    </div>

                    {/* Players Row */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
                      <AvatarWidget avatarUrl={battle.players[0]?.avatar} size={32} />
                      <span style={{ fontSize: 13, color: '#FFFFFF', marginLeft: 8 }}>
                        {battle.players[0]?.userName || 'Bạn'}
                      </span>
                      <span style={{ margin: '0 12px', fontWeight: 800, color: '#6B6B80', fontSize: 12 }}>
                        VS
                      </span>
                      <AvatarWidget avatarUrl={battle.players[1]?.avatar} size={32} />
                      <span style={{ fontSize: 13, color: '#FFFFFF', marginLeft: 8 }}>
                        {battle.players[1]?.userName || 'Đối thủ'}
                      </span>
                    </div>

                    {/* Bottom Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#FF6B35', fontWeight: 600 }}>
                        +{battle.reward.xp} XP • +{battle.reward.coins} Coins
                      </span>

                      {isWaiting && (
                        <button
                          onClick={() => {
                            joinBattle(battle.id);
                            navigate(`/battle-camera?exercise=${encodeURIComponent(battle.exerciseType)}`);
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
                            border: 'none',
                            borderRadius: 10,
                            padding: '8px 16px',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: 'pointer'
                          }}
                        >
                          Tham gia
                        </button>
                      )}
                    </div>
                  </AppCard>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================== ARENAS TAB ==================== */}
      {activeTab === 'arenas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {premiumArenas.map((arena) => {
            const statusBadge = getArenaStatusBadge(arena.status);
            return (
              <AppCard key={arena.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 24 }}>🏆</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>
                      {arena.name}
                    </span>
                  </div>
                  <span
                    style={{
                      background: `${statusBadge.color}25`,
                      color: statusBadge.color,
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 8
                    }}
                  >
                    {statusBadge.label}
                  </span>
                </div>

                <div style={{ fontSize: 13, color: '#B0B0C3', marginBottom: 12 }}>
                  {arena.description}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, background: '#25253D', padding: 10, borderRadius: 12, marginBottom: 12 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#6B6B80' }}>Giải thưởng</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#F7C948' }}>{arena.prizePool.toLocaleString()} XP</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#6B6B80' }}>Phí vào</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#FF4757' }}>💎 {arena.entryRuby} Ruby</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#6B6B80' }}>Người tham gia</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#2ED573' }}>{arena.participants}/{arena.maxParticipants}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (user.ruby < arena.entryRuby) {
                      showToast('Bạn không đủ Ruby để tham gia đấu trường này!', 'error');
                      return;
                    }
                    navigate(`/battle-camera?exercise=${encodeURIComponent(arena.exerciseType)}`);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
                    border: 'none',
                    borderRadius: 12,
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer'
                  }}
                >
                  THAM GIA NGAY (💎 {arena.entryRuby} RUBY)
                </button>
              </AppCard>
            );
          })}
        </div>
      )}

      {/* ==================== HISTORY TAB ==================== */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { id: 'h1', exercise: 'Hít Đất', result: 'win', myScore: 32, oppScore: 28, opponent: 'Thu Hà', xp: 500, time: '2 giờ trước' },
            { id: 'h2', exercise: 'Kéo Xà', result: 'win', myScore: 14, oppScore: 11, opponent: 'Minh Đạt', xp: 450, time: 'Hôm qua' },
            { id: 'h3', exercise: 'Hít Đất', result: 'lose', myScore: 25, oppScore: 30, opponent: 'Hoàng Nam', xp: 100, time: '2 ngày trước' },
          ].map((item) => {
            const isWin = item.result === 'win';
            return (
              <AppCard key={item.id}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: isWin ? 'rgba(46, 213, 115, 0.15)' : 'rgba(255, 71, 87, 0.15)',
                        border: isWin ? '1px solid #2ED573' : '1px solid #FF4757',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20
                      }}
                    >
                      {isWin ? '🏆' : '💔'}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF' }}>
                        {item.exercise} vs {item.opponent}
                      </div>
                      <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
                        Tỉ số: {item.myScore} - {item.oppScore} • {item.time}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: isWin ? '#2ED573' : '#FF4757' }}>
                      {isWin ? 'THẮNG' : 'THUA'}
                    </div>
                    <div style={{ fontSize: 11, color: '#FF6B35', fontWeight: 600 }}>
                      +{item.xp} XP
                    </div>
                  </div>
                </div>
              </AppCard>
            );
          })}
        </div>
      )}

      {/* Exercise Selection Bottom Sheet */}
      {showExerciseSheet && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
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
              maxWidth: 480,
              background: '#1A1A2E',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: '24px 20px',
              border: '1px solid #25253D'
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 16 }}>
              Chọn bài tập thi đấu
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => {
                  setShowExerciseSheet(false);
                  navigate('/battle-camera?exercise=Hít Đất');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 16,
                  background: '#25253D',
                  border: '1px solid #25253D',
                  borderRadius: 14,
                  color: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: 28, marginRight: 14 }}>💪</span>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Hít Đất (Push-up)</div>
                  <div style={{ fontSize: 12, color: '#B0B0C3' }}>So tài 60s đếm rep AI chuẩn</div>
                </div>
                <ChevronRight size={20} color="#6B6B80" />
              </button>

              <button
                onClick={() => {
                  setShowExerciseSheet(false);
                  navigate('/battle-camera?exercise=Kéo Xà');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 16,
                  background: '#25253D',
                  border: '1px solid #25253D',
                  borderRadius: 14,
                  color: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: 28, marginRight: 14 }}>🏋️</span>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Kéo Xà (Pull-up)</div>
                  <div style={{ fontSize: 12, color: '#B0B0C3' }}>Thử thách sức mạnh thân trên</div>
                </div>
                <ChevronRight size={20} color="#6B6B80" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
