import { useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import type { Course } from '@/types';

export function useCourses() {
  const { state, dispatch } = useApp();

  const addCourse = useCallback((courseData: Omit<Course, 'id' | 'completedLessons' | 'status'>) => {
    const newCourse: Course = {
      ...courseData,
      id: crypto.randomUUID(),
      completedLessons: 0,
      status: 'not-started',
    };
    dispatch({ type: 'ADD_COURSE', payload: newCourse });
    return newCourse;
  }, [dispatch]);

  const updateCourse = useCallback((id: string, updates: Partial<Course>) => {
    const course = state.courses.find(c => c.id === id);
    if (course) {
      const updatedCourse = { ...course, ...updates };
      
      // Auto-update status based on progress
      if (updatedCourse.progress === 0) {
        updatedCourse.status = 'not-started';
      } else if (updatedCourse.progress === 100) {
        updatedCourse.status = 'completed';
        updatedCourse.completedDate = new Date().toISOString();
      } else {
        updatedCourse.status = 'in-progress';
      }
      
      // Update completed lessons based on progress
      if (updates.progress !== undefined) {
        updatedCourse.completedLessons = Math.round(
          (updates.progress / 100) * course.totalLessons
        );
      }
      
      dispatch({ type: 'UPDATE_COURSE', payload: updatedCourse });
    }
  }, [dispatch, state.courses]);

  const deleteCourse = useCallback((id: string) => {
    dispatch({ type: 'DELETE_COURSE', payload: id });
  }, [dispatch]);

  const updateProgress = useCallback((id: string, progress: number) => {
    updateCourse(id, { progress: Math.min(100, Math.max(0, progress)) });
  }, [updateCourse]);

  const incrementProgress = useCallback((id: string, lessons: number = 1) => {
    const course = state.courses.find(c => c.id === id);
    if (course) {
      if (course.totalLessons <= 0) {
        const fallbackProgress = Math.min(100, Math.max(0, course.progress + lessons));
        updateCourse(id, { progress: fallbackProgress });
        return;
      }

      const newCompleted = Math.min(course.totalLessons, course.completedLessons + lessons);
      const newProgress = Math.round((newCompleted / course.totalLessons) * 100);
      updateCourse(id, { 
        completedLessons: newCompleted, 
        progress: newProgress 
      });
    }
  }, [state.courses, updateCourse]);

  const getCoursesByStatus = useCallback((status: Course['status']) => {
    return state.courses.filter(c => c.status === status);
  }, [state.courses]);

  const getCoursesByCategory = useCallback((category: string) => {
    return state.courses.filter(c => c.category === category);
  }, [state.courses]);

  const getInProgressCourses = useCallback(() => {
    return state.courses.filter(c => c.status === 'in-progress');
  }, [state.courses]);

  const getCompletedCourses = useCallback(() => {
    return state.courses.filter(c => c.status === 'completed');
  }, [state.courses]);

  const getCourseStats = useCallback(() => {
    const total = state.courses.length;
    const completed = state.courses.filter(c => c.status === 'completed').length;
    const inProgress = state.courses.filter(c => c.status === 'in-progress').length;
    const notStarted = state.courses.filter(c => c.status === 'not-started').length;
    const averageProgress = total > 0 
      ? state.courses.reduce((sum, c) => sum + c.progress, 0) / total 
      : 0;

    return { total, completed, inProgress, notStarted, averageProgress };
  }, [state.courses]);

  const getAllCategories = useCallback(() => {
    const categories = new Set<string>();
    state.courses.forEach(c => categories.add(c.category));
    return Array.from(categories);
  }, [state.courses]);

  return {
    courses: state.courses,
    addCourse,
    updateCourse,
    deleteCourse,
    updateProgress,
    incrementProgress,
    getCoursesByStatus,
    getCoursesByCategory,
    getInProgressCourses,
    getCompletedCourses,
    getCourseStats,
    getAllCategories,
  };
}
