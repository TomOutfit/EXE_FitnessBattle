import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { Database, Coins, Zap, RefreshCw, Check, X } from 'lucide-react';

interface DatabaseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseManagerModal: React.FC<DatabaseManagerModalProps> = ({ isOpen, onClose }) => {
  const { user, setUser, resetDatabase, showToast } = useUser();

  const [coins, setCoins] = useState(user.coins);
  const [ruby, setRuby] = useState(user.ruby);
  const [stamina, setStamina] = useState(user.stamina);
  const [level, setLevel] = useState(user.level);
  const [points, setPoints] = useState(user.totalPoints);
  const [streak, setStreak] = useState(user.streak);
  const [isVIP, setIsVIP] = useState(user.isVIP);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setUser((prev) => ({
      ...prev,
      coins: Number(coins) || prev.coins,
      ruby: Number(ruby) || prev.ruby,
      stamina: Number(stamina) || prev.stamina,
      level: Number(level) || prev.level,
      totalPoints: Number(points) || prev.totalPoints,
      streak: Number(streak) || prev.streak,
      isVIP,
      maxStamina: isVIP ? 500 : 200,
    }));
    showToast('✓ Đã lưu thay đổi vào CSDL thành công!', 'success');
    onClose();
  };

  const handleReset = () => {
    resetDatabase();
    setShowConfirmReset(false);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#1A1A2E',
          borderRadius: 20,
          padding: '24px 20px',
          border: '1px solid #25253D',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'rgba(255, 107, 53, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Database size={24} color="#FF6B35" />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
                Quản lý Cơ Sở Dữ Liệu
              </div>
              <div style={{ fontSize: 12, color: '#B0B0C3' }}>
                Chỉnh sửa thông số & Đặt lại dữ liệu
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#6B6B80', cursor: 'pointer', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Booster Buttons */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#B0B0C3', marginBottom: 8 }}>
            ⚡ Nạp Nhanh Tài Nguyên
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            <button
              onClick={() => setCoins((c) => c + 1000)}
              style={{
                background: '#25253D',
                border: '1px solid rgba(247, 201, 72, 0.3)',
                borderRadius: 10,
                padding: '8px 12px',
                color: '#F7C948',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Coins size={16} /> +1,000 Coins
            </button>
            <button
              onClick={() => setRuby((r) => r + 100)}
              style={{
                background: '#25253D',
                border: '1px solid rgba(255, 71, 87, 0.3)',
                borderRadius: 10,
                padding: '8px 12px',
                color: '#FF4757',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <span>💎</span> +100 Ruby
            </button>
            <button
              onClick={() => setStamina((s) => Math.min(500, s + 50))}
              style={{
                background: '#25253D',
                border: '1px solid rgba(83, 82, 237, 0.3)',
                borderRadius: 10,
                padding: '8px 12px',
                color: '#5352ED',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Zap size={16} /> +50 Stamina
            </button>
            <button
              onClick={() => setStamina(isVIP ? 500 : 200)}
              style={{
                background: 'rgba(46, 213, 115, 0.15)',
                border: '1px solid #2ED573',
                borderRadius: 10,
                padding: '8px 12px',
                color: '#2ED573',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Check size={16} /> Hồi Đầy Stamina
            </button>
          </div>
        </div>

        {/* Input Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: '#B0B0C3', display: 'block', marginBottom: 4 }}>Coins</label>
              <input
                type="number"
                value={coins}
                onChange={(e) => setCoins(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#25253D',
                  border: '1px solid #25253D',
                  borderRadius: 10,
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#B0B0C3', display: 'block', marginBottom: 4 }}>Ruby</label>
              <input
                type="number"
                value={ruby}
                onChange={(e) => setRuby(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#25253D',
                  border: '1px solid #25253D',
                  borderRadius: 10,
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: '#B0B0C3', display: 'block', marginBottom: 4 }}>Stamina</label>
              <input
                type="number"
                value={stamina}
                onChange={(e) => setStamina(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#25253D',
                  border: '1px solid #25253D',
                  borderRadius: 10,
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#B0B0C3', display: 'block', marginBottom: 4 }}>Level</label>
              <input
                type="number"
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#25253D',
                  border: '1px solid #25253D',
                  borderRadius: 10,
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: '#B0B0C3', display: 'block', marginBottom: 4 }}>Tổng Điểm</label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#25253D',
                  border: '1px solid #25253D',
                  borderRadius: 10,
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#B0B0C3', display: 'block', marginBottom: 4 }}>Streak (Ngày)</label>
              <input
                type="number"
                value={streak}
                onChange={(e) => setStreak(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#25253D',
                  border: '1px solid #25253D',
                  borderRadius: 10,
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* VIP Toggle */}
          <div
            onClick={() => setIsVIP(!isVIP)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: '#25253D',
              borderRadius: 12,
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>
              💎 Trạng Thái Thành Viên VIP
            </span>
            <div
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: isVIP ? '#FF6B35' : '#1A1A2E',
                position: 'relative',
                transition: 'background 0.2s',
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  position: 'absolute',
                  top: 3,
                  left: isVIP ? 23 : 3,
                  transition: 'left 0.2s',
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={handleSave}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #FF6B35, #FF8E53)',
              border: 'none',
              borderRadius: 12,
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            LƯU THAY ĐỔI CSDL
          </button>

          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 71, 87, 0.1)',
                border: '1px solid rgba(255, 71, 87, 0.3)',
                borderRadius: 12,
                color: '#FF4757',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <RefreshCw size={16} /> Đặt Lại CSDL Mặc Định (Factory Reset)
            </button>
          ) : (
            <div
              style={{
                background: 'rgba(255, 71, 87, 0.15)',
                border: '1px solid #FF4757',
                borderRadius: 12,
                padding: 12,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 12, color: '#FF4757', fontWeight: 600, marginBottom: 8 }}>
                ⚠️ Bạn có chắc muốn xóa toàn bộ và đặt lại mặc định?
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleReset}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#FF4757',
                    border: 'none',
                    borderRadius: 8,
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Xác Nhận Xóa
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#25253D',
                    border: 'none',
                    borderRadius: 8,
                    color: '#B0B0C3',
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
