import { useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import type { Note } from '@/types';

export function useNotes() {
  const { state, dispatch } = useApp();

  const addNote = useCallback((title: string, content: string, tags: string[] = []) => {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      tags,
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: 'ADD_NOTE', payload: newNote });
    return newNote;
  }, [dispatch]);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    const note = state.notes.find(n => n.id === id);
    if (note) {
      const updatedNote = { 
        ...note, 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
    }
  }, [dispatch, state.notes]);

  const deleteNote = useCallback((id: string) => {
    dispatch({ type: 'DELETE_NOTE', payload: id });
  }, [dispatch]);

  const getNotesByTag = useCallback((tag: string) => {
    return state.notes.filter(n => n.tags.includes(tag));
  }, [state.notes]);

  const searchNotes = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return state.notes.filter(n => 
      n.title.toLowerCase().includes(lowerQuery) ||
      n.content.toLowerCase().includes(lowerQuery) ||
      n.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }, [state.notes]);

  const getAllTags = useCallback(() => {
    const tags = new Set<string>();
    state.notes.forEach(n => n.tags.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [state.notes]);

  const getRecentNotes = useCallback((limit: number = 5) => {
    return [...state.notes]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }, [state.notes]);

  return {
    notes: state.notes,
    addNote,
    updateNote,
    deleteNote,
    getNotesByTag,
    searchNotes,
    getAllTags,
    getRecentNotes,
  };
}
