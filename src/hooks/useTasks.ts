import { useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import type { Task, TaskCategory } from '@/types';

export function useTasks() {
  const { state, dispatch } = useApp();

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
    return newTask;
  }, [dispatch]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
      const updatedTask = { ...task, ...updates };
      if (updates.status === 'completed' && task.status !== 'completed') {
        updatedTask.completedAt = new Date().toISOString();
      } else if (updatedTask.status !== 'completed') {
        updatedTask.completedAt = undefined;
      }
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    }
  }, [dispatch, state.tasks]);

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  }, [dispatch]);

  const toggleTaskStatus = useCallback((id: string) => {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      updateTask(id, { 
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
      });
    }
  }, [state.tasks, updateTask]);

  const getTasksByCategory = useCallback((category: TaskCategory) => {
    return state.tasks.filter(t => t.category === category);
  }, [state.tasks]);

  const getTasksByStatus = useCallback((status: Task['status']) => {
    return state.tasks.filter(t => t.status === status);
  }, [state.tasks]);

  const getTasksForDate = useCallback((date: string) => {
    return state.tasks.filter(t => t.dueDate === date);
  }, [state.tasks]);

  const getTodayTasks = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return getTasksForDate(today);
  }, [getTasksForDate]);

  const getOverdueTasks = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return state.tasks.filter(t => 
      t.dueDate < today && t.status !== 'completed'
    );
  }, [state.tasks]);

  const getUpcomingTasks = useCallback((days: number = 7) => {
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + days);
    
    return state.tasks.filter(t => {
      const taskDate = new Date(t.dueDate);
      return taskDate >= today && taskDate <= future && t.status !== 'completed';
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [state.tasks]);

  const getTaskStats = useCallback(() => {
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.status === 'completed').length;
    const pending = state.tasks.filter(t => t.status === 'pending').length;
    const inProgress = state.tasks.filter(t => t.status === 'in-progress').length;
    
    const byCategory = {
      coding: state.tasks.filter(t => t.category === 'coding').length,
      job: state.tasks.filter(t => t.category === 'job').length,
      learning: state.tasks.filter(t => t.category === 'learning').length,
      personal: state.tasks.filter(t => t.category === 'personal').length,
    };

    return { total, completed, pending, inProgress, byCategory };
  }, [state.tasks]);

  return {
    tasks: state.tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    getTasksByCategory,
    getTasksByStatus,
    getTasksForDate,
    getTodayTasks,
    getOverdueTasks,
    getUpcomingTasks,
    getTaskStats,
  };
}
