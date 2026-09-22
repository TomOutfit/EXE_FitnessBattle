import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Smartphone,
  Download,
  Sparkles,
  Target,
  Crown,
  Coins,
  Gift,
} from 'lucide-react';
import { CyberArenaCanvas3D } from '../components/3d/CyberArenaCanvas3D';
import { PoseSkeletonCanvas3D } from '../components/3d/PoseSkeletonCanvas3D';
import { Interactive3DCard } from '../components/3d/Interactive3DCard';

export const StartupShowcasePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#090A14',
      color: '#FFFFFF',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* ── 1. 3D HERO SECTION ────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px 60px',
        overflow: 'hidden',
      }}>
        {/* 3D WebGL Arena Canvas */}
        <CyberArenaCanvas3D intensity={1.3} showFloatingObjects={true} />

        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
        }}>
          {/* Startup Tag Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 18px',
            borderRadius: 30,
            background: 'rgba(255, 107, 53, 0.18)',
            border: '1px solid rgba(255, 107, 53, 0.45)',
            color: '#FF8E53',
            fontSize: 12.5,
            fontWeight: 800,
            marginBottom: 24,
            boxShadow: '0 0 25px rgba(255, 107, 53, 0.35)',
            backdropFilter: 'blur(12px)',
          }}>
            <Sparkles size={16} />
            <span>DỰ ÁN KHỞI NGHIỆP SÁNG TẠO (EXE101) — ĐẠI HỌC FPT</span>
          </div>

          {/* Main Hero Hook */}
          <h1 style={{
            fontSize: 'clamp(34px, 5.8vw, 68px)',
            fontWeight: 900,
            lineHeight: 1.12,
            letterSpacing: '-1.5px',
            marginBottom: 24,
            textTransform: 'uppercase',
          }}>
            Biến Mồ Hôi Thành Chiến Tích <br />
            <span style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF4757 50%, #FFA502 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 35px rgba(255, 107, 53, 0.65))',
            }}>
              Đấu Trường Fitness AI 1v1
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 1.8vw, 19px)',
            color: '#B0B0C3',
            maxWidth: 780,
            margin: '0 auto 40px',
            lineHeight: 1.6,
          }}>
            Nền tảng Gamified Fitness đầu tiên ứng dụng <strong>Trọng tài Thị giác Máy tính 3D (AI Vision)</strong> chấm điểm thời gian thực, chống gian lận sinh trắc học và hệ sinh thái Battle Pass săn quà thương hiệu.
          </p>

          {/* CTA Buttons Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 50,
          }}>
            <button
              onClick={() => navigate('/demo')}
              style={{
                padding: '16px 36px',
                borderRadius: 16,
                background: 'linear-gradient(135deg, #FF6B35, #FF4757)',
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 8px 30px rgba(255, 107, 53, 0.5), inset 0 0 2px rgba(255,255,255,0.4)',
                border: 'none',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
            >
              <Smartphone size={20} />
              <span>Trải Nghiệm Trực Tuyến 3D 📱</span>
            </button>

            <button
              onClick={() => navigate('/download')}
              style={{
                padding: '16px 28px',
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                fontSize: 15,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Download size={18} />
              <span>Tải App Android & PC</span>
            </button>
          </div>

          {/* Traction Stats Ribbon in 3D Card */}
          <Interactive3DCard glowColor="#FF6B35" depth={15} style={{ maxWidth: 960, margin: '0 auto', borderRadius: 22 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16,
              background: 'rgba(20, 20, 42, 0.85)',
              backdropFilter: 'blur(18px)',
              padding: '24px 28px',
              borderRadius: 22,
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}>
              {[
                { val: '98.4%', label: 'Độ chính xác AI Pose Tracking', color: '#2ED573' },
                { val: '3.2x', label: 'Tỷ lệ duy trì Streak so với app thường', color: '#FF8E53' },
                { val: '60 Giây', label: 'Thời lượng 1 trận đấu PvP 1v1', color: '#00E5FF' },
                { val: '30 Cấp', label: 'Mùa giải Battle Pass đổi Voucher', color: '#FFA502' },
              ].map((stat, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: stat.color, marginBottom: 4 }}>
                    {stat.val}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#8E94A5', fontWeight: 600 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </Interactive3DCard>
        </div>
      </section>

      {/* ── 2. THE BIG PROBLEM & THE DISRUPTIVE SOLUTION (3D CARDS) ───────── */}
      <section style={{
        padding: '100px 24px',
        maxWidth: 1280,
        margin: '0 auto',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ color: '#FF4757', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
            Market Pain Point & Disruption
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, textTransform: 'uppercase' }}>
            Vấn Đề Thị Trường & Giải Pháp Đột Phá
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 30,
        }}>
          {/* 3D Card 1: The Problem */}
          <Interactive3DCard glowColor="#FF4757" depth={24} style={{ borderRadius: 24 }}>
            <div style={{
              background: 'linear-gradient(145deg, #1A1420, #120E18)',
              border: '1px solid rgba(255, 71, 87, 0.35)',
              borderRadius: 24,
              padding: '38px 32px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'rgba(255, 71, 87, 0.15)', border: '1px solid #FF4757',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 22,
                  boxShadow: '0 0 20px rgba(255, 71, 87, 0.3)',
                }}>
                  <Target size={28} color="#FF4757" />
                </div>
                <h3 style={{ fontSize: 21, fontWeight: 900, color: '#FF6B81', marginBottom: 16 }}>
                  Cái Bẫy 30 Ngày Của Người Tập (The 80% Drop-off)
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14, color: '#B0B0C3', lineHeight: 1.55 }}>
                  <li>❌ <strong>Nhàm chán & Cô độc:</strong> Tập một mình không có áp lực cạnh tranh dẫn đến nhanh bỏ cuộc sau 2-3 tuần.</li>
                  <li>❌ <strong>Gian lận & Ảo tưởng:</strong> Không ai giám sát tư thế chuẩn, tập sai form không hiệu quả và dễ gây chấn thương khớp.</li>
                  <li>❌ <strong>App hiện tại thụ động:</strong> Chỉ dừng lại ở việc đếm calo, ghi chép chay, thiếu hoàn toàn cảm xúc phấn khích (Dopamine).</li>
                </ul>
              </div>
            </div>
          </Interactive3DCard>

          {/* 3D Card 2: The Solution */}
          <Interactive3DCard glowColor="#2ED573" depth={24} style={{ borderRadius: 24 }}>
            <div style={{
              background: 'linear-gradient(145deg, #141E28, #0E1620)',
              border: '1px solid rgba(46, 213, 115, 0.4)',
              borderRadius: 24,
              padding: '38px 32px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'rgba(46, 213, 115, 0.15)', border: '1px solid #2ED573',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 22,
                  boxShadow: '0 0 20px rgba(46, 213, 115, 0.3)',
                }}>
                  <Zap size={28} color="#2ED573" />
                </div>
                <h3 style={{ fontSize: 21, fontWeight: 900, color: '#2ED573', marginBottom: 16 }}>
                  Giải Pháp: Đấu Trường PvP 1v1 + Trọng Tài AI 3D
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14, color: '#B0B0C3', lineHeight: 1.55 }}>
                  <li>✅ <strong>PvP Cạnh Tranh 60s:</strong> Ghép trận 1v1 trực tiếp, thi đấu tính điểm kịch tính như game Esports.</li>
                  <li>✅ <strong>AI Pose Referee 3D:</strong> Thị giác máy tính nhận diện góc khớp chuẩn xác, loại bỏ hoàn toàn gian lận.</li>
                  <li>✅ <strong>Phần Thưởng Thực Tế:</strong> Tích lũy Ruby và hoàn thành Battle Pass để nhận Voucher Phúc Long, Nike, Gym.</li>
                </ul>
              </div>
            </div>
          </Interactive3DCard>
        </div>
      </section>

      {/* ── 3. 3D AI DEEP TECH MOAT ──────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(180deg, #090A14 0%, #111326 50%, #090A14 100%)',
        padding: '100px 24px',
        borderTop: '1px solid rgba(255, 107, 53, 0.15)',
        borderBottom: '1px solid rgba(255, 107, 53, 0.15)',
        position: 'relative',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 50,
            alignItems: 'center',
          }}>
            {/* Left Col: 3D Holographic Skeleton */}
            <Interactive3DCard glowColor="#00E5FF" depth={20} style={{ borderRadius: 24 }}>
              <div style={{
                background: 'rgba(15, 15, 35, 0.92)',
                borderRadius: 24,
                padding: 24,
                border: '1px solid rgba(0, 229, 255, 0.35)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#00E5FF' }}>3D BIOMECHANICAL SKELETON ENGINE</div>
                  <div style={{ fontSize: 11, color: '#8E94A5' }}>Kéo chuột để xoay 3D</div>
                </div>
                <PoseSkeletonCanvas3D />
              </div>
            </Interactive3DCard>

            {/* Right Col: Tech Explanation */}
            <div>
              <div style={{ color: '#00E5FF', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
                Defensible Technology Moat
              </div>
              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 900, marginBottom: 20, lineHeight: 1.2 }}>
                Trọng Tài AI Sinh Trắc Học & Khóa Đối Tượng Duy Nhất
              </h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: '#B0B0C3', marginBottom: 24 }}>
                Sử dụng mô hình <strong>MediaPipe Pose Estimation 33 Khớp</strong> kết hợp thuật toán tính góc giải phẫu và so sánh chữ ký sinh trắc học cơ thể người để đảm bảo tính công bằng tuyệt đối cho giải đấu.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { title: 'Khóa đối tượng duy nhất (Single-Subject Lock):', desc: 'Trích xuất tỷ lệ vai-thân-tay bất biến. Nếu người khác vào thay thế, trận đấu bị hủy ngay lập tức.' },
                  { title: 'Xác thực độ sâu chuẩn khớp (Depth Validation):', desc: 'Chỉ tính rep khi góc khuỷu tay ≤90° (hít đất) hoặc cằm vượt qua thanh xà (hít xà).' },
                  { title: 'Chạy trực tiếp trên thiết bị (On-Device AI):', desc: 'Không cần truyền video lên máy chủ, bảo mật 100% hình ảnh người dùng và phản hồi tức thì 30+ FPS.' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: 'rgba(0, 229, 255, 0.2)', color: '#00E5FF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 900, flexShrink: 0, marginTop: 2,
                    }}>
                      ✓
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{item.title}</div>
                      <div style={{ fontSize: 13, color: '#8E94A5' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. MONETIZATION ENGINE (3D CARDS) ─────────────────────────────── */}
      <section style={{
        padding: '100px 24px',
        maxWidth: 1280,
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ color: '#FFA502', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
            Business Model & Unit Economics
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900 }}>
            3 Trụ Cột Doanh Thu Đột Phá
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 26,
        }}>
          {[
            {
              icon: Crown,
              title: '1. Battle Pass Mùa Giải (B2C Sub)',
              price: '29.000đ - 99.000đ / mùa',
              desc: 'Người dùng mua Battle Pass VIP để mở khóa skin avatar độc quyền, hiệu ứng pháo hoa và nhận voucher quà tặng giá trị cao.',
              badge: 'Recurring B2C',
              color: '#FF6B35',
            },
            {
              icon: Coins,
              title: '2. Nền Kinh Tế Ruby & Vé Đấu (IAP)',
              price: '10.000đ - 200.000đ / gói',
              desc: 'Ruby là đơn vị tiền tệ để tham gia Đấu Trường Titan, Giải Đua Sức Bền. Thắng trận nhận Ruby và phần thưởng hiện vật.',
              badge: 'In-App Purchases',
              color: '#FF4757',
            },
            {
              icon: Gift,
              title: '3. Tài Trợ Thương Hiệu & B2B',
              price: 'Hợp tác B2B & Voucher',
              desc: 'Các nhãn hàng (Phúc Long, Gym Chain, Đồ thể thao) đặt voucher quà tặng trong app để tiếp cận tệp khách hàng trẻ năng động.',
              badge: 'B2B Brand Sponsor',
              color: '#FFA502',
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <Interactive3DCard key={i} glowColor={card.color} depth={22} style={{ borderRadius: 22 }}>
                <div
                  style={{
                    background: 'linear-gradient(145deg, #1A1A35, #121225)',
                    borderRadius: 22,
                    padding: '34px 28px',
                    border: `1px solid ${card.color}45`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: `${card.color}20`, border: `1px solid ${card.color}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={22} color={card.color} />
                      </div>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: `${card.color}20`,
                        color: card.color,
                        fontSize: 11,
                        fontWeight: 800,
                      }}>
                        {card.badge}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 19, fontWeight: 900, color: '#fff', marginBottom: 8 }}>{card.title}</h3>
                    <div style={{ fontSize: 16, fontWeight: 800, color: card.color, marginBottom: 14 }}>{card.price}</div>
                    <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#B0B0C3' }}>{card.desc}</p>
                  </div>
                </div>
              </Interactive3DCard>
            );
          })}
        </div>
      </section>

      {/* ── 5. FINAL CALL TO ACTION ──────────────────────────────────────── */}
      <section style={{
        padding: '90px 24px',
        textAlign: 'center',
        background: 'radial-gradient(ellipse at center, rgba(255, 107, 53, 0.25) 0%, #090A14 70%)',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 900, marginBottom: 16 }}>
            Trải Nghiệm Toàn Bộ Ứng Dụng Ngay Bây Giờ
          </h2>
          <p style={{ fontSize: 16, color: '#B0B0C3', marginBottom: 36 }}>
            Thử nghiệm trực tiếp trên trình giả lập điện thoại 3D hoặc tải app về thiết bị của bạn.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/demo')}
              style={{
                padding: '16px 36px',
                borderRadius: 16,
                background: 'linear-gradient(135deg, #FF6B35, #FF4757)',
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: 900,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(255, 107, 53, 0.5)',
              }}
            >
              Mở Trình Giả Lập Trực Tuyến 📱
            </button>
            <button
              onClick={() => navigate('/download')}
              style={{
                padding: '16px 28px',
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Trung Tâm Tải Về 📥
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
