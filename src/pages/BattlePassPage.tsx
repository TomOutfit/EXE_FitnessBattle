import React, { useState } from 'react';
import { Check, Brain, Crown, Shield, BarChart2, Heart, Swords } from 'lucide-react';
import { Button } from '../components/ui';
import { useUser } from '../context/UserContext';

const PREMIUM_FEATURES = [
  { icon: Brain, color: '#5352ed', title: 'AI Coach cá nhân 24/7', desc: 'Kế hoạch tập luyện được tạo riêng cho bạn' },
  { icon: BarChart2, color: '#ff6b35', title: 'Báo cáo sức khỏe chi tiết', desc: 'Theo dõi nhịp tim, calories, và xu hướng thể lực' },
  { icon: Swords, color: '#ffd700', title: 'Battle chống gian lận', desc: 'Đảm bảo mọi trận đấu đều công bằng' },
  { icon: Heart, color: '#ff4757', title: 'Theo dõi nhịp tim', desc: 'Giám sát nhịp tim trong thời gian thực' },
  { icon: Shield, color: '#2ed573', title: 'Không quảng cáo', desc: 'Trải nghiệm app trọn vẹn, tập trung 100%' },
];

export const BattlePassPage: React.FC = () => {
  const { user, upgradeToVIP, showToast } = useUser();
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
              <div style={{ fontSize: 44, marginBottom: 10 }}>💪</div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', marginBottom: 8 }}>
                Tại sao chọn Premium?
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6, marginBottom: 16 }}>
                Fitness Battle Premium giúp bạn <strong style={{ color: 'var(--primary)' }}>tập luyện hiệu quả hơn</strong> với AI Coach thông minh, báo cáo sức khỏe chi tiết, và trải nghiệm không quảng cáo.
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                {['🤖 AI Coach 24/7', '📊 Báo cáo sức khỏe', '🛡️ Battle công bằng'].map(tag => (
                  <div key={tag} style={{ padding: '5px 12px', background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 20, fontSize: 11, fontWeight: 600, color: 'var(--primary)' }}>
                    {tag}
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div style={{ padding: '16px', background: 'rgba(46,213,115,0.06)', border: '1px solid rgba(46,213,115,0.2)', borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Shield size={18} color="#2ed573" />
                <span style={{ fontSize: 13, fontWeight: 800, color: '#2ed573' }}>Battle công bằng</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>
                Hệ thống chống gian lận đảm bảo mọi trận đấu đều công bằng. Thắng là thật, thua cũng thật.
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
              <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)', marginBottom: 6 }}>Tính năng Premium</h3>
              <p style={{ fontSize: 12, color: 'var(--text3)' }}>So sánh giữa tài khoản Free và Premium</p>
            </div>

            {/* Feature Comparison */}
            {[
              { feat: 'Battle 1v1', free: true, prem: true },
              { feat: 'AI Coach cá nhân', free: false, prem: true },
              { feat: 'Báo cáo sức khỏe chi tiết', free: false, prem: true },
              { feat: 'Battle chống gian lận', free: false, prem: true },
              { feat: 'Thể lực tối đa', free: '100 HP', prem: '500 HP' },
              { feat: 'Quảng cáo', free: 'Có', prem: 'Không' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }}>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text2)' }}>{row.feat}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {typeof row.free === 'boolean' ? (
                    <span style={{ fontSize: 16 }}>{row.free ? '✅' : '—'}</span>
                  ) : (
                    <span style={{ fontSize: 11, color: 'var(--text4)' }}>{row.free}</span>
                  )}
                  <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
                  {typeof row.prem === 'boolean' ? (
                    <span style={{ fontSize: 16 }}>{row.prem ? '✅' : '—'}</span>
                  ) : (
                    <span style={{ fontSize: 11, color: '#ffd700', fontWeight: 600 }}>{row.prem}</span>
                  )}
                </div>
              </div>
            ))}

            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <span style={{ fontSize: 11, color: 'var(--text4)' }}> trái: Free | phải: Premium 👑</span>
            </div>

            {!user.isVIP && (
              <button onClick={() => setShowModal(true)} style={{ padding: '16px', background: 'var(--gradient-primary)', border: 'none', borderRadius: 16, fontSize: 15, fontWeight: 800, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Crown size={18} /> Nâng cấp Premium — 29K/tháng
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
                }}>
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
              showToast('🎉 Chúc mừng! Bạn đã là Premium Member!', 'success');
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
