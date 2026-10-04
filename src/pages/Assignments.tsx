import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { formatTime, formatDate, todayISO, daysUntil } from '@/lib/dateUtils';
import { getSubjectName } from '@/lib/colors';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Field, TextInput, TextArea, Select, PriorityBadge, PageHeader, EmptyState } from '@/components/ui/Form';
import { Plus, Pencil, Trash2, Check, FileText, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import type { Assignment, Priority } from '@/lib/types';

export function Assignments() {
  const { data, addAssignment, updateAssignment, deleteAssignment } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Assignment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const tf = data.settings.timeFormat;

  const groups = useMemo(() => {
    const pending = data.assignments.filter((a) => a.status === 'pending');
    return {
      overdue: pending.filter((a) => daysUntil(a.dueDate) < 0).sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
      today: pending.filter((a) => a.dueDate === todayISO()).sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
      upcoming: pending.filter((a) => daysUntil(a.dueDate) > 0).sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
      completed: data.assignments.filter((a) => a.status === 'completed').sort((a, b) => b.dueDate.localeCompare(a.dueDate)),
    };
  }, [data.assignments]);

  const handleSave = (a: Omit<Assignment, 'id'>) => {
    if (editItem) updateAssignment(editItem.id, a);
    else addAssignment(a);
    setEditItem(null);
  };

  const renderGroup = (title: string, items: Assignment[], icon: React.ReactNode, accent: string) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-5">
        <h3 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${accent}`}>{title} ({items.length})</h3>
        <div className="space-y-2">
          {items.map((a) => {
            const days = daysUntil(a.dueDate);
            const isOverdue = a.status === 'pending' && days < 0;
            return (
              <div key={a.id} className={`bg-white dark:bg-slate-800 rounded-xl p-3.5 shadow-sm border ${isOverdue ? 'border-red-200 dark:border-red-800' : 'border-slate-100 dark:border-slate-700'}`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${isOverdue ? 'bg-red-50 dark:bg-red-900/30 text-red-500' : a.status === 'completed' ? 'bg-green-50 dark:bg-green-900/30 text-green-500' : 'bg-sky-50 dark:bg-sky-900/30 text-sky-500'}`}>
                    {a.status === 'completed' ? <CheckCircle2 size={18} /> : isOverdue ? <AlertCircle size={18} /> : <FileText size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold text-slate-700 dark:text-slate-200 ${a.status === 'completed' ? 'line-through opacity-60' : ''}`}>{a.title}</p>
                    {a.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{a.description}</p>}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <PriorityBadge priority={a.priority} />
                      {a.subjectId && <span className="text-xs text-slate-400">{getSubjectName(data.subjects, a.subjectId)}</span>}
                      <span className={`text-xs font-medium ${isOverdue ? 'text-red-500' : days === 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                        {a.status === 'completed' ? 'Completed' : isOverdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d remaining`}
                        {' · '}{formatDate(a.dueDate)}
                        {a.dueTime && ` · ${formatTime(a.dueTime, tf)}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {a.status === 'pending' && (
                      <button onClick={() => updateAssignment(a.id, { status: 'completed' })} className="p-1.5 rounded-lg text-slate-400 hover:text-green-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Mark complete">
                        <Check size={15} />
                      </button>
                    )}
                    {a.status === 'completed' && (
                      <button onClick={() => updateAssignment(a.id, { status: 'pending' })} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Mark pending">
                        <Clock size={15} />
                      </button>
                    )}
                    <button onClick={() => { setEditItem(a); setFormOpen(true); }} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setDeleteId(a.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title="Assignments"
        subtitle={`${groups.overdue.length + groups.today.length + groups.upcoming.length} pending · ${groups.completed.length} completed`}
        action={
          <button onClick={() => { setEditItem(null); setFormOpen(true); }} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-colors">
            <Plus size={18} /> <span className="hidden sm:inline">Add Assignment</span>
          </button>
        }
      />

      {data.assignments.length === 0 ? (
        <EmptyState icon={<FileText size={48} />} title="No assignments" message="Add your first assignment to track deadlines" />
      ) : (
        <>
          {renderGroup('Overdue', groups.overdue, <AlertCircle size={16} />, 'text-red-500')}
          {renderGroup('Due Today', groups.today, <Clock size={16} />, 'text-amber-500')}
          {renderGroup('Upcoming', groups.upcoming, <FileText size={16} />, 'text-sky-500')}
          {renderGroup('Completed', groups.completed, <CheckCircle2 size={16} />, 'text-green-500')}
        </>
      )}

      <AssignmentForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditItem(null); }}
        onSave={handleSave}
        initial={editItem}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment?"
        onConfirm={() => { if (deleteId) deleteAssignment(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

interface AssignmentFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (a: Omit<Assignment, 'id'>) => void;
  initial?: Assignment | null;
}

function AssignmentForm({ open, onClose, onSave, initial }: AssignmentFormProps) {
  const { data } = useApp();
  const [title, setTitle] = useState(initial?.title || '');
  const [subjectId, setSubjectId] = useState(initial?.subjectId || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [dueDate, setDueDate] = useState(initial?.dueDate || todayISO());
  const [dueTime, setDueTime] = useState(initial?.dueTime || '');
  const [priority, setPriority] = useState<Priority>(initial?.priority || 'medium');
  const [status, setStatus] = useState<'pending' | 'completed'>(initial?.status || 'pending');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!dueDate) errs.dueDate = 'Due date is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave({
      title: title.trim(),
      subjectId: subjectId || undefined,
      description: description.trim(),
      dueDate,
      dueTime: dueTime || undefined,
      priority,
      status,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Assignment' : 'Add Assignment'}>
      <Field label="Title" required error={errors.title}>
        <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., DBMS Project Report" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Subject">
          <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">General</option>
            {data.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="Priority">
          <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </Field>
      </div>
      <Field label="Description">
        <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Assignment details..." rows={2} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Due Date" required error={errors.dueDate}>
          <TextInput type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
        <Field label="Due Time">
          <TextInput type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
        </Field>
      </div>
      <Field label="Status">
        <Select value={status} onChange={(e) => setStatus(e.target.value as 'pending' | 'completed')}>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </Select>
      </Field>
      <div className="flex gap-3 mt-4">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
        <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 transition-colors">{initial ? 'Update' : 'Add Assignment'}</button>
      </div>
    </Modal>
  );
}
