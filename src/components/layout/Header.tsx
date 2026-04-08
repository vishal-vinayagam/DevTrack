import { motion } from 'framer-motion';
import { 
  Search, 
  Bell, 
  Moon, 
  Sun,
  Menu,
  Flame,
  CheckCircle2,
  X,
  Trophy,
  Sparkles,
  User,
  Settings
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatRelativeTime } from '@/utils/helpers';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onMenuClick: () => void;
  onPageChange: (page: string) => void;
}

export function Header({ onMenuClick, onPageChange }: HeaderProps) {
  const { state, dispatch } = useApp();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const isDarkTheme = state.userProfile.preferences.theme === 'dark';
  const unreadNotifications = state.notifications.filter(notification => !notification.read).length;
  
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = state.tasks.filter(t => t.dueDate === today);
  const completedToday = todayTasks.filter(t => t.status === 'completed').length;
  const totalToday = todayTasks.length;

  const toggleTheme = () => {
    dispatch({
      type: 'UPDATE_PROFILE',
      payload: {
        preferences: {
          ...state.userProfile.preferences,
          theme: isDarkTheme ? 'light' : 'dark',
        },
      },
    });
  };

  useEffect(() => {
    if (isNotificationsOpen && unreadNotifications > 0) {
      dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
    }
  }, [dispatch, isNotificationsOpen, unreadNotifications]);

  const getNotificationIcon = (type: string) => {
    if (type === 'achievement-unlocked') {
      return <Trophy className="h-4 w-4 text-yellow-300" />;
    }
    if (type === 'first-task-completed') {
      return <Sparkles className="h-4 w-4 text-cyan-300" />;
    }
    return <CheckCircle2 className="h-4 w-4 text-green-300" />;
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-foreground/60 hover:bg-foreground/5 hover:text-foreground lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="hidden items-center gap-2 text-sm text-foreground/60 sm:flex">
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Center - Daily Progress */}
        <div className="hidden items-center gap-4 md:flex">
          <div className="flex items-center gap-2 rounded-xl bg-foreground/5 px-4 py-2">
            <Flame className="h-4 w-4 text-orange-400" />
            <span className="text-sm text-foreground/80">
              {state.streakData.currentStreak} day streak
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-foreground/5 px-4 py-2">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span className="text-sm text-foreground/80">
              {completedToday}/{totalToday || 0} tasks today
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <motion.div
            initial={false}
            animate={{ width: isSearchOpen ? 240 : 40 }}
            className="relative overflow-hidden rounded-xl bg-foreground/5"
          >
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="flex h-10 w-10 items-center justify-center text-foreground/60 hover:text-foreground"
            >
              <Search className="h-5 w-5" />
            </button>
            {isSearchOpen && (
              <input
                type="text"
                placeholder="Search..."
                className="absolute left-10 right-2 top-1/2 -translate-y-1/2 bg-transparent text-sm text-foreground placeholder-foreground/40 outline-none"
                autoFocus
              />
            )}
          </motion.div>

          {/* Notifications */}
          <button
            onClick={() => setIsNotificationsOpen(prev => !prev)}
            className="relative rounded-xl p-2 text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
            aria-label="Toggle notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-semibold text-white">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-xl p-2 text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
            aria-label="Toggle theme"
            title={isDarkTheme ? 'Switch to white mode' : 'Switch to dark mode'}
          >
            {isDarkTheme ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* User Avatar Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-medium text-white">
                {state.userProfile.username.slice(0, 2).toUpperCase()}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-[70] border-white/10 bg-[hsl(201,100%,11%)] text-white">
              <DropdownMenuItem
                onClick={() => onPageChange('profile')}
                className="text-white/90 hover:text-white focus:bg-white/10"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onPageChange('settings')}
                className="text-white/90 hover:text-white focus:bg-white/10"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isNotificationsOpen && (
        <motion.div
          drag
          dragMomentum={false}
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed right-4 top-20 z-50 w-[min(92vw,380px)] rounded-2xl border border-white/10 bg-[hsl(201,100%,11%)] shadow-2xl"
        >
          <div className="flex cursor-move items-center justify-between border-b border-white/10 px-4 py-3">
            <h3 className="font-[family-name:var(--font-display)] text-lg text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch({ type: 'CLEAR_NOTIFICATIONS' })}
                className="text-xs text-white/60 hover:text-white"
              >
                Clear all
              </button>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white"
                aria-label="Close notifications"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-2">
            {state.notifications.length === 0 ? (
              <div className="rounded-xl bg-white/5 p-6 text-center text-sm text-white/60">
                No notifications yet
              </div>
            ) : (
              <div className="space-y-2">
                {state.notifications.map(notification => (
                  <div key={notification.id} className="rounded-xl bg-white/5 p-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-md bg-white/10 p-1.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">{notification.title}</p>
                        <p className="mt-1 text-xs text-white/70">{notification.message}</p>
                        <p className="mt-1 text-[11px] text-white/40">{formatRelativeTime(notification.createdAt)}</p>
                      </div>
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id })}
                        className="rounded-md p-1 text-white/50 hover:bg-white/10 hover:text-white"
                        aria-label="Remove notification"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </header>
  );
}
