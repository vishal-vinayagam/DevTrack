import { useState, useCallback, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import type { PomodoroSession } from '@/types';

type TimerState = 'idle' | 'work' | 'break' | 'paused';

export function usePomodoro() {
  const { state, dispatch } = useApp();
  const { userProfile } = state;
  
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeLeft, setTimeLeft] = useState(userProfile.preferences.pomodoroDuration * 60);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const workDuration = userProfile.preferences.pomodoroDuration * 60;
  const breakDuration = userProfile.preferences.breakDuration * 60;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startWork = useCallback(() => {
    clearTimer();
    setTimerState('work');
    setTimeLeft(workDuration);
    
    const session: PomodoroSession = {
      id: crypto.randomUUID(),
      startTime: new Date().toISOString(),
      duration: workDuration,
      type: 'work',
      completed: false,
    };
    setCurrentSession(session);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearTimer();
          setTimerState('break');
          setTimeLeft(breakDuration);
          setCompletedSessions(s => s + 1);
          
          if (currentSession) {
            const completedSession = {
              ...currentSession,
              endTime: new Date().toISOString(),
              completed: true,
            };
            dispatch({ type: 'ADD_POMODORO', payload: completedSession });
          }
          
          try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => {});
          } catch {}
          
          return breakDuration;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, workDuration, breakDuration, currentSession, dispatch]);

  const startBreak = useCallback(() => {
    clearTimer();
    setTimerState('break');
    setTimeLeft(breakDuration);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearTimer();
          setTimerState('idle');
          setTimeLeft(workDuration);
          return workDuration;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, breakDuration, workDuration]);

  const pause = useCallback(() => {
    clearTimer();
    setTimerState('paused');
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (timerState === 'paused') {
      setTimerState(timeLeft > breakDuration ? 'work' : 'break');
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [clearTimer, timerState, timeLeft, breakDuration]);

  const reset = useCallback(() => {
    clearTimer();
    setTimerState('idle');
    setTimeLeft(workDuration);
    setCurrentSession(null);
  }, [clearTimer, workDuration]);

  const skip = useCallback(() => {
    clearTimer();
    if (timerState === 'work') {
      setTimerState('break');
      setTimeLeft(breakDuration);
    } else {
      setTimerState('idle');
      setTimeLeft(workDuration);
    }
  }, [clearTimer, timerState, breakDuration, workDuration]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getProgress = useCallback(() => {
    const total = timerState === 'work' ? workDuration : breakDuration;
    return ((total - timeLeft) / total) * 100;
  }, [timerState, timeLeft, workDuration, breakDuration]);

  const getTodaySessions = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return state.pomodoroSessions.filter(s => 
      s.startTime.startsWith(today) && s.completed
    );
  }, [state.pomodoroSessions]);

  const getTotalFocusTime = useCallback(() => {
    const todaySessions = getTodaySessions();
    return todaySessions.reduce((total, s) => total + s.duration, 0);
  }, [getTodaySessions]);

  return {
    timerState,
    timeLeft,
    formattedTime: formatTime(timeLeft),
    progress: getProgress(),
    completedSessions,
    isRunning: timerState === 'work' || timerState === 'break',
    isPaused: timerState === 'paused',
    startWork,
    startBreak,
    pause,
    resume,
    reset,
    skip,
    getTodaySessions,
    getTotalFocusTime,
  };
}
