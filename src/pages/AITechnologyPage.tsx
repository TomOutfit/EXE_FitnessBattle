import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, ShieldCheck, Eye, Zap } from 'lucide-react';
import { PoseSkeletonCanvas3D } from '../components/3d/PoseSkeletonCanvas3D';
import { Interactive3DCard } from '../components/3d/Interactive3DCard';

export const AITechnologyPage: React.FC = () => {
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
            background: 'rgba(0, 229, 255, 0.15)',
            border: '1px solid rgba(0, 229, 255, 0.4)',
            color: '#00E5FF',
            fontSize: 12.5,
            fontWeight: 800,
            marginBottom: 20,
          }}>
            <Cpu size={16} />
            <span>AI VISION & BIOMETRICS DEEP TECH</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, textTransform: 'uppercase', marginBottom: 16 }}>
            Công Nghệ Trọng Tài AI & Chống Gian Lận
          </h1>
          <p style={{ fontSize: 16, color: '#B0B0C3', maxWidth: 700, margin: '0 auto', lineHeight: 1.6 }}>
            Hệ thống thị giác máy tính biên (Edge AI Vision) bảo mật và công bằng tuyệt đối cho giải đấu thể thao điện tử thể chất.
          </p>
        </div>

        {/* 3D Visualizer + Algorithms Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 40,
          marginBottom: 60,
          alignItems: 'center',
        }}>
          {/* 3D Skeleton Visualizer in 3D Card */}
          <Interactive3DCard glowColor="#00E5FF" depth={0} disabled={true} style={{ borderRadius: 24 }}>
            <div style={{
              background: 'linear-gradient(145deg, #14142B, #0E0E1F)',
              borderRadius: 24,
              padding: 24,
              border: '1px solid rgba(0, 229, 255, 0.35)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#00E5FF' }}>3D BIOMECHANICAL SKELETON</div>
                <div style={{ fontSize: 11, color: '#8E94A5' }}>Kéo chuột xoay mô hình 3D</div>
              </div>
              <PoseSkeletonCanvas3D />
            </div>
          </Interactive3DCard>

          {/* Core Algorithms List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              {
                icon: ShieldCheck,
                title: '1. Single-Subject Biometric Lock',
                desc: 'Khi bắt đầu thi đấu, AI trích xuất vector chữ ký sinh trắc học bất biến (tỷ lệ vai-thân, cánh tay-thân) của người chơi. Bất kỳ người nào khác bước vào camera thay thế sẽ bị hệ thống phát hiện và hủy kết quả ngay tức khắc.',
                color: '#2ED573',
              },
              {
                icon: Eye,
                title: '2. Joint Angle & Form Verification',
                desc: 'Tính toán góc vectơ không gian giữa vai-khuỷu-cổ tay theo thời gian thực. Đảm bảo góc gập đạt chuẩn ≤90° đối với bài Hít đất và cằm vượt qua thanh xà đối với bài Kéo xà mới được tính 1 rep hợp lệ.',
                color: '#00E5FF',
              },
              {
                icon: Zap,
                title: '3. Edge AI Processing (Zero Video Upload)',
                desc: 'Mô hình Neural Network xử lý trực tiếp trên GPU/NPU của thiết bị người dùng với tốc độ 30+ FPS. Hình ảnh và video của bạn không bao giờ phải gửi lên đám mây, đảm bảo riêng tư 100%.',
                color: '#FF8E53',
              },
            ].map((alg, i) => {
              const Icon = alg.icon;
              return (
                <Interactive3DCard key={i} glowColor={alg.color} depth={16} style={{ borderRadius: 18 }}>
                  <div
                    style={{
                      background: 'rgba(20, 20, 40, 0.85)',
                      border: `1px solid ${alg.color}35`,
                      borderRadius: 18,
                      padding: '22px 20px',
                      display: 'flex',
                      gap: 16,
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: `${alg.color}20`, border: `1px solid ${alg.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={20} color={alg.color} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 6 }}>{alg.title}</h3>
                      <p style={{ fontSize: 13, lineHeight: 1.6, color: '#B0B0C3' }}>{alg.desc}</p>
                    </div>
                  </div>
                </Interactive3DCard>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => navigate('/demo')}
            style={{
              padding: '16px 36px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #00E5FF, #5352ED)',
              color: '#FFFFFF',
              fontSize: 15,
              fontWeight: 900,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(0, 229, 255, 0.4)',
            }}
          >
            Thử Nghiệm Camera AI Trên Trình Giả Lập 📱
          </button>
        </div>
      </div>
    </div>
  );
};
