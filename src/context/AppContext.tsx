import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { 
  Task, Note, Course, StreakData, AppShortcut, 
  PomodoroSession, Goal, Achievement, UserProfile, NotificationItem
} from '@/types';

interface AppState {
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

type Action =
  | { type: 'SET_STATE'; payload: Partial<AppState> }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'ADD_COURSE'; payload: Course }
  | { type: 'UPDATE_COURSE'; payload: Course }
  | { type: 'DELETE_COURSE'; payload: string }
  | { type: 'UPDATE_STREAK'; payload: StreakData }
  | { type: 'ADD_SHORTCUT'; payload: AppShortcut }
  | { type: 'UPDATE_SHORTCUT'; payload: AppShortcut }
  | { type: 'DELETE_SHORTCUT'; payload: string }
  | { type: 'ADD_POMODORO'; payload: PomodoroSession }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: NotificationItem }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'RESET_DATA' };

const defaultStreakData: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  activities: [],
};

const defaultUserProfile: UserProfile = {
  username: 'Developer',
  joinDate: new Date().toISOString(),
  preferences: {
    theme: 'dark',
    notifications: true,
    pomodoroDuration: 25,
    breakDuration: 5,
  },
};

const defaultAppShortcuts: AppShortcut[] = [
  { id: '1', name: 'LeetCode', url: 'https://leetcode.com/u/vishal205/', icon: 'Code', color: '#FFA116', category: 'Coding' },
  { id: '2', name: 'LinkedIn', url: 'https://www.linkedin.com/in/vishal-v-053a9128b/', icon: 'Linkedin', color: '#0A66C2', category: 'Career' },
  { id: '3', name: 'GitHub', url: 'https://github.com/vishal-vinayagam', icon: 'Github', color: '#FFFFFF', category: 'Coding' },
  { id: '4', name: 'Naukri', url: 'https://www.naukri.com/code360/profile/35b316e7-e1d7-4bcc-b810-cbc393585d97', icon: 'Briefcase', color: '#275DF5', category: 'Career' },
];

const defaultAchievements: Achievement[] = [
  { id: '1', title: 'First Steps', description: 'Complete your first task', icon: 'Star', requirement: 1, type: 'tasks' },
  { id: '7', title: 'Daily Grinder', description: 'Complete 10 tasks', icon: 'CheckCircle2', requirement: 10, type: 'tasks' },
  { id: '2', title: 'Task Master', description: 'Complete 50 tasks', icon: 'Trophy', requirement: 50, type: 'tasks' },
  { id: '8', title: 'Task Legend', description: 'Complete 100 tasks', icon: 'Medal', requirement: 100, type: 'tasks' },
  { id: '9', title: 'Problem Starter', description: 'Solve 25 problems', icon: 'Target', requirement: 25, type: 'problems' },
  { id: '10', title: 'Sharp Coder', description: 'Solve 50 problems', icon: 'Brain', requirement: 50, type: 'problems' },
  { id: '3', title: 'Problem Solver', description: 'Solve 100 problems', icon: 'Brain', requirement: 100, type: 'problems' },
  { id: '11', title: 'Course Explorer', description: 'Complete your first course', icon: 'BookOpen', requirement: 1, type: 'courses' },
  { id: '12', title: 'Skill Builder', description: 'Complete 3 courses', icon: 'GraduationCap', requirement: 3, type: 'courses' },
  { id: '4', title: 'Course Champion', description: 'Complete 5 courses', icon: 'GraduationCap', requirement: 5, type: 'courses' },
  { id: '13', title: 'Consistency Kickoff', description: 'Maintain a 3-day streak', icon: 'Flame', requirement: 3, type: 'streak' },
  { id: '5', title: 'On Fire', description: 'Maintain a 7-day streak', icon: 'Flame', requirement: 7, type: 'streak' },
  { id: '14', title: 'Hot Streak', description: 'Maintain a 14-day streak', icon: 'Zap', requirement: 14, type: 'streak' },
  { id: '6', title: 'Unstoppable', description: 'Maintain a 30-day streak', icon: 'Zap', requirement: 30, type: 'streak' },
];

const getTodayDate = () => new Date().toISOString().split('T')[0];

const defaultTasks: Task[] = [
  {
    id: 'daily-1',
    title: 'Review today\'s priorities',
    description: 'Pick the top 3 items to finish first.',
    category: 'personal',
    priority: 'medium',
    status: 'pending',
    dueDate: getTodayDate(),
    createdAt: new Date().toISOString(),
    recurrence: 'daily',
  },
  {
    id: 'daily-2',
    title: 'Complete a focused work block',
    description: 'Stay on one task without switching context.',
    category: 'coding',
    priority: 'high',
    status: 'pending',
    dueDate: getTodayDate(),
    createdAt: new Date().toISOString(),
    recurrence: 'daily',
  },
  {
    id: 'daily-3',
    title: 'Practice or review learning notes',
    description: 'Keep momentum with a small study session.',
    category: 'learning',
    priority: 'medium',
    status: 'pending',
    dueDate: getTodayDate(),
    createdAt: new Date().toISOString(),
    recurrence: 'daily',
  },
];

