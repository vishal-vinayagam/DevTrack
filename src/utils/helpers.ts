import { format, parseISO, isToday, isYesterday } from 'date-fns';

export function formatDate(dateString: string): string {
  const date = parseISO(dateString);
  
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  
  return format(date, 'MMM d, yyyy');
}

export function formatDateTime(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'MMM d, yyyy h:mm a');
}

export function formatRelativeTime(dateString: string): string {
  const date = parseISO(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return format(date, 'MMM d');
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    coding: 'hsl(190, 100%, 50%)',
    job: 'hsl(280, 100%, 60%)',
    learning: 'hsl(45, 100%, 50%)',
    personal: 'hsl(140, 70%, 50%)',
  };
  return colors[category] || 'hsl(0, 0%, 60%)';
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'hsl(140, 70%, 50%)',
    medium: 'hsl(45, 100%, 50%)',
    high: 'hsl(0, 84%, 60%)',
  };
  return colors[priority] || 'hsl(0, 0%, 60%)';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'hsl(0, 0%, 60%)',
    'in-progress': 'hsl(45, 100%, 50%)',
    completed: 'hsl(140, 70%, 50%)',
  };
  return colors[status] || 'hsl(0, 0%, 60%)';
}

export function calculateStreak(activities: { date: string; hasActivity: boolean }[]): number {
  if (activities.length === 0) return 0;
  
  const sorted = [...activities].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  const lastActivity = sorted.find(a => a.hasActivity);
  if (!lastActivity) return 0;
  
  if (lastActivity.date !== today && lastActivity.date !== yesterday) {
    return 0;
  }
  
  for (const activity of sorted) {
    if (activity.hasActivity) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

export function getHeatmapColor(level: number): string {
  const colors = [
    'hsl(201, 50%, 15%)',
    'hsl(140, 50%, 25%)',
    'hsl(140, 60%, 35%)',
    'hsl(140, 70%, 45%)',
    'hsl(140, 80%, 55%)',
  ];
  return colors[level] || colors[0];
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function sortByDate<T extends { date: string }>(
  array: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...array].sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    return order === 'asc' ? diff : -diff;
  });
}
