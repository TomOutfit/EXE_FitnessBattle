import React, { useState } from 'react';
import { Check, Brain, Zap, Crown, Shield, BarChart2, Heart, Swords } from 'lucide-react';
import { Button } from '../components/ui';
import { useUser } from '../context/UserContext';

const COMPETITORS = [
  {
    name: 'Strava',
    logo: '🏃',
    color: '#fc4c02',
    pros: ['Tracking GPS tốt', 'Cộng đồng lớn', 'Auto-upload từ thiết bị'],
    cons: ['Không có battle', 'Không có Anti-Cheat', 'Không gamification', 'Chỉ tracking thụ động'],
    verdict: 'Tracking — không có động lực cạnh tranh',
  },
  {
    name: 'Google Fit',
    logo: '📱',
    color: '#4285f4',
    pros: ['Miễn phí', 'Tích hợp Google ecosystem', 'Auto tracking'],
    cons: ['Không có battle', 'Không gamification', 'Không AI Coach', 'Giao diện nhàm chán'],
    verdict: 'OS Tool — không phải app tập luyện',
  },
  {
    name: 'Apple Fitness+',
    logo: '🍎',
    color: '#ff375f',
    pros: ['Video hướng dẫn', 'Apple Watch integration', 'UI đẹp'],
    cons: ['Cần Apple Watch', 'Không có battle', 'Không Anti-Cheat', 'Chỉ video workout', 'Ít cộng đồng'],
    verdict: 'Video Workout — không có tính năng xã hội',
  },
];

const PREMIUM_FEATURES = [
  {
    icon: Brain,
    color: '#5352ed',
    title: 'AI Coach cá nhân 24/7',
    desc: 'Kế hoạch tập luyện AI được tạo riêng cho bạn, cập nhật theo tiến độ thực tế. Strava/GFit không có AI Coach.',
    free: false,
    badge: 'CHỈ FB CÓ',
  },
  {
    icon: BarChart2,
    color: '#ff6b35',
    title: 'Báo cáo sức khỏe chi tiết',
    desc: 'Phân tích nhịp tim, VO2max, HR zones, calories, và xu hướng thể lực mỗi tuần. Trực quan hơn Strava 10 lần.',
    free: false,
    badge: 'VS STRAVA',
  },
  {
    icon: Swords,
    color: '#ffd700',
    title: 'Battle 1v1 + Anti-Cheat AI',
    desc: 'Thách đấu thật với GPS + Micro xác minh. Không app nào có tính năng này. Đây là DNA của Fitness Battle.',
    free: false,
    badge: 'ĐỘC QUYỀN',
  },
  {
    icon: Heart,
    color: '#ff4757',
    title: 'Theo dõi nhịp tim real-time',
    desc: 'Đồng hồ nhịp tim tích hợp trong trận đấu, cảnh báo vượt ngưỡng an toàn, lưu lịch sử HR zones.',
    free: false,
  },
  {
    icon: Zap,
    color: '#ffd700',
    title: 'Trận đấu ưu tiên',
    desc: 'Được ghép với đối thủ cùng trình độ nhanh hơn, không phải chờ queue. Priority matchmaking.',
    free: false,
  },
  {
    icon: Shield,
    color: '#2ed573',
    title: 'Không quảng cáo',
    desc: 'Trải nghiệm app trọn vẹn, không bị gián đoạn bởi bất kỳ quảng cáo nào. Tập trung 100%.',
    free: false,
  },
];

