import React, { useState } from 'react';
import { Brain, Clock, ChevronRight, Sparkles, Flame, Target, Dumbbell, Activity } from 'lucide-react';
import { useUser } from '../context/UserContext';

const EXERCISE_PLANS = [
  {
    day: 'Hôm nay',
    emoji: '🏋️',
    title: 'Upper Body & Core',
    duration: 45,
    exercises: [
      { name: 'Push-up', sets: 4, reps: '15 lần', rest: '60s', tip: 'Giữ core cứng, hít sâu ở đỉnh' },
      { name: 'Plank', sets: 3, reps: '45 giây', rest: '30s', tip: 'Hông không võng, mắt nhìn sàn' },
      { name: 'Dumbbell Row', sets: 3, reps: '12 lần/mỗi tay', rest: '45s', tip: 'Kéo về đến hông, siết lưng' },
      { name: 'Squat', sets: 4, reps: '20 lần', rest: '60s', tip: 'Gối hướng ngón chân, lưng thẳng' },
    ],
    calories: 320,
    intensity: 'Trung bình',
    color: '#ff6b35',
  },
  {
    day: 'Ngày mai',
    emoji: '🏃',
    title: 'Cardio & HIIT',
    duration: 30,
    exercises: [
      { name: 'Jumping Jacks', sets: 4, reps: '1 phút', rest: '20s', tip: 'Tay vỗ tai, nhảy cao' },
      { name: 'Burpee', sets: 3, reps: '10 lần', rest: '45s', tip: 'Ngực chạm sàn ở burpee' },
      { name: 'Mountain Climber', sets: 3, reps: '30 giây', rest: '30s', tip: 'Mông không nhô cao' },
      { name: 'High Knees', sets: 3, reps: '30 giây', rest: '30s', tip: 'Đầu gối lên ngang hông' },
    ],
    calories: 280,
    intensity: 'Cao',
    color: '#ff4757',
  },
  {
    day: 'Ngày kia',
    emoji: '🧘',
    title: 'Recovery & Flexibility',
    duration: 25,
    exercises: [
      { name: 'Yoga Flow', sets: 1, reps: '15 phút', rest: '—', tip: 'Thở đều, tập trung vào cảm giác cơ thể' },
      { name: 'Foam Rolling', sets: 1, reps: '10 phút', rest: '—', tip: 'Lăn chậm, dừng ở điểm đau' },
    ],
    calories: 120,
    intensity: 'Nhẹ',
    color: '#2ed573',
  },
];

const AI_TIPS = [
  {
    icon: '💡',
    title: 'Tập khi nào tốt nhất?',
    content: 'Theo dữ liệu của bạn, buổi sáng (7-9h) là thời điểm nhịp tim nghỉ thấp nhất → cơ thể sẵn sàng cho HIIT. Tối (19-21h) tốt cho Strength Training.',
    tag: 'Thời gian',
    color: '#ffd700',
  },
  {
    icon: '🍎',
    title: 'Nutrition tip hôm nay',
    content: 'Sau buổi tập Upper Body, ăn protein trong 30 phút: 2 trứng + 1 quả chuối. Carbs phục hồi + protein xây cơ. Tránh ăn mỡ trong 2h sau tập.',
    tag: 'Dinh dưỡng',
    color: '#2ed573',
  },
  {
    icon: '😴',
    title: 'Giấc ngủ cần cải thiện',
    content: 'Bạn ngủ trung bình 5h42h. Mục tiêu: 7-8h. Thiếu ngủ giảm 30% hiệu quả tập luyện. Thử: không xem màn hình 30 phút trước khi ngủ.',
    tag: 'Phục hồi',
    color: '#5352ed',
  },
  {
    icon: '🎯',
    title: 'Mục tiêu tuần này',
    content: `Bạn đã đạt ${67}% mục tiêu tuần (90 phút / 150 phút). Còn ${63} phút. Hoàn thành bài Upper Body hôm nay → đạt 100%!`,
    tag: 'Mục tiêu',
    color: '#ff6b35',
  },
];

const QUICK_EXERCISES = [
  { emoji: '🏋️', label: 'Gym', count: 12 },
  { emoji: '🏃', label: 'Chạy bộ', count: 8 },
  { emoji: '⚡', label: 'HIIT', count: 6 },
  { emoji: '🚴', label: 'Đạp xe', count: 5 },
  { emoji: '🧘', label: 'Yoga', count: 4 },
  { emoji: '🏊', label: 'Bơi lội', count: 3 },
];

