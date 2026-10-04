import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DAY_NAMES, formatTime, formatDateLong, todayISO, toISODate, fromISODate, minutesBetween } from '@/lib/dateUtils';
import { getSubjectName, getSubjectColor } from '@/lib/colors';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Field, TextInput, Select, TextArea, PageHeader, EmptyState } from '@/components/ui/Form';
import { Plus, Pencil, Trash2, Check, Clock, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import type { StudySession } from '@/lib/types';

interface DayActivity {
  id: string;
  type: 'class' | 'study' | 'custom';
  title: string;
  subtitle?: string;
  startTime: string;
  endTime: string;
  completed?: boolean;
  color: string;
  refData?: StudySession;
}

export function DailySchedule() {
  const { data, addStudySession, updateStudySession, deleteStudySession } = useApp();
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [formOpen, setFormOpen] = useState(false);
  const [editSession, setEditSession] = useState<StudySession | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const tf = data.settings.timeFormat;

  const dateObj = fromISODate(selectedDate);
  const dayOfWeek = dateObj.getDay();

  const activities: DayActivity[] = [
    ...data.classes
      .filter((c) => c.day === dayOfWeek)
      .map((c) => ({
        id: c.id,
        type: 'class' as const,
        title: getSubjectName(data.subjects, c.subjectId),
        subtitle: `${c.classroom} · ${c.teacher}`,
        startTime: c.startTime,
        endTime: c.endTime,
        color: data.subjects.find((s) => s.id === c.subjectId)?.color || 'blue',
      })),
    ...data.studySessions
      .filter((s) => s.date === selectedDate)
      .map((s) => ({
        id: s.id,
        type: 'study' as const,
        title: s.topic,
        subtitle: `${getSubjectName(data.subjects, s.subjectId)} · ${s.goal || ''}`,
        startTime: s.startTime,
        endTime: s.endTime,
        completed: s.completed,
        color: data.subjects.find((sub) => sub.id === s.subjectId)?.color || 'teal',
        refData: s,
      })),
  ].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const changeDate = (delta: number) => {
    const d = fromISODate(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(toISODate(d));
  };

  return (
    <div>
      <PageHeader
        title="Daily Schedule"
        subtitle={formatDateLong(selectedDate)}
        action={
          <button
            onClick={() => { setEditSession(null); setFormOpen(true); }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-colors"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Add Activity</span>
          </button>
        }
      />

      {/* Date navigation */}
      <div className="flex items-center justify-between mb-4 bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-sm border border-slate-100 dark:border-slate-700">
        <button onClick={() => changeDate(-1)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{DAY_NAMES[dayOfWeek]}</p>
          <p className="text-xs text-slate-400">{selectedDate === todayISO() ? 'Today' : formatDateLong(selectedDate)}</p>
        </div>
        <button onClick={() => changeDate(1)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {selectedDate !== todayISO() && (
        <button onClick={() => setSelectedDate(todayISO())} className="mb-3 text-sm text-sky-500 hover:text-sky-600 font-medium">
          ← Back to today
        </button>
      )}

      {/* Timeline */}
      {activities.length === 0 ? (
        <EmptyState icon={<Clock size={48} />} title="No activities scheduled" message="Add a study session or navigate to a day with classes" />
      ) : (
        <div className="relative">
          <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-3">
            {activities.map((a) => {
              const color = getSubjectColor(a.color);
              const duration = minutesBetween(a.startTime, a.endTime);
              return (
                <div key={a.id} className="relative pl-10">
                  <div className={`absolute left-2 top-2 w-3 h-3 rounded-full ${color.dot} ring-4 ring-white dark:ring-slate-900`} />
                  <div className={`bg-white dark:bg-slate-800 rounded-xl p-3.5 shadow-sm border border-slate-100 dark:border-slate-700 ${a.completed ? 'opacity-60' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${color.bgLight} ${color.text} capitalize`}>
                            {a.type === 'class' ? 'Class' : a.type === 'study' ? 'Study' : 'Activity'}
                          </span>
                          {a.completed && <Check size={14} className="text-green-500" />}
                        </div>
                        <p className={`text-sm font-semibold text-slate-700 dark:text-slate-200 ${a.completed ? 'line-through' : ''}`}>{a.title}</p>
                        {a.subtitle && <p className="text-xs text-slate-400 mt-0.5">{a.subtitle}</p>}
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                          {formatTime(a.startTime, tf)} – {formatTime(a.endTime, tf)}
                          <span className="text-slate-400 ml-1.5">({duration}m)</span>
                        </p>
                      </div>
                      {a.type === 'study' && a.refData && (
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            onClick={() => { setEditSession(a.refData!); setFormOpen(true); }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => { if (!a.completed && a.refData) updateStudySession(a.refData.id, { completed: true }); }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-green-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Check size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteId(a.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <StudySessionForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditSession(null); }}
        onSave={(s) => {
          if (editSession) updateStudySession(editSession.id, s);
          else addStudySession({ ...s, date: selectedDate });
        }}
        initial={editSession}
        defaultDate={selectedDate}
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

interface StudySessionFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (s: Omit<StudySession, 'id'>) => void;
  initial?: StudySession | null;
  defaultDate?: string;
}

export function StudySessionForm({ open, onClose, onSave, initial, defaultDate }: StudySessionFormProps) {
  const { data } = useApp();
  const [subjectId, setSubjectId] = useState(initial?.subjectId || data.subjects[0]?.id || '');
  const [topic, setTopic] = useState(initial?.topic || '');
  const [date, setDate] = useState(initial?.date || defaultDate || todayISO());
  const [startTime, setStartTime] = useState(initial?.startTime || '18:00');
  const [endTime, setEndTime] = useState(initial?.endTime || '19:00');
  const [goal, setGoal] = useState(initial?.goal || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!topic.trim()) errs.topic = 'Topic is required';
    if (startTime >= endTime) errs.endTime = 'End time must be after start time';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave({ subjectId, topic: topic.trim(), date, startTime, endTime, goal: goal.trim(), completed: initial?.completed || false });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Study Session' : 'Add Study Session'}>
      <Field label="Subject">
        <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          {data.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
      </Field>
      <Field label="Topic" required error={errors.topic}>
        <TextInput value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Dynamic Programming" />
      </Field>
      <Field label="Date">
        <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start Time">
          <TextInput type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </Field>
        <Field label="End Time" error={errors.endTime}>
          <TextInput type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </Field>
      </div>
      <Field label="Study Goal">
        <TextInput value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="What do you want to achieve?" />
      </Field>
      <div className="flex gap-3 mt-4">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
        <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 transition-colors">{initial ? 'Update' : 'Add Session'}</button>
      </div>
    </Modal>
  );
}
