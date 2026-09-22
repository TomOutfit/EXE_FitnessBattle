import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, ShieldCheck, Heart, Github, ExternalLink } from 'lucide-react';

export const WebFooter: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer style={{
      background: '#090A14',
      borderTop: '1px solid rgba(255, 107, 53, 0.2)',
      padding: '60px 24px 30px',
      color: '#B0B0C3',
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 40,
        marginBottom: 40,
      }}>
        {/* Brand Col */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #FF6B35, #FF4757)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Flame size={20} color="#fff" />
            </div>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>FITNESS BATTLE</span>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: '#8E94A5', marginBottom: 20 }}>
            Dự án Khởi nghiệp Sáng tạo (EXE101). Tiên phong ứng dụng AI thị giác máy tính và cơ chế Game hóa PvP để thúc đẩy thói quen tập luyện thể thao của thế hệ trẻ.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <a
              href="https://github.com/TomOutfit/EXE_FitnessBattle.git"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Github size={18} />
            </a>
            <a
              href="https://play.google.com/apps/testing/com.fitnessbattle.fitness_battle"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '0 12px', height: 36, borderRadius: 8,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', gap: 6,
                color: '#fff', fontSize: 12, fontWeight: 700,
              }}
            >
              <span>Google Play Testing</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 16 }}>Khám Phá Dự Án</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <span onClick={() => navigate('/')} style={{ cursor: 'pointer', transition: 'color 0.2s' }}>🚀 Tổng Quan & Giá Trị Cốt Lõi</span>
            <span onClick={() => navigate('/demo')} style={{ cursor: 'pointer', color: '#FF6B35', fontWeight: 700 }}>📱 Trải Nghiệm Trực Tuyến (Live Demo)</span>
            <span onClick={() => navigate('/ai-tech')} style={{ cursor: 'pointer' }}>🛡️ Công Nghệ AI Vision & Anti-Cheat</span>
            <span onClick={() => navigate('/business')} style={{ cursor: 'pointer' }}>💰 Mô Hình Kinh Doanh (Monetization)</span>
            <span onClick={() => navigate('/download')} style={{ cursor: 'pointer' }}>📥 Trung Tâm Tải Về (Cross-Platform)</span>
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 16 }}>Nền Tảng Công Nghệ</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              'Google ML Kit',
              'MediaPipe Pose',
              'Flutter Framework',
              'React 19 & TypeScript',
              'Firebase Cloud Firestore',
              'Electron Desktop',
              'Biometric Verification',
              'Anti-Cheat Neural Engine'
            ].map(tech => (
              <span
                key={tech}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: 11.5,
                  color: '#A29BFE',
                  fontWeight: 600,
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Startup Info */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 16 }}>Hội Đồng & Nhà Đầu Tư</div>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: '#8E94A5', marginBottom: 12 }}>
            Sản phẩm phát triển cho môn học Khởi nghiệp <strong>EXE101</strong> — Trường Đại học FPT.
          </p>
          <div style={{
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(46, 213, 115, 0.1)',
            border: '1px solid rgba(46, 213, 115, 0.3)',
            color: '#2ED573',
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <ShieldCheck size={16} />
            <span>Sẵn sàng Demo & Thẩm định 100%</span>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        paddingTop: 24,
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        fontSize: 12,
        color: '#6B6B80',
      }}>
        <div>© 2026 Fitness Battle (EXE101 Project). All rights reserved.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>Crafted with</span>
          <Heart size={14} color="#FF4757" fill="#FF4757" />
          <span>for Vietnam Fitness Revolution</span>
        </div>
      </div>
    </footer>
  );
};
