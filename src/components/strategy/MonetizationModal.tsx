import React, { useState } from 'react';
import { Shield, Zap, DollarSign, Crosshair, MapPin, Gift, Crown, Sparkles } from 'lucide-react';
import { Button } from '../ui';

interface MonetizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MonetizationModal: React.FC<MonetizationModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'pillars' | 'calculator' | 'usp' | 'anticheat'>('pillars');
  const [mau, setMau] = useState<number>(20000); // 20,000 MAU default

  if (!isOpen) return null;

  // Revenue calculation estimates based on 20,000 MAU
  const vipConversionRate = 0.06; // 6% paying VIP
  const vipPrice = 29000; // 29,000 VND / month
  const totalVipUsers = Math.round(mau * vipConversionRate);
  const monthlyVipRevenue = totalVipUsers * vipPrice;

  const rubyIapUserRate = 0.04; // 4% buying Ruby packs (avg 50k VND)
  const monthlyRubyRevenue = Math.round(mau * rubyIapUserRate * 50000);

  const b2bSponsorsCount = Math.max(2, Math.floor(mau / 10000) * 2);
  const monthlyB2bRevenue = b2bSponsorsCount * 15000000; // 15M VND per partner sponsor

  const totalMonthlyRevenue = monthlyVipRevenue + monthlyRubyRevenue + monthlyB2bRevenue;
  const estimatedCost = totalMonthlyRevenue * 0.25; // 25% server/infra/ops cost
  const netProfit = totalMonthlyRevenue - estimatedCost;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(5, 5, 12, 0.88)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', overflowY: 'auto'
    }} onClick={onClose}>
      <div style={{
        width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto',
        background: 'linear-gradient(165deg, #181826, #10101a)',
        border: '1px solid rgba(255, 107, 53, 0.4)',
        borderRadius: 24, padding: 22, color: 'var(--text)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        animation: 'slideUp 0.3s ease-out'
      }} onClick={e => e.stopPropagation()}>

        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'linear-gradient(135deg, #ff6b35, #ff4757)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(255,107,53,0.4)', flexShrink: 0
            }}>
              <DollarSign size={24} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)' }}>Mô Hình Kiếm Tiền & USP</h3>
                <span style={{ fontSize: 9, padding: '2px 6px', background: 'rgba(46,213,115,0.15)', border: '1px solid rgba(46,213,115,0.3)', borderRadius: 8, color: '#2ed573', fontWeight: 700 }}>VERIFIED</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                Giải đáp câu hỏi cốt lõi của Mentors & Giám khảo
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 10, background: 'var(--bg3)',
            border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: 'var(--text3)', fontSize: 16
          }}>✕</button>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--bg-card)', padding: 4, borderRadius: 14 }}>
          {[
            { id: 'pillars', label: '💼 4 Trụ Cột' },
            { id: 'calculator', label: '📊 Dòng Tiền' },
            { id: 'usp', label: '⚔️ Ma Trận USP' },
            { id: 'anticheat', label: '🛡️ Anti-Cheat' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                flex: 1, padding: '8px 4px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                background: activeTab === t.id ? 'var(--gradient-primary)' : 'transparent',
                border: 'none', color: activeTab === t.id ? '#fff' : 'var(--text3)',
                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: 4 TRỤ CỘT KIẾM TIỀN ── */}
        {activeTab === 'pillars' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: '12px 14px', background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 14, fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
              💡 <strong style={{ color: 'var(--primary)' }}>Cốt lõi Freemium:</strong> Người dùng chơi Free vẫn rất vui, nhưng nếu nạp tiền sẽ nhận được <strong>Đặc quyền vượt trội (Stamina + Skin Flex + Voucher thật)</strong>.
            </div>

            {/* Pillar 1 */}
            <div style={{ padding: 14, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Crown size={18} color="#ffd700" />
                <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>1. B2C Battle Pass VIP (29k - 199k/tháng)</h4>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5, marginBottom: 8 }}>
                - Mở nhánh VIP: Nhận Skin Rồng Lửa/Neon, Khung Avatar danh hiệu khoe Facebook.<br />
                - Voucher thật từ nhãn hàng: Phúc Long 50k, Shopee 30k, Tiki 50k.<br />
                - <strong>Giới hạn FOMO:</strong> Chỉ 300 suất VIP/mùa giải tạo cơn sốt đăng ký.
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 9, padding: '2px 8px', background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 8, color: '#ffd700', fontWeight: 600 }}>Tỷ lệ chuyển đổi: 5 - 8%</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div style={{ padding: 14, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Zap size={18} color="#ff6b35" />
                <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>2. Thanh Thể Lực (Stamina) & Cược Ruby</h4>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5, marginBottom: 8 }}>
                - <strong>Thanh thể lực Stamina:</strong> User Free bị giới hạn 100 Stamina/ngày (đấu được 3-5 trận). Mua VIP nâng lên 500 Stamina để leo Rank.<br />
                - <strong>Trận Cược Ruby 1v1:</strong> Nạp Ruby thách đấu cược. Thắng nhận 80-90% bể cược, <strong>App thu phế 10-15%</strong> (tương tự cơ chế Game eSports).
              </p>
            </div>

            {/* Pillar 3 */}
            <div style={{ padding: 14, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Gift size={18} color="#2ed573" />
                <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>3. Xu Thưởng Hạn Dùng & VIP Retention</h4>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5, marginBottom: 8 }}>
                - <strong>Cơ chế Shopee Xu:</strong> Điểm/Xu thưởng cày được có hạn sử dụng 30 ngày. Duy trì tài khoản VIP để không bị hết hạn và quy đổi 100% quà xịn.<br />
                - Tạo tâm lý tiếc nuối (FOMO loss aversion), thúc đẩy người dùng nâng VIP giá rẻ để giữ thành quả.
              </p>
            </div>

            {/* Pillar 4 */}
            <div style={{ padding: 14, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <MapPin size={18} color="#5352ed" />
                <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>4. B2B Brand & Location Gym Spots</h4>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5, marginBottom: 8 }}>
                - <strong>Thương hiệu tài trợ:</strong> California Fitness, Pocari Sweat, Highlands Coffee trả tiền để đặt "Brand Gym Spot" trên bản đồ GPS app.<br />
                - User đến điểm tập check-in/thi đấu 1v1 để nhận Voucher → Chuyển đổi User online thành <strong>Foot-traffic thực tế</strong> cho đối tác B2B.
              </p>
            </div>
          </div>
        )}

        {/* ── TAB 2: REVENUE CALCULATOR ── */}
        {activeTab === 'calculator' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: 14, background: 'rgba(83,82,237,0.1)', border: '1px solid rgba(83,82,237,0.25)', borderRadius: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#5352ed', marginBottom: 8 }}>🎛️ Giả lập Doanh Thu theo Quy Mô User (MAU)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>Số người dùng hàng tháng (MAU):</span>
                <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--primary)' }}>{mau.toLocaleString()} Users</span>
              </div>
              <input
                type="range"
                min={5000}
                max={100000}
                step={5000}
                value={mau}
                onChange={e => setMau(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text4)', marginTop: 2 }}>
                <span>5K MAU</span>
                <span>50K MAU</span>
                <span>100K MAU</span>
              </div>
            </div>

            {/* Breakdown Card */}
            <div style={{ padding: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)' }}>📈 Ước tính Doanh thu Hàng tháng:</div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text3)' }}>1. B2C Battle Pass VIP ({totalVipUsers.toLocaleString()} VIPs):</span>
                <span style={{ fontWeight: 700, color: '#ffd700' }}>{(monthlyVipRevenue / 1e6).toFixed(1)} triệuđ</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text3)' }}>2. B2C Nạp Ruby & Fee Cược 1v1:</span>
                <span style={{ fontWeight: 700, color: '#ff6b35' }}>{(monthlyRubyRevenue / 1e6).toFixed(1)} triệuđ</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text3)' }}>3. B2B Brand & Location Sponsor ({b2bSponsorsCount} đối tác):</span>
                <span style={{ fontWeight: 700, color: '#2ed573' }}>{(monthlyB2bRevenue / 1e6).toFixed(1)} triệuđ</span>
              </div>

              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 900 }}>
                <span style={{ color: 'var(--text)' }}>🔥 TỔNG DOANH THU (Monthly):</span>
                <span style={{ color: '#2ed573' }}>{(totalMonthlyRevenue / 1e6).toFixed(1)} triệu VNĐ</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)' }}>
                <span>Chi phí hạ tầng & Vận hành (~25%):</span>
                <span>-{(estimatedCost / 1e6).toFixed(1)} triệuđ</span>
              </div>

              <div style={{ padding: '8px 12px', background: 'rgba(46,213,115,0.12)', border: '1px solid rgba(46,213,115,0.25)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#2ed573' }}>LỢI NHUẬN RÒNG (EBITDA Margin ~75%):</span>
                <span style={{ fontSize: 15, fontWeight: 900, color: '#2ed573' }}>{(netProfit / 1e6).toFixed(1)} triệuđ/tháng</span>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: MATRIX USP VS COMPETITORS ── */}
        {activeTab === 'usp' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>
              Fitness Battle chiến thắng nhờ giải quyết điểm yếu của 3 nhóm đối thủ lớn:
            </div>

            {/* Competitor comparison grid */}
            {[
              {
                name: 'Vs Strava / Nike Run Club',
                icon: '🏃',
                color: '#fc4c02',
                weakness: 'Chỉ tracking thụ động, khô khan, không có PvP 1v1 real-time, không Anti-Cheat.',
                advantage: 'Fitness Battle là Gamification PvP Hiếu thắng: Đấu 60s, cược Ruby, Anti-Cheat AI, Skin khung avatar khoe Facebook.'
              },
              {
                name: 'Vs Duolingo / Fitness Apps cũ',
                icon: '🥑',
                color: '#58cc02',
                weakness: 'Sa lầy vào xây dựng kho bài tập khổng lồ (tốn kém dữ liệu, người dùng chán sau 1 tuần).',
                advantage: 'Tập trung vào Động lực Thi đấu Xã Hội (Social PvP & Location Matchmaking). Không cần kho bài tập cồng kềnh.'
              },
              {
                name: 'Vs Move-to-Earn (StepN)',
                icon: '👟',
                color: '#a55eea',
                weakness: 'Mô hình Ponzi bóng bóng token ảo, dễ sụp đổ.',
                advantage: 'Mô hình Kinh Tế Thực (B2B Brand Sponsor Voucher + B2C Freemium Battle Pass). Doanh thu bền vững 100%.'
              }
            ].map((item, idx) => (
              <div key={idx} style={{ padding: 12, background: 'var(--bg-card)', border: `1px solid ${item.color}30`, borderRadius: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: item.color }}>{item.name}</span>
                </div>
                <div style={{ fontSize: 10, color: '#ff4757', marginBottom: 4 }}>
                  ❌ <strong>Điểm yếu đối thủ:</strong> {item.weakness}
                </div>
                <div style={{ fontSize: 11, color: '#2ed573', fontWeight: 600 }}>
                  ✅ <strong>Fitness Battle USP:</strong> {item.advantage}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB 4: ANTI-CHEAT ENGINE ── */}
        {activeTab === 'anticheat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 16, background: 'rgba(46,213,115,0.08)', border: '1px solid rgba(46,213,115,0.25)', borderRadius: 16, textAlign: 'center' }}>
              <Shield size={36} color="#2ed573" style={{ margin: '0 auto 8px' }} />
              <h4 style={{ fontSize: 15, fontWeight: 900, color: '#2ed573', marginBottom: 4 }}>AI Anti-Cheat Dual Sensor System</h4>
              <p style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5 }}>
                Lý do khiến người dùng tin tưởng nạp tiền đấu cược là vì <strong>Trận đấu minh bạch 100%</strong>.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ padding: 12, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#ff6b35' }}>
                  <Crosshair size={14} /> 1. Dual GPS Motion
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.4 }}>
                  Đo gia tốc & vận tốc di chuyển thực tế. Phát hiện ngay nếu người dùng bật Fake GPS hoặc đi xe máy trên 25km/h.
                </div>
              </div>

              <div style={{ padding: 12, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#5352ed' }}>
                  <Sparkles size={14} /> 2. Micro Sound Frequency
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.4 }}>
                  Phân tích tần số nhịp thở heavy breathing & tiếng bước chân thực tế trong 60s thi đấu để loại trừ máy lắc tự động.
                </div>
              </div>
            </div>

            <div style={{ padding: 12, background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 14, fontSize: 11, color: 'var(--text2)', lineHeight: 1.5 }}>
              ⚡ <strong>Quyền riêng tư tuyệt đối:</strong> GPS & Micro chỉ kích hoạt duy nhất trong 60 giây thi đấu. Vị trí được làm mờ để bảo vệ người dùng.
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
          <Button variant="primary" fullWidth size="md" onClick={onClose}>
            Đóng & Tiếp tục Trải Nghiệm Demo
          </Button>
        </div>

      </div>
    </div>
  );
};
