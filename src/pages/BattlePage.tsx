import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Users, Trophy } from 'lucide-react';
import { battles, premiumArenas } from '../data/mockData';
import { useUser } from '../context/UserContext';

export const BattlePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, deductStamina, showToast } = useUser();
  const [activeTab, setActiveTab] = useState<'battles' | 'arenas' | 'history'>('battles');
  const [showQuickMatchModal, setShowQuickMatchModal] = useState(false);
  const [matchType, setMatchType] = useState<'ranked' | 'friendly'>('ranked');
  const [selectedExercise, setSelectedExercise] = useState('Hít Đất');

  const handleStartQuickMatch = () => {
    const ok = deductStamina(15);
    if (!ok) {
      showToast('Hết thể lực! Vui lòng chờ hồi phục hoặc nâng cấp VIP', 'warning');
      return;
    }
    setShowQuickMatchModal(false);
    navigate(`/battle-camera?mode=${matchType}&exercise=${encodeURIComponent(selectedExercise)}`);
  };

  return (
    <div style={{ paddingBottom: 90 }}>
      {/* Top Header */}
      <div style={{
        background: 'linear-gradient(180deg, #14141e, var(--bg))',
        padding: '16px 20px 12px',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24 }}>⚔️</span>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>Đấu Trường</h1>
          </div>

          <div style={{
            padding: '6px 14px', borderRadius: 20,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Zap size={16} color="var(--primary)" />
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>{user.stamina} HP</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-card)',
          borderRadius: 14,
          padding: 4,
          border: '1px solid var(--border)',
        }}>
          {[
            { id: 'battles', label: 'Trận đấu' },
            { id: 'arenas', label: 'Đấu trường' },
            { id: 'history', label: 'Lịch sử' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10,
                  background: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text3)',
                  fontWeight: isActive ? 800 : 600, fontSize: 13,
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '0 20px', marginTop: 16 }}>
        {/* ─── TAB 1: BATTLES ─── */}
        {activeTab === 'battles' && (
          <div>
            {/* Camera Battle Banner */}
            <div
              onClick={() => navigate('/battle-camera')}
              style={{
                padding: '18px 20px',
                borderRadius: 20,
                background: 'linear-gradient(135deg, #FF4757, #FF6B35)',
                boxShadow: '0 8px 25px rgba(255, 71, 87, 0.35)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 20,
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, flexShrink: 0,
              }}>
                ⚔️
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>
                  BẮT ĐẦU ĐẤU CAMERA
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
                  Mở camera đối kháng 2 người chơi thời gian thực
                </div>
              </div>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 14,
              }}>
                ➔
              </div>
            </div>

            {/* Quick Match Section */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>⚡</span>
                <span>Tạo trận nhanh</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button
                  onClick={() => { setMatchType('ranked'); setShowQuickMatchModal(true); }}
                  style={{
                    padding: '14px', borderRadius: 16,
                    background: 'var(--gradient-primary)',
                    border: 'none', color: '#fff', fontWeight: 800, fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    cursor: 'pointer', boxShadow: '0 4px 16px rgba(255, 107, 53, 0.3)',
                  }}
                >
                  <Trophy size={18} />
                  <span>Xếp hạng</span>
                </button>

                <button
                  onClick={() => { setMatchType('friendly'); setShowQuickMatchModal(true); }}
                  style={{
                    padding: '14px', borderRadius: 16,
                    background: 'linear-gradient(135deg, #5352ED, #7070FF)',
                    border: 'none', color: '#fff', fontWeight: 800, fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    cursor: 'pointer', boxShadow: '0 4px 16px rgba(83, 82, 237, 0.3)',
                  }}
                >
                  <Users size={18} />
                  <span>Giao hữu</span>
                </button>
              </div>
            </div>

            {/* Active Lobbies */}
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🎮</span>
                <span>Phòng chờ</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {battles.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      padding: 16,
                      background: 'var(--bg-card)',
                      borderRadius: 18,
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 8,
                          background: b.type === 'ranked' ? 'rgba(255,107,53,0.2)' : 'rgba(83,82,237,0.2)',
                          color: b.type === 'ranked' ? 'var(--primary)' : '#5352ED',
                        }}>
                          {b.type === 'ranked' ? 'XẾP HẠNG' : 'GIAO HỮU'}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>{b.title}</span>
                      </div>

                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 8,
                        background: b.status === 'active' ? 'rgba(46,213,115,0.2)' : 'rgba(255,165,2,0.2)',
                        color: b.status === 'active' ? '#2ED573' : '#FFA502',
                      }}>
                        {b.status === 'active' ? 'ĐANG CHƠI' : 'CHỜ'}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span>🏃 {b.exerciseType}</span>
                      <span>⏱️ {b.duration} phút</span>
                    </div>

                    {/* Players Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src={b.players[0].avatar}
                          alt={b.players[0].userName}
                          style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-card2)' }}
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                          {b.players[0].userName}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)' }}>VS</span>
                        <img
                          src={b.players[1].avatar}
                          alt={b.players[1].userName}
                          style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-card2)' }}
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                          {b.players[1].userName}
                        </span>
                      </div>

                      <button
                        onClick={() => navigate('/battle-camera')}
                        style={{
                          padding: '8px 16px', borderRadius: 12,
                          background: 'var(--gradient-primary)',
                          border: 'none', color: '#fff', fontSize: 12, fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        {b.status === 'active' ? 'Xem' : 'Tham gia'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: ARENAS ─── */}
        {activeTab === 'arenas' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {premiumArenas.map((a) => (
                <div
                  key={a.id}
                  style={{
                    padding: 20, borderRadius: 20,
                    background: 'linear-gradient(145deg, #1a1a2b, #13131f)',
                    border: '1px solid rgba(83,82,237,0.4)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 8,
                        background: 'rgba(255,215,0,0.2)', color: '#FFD700',
                      }}>
                        TITAN ARENA
                      </span>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginTop: 6 }}>
                        {a.name}
                      </h3>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>Tổng giải thưởng</div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#5352ED' }}>💎 {a.prizePool} Ruby</div>
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5, marginBottom: 16 }}>
                    {a.description}
                  </p>

                  {/* Breakdown Table */}
                  <div style={{ background: 'var(--bg-card)', padding: 12, borderRadius: 14, marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                      Cơ cấu phần thưởng:
                    </div>
                    {a.prizePoolBreakdown.map((r, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', padding: '3px 0' }}>
                        <span style={{ color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : '#CD7F32', fontWeight: 700 }}>
                          {r.position}
                        </span>
                        <span>{r.reward}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      if (user.ruby < a.entryRuby) {
                        showToast(`Cần ${a.entryRuby} Ruby để tham gia!`, 'warning');
                        return;
                      }
                      showToast('Đăng ký tham gia đấu trường thành công!', 'success');
                      navigate('/battle-camera');
                    }}
                    style={{
                      width: '100%', padding: '14px', borderRadius: 14,
                      background: 'linear-gradient(135deg, #5352ED, #7070FF)',
                      border: 'none', color: '#fff', fontWeight: 800, fontSize: 14,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                  >
                    <span>Tham gia ngay (Phí: {a.entryRuby} Ruby)</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 3: HISTORY ─── */}
        {activeTab === 'history' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { id: 'h1', date: 'Hôm nay, 16:20', opp: 'Minh Đạt', oppAvatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=MinhDat', myScore: 35, oppScore: 32, result: 'WIN', exercise: 'Hít Đất', xp: 200, coins: 80 },
                { id: 'h2', date: 'Hôm qua, 20:15', opp: 'Thu Hà', oppAvatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=ThuHa', myScore: 18, oppScore: 20, result: 'LOSE', exercise: 'Kéo Xà', xp: 50, coins: 20 },
                { id: 'h3', date: '3 ngày trước', opp: 'Hoàng Nam', oppAvatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=HoangNam', myScore: 42, oppScore: 38, result: 'WIN', exercise: 'Hít Đất', xp: 200, coins: 80 },
              ].map((h) => (
                <div
                  key={h.id}
                  style={{
                    padding: 16,
                    background: 'var(--bg-card)',
                    borderRadius: 16,
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      padding: '4px 8px', borderRadius: 8,
                      background: h.result === 'WIN' ? 'rgba(46,213,115,0.2)' : 'rgba(255,71,87,0.2)',
                      color: h.result === 'WIN' ? '#2ED573' : '#FF4757',
                      fontWeight: 900, fontSize: 11,
                    }}>
                      {h.result}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                        VS {h.opp} ({h.exercise})
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{h.date}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>
                      {h.myScore} - {h.oppScore}
                    </div>
                    <div style={{ fontSize: 11, color: '#FFD700', fontWeight: 700 }}>
                      +{h.xp} XP • +{h.coins} Xu
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Match Modal */}
      {showQuickMatchModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)',
          zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            width: '100%', maxWidth: 400,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 24, padding: 24,
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 16 }}>
              Tạo Trận {matchType === 'ranked' ? 'Xếp Hạng' : 'Giao Hữu'}
            </h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 8 }}>
                Chọn Môn Thi Đấu:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {['Hít Đất', 'Kéo Xà', 'Chạy Bộ'].map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setSelectedExercise(ex)}
                    style={{
                      padding: '10px 6px', borderRadius: 12,
                      background: selectedExercise === ex ? 'var(--primary)' : 'var(--bg-card2)',
                      border: '1px solid var(--border)',
                      color: selectedExercise === ex ? '#fff' : 'var(--text)',
                      fontWeight: 700, fontSize: 12, cursor: 'pointer',
                    }}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              padding: 12, borderRadius: 12, background: 'rgba(255,107,53,0.1)',
              border: '1px solid rgba(255,107,53,0.3)', marginBottom: 20,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 12, color: 'var(--text)' }}>Thể lực tiêu hao:</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>⚡ 15 HP</span>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowQuickMatchModal(false)}
                style={{
                  flex: 1, padding: '14px', borderRadius: 14,
                  background: 'var(--bg-card2)', border: '1px solid var(--border)',
                  color: 'var(--text)', fontWeight: 700, cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleStartQuickMatch}
                style={{
                  flex: 1.5, padding: '14px', borderRadius: 14,
                  background: 'var(--gradient-primary)', border: 'none',
                  color: '#fff', fontWeight: 800, cursor: 'pointer',
                }}
              >
                Tìm Đối Thủ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