export const AICoachPage: React.FC = () => {
  const { user } = useUser();
  const [expandedDay, setExpandedDay] = useState<number>(0);
  const [activeTip, setActiveTip] = useState(0);

  const weeklyMinutes = user.stats.weeklyMinutes.reduce((a, b) => a + b, 0);
  const weeklyGoal = 150;
  const goalProgress = Math.min(100, Math.round((weeklyMinutes / weeklyGoal) * 100));

  return (
    <div style={{ padding: '0 0 100px' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 0', background: 'linear-gradient(180deg, #14141e, var(--bg))', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Brain size={22} color="#5352ed" />
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>AI Coach</h1>
            <p style={{ fontSize: 11, color: 'var(--text3)' }}>Kế hoạch tập luyện cá nhân hóa</p>
          </div>
        </div>

        {/* Weekly Progress */}
        <div style={{ padding: '14px 16px', background: 'rgba(83,82,237,0.08)', border: '1px solid rgba(83,82,237,0.2)', borderRadius: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Target size={14} color="#5352ed" />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Mục tiêu tuần</span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>{weeklyMinutes} / {weeklyGoal} phút</span>
          </div>
          <div style={{ height: 8, background: 'var(--bg4)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${goalProgress}%`, background: 'var(--gradient-secondary)', borderRadius: 4, transition: 'width 1s ease-out', boxShadow: '0 0 8px rgba(83,82,237,0.4)' }} />
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* AI Coach Avatar */}
        <div style={{ padding: '16px', background: 'linear-gradient(145deg, #1a1020, #14141e)', border: '1px solid rgba(83,82,237,0.2)', borderRadius: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #5352ed, #7c7cf0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, boxShadow: '0 0 20px rgba(83,82,237,0.4)' }}>
              🤖
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>Coach AI</div>
              <div style={{ fontSize: 11, color: '#5352ed', fontWeight: 600 }}>Online 24/7 • Đã huấn luyện {user.winCount + user.loseCount + 1} trận</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2ed573', boxShadow: '0 0 6px #2ed573', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 11, color: '#2ed573', fontWeight: 600 }}>Active</span>
            </div>
          </div>

          {/* Quick exercise count */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {QUICK_EXERCISES.map(ex => (
              <div key={ex.label} style={{ padding: '4px 10px', background: 'rgba(83,82,237,0.08)', border: '1px solid rgba(83,82,237,0.15)', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 14 }}>{ex.emoji}</span>
                <span style={{ fontSize: 10, color: 'var(--text3)' }}>{ex.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Plan */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
            📋 Kế hoạch tuần này
          </h3>

          {EXERCISE_PLANS.map((plan, i) => {
            const isExpanded = expandedDay === i;
            return (
              <div key={i} style={{
                marginBottom: 8, background: 'var(--bg-card)', border: `1px solid ${isExpanded ? plan.color + '60' : 'var(--border)'}`,
                borderRadius: 16, overflow: 'hidden', transition: 'all 0.2s',
              }}>
                {/* Day Header */}
                <button onClick={() => setExpandedDay(isExpanded ? -1 : i)} style={{
                  width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                  background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: `${plan.color}15`, border: `1px solid ${plan.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                    {plan.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                      {plan.day} — {plan.title}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                        <Clock size={10} style={{ verticalAlign: 'middle', marginRight: 2 }} />
                        {plan.duration} phút
                      </span>
                      <span style={{ fontSize: 11, color: plan.color, fontWeight: 600 }}>• {plan.intensity}</span>
                      <span style={{ fontSize: 11, color: '#ff6b35' }}>• 🔥 {plan.calories} kcal</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--text4)' }}>{plan.exercises.length} bài</span>
                    <ChevronRight size={16} color="var(--text4)" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>
                </button>

                {/* Expanded exercises */}
                {isExpanded && (
                  <div style={{ borderTop: `1px solid ${plan.color}30`, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8, animation: 'fadeInUp 0.3s ease-out' }}>
                    {plan.exercises.map((ex, j) => (
                      <div key={j} style={{ padding: '10px 12px', background: 'var(--bg-card2)', borderRadius: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{ex.name}</span>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <span style={{ fontSize: 10, color: 'var(--text3)', padding: '2px 8px', background: 'var(--bg3)', borderRadius: 8 }}>{ex.sets} sets</span>
                            <span style={{ fontSize: 10, color: 'var(--text3)', padding: '2px 8px', background: 'var(--bg3)', borderRadius: 8 }}>{ex.reps}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Sparkles size={10} color="#5352ed" />
                          <span style={{ fontSize: 11, color: '#5352ed' }}>{ex.tip}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* AI Tips Carousel */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
            💡 Gợi ý từ AI Coach
          </h3>

          {/* Carousel */}
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16 }}>
            <div style={{ display: 'flex', transition: `transform 0.3s ease`, transform: `translateX(0px)` }}>
              {AI_TIPS.map((tip, i) => (
                <div key={i} style={{ minWidth: '100%', padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ fontSize: 28 }}>{tip.icon}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{tip.title}</div>
                      <div style={{ fontSize: 10, padding: '2px 8px', background: `${tip.color}18`, border: `1px solid ${tip.color}30`, borderRadius: 10, display: 'inline-block' }}>
                        <span style={{ color: tip.color, fontWeight: 600 }}>{tip.tag}</span>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6, margin: 0 }}>{tip.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
            {AI_TIPS.map((_, i) => (
              <button key={i} onClick={() => setActiveTip(i)} style={{
                width: 6, height: 6, borderRadius: '50%', border: 'none',
                background: activeTip === i ? 'var(--primary)' : 'var(--border)',
                cursor: 'pointer', transition: 'all 0.2s',
              }} />
            ))}
          </div>
        </div>

        {/* Stats summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { icon: <Dumbbell size={16} color="#ff6b35" />, value: `${user.level}`, label: 'Level hiện tại', color: '#ff6b35' },
            { icon: <Flame size={16} color="#ff4757" />, value: `${user.streak}`, label: 'Streak ngày', color: '#ff4757' },
            { icon: <Activity size={16} color="#2ed573" />, value: `${weeklyMinutes}`, label: 'Phút tuần này', color: '#2ed573' },
          ].map(s => (
            <div key={s.label} style={{ padding: '14px 8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, textAlign: 'center' }}>
              <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color, marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: 'var(--text3)' }}>{s.label}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
