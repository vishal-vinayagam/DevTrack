import { motion } from 'framer-motion';
import type { ElementType } from 'react';
import { 
  Code, 
  Linkedin, 
  Github, 
  Briefcase, 
  BookOpen,
  Youtube,
  MessageSquare,
  Globe,
  ExternalLink,
  CheckCircle2,
  Clock,
  Flame,
  TrendingUp,
  ArrowRight,
  Plus,
  Bell,
  Award
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useTasks } from '@/hooks/useTasks';
import { useStreak } from '@/hooks/useStreak';
import { useCourses } from '@/hooks/useCourses';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getCategoryColor } from '@/utils/helpers';

interface DashboardProps {
  onPageChange: (page: string) => void;
}

export function Dashboard({ onPageChange }: DashboardProps) {
  const { state } = useApp();
  const { getTodayTasks, getUpcomingTasks } = useTasks();
  const { todayActivity, streakData } = useStreak();
  const { getInProgressCourses, getCourseStats } = useCourses();

  const todayTasks = getTodayTasks();
  const upcomingTasks = getUpcomingTasks(7);
  const inProgressCourses = getInProgressCourses();
  const courseStats = getCourseStats();
  const pendingToday = todayTasks.filter(task => task.status !== 'completed');
  const unlockedAchievements = state.achievements.filter(achievement => achievement.unlockedAt).length;

  const nextAchievement = state.achievements
    .filter(achievement => !achievement.unlockedAt)
    .map(achievement => {
      const currentValue =
        achievement.type === 'tasks'
          ? state.tasks.filter(task => task.status === 'completed').length
          : achievement.type === 'problems'
            ? state.streakData.activities.reduce((sum, activity) => sum + activity.problemsSolved, 0)
            : achievement.type === 'courses'
              ? state.courses.filter(course => course.status === 'completed').length
              : streakData.currentStreak;

      return {
        ...achievement,
        currentValue,
        remaining: Math.max(0, achievement.requirement - currentValue),
      };
    })
    .sort((a, b) => a.remaining - b.remaining)[0];

  // Keep Dashboard quick-launch cards aligned with App Launcher data.
  const appDisplays = state.appShortcuts.map(app => {
    const iconMap: Record<string, ElementType> = {
      'Code': Code,
      'Linkedin': Linkedin,
      'Github': Github,
      'Briefcase': Briefcase,
      'BookOpen': BookOpen,
      'Youtube': Youtube,
      'MessageSquare': MessageSquare,
      'Globe': Globe,
    };

    return {
      ...app,
      icon: iconMap[app.icon] || Code,
    };
  });
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-4 lg:p-8"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-white lg:text-4xl">
          Good {getGreetingTime()}, <span className="text-gradient-cyan">{state.userProfile.username}</span>
        </h1>
        <p className="mt-2 text-white/60">
          Here's your productivity overview for today.
        </p>
      </motion.div>

      {/* Smart Notifications */}
      <motion.div variants={itemVariants} className="grid gap-4 lg:grid-cols-2">
        <div className="liquid-glass rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Today Task Status</h2>
              {pendingToday.length > 0 ? (
                <p className="mt-1 text-sm text-white/70">
                  {pendingToday.length} task{pendingToday.length > 1 ? 's are' : ' is'} pending today. Finish them to keep momentum.
                </p>
              ) : (
                <p className="mt-1 text-sm text-green-300/90">All tasks for today are completed. Great work.</p>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange('tasks')}
                className="mt-3 h-8 px-3 text-amber-200 hover:text-amber-100"
              >
                Review today tasks
              </Button>
            </div>
          </div>
        </div>

        <div className="liquid-glass rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Achievements</h2>
              <p className="mt-1 text-sm text-white/70">
                {unlockedAchievements} of {state.achievements.length} achievements unlocked.
              </p>
              {nextAchievement ? (
                <p className="mt-1 text-xs text-cyan-200/90">
                  Next: {nextAchievement.title} ({nextAchievement.currentValue}/{nextAchievement.requirement})
                </p>
              ) : (
                <p className="mt-1 text-xs text-cyan-200/90">All achievements unlocked. Amazing streak.</p>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange('streaks')}
                className="mt-3 h-8 px-3 text-cyan-200 hover:text-cyan-100"
              >
                View achievements
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Row */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Tasks"
          value={`${todayTasks.filter(t => t.status === 'completed').length}/${todayTasks.length}`}
          subtitle="completed"
          icon={CheckCircle2}
          color="text-green-400"
          bgColor="bg-green-500/20"
          onClick={() => onPageChange('tasks')}
        />
        <StatCard
          title="Current Streak"
          value={streakData.currentStreak}
          subtitle="days"
          icon={Flame}
          color="text-orange-400"
          bgColor="bg-orange-500/20"
          onClick={() => onPageChange('streaks')}
        />
        <StatCard
          title="Problems Solved"
          value={todayActivity.problemsSolved}
          subtitle="today"
          icon={Code}
          color="text-cyan-400"
          bgColor="bg-cyan-500/20"
          onClick={() => onPageChange('analytics')}
        />
        <StatCard
          title="Courses Progress"
          value={`${Math.round(courseStats.averageProgress)}%`}
          subtitle="average"
          icon={TrendingUp}
          color="text-purple-400"
          bgColor="bg-purple-500/20"
          onClick={() => onPageChange('courses')}
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* App Shortcuts */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="liquid-glass rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
                Quick Launch
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange('apps')}
                className="text-cyan-400 hover:text-cyan-300"
              >
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {appDisplays.length === 0 ? (
                <div className="col-span-full rounded-xl bg-white/5 p-6 text-center">
                  <p className="text-white/60">No quick launch apps yet</p>
                  <Button
                    variant="ghost"
                    onClick={() => onPageChange('apps')}
                    className="mt-2 text-cyan-400 hover:text-cyan-300"
                  >
                    Add your first app
                  </Button>
                </div>
              ) : (
                appDisplays.slice(0, 4).map((app, index) => (
                  <motion.a
                    key={app.id}
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${app.color}20` }}
                    >
                      <app.icon className="h-6 w-6" style={{ color: app.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-medium text-white">{app.name}</h3>
                      <p className="truncate text-xs text-white/50">{app.url.replace(/^https?:\/\//, '')}</p>
                      <p className="text-[11px] text-cyan-400/80">{app.category}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-white/30 transition-colors group-hover:text-white/60" />
                  </motion.a>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Today's Focus */}
        <motion.div variants={itemVariants}>
          <div className="liquid-glass rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
                Today's Focus
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onPageChange('tasks')}
                className="h-8 w-8 text-white/60 hover:text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {todayTasks.length === 0 ? (
                <div className="rounded-xl bg-white/5 p-6 text-center">
                  <p className="text-white/60">No tasks for today</p>
                  <Button
                    variant="ghost"
                    onClick={() => onPageChange('tasks')}
                    className="mt-2 text-cyan-400 hover:text-cyan-300"
                  >
                    Add your first task
                  </Button>
                </div>
              ) : (
                todayTasks.slice(0, 5).map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-3 rounded-xl bg-white/5 p-3 ${
                      task.status === 'completed' ? 'opacity-50' : ''
                    }`}
                  >
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: getCategoryColor(task.category) }}
                    />
                    <span className={`flex-1 text-sm ${task.status === 'completed' ? 'line-through text-white/40' : 'text-white'}`}>
                      {task.title}
                    </span>
                    <span className={`text-xs ${
                      task.priority === 'high' ? 'text-red-400' :
                      task.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {task.priority}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
            {todayTasks.length > 5 && (
              <Button
                variant="ghost"
                className="mt-4 w-full text-sm text-white/60 hover:text-white"
                onClick={() => onPageChange('tasks')}
              >
                View {todayTasks.length - 5} more tasks
              </Button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Second Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Courses */}
        <motion.div variants={itemVariants}>
          <div className="liquid-glass rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
                Active Courses
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange('courses')}
                className="text-cyan-400 hover:text-cyan-300"
              >
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {inProgressCourses.length === 0 ? (
                <div className="rounded-xl bg-white/5 p-6 text-center">
                  <p className="text-white/60">No active courses</p>
                </div>
              ) : (
                inProgressCourses.slice(0, 3).map((course) => (
                  <div key={course.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">{course.title}</span>
                      <span className="text-sm text-white/60">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="liquid-glass rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
                Upcoming This Week
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange('tasks')}
                className="text-cyan-400 hover:text-cyan-300"
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {upcomingTasks.length === 0 ? (
                <div className="rounded-xl bg-white/5 p-6 text-center">
                  <p className="text-white/60">No upcoming tasks</p>
                </div>
              ) : (
                upcomingTasks.slice(0, 5).map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 rounded-xl bg-white/5 p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                      <Clock className="h-5 w-5 text-white/60" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white">{task.title}</h4>
                      <p className="text-xs text-white/50">
                        {new Date(task.dueDate).toLocaleDateString()} • {task.category}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs ${
                      task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {task.priority}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color, 
  bgColor,
  onClick 
}: { 
  title: string; 
  value: string | number; 
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="liquid-glass group w-full rounded-2xl p-5 text-left transition-all hover:bg-white/10"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/60">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-[family-name:var(--font-display)] text-3xl text-white">{value}</span>
            <span className="text-sm text-white/50">{subtitle}</span>
          </div>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgColor}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
    </motion.button>
  );
}

function getGreetingTime(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
