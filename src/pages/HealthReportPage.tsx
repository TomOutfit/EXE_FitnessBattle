import React, { useState } from 'react';
import { Heart, Activity, Flame, TrendingUp, CheckCircle, AlertTriangle, BarChart2 } from 'lucide-react';
import { useUser } from '../context/UserContext';

const HR_ZONES = [
  { zone: 1, label: 'Nghỉ ngơi', range: '50-60%', color: '#4285f4', desc: 'Nhịp tim khi nghỉ, không tập' },
  { zone: 2, label: 'Khởi động', range: '60-70%', color: '#2ed573', desc: 'Làm nóng cơ thể, đốt calories nhẹ' },
  { zone: 3, label: 'Aerobic', range: '70-80%', color: '#ffd700', desc: 'Zone tốt cho sức bền, đốt mỡ hiệu quả' },
  { zone: 4, label: 'Anaerobic', range: '80-90%', color: '#ff6b35', desc: 'Tăng sức mạnh, cần nghỉ ngắn' },
  { zone: 5, label: 'Tối đa', range: '90-100%', color: '#ff4757', desc: 'Cực độ, chỉ tập ngắn, có nguy hiểm' },
];

const HEALTH_TIPS = [
  { zone: 1, tip: 'Nghỉ ngơi đầy đủ. Ngủ 7-8 tiếng/đêm giúp cơ bắp phục hồi tốt hơn.' },
  { zone: 2, tip: 'Khởi động 5-10 phút trước mỗi buổi tập để tránh chấn thương.' },
  { zone: 3, tip: 'Tập trung giữ nhịp tim Zone 3 khoảng 20-30 phút để đốt mỡ hiệu quả nhất.' },
  { zone: 4, tip: 'Zone 4 là nơi cải thiện VO2max. Tập 2-3 lần/tuần, mỗi lần 10-15 phút.' },
  { zone: 5, tip: '⚠️ Zone 5 chỉ dành cho vận động viên. Không tập quá 2-3 phút liên tục.' },
];

