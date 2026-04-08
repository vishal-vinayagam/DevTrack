import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Trophy, 
  CheckCircle2, 
  Code, 
  BookOpen,
  Edit2,
  Star,
  Zap,
  Medal,
  Target,
  Settings
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useStreak } from '@/hooks/useStreak';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format, parseISO } from 'date-fns';

interface ProfileProps {
  onPageChange: (page: string) => void;
}

export function Profile({ onPageChange }: ProfileProps) {
  const { state, dispatch } = useApp();
  const { userProfile, courses, achievements } = state;
  const { streakData, getHeatmapData } = useStreak();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: userProfile.username,
    bio: userProfile.bio || '',
  });

  const completedTasks = state.tasks.filter(t => t.status === 'completed').length;
  const totalProblems = streakData.activities.reduce((sum, a) => sum + a.problemsSolved, 0);
  const completedCourses = courses.filter(c => c.status === 'completed').length;
  const heatmapData = getHeatmapData(180);

  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const lockedAchievements = achievements.filter(a => !a.unlockedAt);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({
      type: 'UPDATE_PROFILE',
      payload: { username: formData.username, bio: formData.bio }
    });
    setIsEditDialogOpen(false);
  };

  const getLevelColor = (level: number): string => {
    const colors = [
      'bg-white/5',
      'bg-green-500/30',
      'bg-green-500/50',
      'bg-green-500/70',
      'bg-green-500'
    ];
    return colors[level] || colors[0];
  };

  const calendarWeeks = [];
  const today = new Date();
  for (let week = 0; week < 26; week++) {
    const weekData = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (25 - week) * 7 - (6 - day));
      const dateStr = format(date, 'yyyy-MM-dd');
      const activity = heatmapData.find(d => d.date === dateStr);
      weekData.push({ date: dateStr, level: activity?.level || 0 });
    }
    calendarWeeks.push(weekData);
  }

  return (
    <div className="space-y-6 p-4 lg:p-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="liquid-glass rounded-2xl p-6"
      >
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-3xl font-bold text-white">
              {userProfile.username.slice(0, 2).toUpperCase()}
            </div>
            <button
              onClick={() => setIsEditDialogOpen(true)}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-[family-name:var(--font-display)] text-3xl text-white">
              {userProfile.username}
            </h1>
            <p className="mt-1 text-white/60">
              Member since {format(parseISO(userProfile.joinDate), 'MMMM yyyy')}
            </p>
            {userProfile.bio && (
              <p className="mt-3 text-white/80">{userProfile.bio}</p>
            )}
            
            <div className="mt-4 flex flex-wrap justify-center gap-4 sm:justify-start">
              <div className="flex items-center gap-2 rounded-full bg-orange-500/20 px-3 py-1">
                <Flame className="h-4 w-4 text-orange-400" />
                <span className="text-sm text-white">{streakData.currentStreak} day streak</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-green-500/20 px-3 py-1">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span className="text-sm text-white">{completedTasks} tasks done</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-purple-500/20 px-3 py-1">
                <BookOpen className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-white">{completedCourses} courses</span>
              </div>
              <button
                onClick={() => onPageChange('settings')}
                className="flex items-center gap-2 rounded-full bg-cyan-500/20 px-3 py-1 text-cyan-300 transition-colors hover:bg-cyan-500/30"
              >
                <Settings className="h-4 w-4" />
                <span className="text-sm">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          icon={CheckCircle2}
          value={completedTasks}
          label="Tasks Completed"
          color="text-green-400"
          bgColor="bg-green-500/20"
        />
        <StatCard
          icon={Code}
          value={totalProblems}
          label="Problems Solved"
          color="text-cyan-400"
          bgColor="bg-cyan-500/20"
        />
        <StatCard
          icon={BookOpen}
          value={completedCourses}
          label="Courses Finished"
          color="text-purple-400"
          bgColor="bg-purple-500/20"
        />
        <StatCard
          icon={Trophy}
          value={streakData.longestStreak}
          label="Best Streak"
          color="text-yellow-400"
          bgColor="bg-yellow-500/20"
        />
      </motion.div>

      {/* Activity Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="liquid-glass rounded-2xl p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
            Activity Overview
          </h2>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(level => (
                <div key={level} className={`h-3 w-3 rounded-sm ${getLevelColor(level)}`} />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {calendarWeeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day) => (
                  <div
                    key={day.date}
                    className={`h-3 w-3 rounded-sm ${getLevelColor(day.level)}`}
                    title={day.date}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="liquid-glass rounded-2xl p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
            Achievements
          </h2>
          <span className="text-sm text-white/60">
            {unlockedAchievements.length} / {achievements.length} unlocked
          </span>
        </div>

        {unlockedAchievements.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-white/60">Unlocked</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {unlockedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-start gap-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/30">
                    <AchievementIcon name={achievement.icon} />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{achievement.title}</h4>
                    <p className="text-sm text-white/60">{achievement.description}</p>
                    <p className="mt-1 text-xs text-yellow-400">
                      Unlocked {achievement.unlockedAt && format(parseISO(achievement.unlockedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {lockedAchievements.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-medium text-white/60">Locked</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {lockedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-start gap-3 rounded-xl bg-white/5 p-4 opacity-60"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                    <AchievementIcon name={achievement.icon} className="text-white/40" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white/60">{achievement.title}</h4>
                    <p className="text-sm text-white/40">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="border-white/10 bg-[hsl(201,100%,11%)] text-white">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-display)] text-2xl">
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-white/60">Username</label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Your username"
                className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/60">Bio</label>
              <Input
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself"
                className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1 border-white/10 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button type="submit" className="btn-primary flex-1">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  color, 
  bgColor 
}: { 
  icon: React.ElementType;
  value: number;
  label: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="liquid-glass rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bgColor}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-sm text-white/60">{label}</p>
        </div>
      </div>
    </div>
  );
}

function AchievementIcon({ name, className = '' }: { name: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    Star: <Star className={`h-5 w-5 text-yellow-400 ${className}`} />,
    Trophy: <Trophy className={`h-5 w-5 text-yellow-400 ${className}`} />,
    Brain: <Target className={`h-5 w-5 text-cyan-400 ${className}`} />,
    GraduationCap: <BookOpen className={`h-5 w-5 text-purple-400 ${className}`} />,
    Flame: <Flame className={`h-5 w-5 text-orange-400 ${className}`} />,
    Zap: <Zap className={`h-5 w-5 text-yellow-400 ${className}`} />,
  };
  return icons[name] || <Medal className={`h-5 w-5 ${className}`} />;
}
