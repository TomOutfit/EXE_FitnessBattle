import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, ShieldCheck, Flame, Activity, Trophy } from 'lucide-react';
import { exercises, recentActivities } from '../data/mockData';
import type { ExerciseType } from '../types';

export const ExerciseTrackPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<ExerciseType>('pushup');

  const selectedExercise = exercises.find((e) => e.type === selectedType) || exercises[0];

  return (
    <div style={{ paddingBottom: 90 }}>
      {/* Top Header */}
      <div style={{
        background: 'linear-gradient(180deg, #14141e, var(--bg))',
        padding: '16px 20px 12px',
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', cursor: 'pointer',
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>💪 Tập Luyện AI</h1>
            <p style={{ fontSize: 11, color: 'var(--text3)' }}>Nhận diện tư thế & đếm rep chuẩn xác</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/ranking')}
          style={{
            padding: '6px 12px', borderRadius: 12,
            background: 'rgba(255, 107, 53, 0.15)', border: '1px solid rgba(255, 107, 53, 0.3)',
            display: 'flex', alignItems: 'center', gap: 6,
            color: 'var(--primary)', fontWeight: 700, fontSize: 12, cursor: 'pointer',
          }}
        >
          <Trophy size={14} />
          <span>BXH</span>
        </button>
      </div>

      <div style={{ padding: '0 20px', marginTop: 12 }}>
        {/* Exercise Type Selector Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          {exercises.map((ex) => {
            const isSelected = ex.type === selectedType;
            const progress = Math.min(100, Math.round((ex.todayCount / ex.targetCount) * 100));

            return (
              <div
                key={ex.type}
                onClick={() => setSelectedType(ex.type)}
                style={{
                  padding: '14px 10px',
                  borderRadius: 16,
                  background: isSelected ? 'var(--bg-card2)' : 'var(--bg-card)',
                  border: isSelected ? `2px solid ${ex.color}` : '1px solid var(--border)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: isSelected ? `0 0 16px ${ex.color}33` : 'none',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 4 }}>{ex.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? ex.color : 'var(--text)' }}>
                  {ex.name}
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)', marginTop: 4 }}>
                  {ex.todayCount.toLocaleString()}
                  <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 500, marginLeft: 2 }}>
                    /{ex.targetCount.toLocaleString()}
                  </span>
                </div>

                {/* Progress Mini Bar */}
                <div style={{
                  height: 4, background: 'rgba(255,255,255,0.1)',
                  borderRadius: 2, marginTop: 8, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', width: `${progress}%`,
                    background: ex.color, borderRadius: 2,
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Exercise Detail Banner & Launch Button */}
        <div style={{
          padding: 20,
          background: 'linear-gradient(145deg, #181826, #12121c)',
          borderRadius: 20,
          border: '1px solid var(--border)',
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: selectedExercise.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, boxShadow: `0 0 16px ${selectedExercise.color}55`,
            }}>
              {selectedExercise.icon}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>
                {selectedExercise.name} AI Camera
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                Mục tiêu hôm nay: {selectedExercise.todayCount}/{selectedExercise.targetCount} {selectedExercise.unit}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
            <div style={{ padding: '10px 8px', background: 'var(--bg-card)', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>Calories ước tính</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#FF6B35' }}>
                {(selectedExercise.todayCount * selectedExercise.caloriesPerRep).toFixed(0)} kcal
              </div>
            </div>
            <div style={{ padding: '10px 8px', background: 'var(--bg-card)', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>Độ chuẩn Form</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#2ED573' }}>94%</div>
            </div>
            <div style={{ padding: '10px 8px', background: 'var(--bg-card)', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>Số buổi tập</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#5352ED' }}>24 buổi</div>
            </div>
          </div>

          {/* Start AI Camera Workout Button */}
          <button
            onClick={() => navigate(`/exercise-camera?type=${selectedType}`)}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 16,
              background: selectedExercise.gradient,
              border: 'none',
              color: '#fff',
              fontWeight: 800,
              fontSize: 15,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: `0 6px 20px ${selectedExercise.color}44`,
            }}
          >
            <Camera size={20} />
            <span>BẮT ĐẦU TẬP (MỞ CAMERA AI)</span>
          </button>
        </div>

        {/* Anti-Cheat & Smart Vision Info */}
        <div style={{
          padding: 16,
          background: 'rgba(46, 213, 115, 0.08)',
          border: '1px solid rgba(46, 213, 115, 0.25)',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          marginBottom: 20,
        }}>
          <ShieldCheck size={24} color="#2ED573" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#2ED573', marginBottom: 2 }}>
              Hệ Thống AI Pose Detection 2.0 & Chống Gian Lận
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5 }}>
              Tự động phân tích 33 điểm khớp trên cơ thể, tính góc gập khuỷu tay/khớp gối để xác nhận Rep chuẩn. Phát hiện video giả mạo & góc quay không hợp lệ.
            </div>
          </div>
        </div>

        {/* Recent Workout History */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Activity size={16} color="var(--primary)" />
              <span>Lịch Sử Bài Tập Gần Đây</span>
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentActivities.map((act) => (
              <div
                key={act.id}
                style={{
                  padding: '12px 16px',
                  background: 'var(--bg-card)',
                  borderRadius: 14,
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(255,107,53,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary)',
                  }}>
                    <Flame size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{act.type}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{act.date} • {act.duration} phút</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#FF6B35' }}>+{act.calories} kcal</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#5352ED' }}>+{act.xp} XP</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
