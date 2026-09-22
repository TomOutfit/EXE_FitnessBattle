import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Coins, Crown, Gift } from 'lucide-react';
import { Interactive3DCard } from '../components/3d/Interactive3DCard';

export const BusinessModelPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#090A14',
      color: '#FFFFFF',
      padding: '60px 24px 100px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 30,
            background: 'rgba(255, 165, 2, 0.15)',
            border: '1px solid rgba(255, 165, 2, 0.4)',
            color: '#FFA502',
            fontSize: 12.5,
            fontWeight: 800,
            marginBottom: 20,
          }}>
            <TrendingUp size={16} />
            <span>STARTUP MONETIZATION & CASHFLOW ENGINE</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, textTransform: 'uppercase', marginBottom: 16 }}>
            Mô Hình Kinh Doanh & Dòng Tiền Đa Kênh
          </h1>
          <p style={{ fontSize: 16, color: '#B0B0C3', maxWidth: 700, margin: '0 auto', lineHeight: 1.6 }}>
            Thiết kế kinh tế Game (GameFi Economy) khép kín, tối ưu hóa tỷ lệ chuyển đổi Freemium sang Khách hàng trả phí định kỳ (LTV/CAC).
          </p>
        </div>

        {/* 3 Revenue Channels Grid with 3D Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 28,
          marginBottom: 60,
        }}>
          {[
            {
              icon: Crown,
              title: '1. Battle Pass Mùa Giải (Subscription)',
              pricing: '29.000đ - 99.000đ / mùa (30 ngày)',
              desc: 'Cơ chế Season Pass kinh điển từ ngành Gaming: Người dùng hoàn thành bài tập mỗi ngày để lên cấp Pass. Gói VIP mở khóa Khung Rồng Lửa, Skin Neon và hàng chục voucher Phúc Long, Shopee, Tiki.',
              color: '#FF6B35',
            },
            {
              icon: Coins,
              title: '2. Nền Kinh Tế Ruby (In-App Purchases)',
              pricing: '10.000đ - 500.000đ / gói Ruby',
              desc: 'Ruby là đơn vị tiền tệ cao cấp dùng để đặt cược trong Đấu Trường Titan, Giải Đua Sức Bền. Thắng trận nhận Ruby để quy đổi quà tặng hiện vật và nâng cấp danh hiệu Master.',
              color: '#FF4757',
            },
            {
              icon: Gift,
              title: '3. Tài Trợ Thương Hiệu & B2B Voucher',
              pricing: 'Hợp tác B2B Doanh nghiệp',
              desc: 'Các chuỗi phòng Gym (California, Elite), hãng đồ thể thao (Nike, Adidas) và F&B (Phúc Long) tài trợ voucher quà tặng để thu hút tệp khách hàng trẻ năng động Gen Z.',
              color: '#FFA502',
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <Interactive3DCard key={i} glowColor={item.color} depth={22} style={{ borderRadius: 24 }}>
                <div
                  style={{
                    background: 'linear-gradient(145deg, #1A1A35, #121225)',
                    borderRadius: 24,
                    padding: '38px 30px',
                    border: `1px solid ${item.color}45`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{
                      width: 50, height: 50, borderRadius: 14,
                      background: `${item.color}20`, border: `1px solid ${item.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 22,
                    }}>
                      <Icon size={26} color={item.color} />
                    </div>
                    <h3 style={{ fontSize: 19, fontWeight: 900, color: '#fff', marginBottom: 8 }}>{item.title}</h3>
                    <div style={{ fontSize: 15, fontWeight: 800, color: item.color, marginBottom: 14 }}>{item.pricing}</div>
                    <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#B0B0C3' }}>{item.desc}</p>
                  </div>
                </div>
              </Interactive3DCard>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => navigate('/demo')}
            style={{
              padding: '16px 36px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #FF6B35, #FFA502)',
              color: '#FFFFFF',
              fontSize: 15,
              fontWeight: 900,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(255, 107, 53, 0.4)',
            }}
          >
            Thử Nghiệm Mua Battle Pass & Nạp Ruby Trực Tuyến 💰
          </button>
        </div>
      </div>
    </div>
  );
};
