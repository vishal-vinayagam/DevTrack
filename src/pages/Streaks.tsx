import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Trophy, 
  Target,
  Zap,
  Award,
  CalendarDays,
  Activity
} from 'lucide-react';
import { useStreak } from '@/hooks/useStreak';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format, parseISO, startOfWeek, addDays } from 'date-fns';

export function Streaks() {
  const { streakData, todayActivity, getHeatmapData, getWeeklyStreak, incrementProblemsSolved, updateActivity } = useStreak();
  const { state } = useApp();
  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState<string | null>(todayKey);
  const [problemsInput, setProblemsInput] = useState('');
  const [editProblemsInput, setEditProblemsInput] = useState(String(todayActivity.problemsSolved));

  const heatmapData = useMemo(() => getHeatmapData(365), [getHeatmapData]);
  const weeklyData = useMemo(() => getWeeklyStreak(), [getWeeklyStreak]);

  const calendarWeeks = useMemo(() => {
    const weeks: { date: string; level: number }[][] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);
    
    let currentWeek: { date: string; level: number }[] = [];
    const startOfFirstWeek = startOfWeek(startDate, { weekStartsOn: 1 });
    
    const totalDays = Math.floor((today.getTime() - startOfFirstWeek.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    for (let i = 0; i < totalDays; i++) {
      const date = addDays(startOfFirstWeek, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dataPoint = heatmapData.find(d => d.date === dateStr);
      
      currentWeek.push({
        date: dateStr,
        level: dataPoint?.level || 0
      });
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  }, [heatmapData]);

  const monthLabels = useMemo(() => {
    const labels: { month: string; index: number }[] = [];
    let lastMonth = '';
    
    calendarWeeks.forEach((week, weekIndex) => {
      const firstDay = week[0];
      if (firstDay) {
        const date = parseISO(firstDay.date);
        const month = format(date, 'MMM');
        if (month !== lastMonth) {
          labels.push({ month, index: weekIndex });
          lastMonth = month;
        }
      }
    });
    
    return labels;
  }, [calendarWeeks]);

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

  const getActivityForDate = (dateStr: string) => {
    return streakData.activities.find(a => a.date === dateStr);
  };

  const selectedActivity = selectedDate
    ? getActivityForDate(selectedDate) ?? {
        date: selectedDate,
        tasksCompleted: 0,
        problemsSolved: 0,
        coursesProgress: 0,
        hasActivity: false,
      }
    : null;

  const selectedActivityTotal = selectedActivity
    ? selectedActivity.tasksCompleted + selectedActivity.problemsSolved + selectedActivity.coursesProgress
    : 0;

  const topWeek = [...weeklyData].sort((a, b) => b.total - a.total)[0];

  const handleAddProblems = () => {
    const count = Number.parseInt(problemsInput, 10);
    if (!Number.isFinite(count) || count <= 0) return;

    incrementProblemsSolved(count);
    setProblemsInput('');
  };

  const handleSetProblemsCount = () => {
    const count = Number.parseInt(editProblemsInput, 10);
    if (!Number.isFinite(count) || count < 0) return;

    updateActivity({ problemsSolved: count });
  };

  useEffect(() => {
    setEditProblemsInput(String(todayActivity.problemsSolved));
  }, [todayActivity.problemsSolved]);

  return (
    <div className="space-y-6 p-4 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-white">Streaks</h1>
        <p className="text-white/60">Track your daily consistency and build habits</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="liquid-glass rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20">
              <Flame className="h-6 w-6 text-orange-400 animate-fire" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{streakData.currentStreak}</p>
              <p className="text-sm text-white/60">Current Streak</p>
            </div>
          </div>
        </div>

        <div className="liquid-glass rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/20">
              <Trophy className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{streakData.longestStreak}</p>
              <p className="text-sm text-white/60">Longest Streak</p>
            </div>
          </div>
        </div>

        <div className="liquid-glass rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20">
              <Target className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{todayActivity.tasksCompleted}</p>
              <p className="text-sm text-white/60">Tasks Today</p>
            </div>
          </div>
        </div>

        <div className="liquid-glass rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
              <Zap className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{todayActivity.problemsSolved}</p>
              <p className="text-sm text-white/60">Problems Today</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Problem Logger */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="liquid-glass rounded-2xl p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-white">Log Problems Solved</h2>
            <p className="mt-1 text-sm text-white/60">
              Add how many problems you solved today. Current total: {todayActivity.problemsSolved}
            </p>
            <Input
              type="number"
              min={1}
              value={problemsInput}
              onChange={(e) => setProblemsInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddProblems();
                }
              }}
              placeholder="Enter solved count (e.g. 3)"
              className="mt-3 max-w-xs border-white/10 bg-white/5 text-white placeholder:text-white/40"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => incrementProblemsSolved(1)} className="btn-primary">
              +1
            </Button>
            <Button type="button" onClick={() => incrementProblemsSolved(3)} className="btn-primary">
              +3
            </Button>
            <Button type="button" onClick={() => incrementProblemsSolved(5)} className="btn-primary">
              +5
            </Button>
            <Button type="button" onClick={handleAddProblems} className="btn-primary">
              Add Count
            </Button>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-medium text-white">Edit Today Problem Count</p>
          <p className="mt-1 text-xs text-white/60">Set the exact number if you want to correct the count.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              type="number"
              min={0}
              value={editProblemsInput}
              onChange={(e) => setEditProblemsInput(e.target.value)}
              className="w-full sm:max-w-[180px] border-white/10 bg-white/5 text-white placeholder:text-white/40"
            />
            <Button type="button" onClick={handleSetProblemsCount} className="btn-primary sm:w-auto">
              Save Count
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="liquid-glass rounded-2xl p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
            Activity Heatmap
          </h2>
          <div className="flex items-center gap-4 text-sm text-white/60">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className={`h-3 w-3 rounded-sm ${getLevelColor(level)}`}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-xs text-white/50">Selected Date</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-white">
              <CalendarDays className="h-4 w-4 text-cyan-300" />
              {selectedDate ? format(parseISO(selectedDate), 'MMM d, yyyy') : '-'}
            </p>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-xs text-white/50">Selected Activity Score</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-white">
              <Activity className="h-4 w-4 text-emerald-300" />
              {selectedActivityTotal}
            </p>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-xs text-white/50">Best Week</p>
            <p className="mt-1 text-sm text-white">
              {topWeek ? `${format(parseISO(topWeek.week), 'MMM d')} (${topWeek.total})` : 'No data yet'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-max">
            <div className="mb-2 flex">
              <div className="w-8" />
              <div className="flex">
                {monthLabels.map((label, i) => (
                  <div
                    key={i}
                    className="text-xs text-white/40"
                    style={{ 
                      marginLeft: i === 0 ? label.index * 14 : (label.index - monthLabels[i-1].index) * 14 - 30
                    }}
                  >
                    {label.month}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-1">
              <div className="mr-2 flex flex-col gap-1">
                {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((day, i) => (
                  <div key={i} className="h-3 text-[10px] text-white/40">
                    {day}
                  </div>
                ))}
              </div>

              <div className="flex gap-1">
                {calendarWeeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day) => (
                      <motion.button
                        key={day.date}
                        onClick={() => setSelectedDate(day.date)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`h-3 w-3 rounded-sm transition-all ${getLevelColor(day.level)} ${
                          selectedDate === day.date ? 'ring-2 ring-cyan-400' : ''
                        }`}
                        title={`${day.date}: Level ${day.level}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {selectedDate && selectedActivity && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 rounded-xl bg-white/5 p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-white">
                {format(parseISO(selectedDate), 'MMMM d, yyyy')}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-white/40 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-2xl font-bold text-white">{selectedActivity.tasksCompleted}</p>
                <p className="text-sm text-white/60">Tasks</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{selectedActivity.problemsSolved}</p>
                <p className="text-sm text-white/60">Problems</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{selectedActivity.coursesProgress}%</p>
                <p className="text-sm text-white/60">Course Progress</p>
              </div>
            </div>
            <div className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70">
              {selectedActivity.hasActivity
                ? 'Good consistency for this day. Keep this rhythm going.'
                : 'No activity logged for this day yet.'}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Weekly Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="liquid-glass rounded-2xl p-6"
      >
        <h2 className="mb-6 font-[family-name:var(--font-display)] text-xl text-white">
          Weekly Activity
        </h2>
        <div className="space-y-4">
          {weeklyData.slice(-12).map((week, index) => (
            <div key={index} className="flex items-center gap-4">
              <span className="w-24 text-sm text-white/60">
                Week {format(parseISO(week.week), 'MMM d')}
              </span>
              <div className="flex-1">
                <div className="h-4 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (week.total / 50) * 100)}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  />
                </div>
              </div>
              <span className="w-12 text-right text-sm text-white">{week.total}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="liquid-glass rounded-2xl p-6"
      >
        <h2 className="mb-6 font-[family-name:var(--font-display)] text-xl text-white">
          Achievements
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className={`rounded-xl p-4 ${
                achievement.unlockedAt
                  ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20'
                  : 'bg-white/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  achievement.unlockedAt ? 'bg-yellow-500/30 text-yellow-400' : 'bg-white/10 text-white/40'
                }`}>
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={`font-medium ${achievement.unlockedAt ? 'text-white' : 'text-white/60'}`}>
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-white/50">{achievement.description}</p>
                  {achievement.unlockedAt && (
                    <p className="mt-1 text-xs text-yellow-400">
                      Unlocked {format(parseISO(achievement.unlockedAt), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
