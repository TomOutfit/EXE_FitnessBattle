import React from 'react';
import { Heart, Zap, Trophy, Flame } from 'lucide-react';

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
        <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: big ? 28 : 22, fontWeight: 800, color: color || c.text, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        {sub && <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>{sub}</span>}
      </div>
    </div>
  );
};

interface XpBarProps {
  xp: number;
  xpToNext: number;
  level: number;
  compact?: boolean;
}

export const XpBar: React.FC<XpBarProps> = ({ xp, xpToNext, level, compact }) => {
  const pct = Math.min((xp / xpToNext) * 100, 100);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 10 : 12 }}>
      <div style={{
        width: compact ? 36 : 48, height: compact ? 36 : 48, borderRadius: '50%',
        background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: compact ? 14 : 18, fontWeight: 800, color: '#fff',
        boxShadow: '0 0 16px rgba(255,107,53,0.4)', flexShrink: 0,
      }}>
        {level}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>XP</span>
          <span style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600 }}>{xp.toLocaleString()} / {xpToNext.toLocaleString()}</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'var(--bg4)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gradient-primary)', borderRadius: 3, transition: 'width 1s ease-out', boxShadow: '0 0 8px rgba(255,107,53,0.5)' }} />
        </div>
      </div>
    </div>
  );
};

interface AvatarProps {
  src: string;
  alt: string;
  size?: number;
  online?: boolean;
  level?: number;
  ring?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 40, online, level, ring }) => {
  return (
    <div style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: '50%', border: ring ? `2px solid ${ring}` : '2px solid var(--border)', padding: 2, background: ring ? 'transparent' : 'var(--bg)' }}>
        <img src={src} alt={alt} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { const img = e.currentTarget; img.style.display = 'none'; const fallback = img.nextElementSibling as HTMLElement | null; if (fallback) fallback.style.display = 'flex'; }} />
        <div style={{ display: 'none', position: 'absolute', inset: 2, borderRadius: '50%', background: 'var(--bg3)', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, color: 'var(--text2)', lineHeight: 1 }}>{alt[0]?.toUpperCase()}</div>
      </div>
      {online !== undefined && (
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: size * 0.28, height: size * 0.28, borderRadius: '50%', background: online ? '#2ed573' : '#5a5a75', border: '2px solid var(--bg)' }} />
      )}
      {level !== undefined && (
        <div style={{ position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20, borderRadius: 10, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff', padding: '0 4px', boxShadow: '0 2px 6px rgba(255,107,53,0.4)' }}>
          {level}
        </div>
      )}
    </div>
  );
};

interface BadgeIconProps {
  badgeId: string;
  name: string;
  color: string;
  earned: boolean;
  size?: number;
}

const badgeEmojis: Record<string, string> = {
  shield: '🛡️', flame: '🔥', trophy: '🏆',
  'heart-pulse': '💓', users: '👥', crown: '👑',
};

export const BadgeIcon: React.FC<BadgeIconProps> = ({ badgeId, name, color, earned, size = 32 }) => {
  return (
    <div style={{
      width: size, height: size, borderRadius: 10,
      background: earned ? `${color}22` : 'rgba(90,90,117,0.15)',
      border: `1.5px solid ${earned ? color : 'var(--text4)'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: earned ? 1 : 0.4, filter: earned ? 'none' : 'grayscale(1)',
      boxShadow: earned ? `0 0 10px ${color}40` : 'none',
      cursor: 'pointer',
    }} title={name}>
      {earned ? (badgeEmojis[badgeId] || '⭐') : '🔒'}
    </div>
  );
};

interface TagProps {
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

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', fullWidth, children, style, ...props }) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--gradient-primary)', color: '#fff', border: 'none', boxShadow: '0 4px 14px rgba(255,107,53,0.3)' },
    secondary: { background: 'var(--gradient-secondary)', color: '#fff', border: 'none', boxShadow: '0 4px 14px rgba(83,82,237,0.3)' },
    outline: { background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)' },
    ghost: { background: 'rgba(255,255,255,0.06)', color: 'var(--text2)', border: '1px solid transparent' },
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

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, color = 'var(--primary)', height = 8, showLabel, label }) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>{label}</span>
          <span style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600 }}>{value} / {max}</span>
        </div>
      )}
      <div style={{ height, background: 'var(--bg4)', borderRadius: height / 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: height / 2, transition: 'width 1.2s ease-out', boxShadow: `0 0 8px ${color}60`, position: 'relative' }}>
          {pct >= 100 && <div style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', width: 4, height: 4, borderRadius: '50%', background: '#fff' }} />}
        </div>
      </div>
    </div>
  );
};
