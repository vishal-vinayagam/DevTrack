// Task Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  category: 'coding' | 'job' | 'learning' | 'personal';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  recurrence?: 'once' | 'daily';
}

export type TaskCategory = 'coding' | 'job' | 'learning' | 'personal';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in-progress' | 'completed';

// Note Types
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Course Types
export interface Course {
  id: string;
  title: string;
  platform: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  status: 'not-started' | 'in-progress' | 'completed';
  startDate?: string;
  completedDate?: string;
  category: string;
}

// Streak Types
export interface DailyActivity {
  date: string;
  tasksCompleted: number;
  problemsSolved: number;
  coursesProgress: number;
  hasActivity: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  activities: DailyActivity[];
}

// App Launcher Types
export interface AppShortcut {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
  category: string;
}

// Analytics Types
export interface AnalyticsData {
  totalTasksCompleted: number;
  totalProblemsSolved: number;
  totalCoursesCompleted: number;
  weeklyTasks: { day: string; count: number }[];
  weeklyProblems: { week: string; count: number }[];
  categoryDistribution: { name: string; value: number }[];
  productivityTrend: { date: string; score: number }[];
}

// Pomodoro Types
export interface PomodoroSession {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number;
  type: 'work' | 'break';
  completed: boolean;
}

// Goal Types
export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  category: string;
}

// Achievement Types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  requirement: number;
  type: 'tasks' | 'problems' | 'courses' | 'streak';
}

// Notification Types
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'task-completed' | 'first-task-completed' | 'achievement-unlocked' | 'general';
  createdAt: string;
  read: boolean;
}

// User Profile
export interface UserProfile {
  username: string;
  avatar?: string;
  bio?: string;
  joinDate: string;
  preferences: {
    theme: 'dark' | 'light';
    notifications: boolean;
    pomodoroDuration: number;
    breakDuration: number;
  };
}

// Daily Data Structure
export interface DailyData {
  date: string;
  tasksCompleted: number;
  problemsSolved: number;
  coursesProgress: number;
}

// App State
export interface AppState {
  tasks: Task[];
  notes: Note[];
  courses: Course[];
  streakData: StreakData;
  appShortcuts: AppShortcut[];
  pomodoroSessions: PomodoroSession[];
  goals: Goal[];
  achievements: Achievement[];
  notifications: NotificationItem[];
  userProfile: UserProfile;
}
