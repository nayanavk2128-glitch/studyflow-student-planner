import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { formatDate, formatTime, daysUntil } from '@/lib/dateUtils';
import { getSubjectName, getSubjectColor } from '@/lib/colors';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Field, TextInput, TextArea, Select, PageHeader, EmptyState } from '@/components/ui/Form';
import { Plus, Pencil, Trash2, GraduationCap, MapPin, Clock, BookOpen } from 'lucide-react';
import type { Exam } from '@/lib/types';

export function Exams() {
  const { data, addExam, updateExam, deleteExam } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Exam | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const tf = data.settings.timeFormat;

  const sortedExams = useMemo(() => {
    return [...data.exams].sort((a, b) => a.date.localeCompare(b.date));
  }, [data.exams]);

  const handleSave = (e: Omit<Exam, 'id'>) => {
    if (editItem) updateExam(editItem.id, e);
    else addExam(e);
    setEditItem(null);
  };

  const prepStatusConfig = {
    'not-started': { label: 'Not Started', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', bar: 'bg-slate-300 dark:bg-slate-600', pct: 0 },
    'in-progress': { label: 'In Progress', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300', bar: 'bg-amber-400', pct: 50 },
    'ready': { label: 'Ready', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300', bar: 'bg-green-400', pct: 100 },
  };

  return (
    <div>
      <PageHeader
        title="Exam Planner"
        subtitle={`${sortedExams.filter((e) => daysUntil(e.date) >= 0).length} upcoming exams`}
        action={
          <button onClick={() => { setEditItem(null); setFormOpen(true); }} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-colors">
            <Plus size={18} /> <span className="hidden sm:inline">Add Exam</span>
          </button>
        }
      />

      {sortedExams.length === 0 ? (
        <EmptyState icon={<GraduationCap size={48} />} title="No exams scheduled" message="Add your upcoming exams to track preparation" />
      ) : (
        <div className="space-y-3">
          {sortedExams.map((e) => {
            const days = daysUntil(e.date);
            const isPast = days < 0;
            const color = getSubjectColor(data.subjects.find((s) => s.id === e.subjectId)?.color || 'blue');
            const prep = prepStatusConfig[e.prepStatus];
            return (
              <div key={e.id} className={`bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 ${isPast ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-3 mb-3">
                  {/* Countdown */}
                  <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl shrink-0 ${isPast ? 'bg-slate-100 dark:bg-slate-700 text-slate-400' : days <= 5 ? 'bg-red-50 dark:bg-red-900/30 text-red-500' : color.bgLight + ' ' + color.text}`}>
                    <span className="text-2xl font-bold leading-none">{isPast ? '—' : days}</span>
                    <span className="text-[10px] leading-none mt-1">{isPast ? 'past' : days === 0 ? 'today' : 'days left'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">{e.name}</h3>
                    <p className={`text-xs ${color.text} font-medium`}>{getSubjectName(data.subjects, e.subjectId)}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(e.date)}{e.time && ` · ${formatTime(e.time, tf)}`}</span>
                      {e.room && <span className="flex items-center gap-1"><MapPin size={12} /> {e.room}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => { setEditItem(e); setFormOpen(true); }} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setDeleteId(e.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {e.syllabus && (
                  <div className="mb-2 flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
                    <BookOpen size={14} className="shrink-0 mt-0.5" />
                    <span>{e.syllabus}</span>
                  </div>
                )}

                {/* Prep status */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${prep.bar} rounded-full transition-all duration-500`} style={{ width: `${prep.pct}%` }} />
                  </div>
                  <select
                    value={e.prepStatus}
                    onChange={(ev) => updateExam(e.id, { prepStatus: ev.target.value as Exam['prepStatus'] })}
                    className={`text-xs font-medium px-2 py-1 rounded-lg border-0 cursor-pointer ${prep.color}`}
                  >
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="ready">Ready</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ExamForm open={formOpen} onClose={() => { setFormOpen(false); setEditItem(null); }} onSave={handleSave} initial={editItem} />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Exam"
        message="Are you sure you want to delete this exam?"
        onConfirm={() => { if (deleteId) deleteExam(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

interface ExamFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (e: Omit<Exam, 'id'>) => void;
  initial?: Exam | null;
}

function ExamForm({ open, onClose, onSave, initial }: ExamFormProps) {
  const { data } = useApp();
  const [name, setName] = useState(initial?.name || '');
  const [subjectId, setSubjectId] = useState(initial?.subjectId || '');
  const [date, setDate] = useState(initial?.date || '');
  const [time, setTime] = useState(initial?.time || '');
  const [room, setRoom] = useState(initial?.room || '');
  const [syllabus, setSyllabus] = useState(initial?.syllabus || '');
  const [prepStatus, setPrepStatus] = useState<Exam['prepStatus']>(initial?.prepStatus || 'not-started');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Exam name is required';
    if (!date) errs.date = 'Exam date is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave({
      name: name.trim(),
      subjectId: subjectId || undefined,
      date,
      time: time || undefined,
      room: room.trim() || undefined,
      syllabus: syllabus.trim() || undefined,
      prepStatus,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Exam' : 'Add Exam'}>
      <Field label="Exam Name" required error={errors.name}>
        <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., DBMS Mid-Semester Exam" />
      </Field>
      <Field label="Subject">
        <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          <option value="">General</option>
          {data.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Exam Date" required error={errors.date}>
          <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Exam Time">
          <TextInput type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
      </div>
      <Field label="Room">
        <TextInput value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g., Hall A" />
      </Field>
      <Field label="Syllabus / Topics">
        <TextArea value={syllabus} onChange={(e) => setSyllabus(e.target.value)} placeholder="Topics to study..." rows={3} />
      </Field>
      <Field label="Preparation Status">
        <Select value={prepStatus} onChange={(e) => setPrepStatus(e.target.value as Exam['prepStatus'])}>
          <option value="not-started">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="ready">Ready</option>
        </Select>
      </Field>
      <div className="flex gap-3 mt-4">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
        <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 transition-colors">{initial ? 'Update' : 'Add Exam'}</button>
      </div>
    </Modal>
  );
}
