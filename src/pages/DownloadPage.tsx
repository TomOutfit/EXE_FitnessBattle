import React from 'react';
import { Download, ExternalLink, Smartphone, Monitor, CheckCircle } from 'lucide-react';
import { Interactive3DCard } from '../components/3d/Interactive3DCard';

export const DownloadPage: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#090A14',
      color: '#FFFFFF',
      padding: '60px 24px 100px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 30,
            background: 'rgba(46, 213, 115, 0.15)',
            border: '1px solid rgba(46, 213, 115, 0.4)',
            color: '#2ED573',
            fontSize: 12.5,
            fontWeight: 800,
            marginBottom: 20,
          }}>
            <Download size={16} />
            <span>CROSS-PLATFORM DOWNLOAD CENTER</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, textTransform: 'uppercase', marginBottom: 16 }}>
            Tải Ứng Dụng Fitness Battle
          </h1>
          <p style={{ fontSize: 16, color: '#B0B0C3', maxWidth: 700, margin: '0 auto', lineHeight: 1.6 }}>
            Trải nghiệm trọn vẹn trên điện thoại Android hoặc máy tính PC Windows.
          </p>
        </div>

        {/* 3 Download Cards Grid with 3D Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 28,
          marginBottom: 60,
        }}>
          {/* 3D Card 1: Google Play Closed Testing */}
          <Interactive3DCard glowColor="#2ED573" depth={24} style={{ borderRadius: 24 }}>
            <div style={{
              background: 'linear-gradient(145deg, #141A28, #0E1420)',
              borderRadius: 24,
              padding: '38px 28px',
              border: '1px solid rgba(46, 213, 115, 0.45)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: 6,
                  background: 'rgba(46, 213, 115, 0.2)',
                  color: '#2ED573',
                  fontSize: 11,
                  fontWeight: 800,
                  marginBottom: 16,
                }}>
                  ⭐ KHUYÊN DÙNG CHO ANDROID
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Google Play Testing</h3>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: '#B0B0C3', marginBottom: 20 }}>
                  Tham gia chương trình thử nghiệm chính thức trên CH Play. Tự động nhận bản cập nhật mới nhất từ nhà phát triển.
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, color: '#8E94A5', marginBottom: 24 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={14} color="#2ED573" /> Tự động cập nhật qua CH Play
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={14} color="#2ED573" /> Đầy đủ tính năng Google ML Kit
                  </li>
                </ul>
              </div>

              <a
                href="https://play.google.com/apps/testing/com.fitnessbattle.fitness_battle"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '14px 20px',
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #2ED573, #10AC84)',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  textDecoration: 'none',
                  boxShadow: '0 6px 20px rgba(46, 213, 115, 0.4)',
                }}
              >
                <span>Tham Gia Trên Google Play</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </Interactive3DCard>

          {/* 3D Card 2: Direct Android APK */}
          <Interactive3DCard glowColor="#FF6B35" depth={24} style={{ borderRadius: 24 }}>
            <div style={{
              background: 'linear-gradient(145deg, #1A1A35, #121225)',
              borderRadius: 24,
              padding: '38px 28px',
              border: '1px solid rgba(255, 107, 53, 0.45)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: 6,
                  background: 'rgba(255, 107, 53, 0.2)',
                  color: '#FF8E53',
                  fontSize: 11,
                  fontWeight: 800,
                  marginBottom: 16,
                }}>
                  📦 CÀI ĐẶT TRỰC TIẾP
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Android APK (Release)</h3>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: '#B0B0C3', marginBottom: 20 }}>
                  File APK độc lập cài trực tiếp trên máy điện thoại Android không cần qua CH Play. Dung lượng ~107 MB.
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, color: '#8E94A5', marginBottom: 24 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={14} color="#FF8E53" /> Cài đặt nhanh bằng 1 click
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={14} color="#FF8E53" /> Hoạt động offline mượt mà
                  </li>
                </ul>
              </div>

              <a
                href="file:///d:/Coder-Program/FitnessBattle_EXE/FitnessBattle_Official.apk"
                download="FitnessBattle_Official.apk"
                style={{
                  padding: '14px 20px',
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #FF6B35, #FF4757)',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  textDecoration: 'none',
                  boxShadow: '0 6px 20px rgba(255, 107, 53, 0.4)',
                }}
              >
                <Smartphone size={16} />
                <span>Tải File APK (Release ~107MB)</span>
              </a>
            </div>
          </Interactive3DCard>

          {/* 3D Card 3: Windows Desktop App */}
          <Interactive3DCard glowColor="#5352ED" depth={24} style={{ borderRadius: 24 }}>
            <div style={{
              background: 'linear-gradient(145deg, #1A1A35, #121225)',
              borderRadius: 24,
              padding: '38px 28px',
              border: '1px solid rgba(83, 82, 237, 0.45)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: 6,
                  background: 'rgba(83, 82, 237, 0.2)',
                  color: '#A29BFE',
                  fontSize: 11,
                  fontWeight: 800,
                  marginBottom: 16,
                }}>
                  💻 DÀNH CHO MÁY TÍNH
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Windows Desktop (.exe)</h3>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: '#B0B0C3', marginBottom: 20 }}>
                  Gói cài đặt Desktop độc lập cho máy tính Windows 10/11. Tự động nhận diện webcam để test AI Pose Tracking.
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, color: '#8E94A5', marginBottom: 24 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={14} color="#A29BFE" /> Chạy trực tiếp không cần Node.js
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={14} color="#A29BFE" /> Đầy đủ Webcam AI Skeleton
                  </li>
                </ul>
              </div>

              <a
                href="file:///d:/Coder-Program/FitnessBattle_EXE/FitnessBattle_Windows.zip"
                download="FitnessBattle_Windows.zip"
                style={{
                  padding: '14px 20px',
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #5352ED, #7070FF)',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  textDecoration: 'none',
                  boxShadow: '0 6px 20px rgba(83, 82, 237, 0.4)',
                }}
              >
                <Monitor size={16} />
                <span>Tải Bản Windows (.zip ~158MB)</span>
              </a>
            </div>
          </Interactive3DCard>
        </div>
      </div>
    </div>
  );
};
