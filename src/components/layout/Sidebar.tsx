import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Flame, 
  BookOpen, 
  FileText, 
  BarChart3, 
  User, 
  Timer,
  Rocket,
  LogOut,
  Sparkles,
  Settings
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'streaks', label: 'Streaks', icon: Flame },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
  { id: 'apps', label: 'App Launcher', icon: Rocket },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ currentPage, onPageChange, onLogout }: SidebarProps) {
  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed left-0 top-0 z-40 hidden h-screen w-72 flex-col border-r border-border bg-card lg:flex"
    >
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-xl text-foreground">
            DevTrack
          </h1>
          <p className="text-xs text-foreground/50">Productivity Suite</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-1">
          <p className="mb-3 px-4 text-xs font-medium uppercase tracking-wider text-foreground/40">
            Main Menu
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground'
                }`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-cyan-400' : 'text-foreground/50 group-hover:text-foreground'}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto h-2 w-2 rounded-full bg-cyan-400"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-border p-4">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-foreground/50 transition-all hover:bg-foreground/5 hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
          <span>Go to Dashboard</span>
        </button>
      </div>
    </motion.aside>
  );
}

// Mobile Navigation
export function MobileNav({ currentPage, onPageChange }: { currentPage: string; onPageChange: (page: string) => void }) {
  const mainItems = menuItems.slice(0, 5);
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-around px-2 py-3">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-all ${
                isActive ? 'text-cyan-400' : 'text-foreground/50'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
