import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  CheckCircle2, 
  Code, 
  BookOpen,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useTasks } from '@/hooks/useTasks';
import { useStreak } from '@/hooks/useStreak';
import { useCourses } from '@/hooks/useCourses';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { format, parseISO } from 'date-fns';

const getLocalDateKey = (date: Date) => format(date, 'yyyy-MM-dd');

export function Analytics() {
  const { state } = useApp();
  const { getTaskStats } = useTasks();
  const { getWeeklyStreak, streakData } = useStreak();
  const { getCourseStats } = useCourses();

  const taskStats = getTaskStats();
  const courseStats = getCourseStats();
  const weeklyData = getWeeklyStreak();

  // Weekly tasks data
  const weeklyTasksData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    return days.map((day, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - index));
      const dateStr = getLocalDateKey(date);
      const dayTasks = state.tasks.filter(t => 
        t.dueDate === dateStr && t.status === 'completed'
      ).length;
      return { day, tasks: dayTasks };
    });
  }, [state.tasks]);

  // Category distribution
  const categoryData = useMemo(() => [
    { name: 'Coding', value: taskStats.byCategory.coding, color: '#06b6d4' },
    { name: 'Job', value: taskStats.byCategory.job, color: '#a855f7' },
    { name: 'Learning', value: taskStats.byCategory.learning, color: '#f59e0b' },
    { name: 'Personal', value: taskStats.byCategory.personal, color: '#22c55e' },
  ].filter(d => d.value > 0), [taskStats]);

  // Productivity trend (last 30 days)
  const productivityData = useMemo(() => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = getLocalDateKey(date);
      
      const tasksCompleted = state.tasks.filter(t => 
        t.dueDate === dateStr && t.status === 'completed'
      ).length;
      
      const activity = streakData.activities.find(a => a.date === dateStr);
      const problemsSolved = activity?.problemsSolved || 0;
      
      const productivityScore = tasksCompleted * 10 + problemsSolved * 5;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: productivityScore,
        tasks: tasksCompleted,
        problems: problemsSolved,
      });
    }
    return data;
  }, [state.tasks, streakData.activities]);

  // Monthly summary
  const monthlySummary = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthTasks = state.tasks.filter(t => {
      const taskDate = parseISO(t.dueDate);
      return taskDate >= monthStart && t.status === 'completed';
    }).length;
    
    const monthProblems = streakData.activities
      .filter(a => parseISO(a.date) >= monthStart)
      .reduce((sum, a) => sum + a.problemsSolved, 0);
    
    const monthCourses = state.courses.filter(c => 
      c.completedDate && parseISO(c.completedDate) >= monthStart
    ).length;
    
    return { tasks: monthTasks, problems: monthProblems, courses: monthCourses };
  }, [state.tasks, state.courses, streakData.activities]);

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
    <div className="space-y-6 p-4 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-white">Analytics</h1>
        <p className="text-white/60">Track your productivity and growth over time</p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <SummaryCard
          title="Total Tasks"
          value={taskStats.total}
          subtitle={`${taskStats.completed} completed`}
          icon={CheckCircle2}
          color="text-green-400"
          bgColor="bg-green-500/20"
        />
        <SummaryCard
          title="Problems Solved"
          value={streakData.activities.reduce((sum, a) => sum + a.problemsSolved, 0)}
          subtitle="All time"
          icon={Code}
          color="text-cyan-400"
          bgColor="bg-cyan-500/20"
        />
        <SummaryCard
          title="Courses Completed"
          value={courseStats.completed}
          subtitle={`${courseStats.inProgress} in progress`}
          icon={BookOpen}
          color="text-purple-400"
          bgColor="bg-purple-500/20"
        />
        <SummaryCard
          title="Current Streak"
          value={streakData.currentStreak}
          subtitle="days"
          icon={Target}
          color="text-orange-400"
          bgColor="bg-orange-500/20"
        />
      </motion.div>

      {/* Monthly Insights */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="liquid-glass rounded-2xl p-6"
      >
        <div className="mb-4 flex items-center gap-3">
          <Activity className="h-5 w-5 text-cyan-400" />
          <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
            This Month's Insights
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-3xl font-bold text-white">{monthlySummary.tasks}</p>
            <p className="text-sm text-white/60">Tasks Completed</p>
            <p className="mt-2 text-xs text-green-400">
              +{Math.round((monthlySummary.tasks / Math.max(1, taskStats.completed)) * 100)}% of total
            </p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-3xl font-bold text-white">{monthlySummary.problems}</p>
            <p className="text-sm text-white/60">Problems Solved</p>
            <p className="mt-2 text-xs text-cyan-400">
              Keep up the momentum!
            </p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-3xl font-bold text-white">{monthlySummary.courses}</p>
            <p className="text-sm text-white/60">Courses Finished</p>
            <p className="mt-2 text-xs text-purple-400">
              Great progress!
            </p>
          </div>
        </div>
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Tasks */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="liquid-glass rounded-2xl p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
              Weekly Tasks
            </h2>
            <BarChart3 className="h-5 w-5 text-white/40" />
          </div>
          <div className="h-64 overflow-x-auto">
            <div className="h-full min-w-[520px] sm:min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTasksData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="day" 
                  stroke="rgba(255,255,255,0.4)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.4)"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(201, 100%, 11%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'white' }}
                  itemStyle={{ color: '#06b6d4' }}
                />
                <Bar dataKey="tasks" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="liquid-glass rounded-2xl p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
              Tasks by Category
            </h2>
            <PieChart className="h-5 w-5 text-white/40" />
          </div>
          <div className="h-64 overflow-x-auto">
            <div className="h-full min-w-[520px] sm:min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(201, 100%, 11%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'white' }}
                />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {categoryData.map(cat => (
              <div key={cat.name} className="flex items-center gap-2">
                <div 
                  className="h-3 w-3 rounded-full" 
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm text-white/60">{cat.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Productivity Trend */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="liquid-glass rounded-2xl p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
            30-Day Productivity Trend
          </h2>
          <TrendingUp className="h-5 w-5 text-white/40" />
        </div>
        <div className="h-72 overflow-x-auto">
          <div className="h-full min-w-[520px] sm:min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivityData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.4)"
                fontSize={10}
                interval={4}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.4)"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(201, 100%, 11%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'white' }}
                itemStyle={{ color: '#06b6d4' }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#06b6d4" 
                fillOpacity={1} 
                fill="url(#colorScore)" 
              />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Weekly Activity */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="liquid-glass rounded-2xl p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
            Weekly Activity (Tasks + Problems)
          </h2>
          <Calendar className="h-5 w-5 text-white/40" />
        </div>
        <div className="h-64 overflow-x-auto">
          <div className="h-full min-w-[520px] sm:min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData.slice(-12)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="week" 
                stroke="rgba(255,255,255,0.4)"
                fontSize={10}
                tickFormatter={(value) => parseISO(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.4)"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(201, 100%, 11%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'white' }}
                itemStyle={{ color: '#f59e0b' }}
                labelFormatter={(value) => parseISO(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ fill: '#f59e0b', strokeWidth: 0 }}
              />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SummaryCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color, 
  bgColor 
}: { 
  title: string; 
  value: number; 
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      className="liquid-glass rounded-2xl p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/60">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-[family-name:var(--font-display)] text-3xl text-white">{value}</span>
          </div>
          <p className="text-sm text-white/50">{subtitle}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgColor}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
    </motion.div>
  );
}
