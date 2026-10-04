import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { StudySessionForm } from '@/pages/DailySchedule';
import { todayISO, formatDate, formatTime, fromISODate, toISODate, minutesBetween, daysUntil } from '@/lib/dateUtils';
import { getSubjectName, getSubjectColor } from '@/lib/colors';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { PageHeader, EmptyState } from '@/components/ui/Form';
import { Plus, Pencil, Trash2, Check, BookOpen, TrendingUp, Clock } from 'lucide-react';
import type { StudySession } from '@/lib/types';

export function StudyPlanner() {
  const { data, addStudySession, updateStudySession, deleteStudySession } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<StudySession | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const tf = data.settings.timeFormat;

  // Calculate daily hours for the last 7 days
  const last7Days = useMemo(() => {
    const days: { date: string; hours: number; label: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = toISODate(d);
      const sessions = data.studySessions.filter((s) => s.date === ds);
      const hours = sessions.reduce((sum, s) => sum + minutesBetween(s.startTime, s.endTime) / 60, 0);
      days.push({ date: ds, hours, label: d.toLocaleDateString('en-US', { weekday: 'short' }) });
    }
    return days;
  }, [data.studySessions]);

  const weeklyHours = last7Days.reduce((sum, d) => sum + d.hours, 0);
  const todayHours = last7Days[6].hours;
  const maxHours = Math.max(...last7Days.map((d) => d.hours), 1);

  const todaySessions = data.studySessions
    .filter((s) => s.date === todayISO())
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const upcomingSessions = data.studySessions
    .filter((s) => daysUntil(s.date) > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const handleSave = (s: Omit<StudySession, 'id'>) => {
    if (editItem) updateStudySession(editItem.id, s);
    else addStudySession(s);
    setEditItem(null);
  };

  return (
    <div>
      <PageHeader
        title="Study Planner"
        subtitle="Plan and track your study sessions"
        action={
          <button onClick={() => { setEditItem(null); setFormOpen(true); }} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-colors">
            <Plus size={18} /> <span className="hidden sm:inline">Add Session</span>
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-sky-500 mb-1">
            <Clock size={18} />
            <span className="text-xs font-medium text-slate-400">Today</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{todayHours.toFixed(1)}h</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-green-500 mb-1">
            <TrendingUp size={18} />
            <span className="text-xs font-medium text-slate-400">This Week</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{weeklyHours.toFixed(1)}h</p>
        </div>
      </div>

      {/* Weekly chart */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 mb-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Study Hours (Last 7 Days)</h3>
        <div className="flex items-end justify-between gap-2 h-32">
          {last7Days.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-sky-400 to-blue-500 rounded-t-lg transition-all duration-500 min-h-[2px] relative group"
                  style={{ height: `${(d.hours / maxHours) * 100}%` }}
                >
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.hours.toFixed(1)}h
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Today's sessions */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Today's Study Sessions</h3>
        {todaySessions.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No study sessions today</p>
        ) : (
          <div className="space-y-2">
            {todaySessions.map((s) => {
              const color = getSubjectColor(data.subjects.find((sub) => sub.id === s.subjectId)?.color || 'teal');
              return (
                <div key={s.id} className={`bg-white dark:bg-slate-800 rounded-xl p-3.5 shadow-sm border ${s.completed ? 'border-green-200 dark:border-green-800 opacity-70' : 'border-slate-100 dark:border-slate-700'}`}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateStudySession(s.id, { completed: !s.completed })}
                      className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-colors ${s.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}
                    >
                      {s.completed && <Check size={13} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium text-slate-700 dark:text-slate-200 ${s.completed ? 'line-through' : ''}`}>{s.topic}</p>
                      <p className={`text-xs ${color.text}`}>{getSubjectName(data.subjects, s.subjectId)}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatTime(s.startTime, tf)} – {formatTime(s.endTime, tf)} · {minutesBetween(s.startTime, s.endTime)}m
                      </p>
                      {s.goal && <p className="text-xs text-slate-400 mt-0.5 italic">"{s.goal}"</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => { setEditItem(s); setFormOpen(true); }} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteId(s.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming sessions */}
      {upcomingSessions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Upcoming Sessions</h3>
          <div className="space-y-2">
            {upcomingSessions.map((s) => (
              <div key={s.id} className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-900/30 text-sky-500 shrink-0">
                  <span className="text-sm font-bold leading-none">{daysUntil(s.date)}</span>
                  <span className="text-[9px] mt-0.5">days</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{s.topic}</p>
                  <p className="text-xs text-slate-400">{getSubjectName(data.subjects, s.subjectId)} · {formatDate(s.date)} · {formatTime(s.startTime, tf)}</p>
                </div>
                <button onClick={() => { setEditItem(s); setFormOpen(true); }} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500">
                  <Pencil size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.studySessions.length === 0 && (
        <EmptyState icon={<BookOpen size={48} />} title="No study sessions" message="Add a study session to start tracking your hours" />
      )}

      <StudySessionForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditItem(null); }}
        onSave={handleSave}
        initial={editItem}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Study Session"
        message="Are you sure you want to delete this study session?"
        onConfirm={() => { if (deleteId) deleteStudySession(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
