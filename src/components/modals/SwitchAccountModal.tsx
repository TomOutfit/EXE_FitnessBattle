import React from 'react';
import { useUser } from '../../context/UserContext';
import { AvatarWidget } from '../ui';
import { UserCheck, X } from 'lucide-react';

interface SwitchAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SwitchAccountModal: React.FC<SwitchAccountModalProps> = ({ isOpen, onClose }) => {
  const { user, accounts, switchAccount } = useUser();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#1A1A2E',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: '24px 20px',
          border: '1px solid #25253D',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.5)',
          animation: 'fadeInUp 0.25s ease-out',
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
              <UserCheck size={24} color="#FF6B35" />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
                Chuyển Đổi Tài Khoản
              </div>
              <div style={{ fontSize: 13, color: '#B0B0C3' }}>
                Chọn tài khoản đã lưu trong CSDL
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6B6B80',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Account List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {accounts.map((acc) => {
            const isCurrent = acc.user.id === user.id || acc.email === user.email;

            return (
              <div
                key={acc.email}
                onClick={() => {
                  if (!isCurrent) {
                    switchAccount(acc.email);
                    onClose();
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 14,
                  borderRadius: 16,
                  background: isCurrent ? 'rgba(255, 107, 53, 0.12)' : '#25253D',
                  border: isCurrent ? '1.5px solid #FF6B35' : '1px solid #25253D',
                  cursor: isCurrent ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <AvatarWidget
                  avatarUrl={acc.user.avatar}
                  size={46}
                  isVIP={acc.user.isVIP}
                  level={acc.user.level}
                />
                <div style={{ marginLeft: 14, flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF' }}>
                      {acc.user.name}
                    </span>
                    {acc.user.isVIP && (
                      <span
                        style={{
                          background: 'linear-gradient(135deg, #FF6B35, #FFD700)',
                          color: '#000',
                          fontSize: 9,
                          fontWeight: 900,
                          padding: '1px 6px',
                          borderRadius: 8,
                        }}
                      >
                        VIP
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
                    {acc.email} • Level {acc.user.level} • {acc.user.totalPoints} pts
                  </div>
                </div>

                {isCurrent ? (
                  <span
                    style={{
                      background: '#FF6B35',
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 12,
                    }}
                  >
                    Hiện tại
                  </span>
                ) : (
                  <span style={{ color: '#FF6B35', fontSize: 13, fontWeight: 600 }}>
                    Chọn ➔
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
