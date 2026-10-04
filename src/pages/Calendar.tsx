import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { MONTH_NAMES, DAY_NAMES, DAY_SHORT, getCalendarGrid, toISODate, todayISO, formatTime } from '@/lib/dateUtils';
import { getSubjectName, getSubjectColor } from '@/lib/colors';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/Form';
import { ChevronLeft, ChevronRight, Clock, CheckSquare, FileText, GraduationCap, BookOpen } from 'lucide-react';
import type { DayOfWeek } from '@/lib/types';

export function Calendar() {
  const { data } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const startOfWeek = data.settings.startOfWeek;
  const tf = data.settings.timeFormat;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const grid = useMemo(() => getCalendarGrid(year, month, startOfWeek), [year, month, startOfWeek]);

  // Build event lookup by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, { type: string; label: string; time?: string; color: string }[]> = {};
    // Classes
    data.classes.forEach((c) => {
      // Find dates in current month that match the day
      grid.forEach((d) => {
        if (d.getMonth() === month && d.getDay() === c.day) {
          const ds = toISODate(d);
          if (!map[ds]) map[ds] = [];
          map[ds].push({ type: 'class', label: getSubjectName(data.subjects, c.subjectId), time: c.startTime, color: data.subjects.find((s) => s.id === c.subjectId)?.color || 'blue' });
        }
      });
    });
    // Tasks
    data.tasks.forEach((t) => {
      if (t.dueDate && !map[t.dueDate]) map[t.dueDate] = [];
      if (t.dueDate) map[t.dueDate]?.push({ type: 'task', label: t.title, color: t.completed ? 'green' : 'amber' });
    });
    // Assignments
    data.assignments.forEach((a) => {
      if (!map[a.dueDate]) map[a.dueDate] = [];
      map[a.dueDate]?.push({ type: 'assignment', label: a.title, color: a.status === 'completed' ? 'green' : 'red' });
    });
    // Exams
    data.exams.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date]?.push({ type: 'exam', label: e.name, time: e.time, color: 'red' });
    });
    // Study sessions
    data.studySessions.forEach((s) => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date]?.push({ type: 'study', label: s.topic, time: s.startTime, color: data.subjects.find((sub) => sub.id === s.subjectId)?.color || 'teal' });
    });
    return map;
  }, [data, grid, month]);

  const dayLabels = useMemo(() => {
    const labels: string[] = [];
    for (let i = 0; i < 7; i++) {
      const idx = (startOfWeek + i) % 7;
      labels.push(DAY_SHORT[idx]);
    }
    return labels;
  }, [startOfWeek]);

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];
  const today = todayISO();

  const eventIcons: Record<string, React.ReactNode> = {
    class: <Clock size={14} />,
    task: <CheckSquare size={14} />,
    assignment: <FileText size={14} />,
    exam: <GraduationCap size={14} />,
    study: <BookOpen size={14} />,
  };

  return (
    <div>
      <PageHeader title="Calendar" subtitle="All your events in one view" />

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4 bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-700">
        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-base font-bold text-slate-700 dark:text-slate-200">{MONTH_NAMES[month]} {year}</h2>
        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      <button onClick={() => { setCurrentDate(new Date()); setSelectedDate(today); }} className="mb-3 text-sm text-sky-500 hover:text-sky-600 font-medium">
        → Jump to today
      </button>

      {/* Calendar grid */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="grid grid-cols-7 mb-2">
          {dayLabels.map((d, i) => (
            <div key={i} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {grid.map((d, i) => {
            const ds = toISODate(d);
            const isCurrentMonth = d.getMonth() === month;
            const isToday = ds === today;
            const isSelected = ds === selectedDate;
            const events = eventsByDate[ds] || [];
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(ds)}
                className={`relative aspect-square sm:aspect-auto sm:min-h-[60px] rounded-lg p-1 sm:p-1.5 text-left transition-all ${
                  !isCurrentMonth ? 'opacity-30' : ''
                } ${
                  isSelected ? 'bg-sky-100 dark:bg-sky-900/40 ring-2 ring-sky-400' : isToday ? 'bg-sky-50 dark:bg-sky-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <span className={`text-xs font-medium ${isToday ? 'text-sky-600 dark:text-sky-400 font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
                  {d.getDate()}
                </span>
                {events.length > 0 && (
                  <div className="hidden sm:flex flex-col gap-0.5 mt-1">
                    {events.slice(0, 3).map((e, j) => {
                      const color = getSubjectColor(e.color);
                      return (
                        <div key={j} className={`text-[9px] truncate px-1 rounded ${color.bgLight} ${color.text}`}>
                          {e.label}
                        </div>
                      );
                    })}
                    {events.length > 3 && <span className="text-[9px] text-slate-400 px-1">+{events.length - 3} more</span>}
                  </div>
                )}
                {events.length > 0 && (
                  <div className="sm:hidden absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {events.slice(0, 3).map((e, j) => {
                      const color = getSubjectColor(e.color);
                      return <div key={j} className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />;
                    })}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day detail modal */}
      <Modal open={!!selectedDate} onClose={() => setSelectedDate(null)} title={selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : ''}>
        {selectedEvents.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No events on this day</p>
        ) : (
          <div className="space-y-2">
            {selectedEvents.map((e, i) => {
              const color = getSubjectColor(e.color);
              return (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <div className={`p-1.5 rounded-lg ${color.bgLight} ${color.text}`}>{eventIcons[e.type]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{e.label}</p>
                    <p className="text-xs text-slate-400 capitalize">{e.type}{e.time && ` · ${formatTime(e.time, tf)}`}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
}
