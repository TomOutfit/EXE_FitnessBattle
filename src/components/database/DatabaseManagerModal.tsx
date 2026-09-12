import React, { useState } from 'react';
import { Database, RotateCcw, Save, X, CheckCircle } from 'lucide-react';
import { dbService } from '../../services/DatabaseService';
import { useUser } from '../../context/UserContext';

interface DatabaseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseManagerModal: React.FC<DatabaseManagerModalProps> = ({ isOpen, onClose }) => {
  const { user, setUser, showToast } = useUser();
  const [coins, setCoins] = useState(user.coins);
  const [ruby, setRuby] = useState(user.ruby);
  const [stamina, setStamina] = useState(user.stamina);
  const [level, setLevel] = useState(user.level);

  if (!isOpen) return null;

  const stats = dbService.getStatsSummary();

  const handleSave = () => {
    const updated = {
      ...user,
      coins: Number(coins),
      ruby: Number(ruby),
      stamina: Number(stamina),
      level: Number(level)
    };
    setUser(updated);
    dbService.saveUser(updated);
    showToast('✓ Đã cập nhật CSDL thành công!', 'success');
    onClose();
  };

  const handleReset = () => {
    if (window.confirm('Khôi phục toàn bộ CSDL về trạng thái dữ liệu mẫu ban đầu?')) {
      dbService.resetDatabase();
      const defaultU = dbService.getUser();
      setUser(defaultU);
      setCoins(defaultU.coins);
      setRuby(defaultU.ruby);
      setStamina(defaultU.stamina);
      setLevel(defaultU.level);
      showToast('✓ Đã khôi phục CSDL mẫu thành công!', 'success');
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        background: '#161B29',
        border: '1.5px solid #FF6B35',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '480px',
        padding: '24px',
        color: '#fff',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'rgba(255, 107, 53, 0.2)',
              padding: '10px',
              borderRadius: '12px',
              color: '#FF6B35'
            }}>
              <Database size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Quản Lý Cơ Sở Dữ Liệu</h3>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Dynamic Persistent Storage</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Collections summary */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '16px',
          padding: '14px',
          marginBottom: '18px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#2ED573', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={14} /> CÁC BẢNG DỮ LIỆU ĐỘNG ({Object.keys(stats).length} Tables)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            {Object.entries(stats).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '8px' }}>
                <span>{k}</span>
                <b style={{ color: '#fff' }}>{v}</b>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Edit Stats */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#FF6B35', display: 'block', marginBottom: '10px' }}>
            ⚡ ĐIỀU CHỈNH NHANH THÔNG SỐ (TEST DATA)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>🪙 Coins</span>
              <input
                type="number"
                value={coins}
                onChange={(e) => setCoins(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontWeight: 'bold'
                }}
              />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>💎 Ruby</span>
              <input
                type="number"
                value={ruby}
                onChange={(e) => setRuby(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontWeight: 'bold'
                }}
              />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>⚡ Stamina</span>
              <input
                type="number"
                value={stamina}
                onChange={(e) => setStamina(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontWeight: 'bold'
                }}
              />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>⭐ Level</span>
              <input
                type="number"
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontWeight: 'bold'
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleSave}
            style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Save size={18} /> LƯU THAY ĐỔI CSDL
          </button>
          <button
            onClick={handleReset}
            style={{
              background: 'rgba(255, 71, 87, 0.1)',
              border: '1px solid #FF4757',
              borderRadius: '12px',
              padding: '12px',
              color: '#FF4757',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <RotateCcw size={18} /> KHÔI PHỤC CSDL MẪU (RESET SEED)
          </button>
        </div>
      </div>
    </div>
  );
};