export const HealthReportPage: React.FC = () => {
  const { user } = useUser();
  const [selectedZone, setSelectedZone] = useState<number | null>(3);

  const weeklyMinutes = user.stats.weeklyMinutes;
  const weeklyCalories = user.stats.weeklyCalories;
  const avgHR = user.stats.avgHeartRate;
  const totalCalories = weeklyCalories.reduce((a, b) => a + b, 0);
  const totalMinutes = weeklyMinutes.reduce((a, b) => a + b, 0);

  // VO2max estimation based on weekly activity
  const vo2max = Math.round(35 + (user.level * 0.8) + (user.streak * 0.3) + (totalMinutes / 60));
  const vo2maxLabel = vo2max < 40 ? 'Yếu' : vo2max < 50 ? 'Trung bình' : vo2max < 55 ? 'Khá' : vo2max < 60 ? 'Tốt' : 'Xuất sắc';
  const vo2maxColor = vo2max < 40 ? '#ff4757' : vo2max < 50 ? '#ff6b35' : vo2max < 55 ? '#ffd700' : vo2max < 60 ? '#2ed573' : '#5352ed';

  // Health score
  const activityScore = Math.min(100, Math.round((totalMinutes / 300) * 100));
  const streakScore = Math.min(100, user.streak * 7);
  const battleScore = Math.min(100, Math.round((user.winCount / (user.winCount + user.loseCount + 1)) * 100));
  const healthScore = Math.round((activityScore * 0.4 + streakScore * 0.3 + battleScore * 0.3));
  const healthLabel = healthScore < 40 ? 'Cần cải thiện' : healthScore < 60 ? 'Khá' : healthScore < 80 ? 'Tốt' : 'Xuất sắc';

  const maxCalories = Math.max(...weeklyCalories, 1);
  const maxMinutes = Math.max(...weeklyMinutes, 1);
  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div style={{ padding: '0 0 100px' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 0', background: 'linear-gradient(180deg, #14141e, var(--bg))', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <BarChart2 size={22} color="var(--primary)" />
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>Báo cáo sức khỏe</h1>
            <p style={{ fontSize: 11, color: 'var(--text3)' }}>Phân tích chi tiết VO2max, HR zones, Calories</p>
          </div>
        </div>

        {/* Health Score Hero */}
        <div style={{ padding: '20px', background: 'linear-gradient(145deg, rgba(255,107,53,0.12), rgba(83,82,237,0.08))', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Score Circle */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <svg width="90" height="90" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r="38" fill="none" stroke="var(--bg4)" strokeWidth="8" />
                <circle cx="45" cy="45" r="38" fill="none"
                  stroke={healthScore < 40 ? '#ff4757' : healthScore < 60 ? '#ff6b35' : healthScore < 80 ? '#ffd700' : '#2ed573'}
                  strokeWidth="8"
                  strokeDasharray={`${(healthScore / 100) * 238.76} 238.76`}
                  strokeLinecap="round"
                  transform="rotate(-90 45 45)"
                  style={{ transition: 'stroke-dasharray 1s ease-out' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: healthScore < 40 ? '#ff4757' : healthScore < 60 ? '#ff6b35' : healthScore < 80 ? '#ffd700' : '#2ed573' }}>{healthScore}</span>
                <span style={{ fontSize: 8, color: 'var(--text3)' }}>/100</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Điểm sức khỏe tổng quát</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: healthScore < 40 ? '#ff4757' : healthScore < 60 ? '#ff6b35' : healthScore < 80 ? '#ffd700' : '#2ed573', marginBottom: 6 }}>
                {healthLabel}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                🎯 Hoạt động {activityScore}% • 🔥 Streak {streakScore}% • ⚔️ Battle {battleScore}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* VO2max */}
        <div style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Activity size={16} color={vo2maxColor} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>VO2max ước tính</h3>
            <div style={{ marginLeft: 'auto', padding: '2px 10px', background: `${vo2maxColor}18`, border: `1px solid ${vo2maxColor}40`, borderRadius: 20 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: vo2maxColor }}>{vo2maxLabel}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: vo2maxColor }}>{vo2max}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>ml/kg/phút</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                {vo2max < 40 ? 'Người ít vận động' : vo2max < 50 ? 'Người tập thể dục trung bình' : vo2max < 55 ? 'Người tập thể dục khá' : vo2max < 60 ? 'VĐV nghiệp dư' : 'VĐV chuyên nghiệp'}
              </div>
            </div>
          </div>

          {/* VO2max Progress Bar */}
          <div style={{ height: 8, background: 'var(--bg4)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(vo2max / 70) * 100}%`, background: `linear-gradient(90deg, ${vo2maxColor}, ${vo2maxColor}88)`, borderRadius: 4, transition: 'width 1s ease-out', boxShadow: `0 0 8px ${vo2maxColor}60` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 9, color: 'var(--text4)' }}>Yếu (30)</span>
            <span style={{ fontSize: 9, color: 'var(--text4)' }}>Tốt (55)</span>
            <span style={{ fontSize: 9, color: 'var(--text4)' }}>Xuất sắc (70)</span>
          </div>
        </div>

        {/* Heart Rate Zones */}
        <div style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Heart size={16} color="#ff4757" />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Nhịp tim theo Zone</h3>
            <div style={{ marginLeft: 'auto', padding: '2px 10px', background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 20 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#ff4757' }}>BPM {avgHR}</span>
            </div>
          </div>

          {/* Zone Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {HR_ZONES.map(z => {
              const isSelected = selectedZone === z.zone;
              return (
                <div key={z.zone} onClick={() => setSelectedZone(isSelected ? null : z.zone)} style={{
                  padding: '10px 12px', background: isSelected ? `${z.color}12` : 'var(--bg-card2)',
                  border: `1.5px solid ${isSelected ? z.color : 'transparent'}`, borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, background: `${z.color}22`, border: `1px solid ${z.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: z.color }}>
                      {z.zone}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: isSelected ? z.color : 'var(--text)' }}>{z.label}</span>
                        <span style={{ fontSize: 10, color: 'var(--text3)' }}>{z.range} MHR</span>
                      </div>
                      {isSelected && (
                        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, animation: 'fadeInUp 0.2s ease-out' }}>{z.desc}</div>
                      )}
                    </div>
                    {isSelected && <CheckCircle size={14} color={z.color} />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tip based on selected zone */}
          {selectedZone && (
            <div style={{ marginTop: 10, padding: '10px 12px', background: 'rgba(46,213,115,0.06)', border: '1px solid rgba(46,213,115,0.15)', borderRadius: 10, animation: 'fadeInUp 0.2s ease-out' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <TrendingUp size={12} color="#2ed573" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#2ed573' }}>Gợi ý từ AI Coach</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text3)', margin: 0, lineHeight: 1.5 }}>
                {HEALTH_TIPS.find(t => t.zone === selectedZone)?.tip}
              </p>
            </div>
          )}
        </div>

        {/* Weekly Calories */}
        <div style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Flame size={16} color="#ff6b35" />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Calories đốt theo tuần</h3>
            <div style={{ marginLeft: 'auto', fontSize: 16, fontWeight: 800, color: '#ff6b35' }}>{totalCalories.toLocaleString()} kcal</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
            {weeklyCalories.map((cal, i) => {
              const pct = maxCalories > 0 ? (cal / maxCalories) * 100 : 0;
              const isToday = i === weeklyCalories.length - 1;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: '100%', height: `${Math.max(pct, 8)}%`, background: isToday ? 'var(--gradient-primary)' : 'rgba(255,107,53,0.25)', borderRadius: 4, transition: 'height 0.5s ease-out', minHeight: 6 }} />
                  <span style={{ fontSize: 9, color: isToday ? 'var(--primary)' : 'var(--text4)', fontWeight: isToday ? 700 : 400 }}>{days[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Activity */}
        <div style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <TrendingUp size={16} color="#5352ed" />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Phút tập theo tuần</h3>
            <div style={{ marginLeft: 'auto', fontSize: 16, fontWeight: 800, color: '#5352ed' }}>{totalMinutes} phút</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
            {weeklyMinutes.map((min, i) => {
              const pct = maxMinutes > 0 ? (min / maxMinutes) * 100 : 0;
              const isToday = i === weeklyMinutes.length - 1;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: '100%', height: `${Math.max(pct, 8)}%`, background: isToday ? 'linear-gradient(180deg, #5352ed, #7c7cf0)' : 'rgba(83,82,237,0.25)', borderRadius: 4, transition: 'height 0.5s ease-out', minHeight: 6 }} />
                  <span style={{ fontSize: 9, color: isToday ? '#5352ed' : 'var(--text4)', fontWeight: isToday ? 700 : 400 }}>{days[i]}</span>
                </div>
              );
            })}
          </div>

          {/* Recommendation */}
          <div style={{ marginTop: 10, padding: '10px 12px', background: totalMinutes < 150 ? 'rgba(255,107,53,0.06)' : 'rgba(46,213,115,0.06)', border: `1px solid ${totalMinutes < 150 ? 'rgba(255,107,53,0.15)' : 'rgba(46,213,115,0.15)'}`, borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              {totalMinutes < 150 ? <AlertTriangle size={12} color="#ff6b35" /> : <CheckCircle size={12} color="#2ed573" />}
              <span style={{ fontSize: 11, fontWeight: 700, color: totalMinutes < 150 ? '#ff6b35' : '#2ed573' }}>
                {totalMinutes < 150 ? '⚠️ Cần tập thêm' : '✓ Đạt mục tiêu tuần'}
              </span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text3)', margin: 0, lineHeight: 1.5 }}>
              {totalMinutes < 150
                ? `Bạn mới tập ${totalMinutes} phút. Mục tiêu tuần là 150 phút. Cần thêm ${150 - totalMinutes} phút nữa để đạt chuẩn WHO.`
                : `Bạn đã tập ${totalMinutes} phút, vượt mục tiêu WHO 150 phút/tuần! ${user.streak > 0 ? `Tiếp tục duy trì streak ${user.streak} ngày!` : 'Bắt đầu streak hôm nay!'}`}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { icon: '❤️', value: avgHR, unit: 'BPM', label: 'Nhịp tim TB', color: '#ff4757' },
            { icon: '🔥', value: totalCalories, unit: 'kcal', label: 'Calories tuần', color: '#ff6b35' },
            { icon: '⏱️', value: totalMinutes, unit: 'phút', label: 'Tổng tập', color: '#5352ed' },
          ].map(s => (
            <div key={s.label} style={{ padding: '14px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: 'var(--text4)' }}>{s.unit}</div>
              <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
