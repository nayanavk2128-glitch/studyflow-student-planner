import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DAY_NAMES, DAY_SHORT, formatTime, timesOverlap } from '@/lib/dateUtils';
import { getSubjectName, getSubjectColor } from '@/lib/colors';
import { ClassForm } from '@/components/ClassForm';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { PageHeader, EmptyState } from '@/components/ui/Form';
import { Plus, Pencil, Trash2, AlertTriangle, CalendarRange } from 'lucide-react';
import type { ClassEntry, DayOfWeek } from '@/lib/types';

export function Timetable() {
  const { data, addClass, updateClass, deleteClass } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editClass, setEditClass] = useState<ClassEntry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [overlapWarning, setOverlapWarning] = useState<string | null>(null);
  const tf = data.settings.timeFormat;

  const days: DayOfWeek[] = [1, 2, 3, 4, 5, 0, 6]; // Mon-Sun

  const handleSave = (c: Omit<ClassEntry, 'id'>) => {
    // Check overlap
    const overlaps = data.classes.filter(
      (existing) => existing.day === c.day && existing.id !== editClass?.id && timesOverlap(c.startTime, c.endTime, existing.startTime, existing.endTime)
    );
    if (overlaps.length > 0) {
      const names = overlaps.map((o) => getSubjectName(data.subjects, o.subjectId)).join(', ');
      setOverlapWarning(`This class overlaps with: ${names}`);
    }
    if (editClass) {
      updateClass(editClass.id, c);
    } else {
      addClass(c);
    }
    setEditClass(null);
  };

  const getClassesForDay = (day: DayOfWeek) =>
    data.classes.filter((c) => c.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const today = new Date().getDay() as DayOfWeek;

  return (
    <div>
      <PageHeader
        title="Weekly Timetable"
        subtitle="Your class schedule for the week"
        action={
          <button
            onClick={() => { setEditClass(null); setFormOpen(true); }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-colors"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Add Class</span>
          </button>
        }
      />

      {overlapWarning && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <span>{overlapWarning}</span>
          <button onClick={() => setOverlapWarning(null)} className="ml-auto text-amber-500 hover:text-amber-700">
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* Desktop: Grid view */}
      <div className="hidden md:grid grid-cols-7 gap-2">
        {days.map((day) => {
          const classes = getClassesForDay(day);
          const isToday = day === today;
          return (
            <div key={day} className={`rounded-xl ${isToday ? 'ring-2 ring-sky-400' : ''}`}>
              <div className={`text-center py-2 mb-1 rounded-lg ${isToday ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                <p className="text-xs font-bold">{DAY_SHORT[day]}</p>
              </div>
              <div className="space-y-1.5 min-h-[200px]">
                {classes.length === 0 ? (
                  <div className="h-20 flex items-center justify-center text-xs text-slate-300 dark:text-slate-600">—</div>
                ) : (
                  classes.map((c) => {
                    const color = getSubjectColor(data.subjects.find((s) => s.id === c.subjectId)?.color || 'blue');
                    return (
                      <button
                        key={c.id}
                        onClick={() => { setEditClass(c); setFormOpen(true); }}
                        className={`w-full text-left p-2 rounded-lg ${color.bgLight} ${color.border} border hover:shadow-md transition-all`}
                      >
                        <p className={`text-xs font-semibold ${color.text} truncate`}>{getSubjectName(data.subjects, c.subjectId)}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{formatTime(c.startTime, tf)} - {formatTime(c.endTime, tf)}</p>
                        {c.classroom && <p className="text-[10px] text-slate-400 truncate">{c.classroom}</p>}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: List view by day */}
      <div className="md:hidden space-y-3">
        {days.map((day) => {
          const classes = getClassesForDay(day);
          const isToday = day === today;
          return (
            <div key={day} className={`bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm border ${isToday ? 'border-sky-400' : 'border-slate-100 dark:border-slate-700'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-sm font-bold ${isToday ? 'text-sky-500' : 'text-slate-700 dark:text-slate-200'}`}>
                  {DAY_NAMES[day]}{isToday && <span className="ml-2 text-xs">Today</span>}
                </h3>
                <span className="text-xs text-slate-400">{classes.length} class{classes.length !== 1 ? 'es' : ''}</span>
              </div>
              {classes.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No classes</p>
              ) : (
                <div className="space-y-2">
                  {classes.map((c) => {
                    const color = getSubjectColor(data.subjects.find((s) => s.id === c.subjectId)?.color || 'blue');
                    return (
                      <button
                        key={c.id}
                        onClick={() => { setEditClass(c); setFormOpen(true); }}
                        className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-left"
                      >
                        <div className={`w-1 h-10 rounded-full ${color.dot} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{getSubjectName(data.subjects, c.subjectId)}</p>
                          <p className="text-xs text-slate-400">{formatTime(c.startTime, tf)} - {formatTime(c.endTime, tf)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {data.classes.length === 0 && (
        <EmptyState icon={<CalendarRange size={48} />} title="No classes yet" message="Add your first class to start building your weekly timetable" />
      )}

      {/* Edit/Delete modal within form */}
      {editClass && formOpen && (
        <ClassForm open={formOpen} onClose={() => { setFormOpen(false); setEditClass(null); }} onSave={handleSave} initial={editClass} />
      )}
      {!editClass && formOpen && (
        <ClassForm open={formOpen} onClose={() => { setFormOpen(false); setEditClass(null); }} onSave={handleSave} />
      )}

      {editClass && formOpen && (
        <div className="fixed bottom-4 left-4 z-50">
          <button
            onClick={() => { setDeleteId(editClass.id); }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 text-sm font-medium"
          >
            <Trash2 size={16} /> Delete this class
          </button>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Class"
        message="Are you sure you want to delete this class? This cannot be undone."
        onConfirm={() => {
          if (deleteId) deleteClass(deleteId);
          setDeleteId(null);
          setFormOpen(false);
          setEditClass(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
