import React from 'react';
import { Heart, Zap, Trophy, Flame, ChevronRight } from 'lucide-react';

// ============================================
// APP CARD (Matching Flutter AppCard)
// ============================================
export interface AppCardProps {
  children: React.ReactNode;
  padding?: string | number;
  onTap?: () => void;
  color?: string;
  gradient?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  padding = 16,
  onTap,
  color = '#1A1A2E',
  gradient,
  style,
  className
}) => {
  return (
    <div
      onClick={onTap}
      className={className}
      style={{
        background: gradient || color,
        borderRadius: 16,
        padding,
        border: '1px solid #25253D',
        cursor: onTap ? 'pointer' : 'default',
        boxSizing: 'border-box',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        ...style
      }}
    >
      {children}
    </div>
  );
};

// ============================================
// GRADIENT BUTTON (Matching Flutter GradientButton)
// ============================================
export interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  onPressed?: () => void;
  gradient?: string;
  width?: string | number;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  text,
  onPressed,
  gradient = 'linear-gradient(135deg, #FF6B35, #FF8E53)',
  width,
  icon,
  fullWidth,
  style,
  ...props
}) => {
  return (
    <button
      {...props}
      onClick={onPressed || props.onClick}
      style={{
        width: fullWidth ? '100%' : width,
        background: gradient,
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(255, 107, 53, 0.35)',
        border: 'none',
        color: '#FFFFFF',
        padding: '12px 20px',
        fontWeight: 600,
        fontSize: 14,
        fontFamily: 'var(--font)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'all 0.2s ease',
        ...style
      }}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
};

// ============================================
// BUTTON (Legacy & Standard Helper)
// ============================================
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', fullWidth, children, style, ...props }) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { background: 'linear-gradient(135deg, #FF6B35, #FF8E53)', color: '#fff', border: 'none', boxShadow: '0 4px 14px rgba(255,107,53,0.3)' },
    secondary: { background: 'linear-gradient(135deg, #5352ED, #7070FF)', color: '#fff', border: 'none', boxShadow: '0 4px 14px rgba(83,82,237,0.3)' },
    outline: { background: 'transparent', color: '#B0B0C3', border: '1px solid #25253D' },
    ghost: { background: 'rgba(255,255,255,0.06)', color: '#B0B0C3', border: '1px solid transparent' },
    danger: { background: 'linear-gradient(135deg, #ff4757, #ff6b81)', color: '#fff', border: 'none' },
  };
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '8px 14px', fontSize: 12, borderRadius: 10 },
    md: { padding: '10px 20px', fontSize: 14, borderRadius: 12 },
    lg: { padding: '14px 28px', fontSize: 15, borderRadius: 14 },
  };

  return (
    <button
      {...props}
      style={{ ...variantStyles[variant], ...sizeStyles[size], width: fullWidth ? '100%' : undefined, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s', ...style }}
    >
      {children}
    </button>
  );
};

// ============================================
// TAG (Legacy Helper)
// ============================================
export interface TagProps {
  children: React.ReactNode;
  color?: string;
  size?: 'sm' | 'md';
}

export const Tag: React.FC<TagProps> = ({ children, color = '#5352ed', size = 'sm' }) => {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: size === 'sm' ? '3px 8px' : '5px 12px',
      borderRadius: 20, fontSize: size === 'sm' ? 11 : 13, fontWeight: 600,
      background: `${color}22`, border: `1px solid ${color}66`, color: color,
    }}>
      {children}
    </span>
  );
};

// ============================================
// CURRENCY DISPLAY (Matching Flutter CurrencyDisplay)
// ============================================
export interface CurrencyDisplayProps {
  icon: React.ReactNode | string;
  amount: number | string;
  iconColor?: string;
  iconSize?: number;
  textSize?: number;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  icon,
  amount,
  textSize = 14
}) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {typeof icon === 'string' ? <span style={{ fontSize: textSize }}>{icon}</span> : icon}
      <span style={{ fontSize: textSize, fontWeight: 600, color: '#FFFFFF' }}>
        {typeof amount === 'number' ? amount.toLocaleString() : amount}
      </span>
    </div>
  );
};

// ============================================
// AVATAR WIDGET (Matching Flutter AvatarWidget & Legacy Avatar)
// ============================================
export interface AvatarWidgetProps {
  avatarUrl?: string;
  src?: string;
  alt?: string;
  size?: number;
  showBorder?: boolean;
  borderColor?: string;
  ring?: string;
  online?: boolean;
  level?: number;
  isVIP?: boolean;
  onClick?: () => void;
}

