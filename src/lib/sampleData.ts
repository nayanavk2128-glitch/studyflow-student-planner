import type { AppData, Subject, ClassEntry, Task, Assignment, Exam, StudySession, Note, PlacementGoal, Settings } from './types';
import { defaultSettings, uid } from './storage';
import { todayISO } from './dateUtils';

function offsetDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function defaultData(): AppData {
  const subjects: Subject[] = [
    { id: uid(), name: 'DBMS', color: 'blue' },
    { id: uid(), name: 'Java', color: 'orange' },
    { id: uid(), name: 'Python', color: 'green' },
    { id: uid(), name: 'Computer Networks', color: 'purple' },
    { id: uid(), name: 'Theory of Computation', color: 'pink' },
    { id: uid(), name: 'Algorithms', color: 'cyan' },
    { id: uid(), name: 'UI/UX', color: 'amber' },
  ];

  const sid = (name: string) => subjects.find((s) => s.name === name)!.id;

  const classes: ClassEntry[] = [
    { id: uid(), subjectId: sid('DBMS'), teacher: 'Prof. Sharma', classroom: 'Room 301', day: 1, startTime: '09:00', endTime: '10:00', notes: 'Chapter 4: Normalization' },
    { id: uid(), subjectId: sid('Java'), teacher: 'Prof. Iyer', classroom: 'Lab 2', day: 1, startTime: '10:00', endTime: '11:00' },
    { id: uid(), subjectId: sid('Algorithms'), teacher: 'Prof. Rao', classroom: 'Room 205', day: 1, startTime: '14:00', endTime: '15:00' },
    { id: uid(), subjectId: sid('Computer Networks'), teacher: 'Prof. Gupta', classroom: 'Room 401', day: 2, startTime: '09:00', endTime: '10:00' },
    { id: uid(), subjectId: sid('Python'), teacher: 'Prof. Nair', classroom: 'Lab 1', day: 2, startTime: '11:00', endTime: '12:00' },
    { id: uid(), subjectId: sid('Theory of Computation'), teacher: 'Prof. Das', classroom: 'Room 302', day: 3, startTime: '09:00', endTime: '10:00' },
    { id: uid(), subjectId: sid('DBMS'), teacher: 'Prof. Sharma', classroom: 'Lab 3', day: 3, startTime: '10:00', endTime: '11:00' },
    { id: uid(), subjectId: sid('Java'), teacher: 'Prof. Iyer', classroom: 'Room 101', day: 4, startTime: '09:00', endTime: '10:00' },
    { id: uid(), subjectId: sid('UI/UX'), teacher: 'Prof. Khan', classroom: 'Studio A', day: 4, startTime: '14:00', endTime: '15:00' },
    { id: uid(), subjectId: sid('Algorithms'), teacher: 'Prof. Rao', classroom: 'Lab 2', day: 5, startTime: '10:00', endTime: '11:00' },
    { id: uid(), subjectId: sid('Python'), teacher: 'Prof. Nair', classroom: 'Room 103', day: 5, startTime: '11:00', endTime: '12:00' },
  ];

  const tasks: Task[] = [
    { id: uid(), title: 'Complete DBMS Lab Exercise 5', description: 'Write SQL queries for joins and subqueries', subjectId: sid('DBMS'), priority: 'high', dueDate: offsetDate(0), dueTime: '23:59', completed: false, createdAt: todayISO() },
    { id: uid(), title: 'Read Java Generics chapter', subjectId: sid('Java'), priority: 'medium', dueDate: offsetDate(2), completed: false, createdAt: todayISO() },
    { id: uid(), title: 'Solve 5 DSA problems on arrays', subjectId: sid('Algorithms'), priority: 'medium', dueDate: offsetDate(1), completed: false, createdAt: todayISO() },
    { id: uid(), title: 'Review CN slides for quiz', subjectId: sid('Computer Networks'), priority: 'low', dueDate: offsetDate(3), completed: false, createdAt: todayISO() },
    { id: uid(), title: 'Submit UI/UX wireframes', subjectId: sid('UI/UX'), priority: 'high', dueDate: offsetDate(-1), dueTime: '23:59', completed: false, createdAt: todayISO() },
    { id: uid(), title: 'Watch Python OOP tutorial', subjectId: sid('Python'), priority: 'low', completed: true, createdAt: todayISO() },
  ];

  const assignments: Assignment[] = [
    { id: uid(), title: 'DBMS Project: Library Management System', subjectId: sid('DBMS'), description: 'Design schema and implement CRUD with normalization', dueDate: offsetDate(7), dueTime: '23:59', status: 'pending', priority: 'high' },
    { id: uid(), title: 'Java Swing Calculator', subjectId: sid('Java'), description: 'Build a GUI calculator using Swing', dueDate: offsetDate(0), dueTime: '23:59', status: 'pending', priority: 'medium' },
    { id: uid(), title: 'CN Case Study: TCP vs UDP', subjectId: sid('Computer Networks'), dueDate: offsetDate(-2), dueTime: '23:59', status: 'pending', priority: 'high' },
    { id: uid(), title: 'Python Data Analysis Script', subjectId: sid('Python'), dueDate: offsetDate(14), status: 'pending', priority: 'low' },
    { id: uid(), title: 'Algorithms Assignment 3', subjectId: sid('Algorithms'), dueDate: offsetDate(-5), status: 'completed', priority: 'medium' },
  ];

  const exams: Exam[] = [
    { id: uid(), subjectId: sid('DBMS'), name: 'DBMS Mid-Semester Exam', date: offsetDate(10), time: '10:00', room: 'Hall A', syllabus: 'ER Diagrams, Normalization (1NF-3NF), SQL, Transactions', prepStatus: 'in-progress' },
    { id: uid(), subjectId: sid('Java'), name: 'Java Internal Assessment', date: offsetDate(5), time: '14:00', room: 'Room 101', syllabus: 'OOP, Generics, Collections, Exception Handling', prepStatus: 'not-started' },
    { id: uid(), subjectId: sid('Algorithms'), name: 'Algorithms Quiz', date: offsetDate(20), time: '09:00', room: 'Room 205', syllabus: 'Sorting, Searching, Dynamic Programming basics', prepStatus: 'not-started' },
  ];

  const studySessions: StudySession[] = [
    { id: uid(), subjectId: sid('DBMS'), topic: 'Normalization practice', date: todayISO(), startTime: '19:00', endTime: '20:00', goal: 'Complete 10 normalization problems', completed: true },
    { id: uid(), subjectId: sid('Java'), topic: 'Collections framework', date: todayISO(), startTime: '20:00', endTime: '21:00', goal: 'Understand HashMap vs TreeMap', completed: false },
    { id: uid(), subjectId: sid('Algorithms'), topic: 'Dynamic Programming intro', date: offsetDate(1), startTime: '18:00', endTime: '19:30', goal: 'Solve 3 DP problems', completed: false },
    { id: uid(), subjectId: sid('Python'), topic: 'OOP concepts', date: offsetDate(-1), startTime: '17:00', endTime: '18:00', goal: 'Classes and inheritance', completed: true },
  ];

  const notes: Note[] = [
    { id: uid(), title: 'DBMS Key Concepts', content: '1NF: No repeating groups\n2NF: No partial dependency\n3NF: No transitive dependency\nBCNF: Every determinant is a candidate key', category: 'College', createdAt: todayISO(), updatedAt: todayISO() },
    { id: uid(), title: 'Java Interview Questions', content: 'Difference between HashMap and Hashtable?\nWhat is the diamond operator?\nExplain method overloading vs overriding', category: 'Placement', createdAt: todayISO(), updatedAt: todayISO() },
    { id: uid(), title: 'DSA Problem Solving Approach', content: '1. Understand the problem\n2. Think of brute force first\n3. Optimize step by step\n4. Code it\n5. Test with edge cases', category: 'Exams', createdAt: todayISO(), updatedAt: todayISO() },
  ];

  const placementGoals: PlacementGoal[] = [
    { id: uid(), category: 'Aptitude', totalItems: 50, completedItems: 35 },
    { id: uid(), category: 'Python', totalItems: 40, completedItems: 32 },
    { id: uid(), category: 'Java', totalItems: 40, completedItems: 24 },
    { id: uid(), category: 'DSA', totalItems: 100, completedItems: 40 },
    { id: uid(), category: 'DBMS', totalItems: 30, completedItems: 22 },
    { id: uid(), category: 'SQL', totalItems: 25, completedItems: 20 },
    { id: uid(), category: 'OOP', totalItems: 20, completedItems: 15 },
    { id: uid(), category: 'Computer Networks', totalItems: 25, completedItems: 10 },
    { id: uid(), category: 'Operating Systems', totalItems: 25, completedItems: 8 },
    { id: uid(), category: 'Coding Practice', totalItems: 80, completedItems: 28 },
    { id: uid(), category: 'Interview Preparation', totalItems: 30, completedItems: 12 },
  ];

  const settings: Settings = {
    ...defaultSettings(),
    studentName: 'Nayana',
    collegeName: 'ABC Engineering College',
  };

  return {
    subjects,
    classes,
    tasks,
    assignments,
    exams,
    studySessions,
    notes,
    placementGoals,
    reminders: [],
    settings,
    version: 1,
  };
}