const normalizeRecurringTasks = (tasks: Task[]) => {
  const today = getTodayDate();

  return tasks.map(task => {
    if (task.recurrence !== 'daily') {
      return task;
    }

    if (task.completedAt && task.completedAt.split('T')[0] === today) {
      return { ...task, dueDate: today };
    }

    return {
      ...task,
      dueDate: today,
      status: 'pending',
      completedAt: undefined,
    };
  });
};

const initialState: AppState = {
  tasks: defaultTasks,
  notes: [],
  courses: [],
  streakData: defaultStreakData,
  appShortcuts: defaultAppShortcuts,
  pomodoroSessions: [],
  goals: [],
  achievements: defaultAchievements,
  notifications: [],
  userProfile: defaultUserProfile,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload),
      };
    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, action.payload] };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(n => n.id === action.payload.id ? action.payload : n),
      };
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(n => n.id !== action.payload),
      };
    case 'ADD_COURSE':
      return { ...state, courses: [...state.courses, action.payload] };
    case 'UPDATE_COURSE':
      return {
        ...state,
        courses: state.courses.map(c => c.id === action.payload.id ? action.payload : c),
      };
    case 'DELETE_COURSE':
      return {
        ...state,
        courses: state.courses.filter(c => c.id !== action.payload),
      };
    case 'UPDATE_STREAK':
      return { ...state, streakData: action.payload };
    case 'ADD_SHORTCUT':
      return { ...state, appShortcuts: [...state.appShortcuts, action.payload] };
    case 'UPDATE_SHORTCUT':
      return {
        ...state,
        appShortcuts: state.appShortcuts.map(s => s.id === action.payload.id ? action.payload : s),
      };
    case 'DELETE_SHORTCUT':
      return {
        ...state,
        appShortcuts: state.appShortcuts.filter(s => s.id !== action.payload),
      };
    case 'ADD_POMODORO':
      return { ...state, pomodoroSessions: [...state.pomodoroSessions, action.payload] };
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(g => g.id === action.payload.id ? action.payload : g),
      };
    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter(g => g.id !== action.payload),
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 100),
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({ ...notification, read: true })),
      };
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        userProfile: { ...state.userProfile, ...action.payload },
      };
    case 'RESET_DATA':
      return initialState;
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  getTodayTasks: () => Task[];
  getTasksByCategory: (category: string) => Task[];
  getCompletedTasksCount: () => number;
  getTasksForDate: (date: string) => Task[];
  updateStreak: () => void;
  getWeeklyStats: () => { day: string; tasks: number; problems: number }[];
  checkAchievements: () => Achievement[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'devtrack-data';

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasPrimedTaskNotifications = React.useRef(false);
  const previousCompletedTaskIds = React.useRef<Set<string>>(new Set());
  const previousCompletedCount = React.useRef(0);

  const canonicalShortcutUrls: Record<string, string> = {
    LeetCode: 'https://leetcode.com/u/vishal205/',
    LinkedIn: 'https://www.linkedin.com/in/vishal-v-053a9128b/',
    GitHub: 'https://github.com/vishal-vinayagam',
    Naukri: 'https://www.naukri.com/code360/profile/35b316e7-e1d7-4bcc-b810-cbc393585d97',
  };

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.tasks)) {
          parsed.tasks = normalizeRecurringTasks(parsed.tasks);
        }
        if (Array.isArray(parsed.appShortcuts)) {
          parsed.appShortcuts = parsed.appShortcuts.map((shortcut: AppShortcut) => {
            const canonicalUrl = canonicalShortcutUrls[shortcut.name];
            return canonicalUrl ? { ...shortcut, url: canonicalUrl } : shortcut;
          });
        }
        dispatch({ type: 'SET_STATE', payload: parsed });
      } catch (e) {
        console.error('Failed to parse stored data:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    const completedTasks = state.tasks.filter(t => t.status === 'completed').length;
    const totalProblems = state.streakData.activities.reduce((sum, activity) => sum + activity.problemsSolved, 0);
    const completedCourses = state.courses.filter(c => c.status === 'completed').length;
    const currentStreak = state.streakData.currentStreak;

    let hasNewUnlock = false;
    const newlyUnlocked: Achievement[] = [];
    const updatedAchievements = state.achievements.map(achievement => {
      if (achievement.unlockedAt) {
        return achievement;
      }

      let unlocked = false;
      switch (achievement.type) {
        case 'tasks':
          unlocked = completedTasks >= achievement.requirement;
          break;
        case 'problems':
          unlocked = totalProblems >= achievement.requirement;
          break;
        case 'courses':
          unlocked = completedCourses >= achievement.requirement;
          break;
        case 'streak':
          unlocked = currentStreak >= achievement.requirement;
          break;
      }

      if (!unlocked) {
        return achievement;
      }

      hasNewUnlock = true;
      newlyUnlocked.push(achievement);
      return {
        ...achievement,
        unlockedAt: new Date().toISOString(),
      };
    });

    if (hasNewUnlock) {
      dispatch({ type: 'SET_STATE', payload: { achievements: updatedAchievements } });
      newlyUnlocked.forEach(achievement => {
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: crypto.randomUUID(),
            title: 'Achievement Unlocked',
            message: `${achievement.title}: ${achievement.description}`,
            type: 'achievement-unlocked',
            createdAt: new Date().toISOString(),
            read: false,
          },
        });
      });
    }
  }, [isLoaded, state.achievements, state.courses, state.streakData.activities, state.streakData.currentStreak, state.tasks]);

  useEffect(() => {
    if (!isLoaded) return;

    const completedTasks = state.tasks.filter(task => task.status === 'completed');
    const completedTaskIds = new Set(completedTasks.map(task => task.id));

    if (!hasPrimedTaskNotifications.current) {
      hasPrimedTaskNotifications.current = true;
      previousCompletedTaskIds.current = completedTaskIds;
      previousCompletedCount.current = completedTasks.length;
      return;
    }

    const justCompleted = completedTasks.filter(task => !previousCompletedTaskIds.current.has(task.id));

    justCompleted.forEach(task => {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: crypto.randomUUID(),
          title: 'Task Completed',
          message: `You completed: ${task.title}`,
          type: 'task-completed',
          createdAt: new Date().toISOString(),
          read: false,
        },
      });
    });

    if (previousCompletedCount.current < 1 && completedTasks.length >= 1) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: crypto.randomUUID(),
          title: 'First Task Completed',
          message: 'Great start. You completed your first task.',
          type: 'first-task-completed',
          createdAt: new Date().toISOString(),
          read: false,
        },
      });
    }

    previousCompletedTaskIds.current = completedTaskIds;
    previousCompletedCount.current = completedTasks.length;
  }, [isLoaded, state.tasks]);

  const getTodayTasks = () => {
    const today = getTodayDate();
    return state.tasks.filter(t => t.dueDate === today);
  };

  const getTasksByCategory = (category: string) => {
    return state.tasks.filter(t => t.category === category);
  };

  const getCompletedTasksCount = () => {
    return state.tasks.filter(t => t.status === 'completed').length;
  };

  const getTasksForDate = (date: string) => {
    return state.tasks.filter(t => t.dueDate === date);
  };

  const updateStreak = () => {
    const today = getTodayDate();
    const { streakData } = state;
    
    if (streakData.lastActiveDate === today) return;

    const lastDate = streakData.lastActiveDate ? new Date(streakData.lastActiveDate) : null;
    const todayDate = new Date(today);
    
    let newStreak = streakData.currentStreak;
    
    if (lastDate) {
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const newStreakData: StreakData = {
      ...streakData,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, streakData.longestStreak),
      lastActiveDate: today,
    };

    dispatch({ type: 'UPDATE_STREAK', payload: newStreakData });
  };

  const getWeeklyStats = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const stats = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = days[date.getDay()];

      const tasks = state.tasks.filter(t => t.dueDate === dateStr && t.status === 'completed').length;
      const problems = state.streakData.activities.find(a => a.date === dateStr)?.problemsSolved || 0;

      stats.push({ day: dayName, tasks, problems });
    }

    return stats;
  };

  const checkAchievements = () => {
    const completedTasks = getCompletedTasksCount();
    const totalProblems = state.streakData.activities.reduce((sum, a) => sum + a.problemsSolved, 0);
    const completedCourses = state.courses.filter(c => c.status === 'completed').length;
    const currentStreak = state.streakData.currentStreak;

    return state.achievements.map(achievement => {
      let unlocked = false;
      switch (achievement.type) {
        case 'tasks':
          unlocked = completedTasks >= achievement.requirement;
          break;
        case 'problems':
          unlocked = totalProblems >= achievement.requirement;
          break;
        case 'courses':
          unlocked = completedCourses >= achievement.requirement;
          break;
        case 'streak':
          unlocked = currentStreak >= achievement.requirement;
          break;
      }
      
      if (unlocked && !achievement.unlockedAt) {
        return { ...achievement, unlockedAt: new Date().toISOString() };
      }
      return achievement;
    });
  };

  const value: AppContextType = {
    state,
    dispatch,
    getTodayTasks,
    getTasksByCategory,
    getCompletedTasksCount,
    getTasksForDate,
    updateStreak,
    getWeeklyStats,
    checkAchievements,
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
