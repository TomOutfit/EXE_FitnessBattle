import type { User, Battle, Challenge } from '../types';

export function getXpProgress(user: User): number {
  return Math.round((user.xp / user.xpToNextLevel) * 100);
}

export function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}p`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}p` : `${h}h`;
}

export function getRankTitle(rank: number): string {
  if (rank <= 10) return 'Huyền thoại';
  if (rank <= 50) return 'Chiến binh';
  if (rank <= 100) return 'Người tập';
  return 'Tân binh';
}

export function getRankColor(rank: number): string {
  if (rank === 1) return '#ffd700';
  if (rank === 2) return '#c0c0c0';
  if (rank === 3) return '#cd7f32';
  if (rank <= 10) return '#ff6b35';
  if (rank <= 50) return '#5352ed';
  if (rank <= 100) return '#2ed573';
  return '#9898b0';
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 30) return '🔥';
  if (streak >= 14) return '⚡';
  if (streak >= 7) return '✨';
  return '';
}

export function getBattleStatusColor(status: Battle['status']): string {
  switch (status) {
    case 'active': return '#2ed573';
    case 'waiting': return '#f7c948';
    case 'finished': return '#9898b0';
    default: return '#9898b0';
  }
}

export function getBattleStatusLabel(status: Battle['status']): string {
  switch (status) {
    case 'active': return 'Đang đấu';
    case 'waiting': return 'Chờ';
    case 'finished': return 'Kết thúc';
    default: return status;
  }
}

export function getChallengeTypeColor(type: Challenge['type']): string {
  switch (type) {
    case 'daily': return '#ff6b35';
    case 'weekly': return '#5352ed';
    case 'monthly': return '#a55eea';
    case 'special': return '#ffd700';
    default: return '#9898b0';
  }
}

export function getChallengeTypeLabel(type: Challenge['type']): string {
  switch (type) {
    case 'daily': return 'Ngày';
    case 'weekly': return 'Tuần';
    case 'monthly': return 'Tháng';
    case 'special': return 'Đặc biệt';
    default: return type;
  }
}
