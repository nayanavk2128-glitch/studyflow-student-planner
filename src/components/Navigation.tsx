import { type ReactNode, useState } from 'react';
import {
  LayoutDashboard, CalendarDays, CheckSquare, BookOpen,
  GraduationCap, StickyNote, Timer, BarChart3, Settings as SettingsIcon,
  Clock, CalendarRange, Target, Plus, X, ListChecks, NotebookPen,
  FileText, AlarmClock
} from 'lucide-react';

export type PageId =
  | 'dashboard' | 'timetable' | 'daily' | 'tasks' | 'assignments'
  | 'exams' | 'study' | 'pomodoro' | 'notes' | 'calendar'
  | 'placement' | 'analytics' | 'settings';

interface NavItem {
  id: PageId;
  label: string;
  icon: ReactNode;
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'timetable', label: 'Timetable', icon: <CalendarRange size={20} /> },
  { id: 'daily', label: 'Daily Schedule', icon: <Clock size={20} /> },
  { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={20} /> },
  { id: 'assignments', label: 'Assignments', icon: <FileText size={20} /> },
  { id: 'exams', label: 'Exams', icon: <GraduationCap size={20} /> },
  { id: 'study', label: 'Study Planner', icon: <BookOpen size={20} /> },
  { id: 'pomodoro', label: 'Pomodoro', icon: <Timer size={20} /> },
  { id: 'notes', label: 'Notes', icon: <StickyNote size={20} /> },
  { id: 'calendar', label: 'Calendar', icon: <CalendarDays size={20} /> },
  { id: 'placement', label: 'Placement', icon: <Target size={20} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
];

const BOTTOM_NAV: PageId[] = ['dashboard', 'calendar', 'tasks', 'study', 'settings'];

export const QUICK_ADD_OPTIONS = [
  { label: 'Add Class', icon: <CalendarRange size={18} />, page: 'timetable' as PageId },
  { label: 'Add Task', icon: <CheckSquare size={18} />, page: 'tasks' as PageId },
  { label: 'Add Assignment', icon: <FileText size={18} />, page: 'assignments' as PageId },
  { label: 'Add Exam', icon: <GraduationCap size={18} />, page: 'exams' as PageId },
  { label: 'Add Study Session', icon: <BookOpen size={18} />, page: 'study' as PageId },
  { label: 'Add Note', icon: <StickyNote size={18} />, page: 'notes' as PageId },
  { label: 'Add Reminder', icon: <AlarmClock size={18} />, page: 'settings' as PageId },
];

interface SidebarProps {
  current: PageId;
  onNavigate: (page: PageId) => void;
}

export function Sidebar({ current, onNavigate }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-60 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-screen sticky top-0 shrink-0">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-200 dark:border-slate-700">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-md">
          <NotebookPen size={20} />
        </div>
        <div>
          <h1 className="font-bold text-slate-800 dark:text-slate-100 leading-tight">StudyFlow</h1>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">Plan. Study. Achieve.</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              current === item.id
                ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

interface BottomNavProps {
  current: PageId;
  onNavigate: (page: PageId) => void;
}

export function BottomNav({ current, onNavigate }: BottomNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around px-1 py-1">
        {BOTTOM_NAV.map((id) => {
          const item = NAV_ITEMS.find((n) => n.id === id)!;
          const active = current === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                active ? 'text-sky-500 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

interface MobileHeaderProps {
  current: PageId;
  onNavigate: (page: PageId) => void;
}

export function MobileHeader({ current, onNavigate }: MobileHeaderProps) {
  const [open, setOpen] = useState(false);
  const item = NAV_ITEMS.find((n) => n.id === current);

  return (
    <div className="lg:hidden sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white">
            <NotebookPen size={18} />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-100">StudyFlow</span>
        </div>
        <button onClick={() => setOpen(true)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
          <ListChecks size={22} />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-800 shadow-xl overflow-y-auto animate-slideLeft">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-800 dark:text-slate-100">Menu</span>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                <X size={20} />
              </button>
            </div>
            <nav className="px-3 py-3 space-y-0.5">
              {NAV_ITEMS.map((it) => (
                <button
                  key={it.id}
                  onClick={() => { onNavigate(it.id); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    current === it.id
                      ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {it.icon}
                  {it.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

interface QuickAddFabProps {
  onNavigate: (page: PageId) => void;
}

export function QuickAddFab({ onNavigate }: QuickAddFabProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 flex items-end justify-end p-4 pb-24 lg:pb-8 pointer-events-none">
          <div className="absolute inset-0 bg-black/30 pointer-events-auto" onClick={() => setOpen(false)} />
          <div className="relative flex flex-col gap-2 pointer-events-auto animate-slideUp">
            {QUICK_ADD_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => { onNavigate(opt.page); setOpen(false); }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all whitespace-nowrap ml-auto"
              >
                {opt.label}
                <span className="text-sky-500">{opt.icon}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${
          open ? 'rotate-45' : ''
        }`}
        aria-label="Quick Add"
      >
        <Plus size={26} />
      </button>
    </>
  );
}

export function getPageLabel(page: PageId): string {
  return NAV_ITEMS.find((n) => n.id === page)?.label || '';
}
