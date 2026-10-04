import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { formatTime, formatDate, todayISO, daysUntil } from '@/lib/dateUtils';
import { getSubjectName } from '@/lib/colors';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Field, TextInput, TextArea, Select, PriorityBadge, PageHeader, EmptyState } from '@/components/ui/Form';
import { Plus, Pencil, Trash2, Check, Search, CheckSquare } from 'lucide-react';
import type { Task, Priority } from '@/lib/types';

export function Tasks() {
  const { data, addTask, updateTask, deleteTask } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'today' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority'>('dueDate');

  const tf = data.settings.timeFormat;

  const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

  const filteredTasks = useMemo(() => {
    let result = data.tasks;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q));
    }
    switch (filter) {
      case 'pending': result = result.filter((t) => !t.completed); break;
      case 'completed': result = result.filter((t) => t.completed); break;
      case 'today': result = result.filter((t) => !t.completed && t.dueDate === todayISO()); break;
      case 'overdue': result = result.filter((t) => !t.completed && t.dueDate && daysUntil(t.dueDate) < 0); break;
    }
    result = [...result].sort((a, b) => {
      if (sortBy === 'priority') return priorityOrder[a.priority] - priorityOrder[b.priority];
      return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
    });
    return result;
  }, [data.tasks, search, filter, sortBy]);

  const pendingTasks = filteredTasks.filter((t) => !t.completed);
  const completedTasks = filteredTasks.filter((t) => t.completed);

  const handleSave = (t: Omit<Task, 'id' | 'createdAt'>) => {
    if (editTask) updateTask(editTask.id, t);
    else addTask(t);
    setEditTask(null);
  };

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle={`${data.tasks.filter((t) => !t.completed).length} pending · ${data.tasks.filter((t) => t.completed).length} completed`}
        action={
          <button onClick={() => { setEditTask(null); setFormOpen(true); }} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-colors">
            <Plus size={18} /> <span className="hidden sm:inline">Add Task</span>
          </button>
        }
      />

      {/* Search and filters */}
      <div className="mb-4 space-y-2">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'today', 'overdue', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === f ? 'bg-sky-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600'
              }`}
            >
              {f}
            </button>
          ))}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'priority')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 ml-auto"
          >
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
          </select>
        </div>
      </div>

      {/* Pending tasks */}
      {pendingTasks.length > 0 && (
        <div className="mb-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Pending</h3>
          <div className="space-y-2">
            {pendingTasks.map((t) => {
              const isOverdue = t.dueDate && !t.completed && daysUntil(t.dueDate) < 0;
              const isToday = t.dueDate === todayISO();
              return (
                <div key={t.id} className={`bg-white dark:bg-slate-800 rounded-xl p-3.5 shadow-sm border ${isOverdue ? 'border-red-200 dark:border-red-800' : 'border-slate-100 dark:border-slate-700'}`}>
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => updateTask(t.id, { completed: true })}
                      className="mt-0.5 w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 hover:border-sky-400 transition-colors shrink-0 flex items-center justify-center"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.title}</p>
                      {t.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{t.description}</p>}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <PriorityBadge priority={t.priority} />
                        {t.subjectId && <span className="text-xs text-slate-400">{getSubjectName(data.subjects, t.subjectId)}</span>}
                        {t.dueDate && (
                          <span className={`text-xs font-medium ${isOverdue ? 'text-red-500' : isToday ? 'text-amber-500' : 'text-slate-400'}`}>
                            {isOverdue ? `${Math.abs(daysUntil(t.dueDate))}d overdue` : isToday ? 'Due today' : formatDate(t.dueDate)}
                            {t.dueTime && ` · ${formatTime(t.dueTime, tf)}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => { setEditTask(t); setFormOpen(true); }} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Completed</h3>
          <div className="space-y-2">
            {completedTasks.map((t) => (
              <div key={t.id} className="bg-white dark:bg-slate-800 rounded-xl p-3.5 shadow-sm border border-slate-100 dark:border-slate-700 opacity-70">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => updateTask(t.id, { completed: false })}
                    className="mt-0.5 w-5 h-5 rounded-md bg-green-500 text-white flex items-center justify-center shrink-0"
                  >
                    <Check size={13} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-through">{t.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <PriorityBadge priority={t.priority} />
                      {t.dueDate && <span className="text-xs text-slate-400">{formatDate(t.dueDate)}</span>}
                    </div>
                  </div>
                  <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredTasks.length === 0 && (
        <EmptyState icon={<CheckSquare size={48} />} title="No tasks found" message="Add a task or adjust your filters" />
      )}

      <TaskForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTask(null); }}
        onSave={handleSave}
        initial={editTask}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        onConfirm={() => { if (deleteId) deleteTask(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (t: Omit<Task, 'id' | 'createdAt'>) => void;
  initial?: Task | null;
}

function TaskForm({ open, onClose, onSave, initial }: TaskFormProps) {
  const { data } = useApp();
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [subjectId, setSubjectId] = useState(initial?.subjectId || '');
  const [priority, setPriority] = useState<Priority>(initial?.priority || 'medium');
  const [dueDate, setDueDate] = useState(initial?.dueDate || '');
  const [dueTime, setDueTime] = useState(initial?.dueTime || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Task title is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      subjectId: subjectId || undefined,
      priority,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      completed: initial?.completed || false,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Task' : 'Add Task'}>
      <Field label="Title" required error={errors.title}>
        <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Complete DBMS Lab Exercise" />
      </Field>
      <Field label="Description">
        <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add details..." rows={2} />
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
      <div className="grid grid-cols-2 gap-3">
        <Field label="Due Date">
          <TextInput type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
        <Field label="Due Time">
          <TextInput type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
        </Field>
      </div>
      <div className="flex gap-3 mt-4">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
        <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 transition-colors">{initial ? 'Update' : 'Add Task'}</button>
      </div>
    </Modal>
  );
}