export const BattlePassPage: React.FC = () => {
  const { user, upgradeToVIP } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');
  const [activeTab, setActiveTab] = useState<'why' | 'compare' | 'features'>('why');

  const monthlyPrice = 29000;
  const yearlyPrice = 199000;
  const price = billingCycle === 'month' ? monthlyPrice : yearlyPrice;
  const saving = Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100);

  return (
    <div style={{ padding: '0 0 100px' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 0', background: 'linear-gradient(180deg, #14141e, var(--bg))', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', marginBottom: 4 }}>
            ⭐ <span style={{ background: 'linear-gradient(135deg, #ff6b35, #ff4757)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Premium</span>
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text3)' }}>
            Nâng cao trải nghiệm tập luyện với AI Coach & báo cáo sức khỏe
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
          {[
            { key: 'why', label: 'Tại sao chọn FB?' },
            { key: 'compare', label: 'So sánh' },
            { key: 'features', label: 'Tính năng' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{
              flex: 1, padding: '8px 6px', borderRadius: 10, fontSize: 11, fontWeight: 600,
              background: activeTab === tab.key ? 'var(--gradient-primary)' : 'transparent',
              border: 'none', color: activeTab === tab.key ? '#fff' : 'var(--text3)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 20px' }}>

        {/* ── TAB: WHY FB ── */}
        {activeTab === 'why' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Core USP */}
            <div style={{ padding: '20px', background: 'linear-gradient(145deg, #1a1020, #14141e)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 20, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,71,87,0.15), transparent)', pointerEvents: 'none' }} />
              <div style={{ fontSize: 44, marginBottom: 10 }}>⚔️</div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', marginBottom: 8 }}>
                Fitness Battle khác gì Strava?
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6, marginBottom: 16 }}>
                Strava, Google Fit, Apple Fitness chỉ <strong style={{ color: 'var(--text)' }}>theo dõi</strong> hoạt động của bạn. <strong style={{ color: 'var(--primary)' }}>Fitness Battle biến tập luyện thành cuộc chơi</strong> — có đối thủ, có thưởng, có Anti-Cheat AI xác minh tính công bằng.
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                {['🏆 Thắng là có thật', '🤖 AI Coach 24/7', '🛡️ Anti-Cheat GPS', '💪 Động lực cạnh tranh'].map(tag => (
                  <div key={tag} style={{ padding: '5px 12px', background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 20, fontSize: 11, fontWeight: 600, color: 'var(--primary)' }}>
                    {tag}
                  </div>
                ))}
              </div>
            </div>

            {/* Anti-Cheat highlight */}
            <div style={{ padding: '16px', background: 'rgba(46,213,115,0.06)', border: '1px solid rgba(46,213,115,0.2)', borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Shield size={18} color="#2ed573" />
                <span style={{ fontSize: 13, fontWeight: 800, color: '#2ed573' }}>Anti-Cheat AI — Không app nào có</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>
                GPS + Micro xác minh trong 60 giây thi đấu. Phát hiện gian lận → trận hủy ngay. Điểm số là <strong style={{ color: 'var(--text)' }}>thật 100%</strong>. Đây là lý do Premium xứng đáng — vì bạn đang thi đấu với người thật, không phải bot.
              </p>
            </div>

            {/* Gamification highlight */}
            <div style={{ padding: '16px', background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Swords size={18} color="#ffd700" />
                <span style={{ fontSize: 13, fontWeight: 800, color: '#ffd700' }}>Battle 1v1 — Không chỉ tracking</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>
                Strava chỉ cho bạn biết <em>đã chạy bao xa</em>. Fitness Battle cho bạn biết <strong style={{ color: 'var(--text)' }}>bạn chạy nhanh hơn ai</strong>. Cảm giác thắng trận là động lực mạnh hơn bất kỳ notification nào.
              </p>
            </div>

            {/* CTA */}
            {!user.isVIP && (
              <button onClick={() => setShowModal(true)} style={{ padding: '16px', background: 'var(--gradient-primary)', border: 'none', borderRadius: 16, fontSize: 15, fontWeight: 800, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 20px rgba(255,107,53,0.4)' }}>
                <Crown size={18} /> Nâng cấp Premium — Từ 29K/tháng
              </button>
            )}
            {user.isVIP && (
              <div style={{ padding: '14px', background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 14, textAlign: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#ffd700' }}>👑 Bạn đã là Premium Member</span>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: COMPARE ── */}
        {activeTab === 'compare' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div style={{ textAlign: 'center', padding: '16px 0 4px' }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)', marginBottom: 6 }}>So sánh vs Đối thủ</h3>
              <p style={{ fontSize: 12, color: 'var(--text3)' }}>Strava, Google Fit, Apple Fitness+ — Fitness Battle thắng ở đâu?</p>
            </div>

            {/* Comparison Table */}
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-card2)' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>Tính năng</th>
                    {[
                      { name: 'FB', color: '#ff6b35', badge: '👑' },
                      { name: 'Strava', color: '#fc4c02', badge: '' },
                      { name: 'GFit', color: '#4285f4', badge: '' },
                      { name: 'AF+', color: '#ff375f', badge: '' },
                    ].map(h => (
                      <th key={h.name} style={{ padding: '10px 6px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: h.color }}>
                        {h.badge} {h.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feat: 'Battle 1v1', fb: true, strava: false, gfit: false, af: false, highlight: true },
                    { feat: 'Anti-Cheat AI', fb: true, strava: false, gfit: false, af: false, highlight: true },
                    { feat: 'AI Coach', fb: true, strava: false, gfit: false, af: false, highlight: true },
                    { feat: 'Gamification', fb: true, strava: false, gfit: false, af: false, highlight: true },
                    { feat: 'HR Real-time', fb: true, strava: false, gfit: true, af: true, highlight: false },
                    { feat: 'VO2max Report', fb: true, strava: true, gfit: true, af: true, highlight: false },
                    { feat: 'GPS Tracking', fb: true, strava: true, gfit: true, af: false, highlight: false },
                    { feat: 'Cộng đồng', fb: true, strava: true, gfit: false, af: false, highlight: false },
                    { feat: 'Miễn phí', fb: false, strava: true, gfit: true, af: false, highlight: false },
                  ].map((row, i) => (
                    <tr key={i} style={{ background: row.highlight && i % 2 === 0 ? 'rgba(255,107,53,0.04)' : i % 2 === 0 ? 'var(--bg-card2)' : 'transparent' }}>
                      <td style={{ padding: '10px 12px', fontSize: 11, color: row.highlight ? 'var(--primary)' : 'var(--text2)', fontWeight: row.highlight ? 700 : 500 }}>
                        {row.feat}
                        {row.highlight && <span style={{ marginLeft: 4, fontSize: 9, color: '#ff6b35' }}>★</span>}
                      </td>
                      {[row.fb, row.strava, row.gfit, row.af].map((val, j) => (
                        <td key={j} style={{ padding: '10px 6px', textAlign: 'center' }}>
                          {val ? (
                            <span style={{ fontSize: 14 }}>✅</span>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--text4)' }}>—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Competitor cards */}
            {COMPETITORS.map(comp => (
              <div key={comp.name} style={{ padding: '14px 16px', background: 'var(--bg-card)', border: `1px solid ${comp.color}30`, borderRadius: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: 20 }}>{comp.logo}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: comp.color }}>{comp.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>{comp.verdict}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                  {comp.pros.slice(0, 2).map(p => (
                    <div key={p} style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(46,213,115,0.08)', border: '1px solid rgba(46,213,115,0.15)', borderRadius: 10, color: '#2ed573' }}>✓ {p}</div>
                  ))}
                  {comp.cons.slice(0, 2).map(c => (
                    <div key={c} style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(255,71,87,0.06)', border: '1px solid rgba(255,71,87,0.12)', borderRadius: 10, color: '#ff4757' }}>✗ {c}</div>
                  ))}
                </div>
              </div>
            ))}

            {!user.isVIP && (
              <button onClick={() => setShowModal(true)} style={{ padding: '16px', background: 'var(--gradient-primary)', border: 'none', borderRadius: 16, fontSize: 15, fontWeight: 800, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Crown size={18} /> Chọn Fitness Battle — 29K/tháng
              </button>
            )}
          </div>
        )}

        {/* ── TAB: FEATURES ── */}
        {activeTab === 'features' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Premium Hero */}
            <div style={{ padding: '20px 16px', background: 'linear-gradient(145deg, #1a1020, #14141e)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 44, marginBottom: 8 }}>👑</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)', marginBottom: 4 }}>Premium Member</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>Mở khóa toàn bộ tính năng cao cấp</div>
              {user.isVIP ? (
                <div style={{ padding: '8px 16px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Check size={14} color="#ffd700" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#ffd700' }}>Đã kích hoạt Premium</span>
                </div>
              ) : (
                <Button variant="primary" size="md" onClick={() => setShowModal(true)}>
                  <Crown size={14} /> Nâng cấp
                </Button>
              )}
            </div>

            {/* Feature List */}
            {PREMIUM_FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} style={{
                  padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16,
                  animation: `fadeInUp 0.4s ease-out ${i * 0.06}s both`,
                  position: 'relative', overflow: 'hidden',
                }}>
                  {f.badge && (
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '2px 10px', background: 'rgba(255,107,53,0.15)', borderBottom: '1px solid rgba(255,107,53,0.2)', borderLeft: '1px solid rgba(255,107,53,0.2)', borderRadius: '0 14px 0 12px' }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--primary)' }}>{f.badge}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${f.color}18`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={18} color={f.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{f.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>{f.desc}</div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Testimonials */}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Người dùng nói gì</h3>
              {[
                { name: 'Minh Đạt', avatar: '🧑‍💻', text: 'Trước dùng Strava. Chuyển sang FB vì Battle 1v1 có Anti-Cheat — thắng thật, thua thật. Động lực khác hẳn.', plan: 'Premium 1 năm', rating: 5 },
                { name: 'Thu Hà', avatar: '👩‍💼', text: 'AI Coach FB tạo kế hoạch gym cho mình mỗi tuần. Strava không có tính năng này. Worth it!', plan: 'Premium 1 tháng', rating: 5 },
                { name: 'Hoàng Nam', avatar: '🏃', text: 'Report VO2max + HR zones của FB trực quan hơn Strava. Nhìn là hiểu. Không thể quay lại.', plan: 'Premium 1 năm', rating: 5 },
              ].map((t, i) => (
                <div key={i} style={{ padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{t.avatar}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{t.name}</div>
                      <div style={{ fontSize: 10, color: '#ffd700' }}>{'⭐'.repeat(t.rating)}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', padding: '2px 8px', background: 'rgba(83,82,237,0.1)', border: '1px solid rgba(83,82,237,0.2)', borderRadius: 8 }}>
                      <span style={{ fontSize: 9, color: '#5352ed', fontWeight: 600 }}>{t.plan}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5, margin: 0 }}>"{t.text}"</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            {!user.isVIP && (
              <div style={{ padding: '18px', background: 'linear-gradient(145deg, rgba(255,71,87,0.1), rgba(255,107,53,0.05))', border: '1px solid rgba(255,71,87,0.15)', borderRadius: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 18, marginBottom: 6 }}>👑</div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Nâng cấp Premium hôm nay</h3>
                <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 14 }}>Bắt đầu từ 29K/tháng — Hủy bất kỳ lúc nào</p>
                <Button variant="primary" size="lg" fullWidth onClick={() => setShowModal(true)}>
                  <Crown size={16} /> Nâng cấp ngay — 29K/tháng
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Upgrade Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowModal(false)}>
          <div style={{ width: '100%', maxWidth: 480, background: 'var(--bg-card)', borderRadius: '24px 24px 0 0', padding: 28, animation: 'slideUp 0.3s ease-out' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #ff4757, #ff6b81)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Crown size={24} color="#fff" />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)', marginBottom: 2 }}>Nâng cấp Premium</h3>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>AI Coach + Anti-Cheat + Health Report</div>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>

            {/* Billing cycle */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <button onClick={() => setBillingCycle('month')} style={{ flex: 1, padding: '14px 10px', borderRadius: 14, background: billingCycle === 'month' ? 'rgba(255,107,53,0.15)' : 'var(--bg3)', border: `2px solid ${billingCycle === 'month' ? 'var(--primary)' : 'var(--border)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: billingCycle === 'month' ? 'var(--primary)' : 'var(--text3)' }}>29K</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>/tháng</div>
              </button>
              <button onClick={() => setBillingCycle('year')} style={{ flex: 1, padding: '14px 10px', borderRadius: 14, background: billingCycle === 'year' ? 'rgba(255,107,53,0.15)' : 'var(--bg3)', border: `2px solid ${billingCycle === 'year' ? 'var(--primary)' : 'var(--border)'}`, cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}>
                {saving > 0 && (
                  <div style={{ position: 'absolute', top: -8, right: 10, padding: '2px 8px', background: '#2ed573', borderRadius: 10, fontSize: 9, fontWeight: 700, color: '#fff' }}>
                    Tiết kiệm {saving}%
                  </div>
                )}
                <div style={{ fontSize: 20, fontWeight: 900, color: billingCycle === 'year' ? 'var(--primary)' : 'var(--text3)' }}>199K</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>/năm</div>
              </button>
            </div>

            {/* Features */}
            <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                '🤖 AI Coach cá nhân 24/7',
                '🛡️ Anti-Cheat AI — Battle thật',
                '📊 Báo cáo sức khỏe VO2max + HR',
                '❤️ Nhịp tim real-time',
                '⚡ Không quảng cáo',
                '💎 Premium badge trên profile',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={14} color="#2ed573" />
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>{item}</span>
                </div>
              ))}
            </div>

            <Button variant="primary" size="lg" fullWidth onClick={() => {
              upgradeToVIP();
              setShowModal(false);
              alert('🎉 Thanh toán thành công!\n\n👑 Tài khoản VIP đã được kích hoạt:\n+ Mở rộng 500 Stamina HP\n+ Khung Rồng Lửa Frame VIP\n+ 100 Ruby Thưởng VIP\n+ Bảo lưu 100% Xu Thưởng không hết hạn');
            }}>
              💳 Thanh toán {price.toLocaleString()}đ
            </Button>
            <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: 'var(--text4)' }}>
              💳 MoMo / ZaloPay / Visa • Hủy bất kỳ lúc nào
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
