import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { AppData, Task, Assignment, Exam, StudySession, Note, ClassEntry, Subject, PlacementGoal, Reminder, Settings } from '@/lib/types';
import { loadData, saveData, clearData, defaultSettings, uid } from '@/lib/storage';
import { defaultData } from '@/lib/sampleData';

interface AppContextValue {
  data: AppData;
  // Settings
  updateSettings: (partial: Partial<Settings>) => void;
  resetData: () => void;
  loadSampleData: () => void;
  // Subjects
  addSubject: (s: Omit<Subject, 'id'>) => string;
  updateSubject: (id: string, partial: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  // Classes
  addClass: (c: Omit<ClassEntry, 'id'>) => void;
  updateClass: (id: string, partial: Partial<ClassEntry>) => void;
  deleteClass: (id: string) => void;
  // Tasks
  addTask: (t: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, partial: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  // Assignments
  addAssignment: (a: Omit<Assignment, 'id'>) => void;
  updateAssignment: (id: string, partial: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  // Exams
  addExam: (e: Omit<Exam, 'id'>) => void;
  updateExam: (id: string, partial: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  // Study sessions
  addStudySession: (s: Omit<StudySession, 'id'>) => void;
  updateStudySession: (id: string, partial: Partial<StudySession>) => void;
  deleteStudySession: (id: string) => void;
  // Notes
  addNote: (n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, partial: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  // Placement
  addPlacementGoal: (g: Omit<PlacementGoal, 'id'>) => void;
  updatePlacementGoal: (id: string, partial: Partial<PlacementGoal>) => void;
  deletePlacementGoal: (id: string) => void;
  // Reminders
  addReminder: (r: Omit<Reminder, 'id'>) => void;
  deleteReminder: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  // Theme
  useEffect(() => {
    const root = document.documentElement;
    if (data.settings.theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [data.settings.theme]);

  const update = useCallback((updater: (prev: AppData) => AppData) => {
    setData((prev) => updater(prev));
  }, []);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    update((prev) => ({ ...prev, settings: { ...prev.settings, ...partial } }));
  }, [update]);

  const resetData = useCallback(() => {
    clearData();
    setData({ ...defaultData(), settings: defaultSettings() });
  }, []);

  const loadSampleData = useCallback(() => {
    setData(defaultData());
  }, []);

  const value: AppContextValue = {
    data,
    updateSettings,
    resetData,
    loadSampleData,
    addSubject: (s) => {
      const id = uid();
      update((prev) => ({ ...prev, subjects: [...prev.subjects, { ...s, id }] }));
      return id;
    },
    updateSubject: (id, partial) =>
      update((prev) => ({ ...prev, subjects: prev.subjects.map((s) => (s.id === id ? { ...s, ...partial } : s)) })),
    deleteSubject: (id) =>
      update((prev) => ({ ...prev, subjects: prev.subjects.filter((s) => s.id !== id) })),

    addClass: (c) => update((prev) => ({ ...prev, classes: [...prev.classes, { ...c, id: uid() }] })),
    updateClass: (id, partial) =>
      update((prev) => ({ ...prev, classes: prev.classes.map((c) => (c.id === id ? { ...c, ...partial } : c)) })),
    deleteClass: (id) => update((prev) => ({ ...prev, classes: prev.classes.filter((c) => c.id !== id) })),

    addTask: (t) => update((prev) => ({ ...prev, tasks: [...prev.tasks, { ...t, id: uid(), createdAt: new Date().toISOString().slice(0, 10) }] })),
    updateTask: (id, partial) =>
      update((prev) => ({ ...prev, tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...partial } : t)) })),
    deleteTask: (id) => update((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) })),

    addAssignment: (a) => update((prev) => ({ ...prev, assignments: [...prev.assignments, { ...a, id: uid() }] })),
    updateAssignment: (id, partial) =>
      update((prev) => ({ ...prev, assignments: prev.assignments.map((a) => (a.id === id ? { ...a, ...partial } : a)) })),
    deleteAssignment: (id) => update((prev) => ({ ...prev, assignments: prev.assignments.filter((a) => a.id !== id) })),

    addExam: (e) => update((prev) => ({ ...prev, exams: [...prev.exams, { ...e, id: uid() }] })),
    updateExam: (id, partial) =>
      update((prev) => ({ ...prev, exams: prev.exams.map((e) => (e.id === id ? { ...e, ...partial } : e)) })),
    deleteExam: (id) => update((prev) => ({ ...prev, exams: prev.exams.filter((e) => e.id !== id) })),

    addStudySession: (s) => update((prev) => ({ ...prev, studySessions: [...prev.studySessions, { ...s, id: uid() }] })),
    updateStudySession: (id, partial) =>
      update((prev) => ({ ...prev, studySessions: prev.studySessions.map((s) => (s.id === id ? { ...s, ...partial } : s)) })),
    deleteStudySession: (id) => update((prev) => ({ ...prev, studySessions: prev.studySessions.filter((s) => s.id !== id) })),

    addNote: (n) => {
      const now = new Date().toISOString().slice(0, 10);
      update((prev) => ({ ...prev, notes: [...prev.notes, { ...n, id: uid(), createdAt: now, updatedAt: now }] }));
    },
    updateNote: (id, partial) =>
      update((prev) => ({
        ...prev,
        notes: prev.notes.map((n) => (n.id === id ? { ...n, ...partial, updatedAt: new Date().toISOString().slice(0, 10) } : n)),
      })),
    deleteNote: (id) => update((prev) => ({ ...prev, notes: prev.notes.filter((n) => n.id !== id) })),

    addPlacementGoal: (g) => update((prev) => ({ ...prev, placementGoals: [...prev.placementGoals, { ...g, id: uid() }] })),
    updatePlacementGoal: (id, partial) =>
      update((prev) => ({ ...prev, placementGoals: prev.placementGoals.map((g) => (g.id === id ? { ...g, ...partial } : g)) })),
    deletePlacementGoal: (id) => update((prev) => ({ ...prev, placementGoals: prev.placementGoals.filter((g) => g.id !== id) })),

    addReminder: (r) => update((prev) => ({ ...prev, reminders: [...prev.reminders, { ...r, id: uid() }] })),
    deleteReminder: (id) => update((prev) => ({ ...prev, reminders: prev.reminders.filter((r) => r.id !== id) })),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