export const AvatarWidget: React.FC<AvatarWidgetProps> = ({
  avatarUrl,
  src,
  alt = 'User',
  size = 48,
  showBorder = false,
  borderColor = '#FF6B35',
  ring,
  online,
  level,
  isVIP,
  onClick
}) => {
  const finalSrc = avatarUrl || src || 'https://api.dicebear.com/9.x/avataaars/svg?seed=Warrior&backgroundColor=b6e3f4';
  const ringColor = isVIP ? '#FFD700' : (ring || borderColor);
  const hasBorder = showBorder || Boolean(ring) || isVIP;

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default',
        display: 'inline-block'
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          background: '#25253D',
          border: hasBorder ? `2.5px solid ${ringColor}` : '2px solid #25253D',
          boxShadow: isVIP ? '0 0 12px rgba(255, 215, 0, 0.4)' : 'none',
          boxSizing: 'border-box'
        }}
      >
        <img
          src={finalSrc}
          alt={alt}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.currentTarget.src = 'https://api.dicebear.com/9.x/avataaars/svg?seed=Warrior&backgroundColor=b6e3f4';
          }}
        />
      </div>

      {online !== undefined && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: Math.max(10, Math.round(size * 0.28)),
            height: Math.max(10, Math.round(size * 0.28)),
            borderRadius: '50%',
            background: online ? '#2ED573' : '#6B6B80',
            border: '2px solid #0F0F23'
          }}
        />
      )}

      {level !== undefined && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            background: '#FF6B35',
            color: '#FFFFFF',
            borderRadius: '50%',
            width: Math.max(18, Math.round(size * 0.35)),
            height: Math.max(18, Math.round(size * 0.35)),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: Math.max(9, Math.round(size * 0.18)),
            fontWeight: 800,
            border: '2px solid #0F0F23'
          }}
        >
          {level}
        </div>
      )}
    </div>
  );
};

export const Avatar = AvatarWidget;

// ============================================
// XP PROGRESS BAR (Matching Flutter XpProgressBar)
// ============================================
export interface XpProgressBarProps {
  currentXp?: number;
  xp?: number;
  xpToNextLevel?: number;
  xpToNext?: number;
  level: number;
  compact?: boolean;
}

export const XpProgressBar: React.FC<XpProgressBarProps> = ({
  currentXp,
  xp,
  xpToNextLevel,
  xpToNext,
  level,
}) => {
  const actualXp = currentXp !== undefined ? currentXp : (xp || 0);
  const actualNext = xpToNextLevel !== undefined ? xpToNextLevel : (xpToNext || 6000);
  const pct = Math.min(100, Math.round((actualXp / Math.max(1, actualNext)) * 100));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#FF6B35' }}>
          Level {level}
        </span>
        <span style={{ fontSize: 11, color: '#B0B0C3' }}>
          {actualXp.toLocaleString()} / {actualNext.toLocaleString()} XP
        </span>
      </div>

      <div style={{ height: 8, background: '#25253D', borderRadius: 4, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #FF6B35, #FF8E53)',
            borderRadius: 4,
            transition: 'width 0.4s ease'
          }}
        />
      </div>
    </div>
  );
};

export const XpBar = XpProgressBar;

// ============================================
// PROGRESS BAR (Matching Flutter ProgressBar)
// ============================================
export interface ProgressBarProps {
  progress?: number;
  value?: number;
  max?: number;
  color?: string;
  height?: number;
  backgroundColor?: string;
  showLabel?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  value,
  max,
  color = '#FF6B35',
  height = 8,
  backgroundColor = '#25253D',
  showLabel,
  label
}) => {
  const factor = progress !== undefined ? progress : value !== undefined && max !== undefined ? value / max : 0;
  const pct = Math.min(100, Math.max(0, Math.round(factor * 100)));

  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: '#6B6B80' }}>{label}</span>
          <span style={{ fontSize: 11, color: '#B0B0C3', fontWeight: 600 }}>{value} / {max}</span>
        </div>
      )}
      <div style={{ height, background: backgroundColor, borderRadius: height / 2, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: color,
            borderRadius: height / 2,
            transition: 'width 0.4s ease'
          }}
        />
      </div>
    </div>
  );
};

// ============================================
// STAT ROW (Matching Flutter _StatRow)
// ============================================
export interface StatRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
}

