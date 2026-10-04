export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sun ... 6=Sat

export type Priority = 'low' | 'medium' | 'high';

export interface Subject {
  id: string;
  name: string;
  color: string; // tailwind color name e.g. 'blue'
}

export interface ClassEntry {
  id: string;
  subjectId: string;
  teacher: string;
  classroom: string;
  day: DayOfWeek; // 0..6
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  subjectId?: string;
  priority: Priority;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  completed: boolean;
  createdAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  subjectId?: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string;
  status: 'pending' | 'completed';
  priority: Priority;
}

export interface Exam {
  id: string;
  subjectId?: string;
  name: string;
  date: string; // YYYY-MM-DD
  time?: string;
  room?: string;
  syllabus?: string;
  prepStatus: 'not-started' | 'in-progress' | 'ready';
}

export interface StudySession {
  id: string;
  subjectId?: string;
  topic: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  goal?: string;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'College' | 'Placement' | 'Projects' | 'Personal' | 'Exams';
  createdAt: string;
  updatedAt: string;
}

export interface PlacementGoal {
  id: string;
  category: string;
  totalItems: number;
  completedItems: number;
}

export interface Reminder {
  id: string;
  type: 'class' | 'assignment' | 'exam' | 'task' | 'study';
  refId: string;
  message: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  enabled: boolean;
}

export interface Settings {
  studentName: string;
  collegeName: string;
  course: string;
  semester: string;
  theme: 'light' | 'dark';
  startOfWeek: 0 | 1; // 0=Sun, 1=Mon
  timeFormat: '12h' | '24h';
  notificationsEnabled: boolean;
  pomodoroStudy: number; // minutes
  pomodoroBreak: number; // minutes
}

export interface AppData {
  subjects: Subject[];
  classes: ClassEntry[];
  tasks: Task[];
  assignments: Assignment[];
  exams: Exam[];
  studySessions: StudySession[];
  notes: Note[];
  placementGoals: PlacementGoal[];
  reminders: Reminder[];
  settings: Settings;
  version: number;
}
