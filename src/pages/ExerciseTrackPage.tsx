import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import {
  Flame,
  Swords,
  RefreshCw,
  X,
  Navigation,
  ShieldCheck,
  Trophy,
  Play,
  SlidersHorizontal,
  Sparkles,
  Info,
  TrendingUp,
  Layers
} from 'lucide-react';
import { AppCard, GradientButton, ProgressBar } from '../components/ui';
import {
  EXERCISE_VARIATIONS,
  FITNESS_LEVEL_CONFIG,
  EXERCISE_ROADMAP_STAGES
} from '../data/exerciseLibrary';
import type { ExerciseVariation, FitnessLevel } from '../types';

export const ExerciseTrackPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, exercises, addManualSteps, updateFitnessLevel, showToast } = useUser();

  const currentFitnessLevel: FitnessLevel = user.fitnessLevel || 'intermediate';
  const levelConfig = FITNESS_LEVEL_CONFIG[currentFitnessLevel];

  // Primary Tab
  const [activeTab, setActiveTab] = useState<'pushup' | 'pullup' | 'walking' | 'roadmap'>('pushup');
  // Sub-filter by level
  const [levelFilter, setLevelFilter] = useState<'for_you' | 'all' | FitnessLevel>('for_you');

  // Modals
  const [showStepModal, setShowStepModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<ExerciseVariation | null>(null);
  const [manualStepsInput, setManualStepsInput] = useState('');

  const pushupEx = exercises.find(e => e.type === 'pushup') || exercises[0];
  const pullupEx = exercises.find(e => e.type === 'pullup') || exercises[1];
  const walkingEx = exercises.find(e => e.type === 'walking') || exercises[2];

  // Filtered exercise variations
  const currentVariations = useMemo(() => {
    if (activeTab === 'roadmap') return [];
    return EXERCISE_VARIATIONS.filter(item => {
      if (item.type !== activeTab) return false;
      if (levelFilter === 'for_you') return item.level === currentFitnessLevel;
      if (levelFilter === 'all') return true;
      return item.level === levelFilter;
    });
  }, [activeTab, levelFilter, currentFitnessLevel]);

  const handleSyncHealth = () => {
    const randomSteps = 1200 + Math.floor(Math.random() * 800);
    addManualSteps(randomSteps);
    showToast?.(`Đã đồng bộ thành công +${randomSteps.toLocaleString()} bước từ Apple Health / Google Fit!`, 'success');
  };

  const handleAddManualSteps = () => {
    const steps = parseInt(manualStepsInput, 10);
    if (isNaN(steps) || steps <= 0) {
      showToast?.('Vui lòng nhập số bước hợp lệ', 'error');
      return;
    }
    addManualSteps(steps);
    setShowStepModal(false);
    setManualStepsInput('');
  };

  const renderStars = (stars: number) => {
    return (
      <div style={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <span
            key={s}
            style={{
              fontSize: 12,
              color: s <= stars ? '#FFD700' : 'rgba(255, 255, 255, 0.2)',
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: 16, maxWidth: 640, margin: '0 auto', paddingBottom: 95 }}>
      {/* ── Top Header ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h1 style={{ fontSize: 23, fontWeight: 900, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>💪</span> Kho Bài Tập & Thể Lực
          </h1>
          <div style={{ fontSize: 12, color: '#A29BFE', marginTop: 2 }}>
            Cá nhân hóa theo thể trạng • Trọng tài AI Vision
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: '#1A1A2E',
              padding: '6px 10px',
              borderRadius: 20,
              border: '1px solid #25253D'
            }}
          >
            <Flame size={16} color="#FF4757" />
            <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 12 }}>
              {user.streak} ngày
            </span>
          </div>
        </div>
      </div>

      {/* ── Fitness Level Banner & Level Customizer ─────────────────────────── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${levelConfig.bgLight} 0%, rgba(20, 20, 42, 0.95) 100%)`,
          border: `1.5px solid ${levelConfig.color}60`,
          borderRadius: 16,
          padding: '14px 16px',
          marginBottom: 18,
          boxShadow: `0 6px 20px ${levelConfig.color}20`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: levelConfig.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                boxShadow: `0 4px 12px ${levelConfig.color}50`
              }}
            >
              {levelConfig.icon}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF' }}>
                  {levelConfig.label}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: levelConfig.color,
                    background: levelConfig.bgLight,
                    padding: '2px 6px',
                    borderRadius: 6,
                    border: `1px solid ${levelConfig.color}40`
                  }}
                >
                  {levelConfig.badge}
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: '#B0B0C3', marginTop: 2, maxWidth: 320, lineHeight: 1.4 }}>
                {levelConfig.description}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowLevelModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '7px 12px',
              borderRadius: 10,
              background: '#1F1F3D',
              border: `1px solid ${levelConfig.color}80`,
              color: levelConfig.color,
              fontSize: 11.5,
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            <SlidersHorizontal size={13} />
            <span>Đổi Cấp Độ</span>
          </button>
        </div>

        {/* AI Calibration Info Tag */}
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            color: '#E0E0FF'
          }}
        >
          <Sparkles size={13} color={levelConfig.color} style={{ flexShrink: 0 }} />
          <span><strong>AI Chuẩn Form:</strong> {levelConfig.aiAngleNote}</span>
        </div>
      </div>

      {/* ── Primary Category Tabs ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          background: '#16162E',
          borderRadius: 14,
          padding: 4,
          border: '1px solid #2B2D4F',
          marginBottom: 14
        }}
      >
        {[
          { id: 'pushup', label: '💪 Hít Đất' },
          { id: 'pullup', label: '🏋️ Kéo Xà' },
          { id: 'walking', label: '🚶 Đi Bộ' },
          { id: 'roadmap', label: '🗺️ Lộ Trình' },
        ].map(t => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                flex: 1,
                padding: '9px 0',
                border: 'none',
                borderRadius: 10,
                background: isActive ? 'linear-gradient(135deg, #FF6B35, #FF8E53)' : 'transparent',
                color: isActive ? '#FFFFFF' : '#8E94A5',
                fontWeight: isActive ? 800 : 600,
                fontSize: 12.5,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isActive ? '0 3px 10px rgba(255, 107, 53, 0.35)' : 'none'
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Sub Filter by Level (If not in Roadmap tab) ──────────────────────── */}
      {activeTab !== 'roadmap' && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 6,
            marginBottom: 16,
            scrollbarWidth: 'none'
          }}
        >
          {[
            { id: 'for_you', label: `🎯 Phù Hợp Bạn (${levelConfig.icon})`, color: levelConfig.color },
            { id: 'beginner', label: '🌱 Mới Tập', color: '#2ED573' },
            { id: 'intermediate', label: '⚡ Trung Cấp', color: '#FF6B35' },
            { id: 'advanced', label: '👑 Lâu Năm / Pro', color: '#FFD700' },
            { id: 'all', label: 'Tất Cả', color: '#A29BFE' },
          ].map(f => {
            const isCur = levelFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setLevelFilter(f.id as any)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  border: isCur ? `1.5px solid ${f.color}` : '1px solid #2B2D4F',
                  background: isCur ? `${f.color}25` : '#191932',
                  color: isCur ? '#FFFFFF' : '#8E94A5',
                  fontSize: 11.5,
                  fontWeight: isCur ? 800 : 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: PUSH-UP & PULL-UP & WALKING LISTING                                 */}
      {/* ========================================================================= */}
      {activeTab !== 'roadmap' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick Progress Banner for Current Exercise */}
          {activeTab === 'pushup' && (
            <AppCard gradient="linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)" style={{ color: '#FFFFFF', padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                    💪
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>Hít Đất Hàng Ngày</div>
                    <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.85)' }}>
                      Mục tiêu cấp độ {levelConfig.label}: {pushupEx.targetCount} cái
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>{pushupEx.todayCount}/{pushupEx.targetCount}</div>
                  <div style={{ fontSize: 11, opacity: 0.85 }}>Đã hoàn thành</div>
                </div>
              </div>

              <ProgressBar
                progress={pushupEx.todayCount / Math.max(1, pushupEx.targetCount)}
                color="#FFFFFF"
                height={8}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 11.5, opacity: 0.9 }}>
                <span>🔥 Đốt ~{Math.round(pushupEx.todayCount * pushupEx.caloriesPerRep)} kcal</span>
                <span>🏆 Kỷ lục: 52 cái</span>
              </div>
            </AppCard>
          )}

          {activeTab === 'pullup' && (
            <AppCard gradient="linear-gradient(135deg, #5352ED 0%, #7070FF 100%)" style={{ color: '#FFFFFF', padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                    🏋️
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>Kéo Xà Hàng Ngày</div>
                    <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.85)' }}>
                      Mục tiêu cấp độ {levelConfig.label}: {pullupEx.targetCount} cái
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>{pullupEx.todayCount}/{pullupEx.targetCount}</div>
                  <div style={{ fontSize: 11, opacity: 0.85 }}>Đã hoàn thành</div>
                </div>
              </div>

              <ProgressBar
                progress={pullupEx.todayCount / Math.max(1, pullupEx.targetCount)}
                color="#FFFFFF"
                height={8}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 11.5, opacity: 0.9 }}>
                <span>🔥 Đốt ~{Math.round(pullupEx.todayCount * pullupEx.caloriesPerRep)} kcal</span>
                <span>🏆 Kỷ lục: 18 cái</span>
              </div>
            </AppCard>
          )}

          {activeTab === 'walking' && (
            <AppCard gradient="linear-gradient(135deg, #2ED573 0%, #7BED9F 100%)" style={{ color: '#0D0E15', padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(0, 0, 0, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                    🚶
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>Đi Bộ & Sức Bền</div>
                    <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.85 }}>
                      Mục tiêu {levelConfig.label}: {walkingEx.targetCount.toLocaleString()} bước
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 900 }}>{walkingEx.todayCount.toLocaleString()}</div>
                  <div style={{ fontSize: 11, opacity: 0.85 }}>/{walkingEx.targetCount.toLocaleString()} bước</div>
                </div>
              </div>

              <ProgressBar
                progress={walkingEx.todayCount / Math.max(1, walkingEx.targetCount)}
                color="#0D0E15"
                height={8}
              />

              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 14, textAlign: 'center', fontWeight: 800 }}>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.75 }}>Khoảng cách</div>
                  <div style={{ fontSize: 15 }}>{(walkingEx.todayCount * 0.00075).toFixed(2)} km</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.75 }}>Calories</div>
                  <div style={{ fontSize: 15 }}>{Math.round(walkingEx.todayCount * 0.04)} kcal</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.75 }}>Thời gian</div>
                  <div style={{ fontSize: 15 }}>{Math.round(walkingEx.todayCount / 100)} ph</div>
                </div>
              </div>

              {/* Action buttons for walking */}
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button
                  onClick={() => navigate('/gps-walking')}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: 12,
                    background: '#0D0E15',
                    color: '#2ED573',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: 12.5,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <Navigation size={16} />
                  <span>GPS LIVE TRACKER</span>
                </button>
                <button
                  onClick={handleSyncHealth}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 12,
                    background: 'rgba(0,0,0,0.12)',
                    color: '#0D0E15',
                    border: '1px solid rgba(0,0,0,0.2)',
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4
                  }}
                >
                  <RefreshCw size={14} />
                  <span>Đồng Bộ</span>
                </button>
              </div>
            </AppCard>
          )}

          {/* Quick Camera Launcher (Main Big Button) */}
          {activeTab !== 'walking' && (
            <GradientButton
              text={`BẮT ĐẦU TẬP CAMERA AI (${activeTab === 'pushup' ? 'HÍT ĐẤT' : 'KÉO XÀ'})`}
              icon={<Play size={20} />}
              fullWidth
              gradient={activeTab === 'pushup' ? 'linear-gradient(135deg, #FF6B35, #FF8E53)' : 'linear-gradient(135deg, #5352ED, #7070FF)'}
              onPressed={() => navigate(`/exercise-camera?type=${activeTab}&level=${currentFitnessLevel}`)}
            />
          )}

          {/* ── Section Title: Exercise Variations ─────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={18} color="#FF8E53" />
              <span>Kho Động Tác & Biến Thể ({currentVariations.length})</span>
            </div>
            <span style={{ fontSize: 11.5, color: '#8E94A5' }}>
              Chạm để xem hướng dẫn AI
            </span>
          </div>

          {/* Variations Cards Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {currentVariations.map((item) => {
              const itemLvl = FITNESS_LEVEL_CONFIG[item.level];
              const isMatch = item.level === currentFitnessLevel;

              return (
                <AppCard
                  key={item.id}
                  style={{
                    padding: 16,
                    border: isMatch ? `1.5px solid ${itemLvl.color}60` : '1px solid #25253D',
                    background: isMatch ? `linear-gradient(135deg, ${itemLvl.bgLight} 0%, #1A1A2E 100%)` : '#1A1A2E',
                    cursor: 'pointer'
                  }}
                  onTap={() => setSelectedVariation(item)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: `${itemLvl.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 22,
                          border: `1px solid ${itemLvl.color}40`,
                          flexShrink: 0
                        }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF' }}>
                            {item.vietnameseName}
                          </span>
                          {isMatch && (
                            <span
                              style={{
                                fontSize: 9.5,
                                fontWeight: 800,
                                color: itemLvl.color,
                                background: itemLvl.bgLight,
                                padding: '1px 6px',
                                borderRadius: 6,
                                border: `1px solid ${itemLvl.color}50`
                              }}
                            >
                              Khuyên dùng
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: '#8E94A5' }}>
                          {item.name} • {item.badge}
                        </div>
                      </div>
                    </div>

                    {renderStars(item.difficultyStars)}
                  </div>

                  <p style={{ fontSize: 12, color: '#B0B0C3', margin: '6px 0 10px', lineHeight: 1.45 }}>
                    {item.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    <span style={{ fontSize: 10.5, background: 'rgba(255,255,255,0.06)', color: '#A29BFE', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                      🎯 Mục tiêu: {item.targetRepsPerSet}
                    </span>
                    <span style={{ fontSize: 10.5, background: 'rgba(46, 213, 115, 0.12)', color: '#2ED573', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                      ⚡ AI: {item.aiTargetAngle}
                    </span>
                    <span style={{ fontSize: 10.5, background: 'rgba(255, 107, 53, 0.12)', color: '#FF8E53', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                      💪 {item.targetMuscle.split(',')[0]}
                    </span>
                  </div>

                  {/* Card Bottom CTA */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: 11, color: '#6B6B80', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Info size={13} />
                      <span>Xem kỹ thuật & form AI</span>
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.type === 'walking') {
                          navigate('/gps-walking');
                        } else {
                          navigate(`/exercise-camera?type=${item.type}&variant=${item.id}&level=${item.level}`);
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        background: itemLvl.color,
                        color: item.level === 'beginner' || item.level === 'advanced' ? '#0D0E15' : '#FFFFFF',
                        border: 'none',
                        fontSize: 11,
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Play size={12} fill="currentColor" />
                      <span>TẬP NGAY</span>
                    </button>
                  </div>
                </AppCard>
              );
            })}
          </div>

          {/* Mode Action Cards: 1v1 Battle & Leaderboard */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 4 }}>
            <AppCard
              onTap={() => navigate(`/battle-camera?exercise=${activeTab === 'pushup' ? 'Hít Đất' : 'Kéo Xà'}`)}
              style={{ cursor: 'pointer', padding: 14 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255, 107, 53, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Swords size={20} color="#FF6B35" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>Đấu Trường 1v1</div>
                  <div style={{ fontSize: 10.5, color: '#8E94A5' }}>So tài 60s nhận Ruby</div>
                </div>
              </div>
            </AppCard>

            <AppCard
              onTap={() => navigate('/exercise-ranking')}
              style={{ cursor: 'pointer', padding: 14 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(247, 201, 72, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trophy size={20} color="#F7C948" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>Bảng Xếp Hạng</div>
                  <div style={{ fontSize: 10.5, color: '#8E94A5' }}>Top kỷ lục Reps Server</div>
                </div>
              </div>
            </AppCard>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EXERCISE ROADMAP (LỘ TRÌNH THĂNG HẠNG TỪ MỚI TẬP -> LÂU NĂM)       */}
      {/* ========================================================================= */}
      {activeTab === 'roadmap' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'rgba(255, 107, 53, 0.12)', padding: '14px', borderRadius: 14, border: '1px solid rgba(255, 107, 53, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FF8E53', fontWeight: 800, fontSize: 13.5, marginBottom: 4 }}>
              <TrendingUp size={16} />
              <span>Lộ Trình Nâng Cấp Thể Lực Chuẩn Khoa Học</span>
            </div>
            <p style={{ fontSize: 12, color: '#B0B0C3', margin: 0, lineHeight: 1.5 }}>
              Hệ thống được thiết kế theo nguyên lý quá tải tăng dần (Progressive Overload), giúp bạn phát triển từ người chưa từng tập thành chiến binh Calisthenics mà không lo kiệt sức.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {EXERCISE_ROADMAP_STAGES.map((stage) => {
              const stageLvl = FITNESS_LEVEL_CONFIG[stage.level];
              const isCurrentStage = currentFitnessLevel === stage.level;

              return (
                <AppCard
                  key={stage.stage}
                  style={{
                    padding: 16,
                    border: isCurrentStage ? `2px solid ${stageLvl.color}` : '1px solid #25253D',
                    background: isCurrentStage ? `linear-gradient(135deg, ${stageLvl.bgLight} 0%, #1A1A2E 100%)` : '#1A1A2E'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          background: stageLvl.color,
                          color: '#000',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 20,
                          fontWeight: 900
                        }}
                      >
                        {stage.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF' }}>
                          {stage.title}
                        </div>
                        <div style={{ fontSize: 11, color: stageLvl.color, fontWeight: 700 }}>
                          {stage.subtitle}
                        </div>
                      </div>
                    </div>

                    {isCurrentStage ? (
                      <span style={{ fontSize: 10.5, fontWeight: 800, background: stageLvl.color, color: '#000', padding: '3px 8px', borderRadius: 10 }}>
                        ĐANG Ở ĐÂY
                      </span>
                    ) : (
                      <span style={{ fontSize: 10.5, color: '#6B6B80', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 10 }}>
                        Level {stage.requiredLevel}+
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: 12, color: '#B0B0C3', margin: '0 0 10px', lineHeight: 1.45 }}>
                    {stage.description}
                  </p>

                  <div style={{ background: '#121224', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>
                      🎯 Mục tiêu cột mốc để thăng hạng:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11.5, color: '#B0B0C3', lineHeight: 1.6 }}>
                      {stage.milestones.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#A29BFE' }}>
                    <span>⚡ Khối lượng khuyến nghị: <strong>{stage.recommendedReps}</strong></span>
                    {isCurrentStage ? (
                      <span style={{ color: stageLvl.color, fontWeight: 800 }}>✓ Cấp độ hiện tại của bạn</span>
                    ) : (
                      <button
                        onClick={() => {
                          updateFitnessLevel(stage.level);
                        }}
                        style={{
                          background: 'none',
                          border: `1px solid ${stageLvl.color}80`,
                          color: stageLvl.color,
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 10.5,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Chọn cấp này ➔
                      </button>
                    )}
                  </div>
                </AppCard>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: VARIATION DETAIL & AI GUIDANCE MODAL                             */}
      {/* ========================================================================= */}
      {selectedVariation && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setSelectedVariation(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 480,
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#181832',
              borderRadius: 22,
              padding: 22,
              border: `1.5px solid ${FITNESS_LEVEL_CONFIG[selectedVariation.level].color}80`,
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              color: '#FFFFFF'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: `${FITNESS_LEVEL_CONFIG[selectedVariation.level].color}25`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    border: `1px solid ${FITNESS_LEVEL_CONFIG[selectedVariation.level].color}50`
                  }}
                >
                  {selectedVariation.icon}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>{selectedVariation.vietnameseName}</div>
                  <div style={{ fontSize: 12, color: '#8E94A5' }}>{selectedVariation.name}</div>
                </div>
              </div>

              <button
                onClick={() => setSelectedVariation(null)}
                style={{ background: 'none', border: 'none', color: '#8E94A5', cursor: 'pointer', padding: 4 }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Level & Stars Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#121224', padding: '10px 14px', borderRadius: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: FITNESS_LEVEL_CONFIG[selectedVariation.level].color }}>
                  {FITNESS_LEVEL_CONFIG[selectedVariation.level].label}
                </span>
                <span style={{ fontSize: 11, color: '#8E94A5' }}>• {selectedVariation.badge}</span>
              </div>
              {renderStars(selectedVariation.difficultyStars)}
            </div>

            {/* Description */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#8E94A5', fontWeight: 600, marginBottom: 4 }}>MÔ TẢ KỸ THUẬT:</div>
              <p style={{ fontSize: 13, color: '#E0E0FF', margin: 0, lineHeight: 1.5 }}>
                {selectedVariation.description}
              </p>
            </div>

            {/* AI Vision Form Checks */}
            <div style={{ background: 'rgba(46, 213, 115, 0.1)', border: '1px solid rgba(46, 213, 115, 0.3)', borderRadius: 14, padding: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#2ED573', fontWeight: 800, fontSize: 13, marginBottom: 8 }}>
                <ShieldCheck size={16} />
                <span>Tiêu Chuẩn Chấm Điểm AI Vision:</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#D1F7C4', lineHeight: 1.6 }}>
                {selectedVariation.aiGuidance.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>

            {/* Pro Tips */}
            <div style={{ background: 'rgba(255, 107, 53, 0.1)', border: '1px solid rgba(255, 107, 53, 0.3)', borderRadius: 14, padding: 14, marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FF8E53', fontWeight: 800, fontSize: 13, marginBottom: 4 }}>
                <Sparkles size={16} />
                <span>Mẹo Tập Tránh Chấn Thương (Pro-Tips):</span>
              </div>
              <p style={{ fontSize: 12, color: '#FFD3B6', margin: 0, lineHeight: 1.45 }}>
                {selectedVariation.proTips}
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setSelectedVariation(null)}
                style={{
                  flex: 1,
                  padding: '13px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Đóng
              </button>

              <button
                onClick={() => {
                  const v = selectedVariation;
                  setSelectedVariation(null);
                  if (v.type === 'walking') {
                    navigate('/gps-walking');
                  } else {
                    navigate(`/exercise-camera?type=${v.type}&variant=${v.id}&level=${v.level}`);
                  }
                }}
                style={{
                  flex: 2,
                  padding: '13px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #FF6B35, #FF4757)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: 13.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  boxShadow: '0 4px 16px rgba(255, 107, 53, 0.4)'
                }}
              >
                <Play size={16} fill="#fff" />
                <span>BẬT CAMERA TẬP BÀI NÀY</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: QUICK FITNESS LEVEL SELECTOR MODAL                                */}
      {/* ========================================================================= */}
      {showLevelModal && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setShowLevelModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 440,
              background: '#1A1A2E',
              borderRadius: 22,
              padding: 22,
              border: '1px solid #2B2D4F',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              color: '#FFFFFF'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900 }}>Chọn Trình Độ Thể Lực</div>
                <div style={{ fontSize: 12, color: '#8E94A5' }}>Điều chỉnh mục tiêu & độ khó AI phù hợp</div>
              </div>
              <button
                onClick={() => setShowLevelModal(false)}
                style={{ background: 'none', border: 'none', color: '#8E94A5', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              {/* Option 1: Beginner */}
              <div
                onClick={() => {
                  updateFitnessLevel('beginner');
                  setShowLevelModal(false);
                }}
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: currentFitnessLevel === 'beginner' ? 'rgba(46, 213, 115, 0.18)' : '#121224',
                  border: currentFitnessLevel === 'beginner' ? '2px solid #2ED573' : '1px solid #25253D',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>🌱</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#2ED573' }}>
                      Mới Tập / Chưa Từng Tập (Beginner)
                    </span>
                  </div>
                  {currentFitnessLevel === 'beginner' && (
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#2ED573', color: '#000', fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: '#B0B0C3', lineHeight: 1.4 }}>
                  Mục tiêu nhẹ nhàng (20 hít đất, 5 kéo xà, 5k bước). AI chấm điểm nới lỏng để xây thói quen.
                </div>
              </div>

              {/* Option 2: Intermediate */}
              <div
                onClick={() => {
                  updateFitnessLevel('intermediate');
                  setShowLevelModal(false);
                }}
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: currentFitnessLevel === 'intermediate' ? 'rgba(255, 107, 53, 0.18)' : '#121224',
                  border: currentFitnessLevel === 'intermediate' ? '2px solid #FF6B35' : '1px solid #25253D',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>⚡</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#FF8E53' }}>
                      Đã Tập Một Thời Gian (Intermediate)
                    </span>
                  </div>
                  {currentFitnessLevel === 'intermediate' && (
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#FF6B35', color: '#fff', fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: '#B0B0C3', lineHeight: 1.4 }}>
                  Mục tiêu tiêu chuẩn (50 hít đất, 20 kéo xà, 10k bước). Đấu trường 1v1 chuẩn form 90°.
                </div>
              </div>

              {/* Option 3: Advanced */}
              <div
                onClick={() => {
                  updateFitnessLevel('advanced');
                  setShowLevelModal(false);
                }}
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: currentFitnessLevel === 'advanced' ? 'rgba(255, 215, 0, 0.18)' : '#121224',
                  border: currentFitnessLevel === 'advanced' ? '2px solid #FFD700' : '1px solid #25253D',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>👑</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#FFD700' }}>
                      Đã Tập Lâu Năm / Pro Athlete
                    </span>
                  </div>
                  {currentFitnessLevel === 'advanced' && (
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#FFD700', color: '#000', fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: '#B0B0C3', lineHeight: 1.4 }}>
                  Mục tiêu cực đại (100 hít đất, 45 kéo xà, 15k bước). AI bắt Dead Hang & Full ROM nghiêm ngặt.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MANUAL STEP INPUT MODAL                                          */}
      {/* ========================================================================= */}
      {showStepModal && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setShowStepModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 380,
              background: '#1A1A2E',
              borderRadius: 20,
              padding: 24,
              border: '1px solid #25253D'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
                🚶 Nhập Số Bước
              </span>
              <button
                onClick={() => setShowStepModal(false)}
                style={{ background: 'none', border: 'none', color: '#6B6B80', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <input
              type="number"
              placeholder="Ví dụ: 3000"
              value={manualStepsInput}
              onChange={(e) => setManualStepsInput(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: '#25253D',
                border: '1px solid #25253D',
                borderRadius: 12,
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: 16
              }}
            />

            <button
              onClick={handleAddManualSteps}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #2ED573 0%, #7BED9F 100%)',
                border: 'none',
                borderRadius: 12,
                color: '#0D0E15',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              LƯU SỐ BƯỚC
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
