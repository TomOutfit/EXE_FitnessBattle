import React, { useState } from 'react';
import { ShoppingBag, Star, Sparkles, CheckCircle, Tag } from 'lucide-react';
import { shopVouchers, skinItems } from '../data/mockData';
import { useUser } from '../context/UserContext';
import type { VoucherItem, SkinItem } from '../types';

export const ShopPage: React.FC = () => {
  const { user, addCoins, showToast } = useUser();
  const [activeTab, setActiveTab] = useState<'vouchers' | 'skins'>('vouchers');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [claimedVouchers, setClaimedVouchers] = useState<string[]>([]);
  const [purchasedSkins, setPurchasedSkins] = useState<string[]>([]);

  const filteredVouchers = selectedCategory === 'all'
    ? shopVouchers
    : shopVouchers.filter(v => v.category === selectedCategory);

  const handleRedeemVoucher = (voucher: VoucherItem) => {
    if (claimedVouchers.includes(voucher.id)) {
      showToast('Bạn đã đổi voucher này rồi!', 'info');
      return;
    }
    if (user.coins < voucher.coinPrice) {
      showToast(`Không đủ Coins! Bạn cần ${voucher.coinPrice} Coins nhưng chỉ có ${user.coins} Coins`, 'error');
      return;
    }
    addCoins(-voucher.coinPrice);
    setClaimedVouchers(prev => [...prev, voucher.id]);
    showToast(`🎉 Đổi thành công voucher "${voucher.title}"! Đã lưu vào ví quà tặng.`, 'success');
  };

  const handleBuySkin = (skin: SkinItem) => {
    if (purchasedSkins.includes(skin.id)) {
      showToast('Bạn đã sở hữu vật phẩm này!', 'info');
      return;
    }
    if (user.ruby < skin.price) {
      showToast(`Không đủ Ruby! Cần ${skin.price} 💎 nhưng chỉ có ${user.ruby} 💎`, 'error');
      return;
    }
    setPurchasedSkins(prev => [...prev, skin.id]);
    showToast(`✨ Mua thành công "${skin.name}"! Đã trang bị vào hồ sơ.`, 'success');
  };

  return (
    <div style={{ padding: '0 0 80px', maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 20px', background: 'linear-gradient(180deg, #14141e, var(--bg))', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingBag size={24} color="#ffd700" /> Cửa Hàng & Đổi Thưởng
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>Dùng Coins và Ruby đổi quà tặng độc quyền</p>
          </div>

          {/* Currency balances */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 12 }}>
              <Star size={14} color="#ffd700" />
              <span style={{ fontSize: 13, fontWeight: 800, color: '#ffd700' }}>{user.coins.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: 'rgba(255,71,87,0.12)', border: '1px solid rgba(255,71,87,0.25)', borderRadius: 12 }}>
              <span style={{ fontSize: 13 }}>💎</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#ff4757' }}>{user.ruby}</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button
            onClick={() => setActiveTab('vouchers')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 14,
              fontSize: 13,
              fontWeight: 800,
              background: activeTab === 'vouchers' ? 'var(--gradient-primary)' : 'var(--bg-card)',
              border: `1px solid ${activeTab === 'vouchers' ? 'transparent' : 'var(--border)'}`,
              color: activeTab === 'vouchers' ? '#fff' : 'var(--text3)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <Tag size={15} /> Voucher Đối Tác
          </button>
          <button
            onClick={() => setActiveTab('skins')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 14,
              fontSize: 13,
              fontWeight: 800,
              background: activeTab === 'skins' ? 'var(--gradient-primary)' : 'var(--bg-card)',
              border: `1px solid ${activeTab === 'skins' ? 'transparent' : 'var(--border)'}`,
              color: activeTab === 'skins' ? '#fff' : 'var(--text3)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <Sparkles size={15} /> Trang Phục & Hiệu Ứng
          </button>
        </div>

        {/* Voucher category subtabs */}
        {activeTab === 'vouchers' && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'gym', label: '🏋️ Gym & Fitness' },
              { id: 'fashion', label: '👟 Thời trang' },
              { id: 'nutrition', label: '🥤 Dinh dưỡng' },
              { id: 'drink', label: '☕ Đồ uống' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  background: selectedCategory === cat.id ? 'rgba(255,107,53,0.15)' : 'var(--bg-card)',
                  border: `1px solid ${selectedCategory === cat.id ? 'var(--primary)' : 'var(--border)'}`,
                  color: selectedCategory === cat.id ? 'var(--primary)' : 'var(--text3)',
                  cursor: 'pointer'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main List */}
      <div style={{ padding: '0 20px' }}>
        {activeTab === 'vouchers' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredVouchers.map(voucher => {
              const isClaimed = claimedVouchers.includes(voucher.id);
              const canAfford = user.coins >= voucher.coinPrice;

              return (
                <div
                  key={voucher.id}
                  style={{
                    background: 'linear-gradient(145deg, #14141e, #1a1a28)',
                    border: '1px solid var(--border)',
                    borderRadius: 18,
                    padding: 18,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                      flexShrink: 0
                    }}
                  >
                    {voucher.partnerLogo}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {voucher.partner}
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', margin: '2px 0 4px' }}>
                      {voucher.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: '#2ed573', fontWeight: 700 }}>{voucher.discountText}</span>
                      <span style={{ fontSize: 11, color: 'var(--text4)', textDecoration: 'line-through' }}>{voucher.originalPrice}</span>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 4 }}>
                      Hạn dùng: {voucher.expiresInDays} ngày sau khi đổi
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginBottom: 8 }}>
                      <Star size={14} color="#ffd700" />
                      <span style={{ fontSize: 16, fontWeight: 900, color: '#ffd700' }}>{voucher.coinPrice}</span>
                    </div>
                    {isClaimed ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: 'rgba(46,213,115,0.15)', borderRadius: 10, color: '#2ed573', fontSize: 12, fontWeight: 700 }}>
                        <CheckCircle size={14} /> Đã đổi
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRedeemVoucher(voucher)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 12,
                          background: canAfford ? 'var(--gradient-primary)' : 'var(--bg4)',
                          border: 'none',
                          color: canAfford ? '#fff' : 'var(--text4)',
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: canAfford ? 'pointer' : 'not-allowed',
                          boxShadow: canAfford ? '0 4px 12px rgba(255,107,53,0.35)' : 'none'
                        }}
                      >
                        Đổi ngay
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {skinItems.map(skin => {
              const isOwned = purchasedSkins.includes(skin.id);
              const canAfford = user.ruby >= skin.price;

              return (
                <div
                  key={skin.id}
                  style={{
                    background: 'linear-gradient(145deg, #14141e, #1a1a28)',
                    border: '1px solid var(--border)',
                    borderRadius: 18,
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative'
                  }}
                >
                  {skin.limited && (
                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,71,87,0.2)', border: '1px solid rgba(255,71,87,0.4)', borderRadius: 6, padding: '2px 6px', fontSize: 9, fontWeight: 800, color: '#ff4757' }}>
                      GIỚI HẠN
                    </div>
                  )}
                  <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '8px 0 12px' }}>
                    {skin.preview}
                  </div>
                  <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>{skin.name}</h4>
                  <div style={{ fontSize: 11, color: skin.rarity === 'legendary' ? '#ffd700' : skin.rarity === 'epic' ? '#a55eea' : '#2ed573', fontWeight: 700, textTransform: 'capitalize', marginBottom: 12 }}>
                    {skin.rarity}
                  </div>

                  <div style={{ marginTop: 'auto', width: '100%' }}>
                    {isOwned ? (
                      <div style={{ padding: '8px', background: 'rgba(46,213,115,0.15)', borderRadius: 10, color: '#2ed573', fontSize: 12, fontWeight: 700 }}>
                        Đã sở hữu
                      </div>
                    ) : (
                      <button
                        onClick={() => handleBuySkin(skin)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: 10,
                          background: canAfford ? 'linear-gradient(135deg, #ff4757, #ff6b81)' : 'var(--bg4)',
                          border: 'none',
                          color: canAfford ? '#fff' : 'var(--text4)',
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: canAfford ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4
                        }}
                      >
                        <span>💎 {skin.price} Ruby</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