export const StatRow: React.FC<StatRowProps> = ({ icon, label, value, color = '#FF6B35' }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
          flexShrink: 0
        }}
      >
        {icon}
      </div>
      <span style={{ fontSize: 14, color: '#B0B0C3', flex: 1 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF' }}>{value}</span>
    </div>
  );
};

// ============================================
// MENU ITEM (Matching Flutter _MenuItem)
// ============================================
export interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onTap: () => void;
  iconColor?: string;
  textColor?: string;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  subtitle,
  onTap,
  textColor
}) => {
  return (
    <div
      onClick={onTap}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: 16,
        cursor: 'pointer',
        transition: 'background 0.15s ease'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: '#25253D',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
          flexShrink: 0
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: textColor || '#FFFFFF' }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {subtitle}
        </div>
      </div>

      <ChevronRight size={18} color="#6B6B80" style={{ flexShrink: 0 }} />
    </div>
  );
};

// ============================================
// STATS CARD (Legacy / Compact)
// ============================================
interface StatsCardProps {
  icon: 'heart' | 'zap' | 'trophy' | 'flame';
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  big?: boolean;
  live?: boolean;
}

const iconMap = { heart: Heart, zap: Zap, trophy: Trophy, flame: Flame };

const colorMap: Record<string, { bg: string; border: string; glow: string; text: string }> = {
  heart: { bg: 'rgba(255,71,87,0.12)', border: 'rgba(255,71,87,0.3)', glow: 'rgba(255,71,87,0.2)', text: '#ff4757' },
  zap: { bg: 'rgba(247,201,72,0.12)', border: 'rgba(247,201,72,0.3)', glow: 'rgba(247,201,72,0.2)', text: '#f7c948' },
  trophy: { bg: 'rgba(83,82,237,0.12)', border: 'rgba(83,82,237,0.3)', glow: 'rgba(83,82,237,0.2)', text: '#5352ed' },
  flame: { bg: 'rgba(255,107,53,0.12)', border: 'rgba(255,107,53,0.3)', glow: 'rgba(255,107,53,0.2)', text: '#ff6b35' },
};

export const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value, sub, color, big, live }) => {
  const c = colorMap[icon] || colorMap.zap;
  const IconComp = iconMap[icon];

  return (
    <div style={{
      background: `linear-gradient(145deg, ${c.bg}, rgba(10,10,15,0.8))`,
      border: `1px solid ${c.border}`,
      borderRadius: 16,
      padding: big ? '20px 18px' : '16px',
      display: 'flex', flexDirection: 'column', gap: 8,
      flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden',
      boxShadow: `0 4px 16px ${c.glow}`,
    }}>
      {live && (
        <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2ed573', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: 10, color: '#2ed573', fontWeight: 600 }}>LIVE</span>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${c.border}` }}>
          <IconComp size={18} color={c.text} />
        </div>
        <span style={{ fontSize: 11, color: '#B0B0C3', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: big ? 28 : 22, fontWeight: 800, color: color || c.text, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        {sub && <span style={{ fontSize: 12, color: '#B0B0C3', fontWeight: 500 }}>{sub}</span>}
      </div>
    </div>
  );
};

// ============================================
// TOAST NOTIFICATIONS
// ============================================
export interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

const toastStyles = {
  success: { bg: 'rgba(46,213,115,0.15)', border: 'rgba(46,213,115,0.3)', text: '#2ed573' },
  error: { bg: 'rgba(255,71,87,0.15)', border: 'rgba(255,71,87,0.3)', text: '#ff4757' },
  info: { bg: 'rgba(83,82,237,0.15)', border: 'rgba(83,82,237,0.3)', text: '#5352ed' },
  warning: { bg: 'rgba(255,215,0,0.15)', border: 'rgba(255,215,0,0.3)', text: '#ffd700' },
};

const toastIcons = {
  success: '✅',
  error: '❌',
  info: '💡',
  warning: '⚠️',
};

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', flexDirection: 'column', gap: 8, zIndex: 9999,
      width: '90%', maxWidth: 420, pointerEvents: 'none',
    }}>
      {toasts.map((toast) => {
        const s = toastStyles[toast.type];
        return (
          <div
            key={toast.id}
            onClick={() => onDismiss(toast.id)}
            style={{
              padding: '12px 16px',
              background: '#1A1A2E',
              border: `1px solid ${s.border}`,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              pointerEvents: 'auto',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            }}
          >
            <span style={{ fontSize: 18 }}>{toastIcons[toast.type]}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', flex: 1 }}>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
