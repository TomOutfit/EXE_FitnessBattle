import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import {
  Flame,
  Swords,
  RefreshCw,
  Plus,
  ChevronRight,
  X,
  Navigation,
  ShieldCheck,
  Trophy,
  CheckCircle,
  Play
} from 'lucide-react';
import { AppCard, GradientButton, ProgressBar } from '../components/ui';

export const ExerciseTrackPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, exercises, addManualSteps, showToast } = useUser();
  const [activeTab, setActiveTab] = useState<'pushup' | 'pullup' | 'walking'>('pushup');
  const [manualStepsInput, setManualStepsInput] = useState('');
  const [showStepModal, setShowStepModal] = useState(false);

  const pushupEx = exercises.find(e => e.type === 'pushup') || exercises[0];
  const pullupEx = exercises.find(e => e.type === 'pullup') || exercises[1];
  const walkingEx = exercises.find(e => e.type === 'walking') || exercises[2];

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

  return (
    <div style={{ padding: 16, maxWidth: 640, margin: '0 auto', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
          💪 Tập Luyện
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
          <Flame size={18} color="#FF4757" />
          <span style={{ fontWeight: 600, color: '#FFFFFF', fontSize: 13 }}>
            {user.streak} ngày
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
            transition: 'all 0.2s'
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
            transition: 'all 0.2s'
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
            transition: 'all 0.2s'
          }}
        >
          🚶 Đi Bộ
        </button>
      </div>

      {/* ==================== PUSH-UP TAB ==================== */}
      {activeTab === 'pushup' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick Stats Card */}
          <AppCard
            gradient="linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)"
            style={{ color: '#FFFFFF', padding: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 16,
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  marginRight: 16
                }}
              >
                💪
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>Hít Đất</div>
                <div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.85)' }}>
                  Kỷ lục cá nhân: 52 lần
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.8)' }}>Tổng</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>1,240</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255, 255, 255, 0.2)' }} />
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.8)' }}>Tuần này</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>245</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255, 255, 255, 0.2)' }} />
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.8)' }}>Hôm nay</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{pushupEx.todayCount}</div>
              </div>
            </div>
          </AppCard>

          {/* Daily Goal Progress */}
          <AppCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>
                🎯 Mục tiêu hôm nay
              </span>
              <span style={{ fontWeight: 600, color: '#FF6B35', fontSize: 14 }}>
                {pushupEx.todayCount}/{pushupEx.targetCount}
              </span>
            </div>
            <ProgressBar
              progress={pushupEx.todayCount / Math.max(1, pushupEx.targetCount)}
              color="#FF6B35"
              height={10}
            />
            {pushupEx.todayCount >= pushupEx.targetCount && (
              <div
                style={{
                  marginTop: 12,
                  padding: 10,
                  borderRadius: 10,
                  background: 'rgba(46, 213, 115, 0.15)',
                  border: '1px solid #2ED573',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#2ED573',
                  fontSize: 13,
                  fontWeight: 600
                }}
              >
                <CheckCircle size={18} />
                <span>Hoàn thành mục tiêu! +50 Coins thưởng</span>
              </div>
            )}
          </AppCard>

          {/* Start Training Button */}
          <GradientButton
            text="BẮT ĐẦU TẬP (CAMERA AI)"
            icon={<Play size={20} />}
            fullWidth
            gradient="linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)"
            onPressed={() => navigate('/exercise-camera?type=pushup')}
          />

          {/* Battle Mode Action Card */}
          <AppCard
            onTap={() => navigate('/battle-camera?exercise=Hít Đất')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 12,
                  background: 'rgba(255, 107, 53, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Swords size={26} color="#FF6B35" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>
                  ⚔️ Chế độ Thi đấu 1v1
                </div>
                <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
                  Thách đấu 1 phút - Ai nhiều hơn thắng!
                </div>
              </div>
              <ChevronRight size={20} color="#6B6B80" />
            </div>
          </AppCard>

          {/* Leaderboard Shortcut */}
          <AppCard
            onTap={() => navigate('/exercise-ranking')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 12,
                  background: 'rgba(247, 201, 72, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Trophy size={26} color="#F7C948" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>
                  🏆 Bảng Xếp Hạng Hít Đất
                </div>
                <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
                  Xem kỷ lục Reps cao nhất toàn server
                </div>
              </div>
              <ChevronRight size={20} color="#6B6B80" />
            </div>
          </AppCard>

          {/* AI Tips Card */}
          <AppCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <ShieldCheck size={18} color="#2ED573" />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#2ED573' }}>
                Hướng dẫn AI Form chuẩn
              </span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#B0B0C3', lineHeight: 1.6 }}>
              <li>Đặt camera ngang hông hoặc chếch 45 độ.</li>
              <li>Hạ ngực chạm vạch ảo (khuỷu tay gập dưới 90°).</li>
              <li>Đẩy thẳng tay hoàn toàn để AI tính 1 Rep hợp lệ.</li>
            </ul>
          </AppCard>
        </div>
      )}

      {/* ==================== PULL-UP TAB ==================== */}
      {activeTab === 'pullup' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick Stats Card */}
          <AppCard
            gradient="linear-gradient(135deg, #5352ED 0%, #7070FF 100%)"
            style={{ color: '#FFFFFF', padding: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 16,
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  marginRight: 16
                }}
              >
                🏋️
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>Kéo Xà</div>
                <div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.85)' }}>
                  Kỷ lục cá nhân: 18 lần
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.8)' }}>Tổng</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>380</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255, 255, 255, 0.2)' }} />
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.8)' }}>Tuần này</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>58</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255, 255, 255, 0.2)' }} />
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.8)' }}>Hôm nay</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{pullupEx.todayCount}</div>
              </div>
            </div>
          </AppCard>

          {/* Daily Goal Progress */}
          <AppCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>
                🎯 Mục tiêu hôm nay
              </span>
              <span style={{ fontWeight: 600, color: '#5352ED', fontSize: 14 }}>
                {pullupEx.todayCount}/{pullupEx.targetCount}
              </span>
            </div>
            <ProgressBar
              progress={pullupEx.todayCount / Math.max(1, pullupEx.targetCount)}
              color="#5352ED"
              height={10}
            />
          </AppCard>

          {/* Start Training Button */}
          <GradientButton
            text="BẮT ĐẦU TẬP (CAMERA AI)"
            icon={<Play size={20} />}
            fullWidth
            gradient="linear-gradient(135deg, #5352ED 0%, #7070FF 100%)"
            onPressed={() => navigate('/exercise-camera?type=pullup')}
          />

          {/* Battle Mode Action Card */}
          <AppCard
            onTap={() => navigate('/battle-camera?exercise=Kéo Xà')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 12,
                  background: 'rgba(83, 82, 237, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Swords size={26} color="#5352ED" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>
                  ⚔️ Chế độ Thi đấu Kéo Xà
                </div>
                <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
                  So tài thể lực 60s đỉnh cao
                </div>
              </div>
              <ChevronRight size={20} color="#6B6B80" />
            </div>
          </AppCard>

          {/* Leaderboard Shortcut */}
          <AppCard
            onTap={() => navigate('/exercise-ranking')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 12,
                  background: 'rgba(247, 201, 72, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Trophy size={26} color="#F7C948" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>
                  🏆 Bảng Xếp Hạng Kéo Xà
                </div>
                <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
                  Top kỷ lục kéo xà toàn quốc
                </div>
              </div>
              <ChevronRight size={20} color="#6B6B80" />
            </div>
          </AppCard>
        </div>
      )}

      {/* ==================== WALKING TAB ==================== */}
      {activeTab === 'walking' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick Stats Card */}
          <AppCard
            gradient="linear-gradient(135deg, #2ED573 0%, #7BED9F 100%)"
            style={{ color: '#0D0E15', padding: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 16,
                  background: 'rgba(0, 0, 0, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  marginRight: 16
                }}
              >
                🚶
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>Đi Bộ Hàng Ngày</div>
                <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.85 }}>
                  Hôm nay: {walkingEx.todayCount.toLocaleString()} / {walkingEx.targetCount.toLocaleString()} bước
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Khoảng cách</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>
                  {(walkingEx.todayCount * 0.00075).toFixed(2)} km
                </div>
              </div>
              <div style={{ width: 1, background: 'rgba(0, 0, 0, 0.15)' }} />
              <div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Calories</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>
                  {Math.round(walkingEx.todayCount * 0.04)} kcal
                </div>
              </div>
              <div style={{ width: 1, background: 'rgba(0, 0, 0, 0.15)' }} />
              <div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Thời gian</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>
                  {Math.round(walkingEx.todayCount / 100)} ph
                </div>
              </div>
            </div>
          </AppCard>

          {/* Goal Progress */}
          <AppCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>
                🎯 Tiến độ mục tiêu
              </span>
              <span style={{ fontWeight: 600, color: '#2ED573', fontSize: 14 }}>
                {Math.round((walkingEx.todayCount / walkingEx.targetCount) * 100)}%
              </span>
            </div>
            <ProgressBar
              progress={walkingEx.todayCount / Math.max(1, walkingEx.targetCount)}
              color="#2ED573"
              height={10}
            />
          </AppCard>

          {/* Action 1: GPS Walking Live */}
          <GradientButton
            text="BẮT ĐẦU ĐI BỘ (GPS LIVE TRACKER)"
            icon={<Navigation size={20} />}
            fullWidth
            gradient="linear-gradient(135deg, #2ED573 0%, #7BED9F 100%)"
            style={{ color: '#0D0E15', fontWeight: 800 }}
            onPressed={() => navigate('/gps-walking')}
          />

          {/* Action 2: Sync Health */}
          <AppCard onTap={handleSyncHealth} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'rgba(83, 82, 237, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <RefreshCw size={24} color="#5352ED" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF' }}>
                  Đồng Bộ Apple Health / Google Fit
                </div>
                <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
                  Tự động cập nhật số bước từ điện thoại
                </div>
              </div>
              <ChevronRight size={20} color="#6B6B80" />
            </div>
          </AppCard>

          {/* Action 3: Manual Input */}
          <AppCard onTap={() => setShowStepModal(true)} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'rgba(255, 107, 53, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Plus size={24} color="#FF6B35" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF' }}>
                  Nhập Số Bước Thủ Công
                </div>
                <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
                  Ghi nhận hoạt động đi bộ ngoài trời
                </div>
              </div>
              <ChevronRight size={20} color="#6B6B80" />
            </div>
          </AppCard>
        </div>
      )}

      {/* Manual Step Modal */}
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
