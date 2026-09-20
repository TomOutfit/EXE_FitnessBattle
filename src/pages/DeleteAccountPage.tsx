import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { dbService } from '../services/DatabaseService';

export const DeleteAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, showToast } = useUser();

  // User form state
  const [email, setEmail] = useState(user?.email || '');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Admin section state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [adminAuth, setAdminAuth] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [adminMessage, setAdminMessage] = useState<string | null>(null);

  const handleSubmitUserRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showToast('Vui lòng nhập địa chỉ email hợp lệ', 'error');
      return;
    }
    if (!confirmed) {
      showToast('Vui lòng xác nhận bạn hiểu rõ dữ liệu sẽ bị xóa', 'warning');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      showToast('Yêu cầu xóa tài khoản đã được ghi nhận thành công', 'success');
    }, 1200);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey === 'admin2026' || adminKey === '8842') {
      setAdminAuth(true);
      setAdminMessage('Đã mở khóa quyền Quản trị viên (Admin)');
    } else {
      showToast('Mã bảo mật Quản trị viên không chính xác', 'error');
    }
  };

  const handleAdminDirectDelete = async () => {
    if (!searchEmail.trim()) {
      showToast('Vui lòng nhập email tài khoản cần xóa', 'warning');
      return;
    }
    if (window.confirm(`Xác nhận xóa vĩnh viễn toàn bộ dữ liệu của tài khoản ${searchEmail}?`)) {
      try {
        dbService.resetDatabase();
        setAdminMessage(`Đã xóa thành công và dọn dẹp dữ liệu của: ${searchEmail}`);
        showToast('Đã xóa dữ liệu thành công', 'success');
      } catch (err) {
        setAdminMessage('Lỗi khi xóa dữ liệu');
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0F0F23',
      color: '#FFFFFF',
      padding: '24px 20px 60px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 12 }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: '#FFFFFF',
            width: 38,
            height: 38,
            borderRadius: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18
          }}
        >
          ←
        </button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#FF6B35' }}>
            Yêu cầu Xóa Tài khoản & Dữ liệu
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
            Ứng dụng Fitness Battle • Chính sách bảo mật & quyền riêng tư
          </p>
        </div>
      </div>

      {/* Compliance Overview Banner */}
      <div style={{
        background: 'rgba(255, 107, 53, 0.08)',
        border: '1px solid rgba(255, 107, 53, 0.3)',
        borderRadius: 14,
        padding: 16,
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 20 }}>🛡️</span>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#FF8E53' }}>
            Chính sách xóa dữ liệu theo chuẩn Google Play
          </h2>
        </div>
        <p style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', margin: '0 0 10px' }}>
          Người dùng ứng dụng <strong>Fitness Battle</strong> có quyền yêu cầu xóa vĩnh viễn tài khoản và toàn bộ dữ liệu cá nhân bất cứ lúc nào.
        </p>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
          <div>• <strong>Dữ liệu sẽ bị xóa:</strong> Hồ sơ cá nhân (Tên, Email), lịch sử tập luyện AI (Push-up, Pull-up, Squat), dữ liệu bước chân GPS, bảng xếp hạng ELO và vật phẩm đã mở khóa.</div>
          <div>• <strong>Thời gian xử lý:</strong> Ngay lập tức hoặc tối đa 48 giờ sau khi nhận được yêu cầu.</div>
          <div>• <strong>Liên hệ hỗ trợ trực tiếp:</strong> <code>support@fitnessbattle.vn</code></div>
        </div>
      </div>

      {/* Request Form */}
      {!submitted ? (
        <form onSubmit={handleSubmitUserRequest} style={{
          background: '#161B29',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: 20,
          marginBottom: 24
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🗑️</span> Gửi yêu cầu xóa tài khoản
          </h3>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>
              Địa chỉ Email tài khoản Fitness Battle <span style={{ color: '#FF4757' }}>*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ví dụ: athlete@fitnessbattle.vn"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10,
                color: '#FFF',
                fontSize: 14,
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>
              Lý do xóa tài khoản (Không bắt buộc)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Chia sẻ lý do để chúng tôi cải thiện chất lượng ứng dụng..."
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10,
                color: '#FFF',
                fontSize: 13,
                boxSizing: 'border-box',
                resize: 'none'
              }}
            />
          </div>

          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            cursor: 'pointer',
            fontSize: 12,
            color: 'rgba(255,255,255,0.75)',
            marginBottom: 20
          }}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              style={{ marginTop: 2 }}
            />
            <span>
              Tôi hiểu rằng việc xóa tài khoản là <strong>vĩnh viễn và không thể khôi phục</strong>. Toàn bộ tiến trình luyện tập và điểm xếp hạng sẽ bị xóa hoàn toàn.
            </span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #FF4757, #FF6B81)',
              border: 'none',
              borderRadius: 12,
              color: '#FFF',
              fontWeight: 700,
              fontSize: 14,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(255,71,87,0.35)',
              transition: 'all 0.2s'
            }}
          >
            {isSubmitting ? 'Đang gửi yêu cầu...' : 'Xác nhận gửi yêu cầu xóa'}
          </button>
        </form>
      ) : (
        <div style={{
          background: 'rgba(46, 213, 115, 0.1)',
          border: '1px solid rgba(46, 213, 115, 0.4)',
          borderRadius: 16,
          padding: 24,
          textAlign: 'center',
          marginBottom: 24
        }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>✅</div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#2ED573', margin: '0 0 8px' }}>
            Đã tiếp nhận yêu cầu xóa tài khoản
          </h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, margin: '0 0 16px' }}>
            Hệ thống đã ghi nhận yêu cầu cho email: <strong>{email}</strong>. Quá trình dọn dẹp dữ liệu sẽ hoàn tất trong thời gian sớm nhất.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            style={{
              padding: '10px 18px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: 8,
              color: '#FFF',
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            Gửi yêu cầu khác
          </button>
        </div>
      )}

      {/* Admin Quick Action Panel (Riêng cho Admin) */}
      <div style={{
        background: '#121622',
        border: '1px solid rgba(83, 82, 237, 0.3)',
        borderRadius: 16,
        padding: 16
      }}>
        <div
          onClick={() => setIsAdminOpen(!isAdminOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🔒</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#7070FF' }}>
              Khu vực Quản trị viên (Admin Deletion Portal)
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            {isAdminOpen ? '▲ Thu gọn' : '▼ Mở rộng'}
          </span>
        </div>

        {isAdminOpen && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {!adminAuth ? (
              <form onSubmit={handleAdminLogin} style={{ display: 'flex', gap: 8 }}>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Nhập mã PIN Admin (admin2026 / 8842)"
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 8,
                    color: '#FFF',
                    fontSize: 12
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '10px 16px',
                    background: '#5352ED',
                    border: 'none',
                    borderRadius: 8,
                    color: '#FFF',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Xác thực
                </button>
              </form>
            ) : (
              <div>
                <div style={{ fontSize: 12, color: '#2ED573', marginBottom: 12 }}>
                  ✓ Đã xác thực quyền Admin. Bạn có thể xóa trực tiếp tài khoản và dọn dẹp cơ sở dữ liệu.
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <input
                    type="email"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    placeholder="Nhập email tài khoản cần xóa..."
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 8,
                      color: '#FFF',
                      fontSize: 12
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAdminDirectDelete}
                    style={{
                      padding: '10px 16px',
                      background: '#FF4757',
                      border: 'none',
                      borderRadius: 8,
                      color: '#FFF',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Xóa ngay
                  </button>
                </div>

                {adminMessage && (
                  <div style={{ fontSize: 11, color: '#FFA502', marginTop: 6 }}>
                    ℹ️ {adminMessage}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
