import { useCallback, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import type { DailyActivity } from '@/types';
import { format } from 'date-fns';

function getDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function shiftDate(base: Date, days: number): string {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return getDateKey(next);
}

function hasAnyActivity(activity: DailyActivity): boolean {
  return Boolean(
    activity.hasActivity ||
    activity.tasksCompleted > 0 ||
    activity.problemsSolved > 0 ||
    activity.coursesProgress > 0
  );
}

function calculateCurrentStreak(activities: DailyActivity[], todayKey: string): number {
  const activeDates = new Set(
    activities.filter(hasAnyActivity).map(a => a.date)
  );

  if (activeDates.size === 0) return 0;

  const today = new Date(todayKey);
  const yesterdayKey = shiftDate(today, -1);
  const startKey = activeDates.has(todayKey)
    ? todayKey
    : activeDates.has(yesterdayKey)
      ? yesterdayKey
      : '';

  if (!startKey) return 0;

  let streak = 0;
  let cursor = new Date(startKey);
  while (activeDates.has(getDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function calculateLongestStreak(activities: DailyActivity[]): number {
  const dates = Array.from(
    new Set(activities.filter(hasAnyActivity).map(a => a.date))
  ).sort();

  if (dates.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i += 1) {
    const prev = new Date(dates[i - 1]);
    const nextExpected = shiftDate(prev, 1);
    if (dates[i] === nextExpected) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

export function useStreak() {
  const { state, dispatch } = useApp();
  const { streakData } = state;

  const today = useMemo(() => getDateKey(new Date()), []);

  const getActivityForDate = useCallback((date: string): DailyActivity | undefined => {
    return streakData.activities.find(a => a.date === date);
  }, [streakData.activities]);

  const getTodayActivity = useCallback((): DailyActivity => {
    const activity = getActivityForDate(today);
    if (activity) return activity;
    
    return {
      date: today,
      tasksCompleted: 0,
      problemsSolved: 0,
      coursesProgress: 0,
      hasActivity: false,
    };
  }, [getActivityForDate, today]);

  const updateActivity = useCallback((updates: Partial<DailyActivity>) => {
    const existingActivity = getActivityForDate(today);
    
    if (existingActivity) {
      const updatedActivity = { 
        ...existingActivity, 
        ...updates,
        hasActivity: true 
      };
      const newActivities = streakData.activities.map(a => 
        a.date === today ? updatedActivity : a
      );
      dispatch({ 
        type: 'UPDATE_STREAK', 
        payload: { ...streakData, activities: newActivities } 
      });
    } else {
      const newActivity: DailyActivity = {
        date: today,
        tasksCompleted: 0,
        problemsSolved: 0,
        coursesProgress: 0,
        hasActivity: true,
        ...updates,
      };
      dispatch({ 
        type: 'UPDATE_STREAK', 
        payload: { 
          ...streakData, 
          activities: [...streakData.activities, newActivity] 
        } 
      });
    }
  }, [dispatch, getActivityForDate, streakData, today]);

  const incrementProblemsSolved = useCallback((count: number = 1) => {
    const activity = getTodayActivity();
    updateActivity({ 
      problemsSolved: activity.problemsSolved + count 
    });
  }, [getTodayActivity, updateActivity]);

  const incrementTasksCompleted = useCallback((count: number = 1) => {
    const activity = getTodayActivity();
    updateActivity({ 
      tasksCompleted: activity.tasksCompleted + count 
    });
  }, [getTodayActivity, updateActivity]);

  const computedStreakData = useMemo(() => {
    const activityDates = streakData.activities
      .filter(hasAnyActivity)
      .map(a => a.date)
      .sort();

    const computedCurrent = calculateCurrentStreak(streakData.activities, today);
    const computedLongest = calculateLongestStreak(streakData.activities);
    const lastActiveDate = activityDates.length > 0
      ? activityDates[activityDates.length - 1]
      : '';

    return {
      ...streakData,
      currentStreak: computedCurrent,
      longestStreak: computedLongest,
      lastActiveDate,
    };
  }, [streakData, today]);

  useEffect(() => {
    if (
      streakData.currentStreak !== computedStreakData.currentStreak ||
      streakData.longestStreak !== computedStreakData.longestStreak ||
      streakData.lastActiveDate !== computedStreakData.lastActiveDate
    ) {
      dispatch({ type: 'UPDATE_STREAK', payload: computedStreakData });
    }
  }, [computedStreakData, dispatch, streakData.currentStreak, streakData.lastActiveDate, streakData.longestStreak]);

  const checkAndUpdateStreak = useCallback(() => {
    const lastActive = streakData.lastActiveDate;
    if (!lastActive) {
      dispatch({ 
        type: 'UPDATE_STREAK', 
        payload: { 
          ...streakData, 
          currentStreak: 1, 
          longestStreak: 1, 
          lastActiveDate: today 
        } 
      });
      return;
    }

    const lastDate = new Date(lastActive);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return; // Already updated today

    let newStreak = streakData.currentStreak;
    if (diffDays === 1) {
      newStreak += 1;
    } else {
      newStreak = 1; // Streak broken
    }

    dispatch({ 
      type: 'UPDATE_STREAK', 
      payload: { 
        ...streakData, 
        currentStreak: newStreak, 
        longestStreak: Math.max(newStreak, streakData.longestStreak),
        lastActiveDate: today 
      } 
    });
  }, [dispatch, streakData, today]);

  const getHeatmapData = useCallback((days: number = 365) => {
    const data: { date: string; level: number }[] = [];
    const todayDate = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(todayDate);
      date.setDate(date.getDate() - i);
      const dateStr = getDateKey(date);
      
      const activity = getActivityForDate(dateStr);
      let level = 0;
      
      if (activity && hasAnyActivity(activity)) {
        const total = activity.tasksCompleted + activity.problemsSolved + activity.coursesProgress;
        if (total >= 10) level = 4;
        else if (total >= 7) level = 3;
        else if (total >= 4) level = 2;
        else if (total >= 1) level = 1;
      }
      
      data.push({ date: dateStr, level });
    }
    
    return data;
  }, [getActivityForDate]);

  const getWeeklyStreak = useCallback(() => {
    const weeks: { week: string; total: number }[] = [];
    const todayDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(todayDate);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekKey = getDateKey(weekStart);
      
      let weekTotal = 0;
      for (let j = 0; j < 7; j++) {
        const day = new Date(weekStart);
        day.setDate(day.getDate() + j);
        const dayStr = getDateKey(day);
        const activity = getActivityForDate(dayStr);
        if (activity) {
          weekTotal += activity.tasksCompleted + activity.problemsSolved;
        }
      }
      
      weeks.push({ week: weekKey, total: weekTotal });
    }
    
    return weeks;
  }, [getActivityForDate]);

  return {
    streakData: computedStreakData,
    todayActivity: getTodayActivity(),
    updateActivity,
    incrementProblemsSolved,
    incrementTasksCompleted,
    checkAndUpdateStreak,
    getHeatmapData,
    getWeeklyStreak,
    getActivityForDate,
  };
}
