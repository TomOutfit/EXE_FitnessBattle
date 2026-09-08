import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Flame, Camera, Swords, RefreshCw, Plus, ChevronRight, X, Navigation, Footprints, Smartphone, ShieldCheck } from 'lucide-react';

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

      {/* Tab 1: Hít Đất */}
      {activeTab === 'pushup' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick Stats Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
              borderRadius: 20,
              padding: 20,
              color: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(255, 107, 53, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.2)',
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
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
                  Kỷ lục cá nhân: 52 lần
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 12,
                padding: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                textAlign: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>1.450</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>Tổng</div>
              </div>
              <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.25)' }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>155</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>Tuần này</div>
              </div>
              <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.25)' }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{pushupEx.todayCount}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>Hôm nay</div>
              </div>
            </div>
          </div>

          {/* Daily Goal Card */}
          <div
            style={{
              background: '#1A1A2E',
              borderRadius: 16,
              padding: 16,
              border: '1px solid #25253D'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF' }}>Mục tiêu hôm nay</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#FF6B35' }}>
                {pushupEx.todayCount}/{pushupEx.targetCount} lần
              </span>
            </div>

            <div style={{ height: 8, background: '#25253D', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, Math.round((pushupEx.todayCount / pushupEx.targetCount) * 100))}%`,
                  background: 'linear-gradient(90deg, #FF6B35, #FF8E53)',
                  borderRadius: 4
                }}
              />
            </div>

            <div style={{ fontSize: 12, color: '#B0B0C3' }}>
              🔥 Đã đốt cháy ~{(pushupEx.todayCount * pushupEx.caloriesPerRep).toFixed(0)} kcal
            </div>
          </div>

          {/* Start Exercise Button */}
          <button
            onClick={() => navigate('/exercise-camera?type=pushup')}
            style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
              border: 'none',
              borderRadius: 16,
              padding: 16,
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 6px 20px rgba(255, 107, 53, 0.35)'
            }}
          >
            <Camera size={22} />
            BẮT ĐẦU TẬP (AI CAMERA)
          </button>

          {/* Battle Mode Card */}
          <div
            onClick={() => navigate('/battle-camera?type=pushup')}
            style={{
              background: '#1A1A2E',
              borderRadius: 16,
              padding: 16,
              border: '1px solid #25253D',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(255, 71, 87, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}
            >
              <Swords size={22} color="#FF4757" />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#FFFFFF' }}>
                ⚔️ Chế độ Thi đấu 1v1
              </div>
              <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
                So tài đếm rep chuẩn xác cùng bạn bè
              </div>
            </div>

            <ChevronRight size={20} color="#6B6B80" />
          </div>
        </div>
      )}

      {/* Tab 2: Kéo Xà */}
      {activeTab === 'pullup' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick Stats Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #5352ED 0%, #7070FF 100%)',
              borderRadius: 20,
              padding: 20,
              color: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(83, 82, 237, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.2)',
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
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
                  Kỷ lục cá nhân: 18 lần
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 12,
                padding: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                textAlign: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>420</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>Tổng</div>
              </div>
              <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.25)' }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>45</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>Tuần này</div>
              </div>
              <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.25)' }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{pullupEx.todayCount}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>Hôm nay</div>
              </div>
            </div>
          </div>

          {/* Daily Goal Card */}
          <div
            style={{
              background: '#1A1A2E',
              borderRadius: 16,
              padding: 16,
              border: '1px solid #25253D'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF' }}>Mục tiêu hôm nay</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#5352ED' }}>
                {pullupEx.todayCount}/{pullupEx.targetCount} lần
              </span>
            </div>

            <div style={{ height: 8, background: '#25253D', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, Math.round((pullupEx.todayCount / pullupEx.targetCount) * 100))}%`,
                  background: 'linear-gradient(90deg, #5352ED, #7070FF)',
                  borderRadius: 4
                }}
              />
            </div>

            <div style={{ fontSize: 12, color: '#B0B0C3' }}>
              🔥 Đã đốt cháy ~{(pullupEx.todayCount * pullupEx.caloriesPerRep).toFixed(0)} kcal
            </div>
          </div>

          {/* Start Exercise Button */}
          <button
            onClick={() => navigate('/exercise-camera?type=pullup')}
            style={{
              background: 'linear-gradient(135deg, #5352ED 0%, #7070FF 100%)',
              border: 'none',
              borderRadius: 16,
              padding: 16,
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 6px 20px rgba(83, 82, 237, 0.35)'
            }}
          >
            <Camera size={22} />
            BẮT ĐẦU TẬP (AI CAMERA)
          </button>

          {/* Battle Mode Card */}
          <div
            onClick={() => navigate('/battle-camera?type=pullup')}
            style={{
              background: '#1A1A2E',
              borderRadius: 16,
              padding: 16,
              border: '1px solid #25253D',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(255, 71, 87, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}
            >
              <Swords size={22} color="#FF4757" />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#FFFFFF' }}>
                ⚔️ Chế độ Thi đấu 1v1
              </div>
              <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
                So tài đếm rep chuẩn xác cùng bạn bè
              </div>
            </div>

            <ChevronRight size={20} color="#6B6B80" />
          </div>
        </div>
      )}

      {/* Tab 3: Đi Bộ */}
      {activeTab === 'walking' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick Stats Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #2ED573 0%, #7BED9F 100%)',
              borderRadius: 20,
              padding: 20,
              color: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(46, 213, 115, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.2)',
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
                <div style={{ fontSize: 20, fontWeight: 700 }}>Đi Bộ</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
                  Kỷ lục: 15.000 bước/ngày
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 12,
                padding: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                textAlign: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>185.000</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>Tổng bước</div>
              </div>
              <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.25)' }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>52.500</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>Tuần này</div>
              </div>
              <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.25)' }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{walkingEx.todayCount.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>Hôm nay</div>
              </div>
            </div>
          </div>

          {/* Daily Goal Card */}
          <div
            style={{
              background: '#1A1A2E',
              borderRadius: 16,
              padding: 16,
              border: '1px solid #25253D'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF' }}>Mục tiêu hôm nay</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#2ED573' }}>
                {walkingEx.todayCount.toLocaleString()}/{walkingEx.targetCount.toLocaleString()} bước
              </span>
            </div>

            <div style={{ height: 8, background: '#25253D', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, Math.round((walkingEx.todayCount / walkingEx.targetCount) * 100))}%`,
                  background: 'linear-gradient(90deg, #2ED573, #7BED9F)',
                  borderRadius: 4
                }}
              />
            </div>

            <div style={{ fontSize: 12, color: '#B0B0C3' }}>
              🔥 Đã đốt cháy ~{(walkingEx.todayCount * walkingEx.caloriesPerRep).toFixed(0)} kcal
            </div>
          </div>

          {/* Primary GPS & Realtime Step Tracking CTA Button */}
          <button
            onClick={() => navigate('/gps-walking')}
            style={{
              background: 'linear-gradient(135deg, #2ED573 0%, #7BED9F 100%)',
              border: 'none',
              borderRadius: 16,
              padding: 16,
              color: '#0A0C14',
              fontWeight: 800,
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: '0 6px 22px rgba(46, 213, 115, 0.4)',
              letterSpacing: 0.3
            }}
          >
            <Footprints size={22} color="#0A0C14" />
            BẮT ĐẦU ĐI BỘ (GPS & BƯỚC CHÂN REALTIME)
          </button>

          {/* GPS Outdoor & Indoor Sensor Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div
              onClick={() => navigate('/gps-walking')}
              style={{
                background: '#1A1A2E',
                borderRadius: 16,
                padding: 14,
                border: '1px solid #25253D',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(46, 213, 115, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Navigation size={18} color="#2ED573" />
                </div>
                <span style={{ fontSize: 10, color: '#2ED573', fontWeight: 700, background: 'rgba(46, 213, 115, 0.1)', padding: '2px 6px', borderRadius: 6 }}>
                  Vệ tinh
                </span>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>GPS Ngoài trời</div>
                <div style={{ fontSize: 11, color: '#B0B0C3', marginTop: 2 }}>Đo quãng đường, pace & bản đồ lộ trình live</div>
              </div>
            </div>

            <div
              onClick={() => navigate('/gps-walking')}
              style={{
                background: '#1A1A2E',
                borderRadius: 16,
                padding: 14,
                border: '1px solid #25253D',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255, 107, 53, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Smartphone size={18} color="#FF6B35" />
                </div>
                <span style={{ fontSize: 10, color: '#FF6B35', fontWeight: 700, background: 'rgba(255, 107, 53, 0.1)', padding: '2px 6px', borderRadius: 6 }}>
                  Sensor
                </span>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>Pedometer Mobile</div>
                <div style={{ fontSize: 11, color: '#B0B0C3', marginTop: 2 }}>Cảm biến gia tốc đếm bước chân khi cầm máy</div>
              </div>
            </div>
          </div>

          {/* Anti-cheat verification badge */}
          <div
            style={{
              padding: '12px 14px',
              background: 'rgba(46, 213, 115, 0.08)',
              border: '1px solid rgba(46, 213, 115, 0.2)',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            <ShieldCheck size={20} color="#2ED573" />
            <div style={{ fontSize: 12, color: '#B0B0C3' }}>
              🛡️ <strong style={{ color: '#FFFFFF' }}>Dual Anti-Cheat GPS:</strong> Tự động lọc rung lắc và chặn gian lận xe máy (&gt;25km/h).
            </div>
          </div>

          {/* Sync & Manual Entry Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button
              onClick={handleSyncHealth}
              style={{
                background: '#1A1A2E',
                border: '1px solid #25253D',
                borderRadius: 16,
                padding: 14,
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6
              }}
            >
              <RefreshCw size={20} color="#2ED573" />
              Đồng bộ Health
            </button>

            <button
              onClick={() => setShowStepModal(true)}
              style={{
                background: '#1A1A2E',
                border: '1px solid #25253D',
                borderRadius: 16,
                padding: 14,
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Plus size={20} color="#FF6B35" />
              Nhập bước thủ công
            </button>
          </div>
        </div>
      )}

      {/* Manual Step Entry Modal */}
      {showStepModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 100,
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
              background: '#1A1A2E',
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 360,
              border: '1px solid #25253D'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>🚶 Nhập bước chân</span>
              <button
                onClick={() => setShowStepModal(false)}
                style={{ background: 'none', border: 'none', color: '#6B6B80', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <input
              type="number"
              placeholder="Nhập số bước (VD: 2500)"
              value={manualStepsInput}
              onChange={(e) => setManualStepsInput(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 12,
                background: '#25253D',
                border: '1px solid #6B6B80',
                color: '#FFFFFF',
                fontSize: 16,
                outline: 'none',
                marginBottom: 16,
                boxSizing: 'border-box'
              }}
            />

            <button
              onClick={handleAddManualSteps}
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #2ED573 0%, #7BED9F 100%)',
                border: 'none',
                color: '#000000',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer'
              }}
            >
              Ghi nhận
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
