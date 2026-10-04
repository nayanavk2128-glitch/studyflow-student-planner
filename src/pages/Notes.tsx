import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Field, TextInput, TextArea, Select, PageHeader, EmptyState } from '@/components/ui/Form';
import { Plus, Pencil, Trash2, Search, StickyNote } from 'lucide-react';
import type { Note } from '@/lib/types';

const CATEGORIES: Note['category'][] = ['College', 'Placement', 'Projects', 'Personal', 'Exams'];
const CATEGORY_COLORS: Record<string, string> = {
  College: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  Placement: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Projects: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Personal: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Exams: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export function Notes() {
  const { data, addNote, updateNote, deleteNote } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Note | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const filteredNotes = useMemo(() => {
    let result = data.notes;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    }
    if (filter !== 'all') result = result.filter((n) => n.category === filter);
    return [...result].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [data.notes, search, filter]);

  const handleSave = (n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editItem) updateNote(editItem.id, n);
    else addNote(n);
    setEditItem(null);
  };

  return (
    <div>
      <PageHeader
        title="Notes"
        subtitle={`${data.notes.length} note${data.notes.length !== 1 ? 's' : ''}`}
        action={
          <button onClick={() => { setEditItem(null); setFormOpen(true); }} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-colors">
            <Plus size={18} /> <span className="hidden sm:inline">Add Note</span>
          </button>
        }
      />

      <div className="mb-4 space-y-2">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === 'all' ? 'bg-sky-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-600'}`}>
            All
          </button>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === c ? 'bg-sky-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-600'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <EmptyState icon={<StickyNote size={48} />} title="No notes found" message="Create your first note to get started" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredNotes.map((n) => (
            <div key={n.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{n.title}</h3>
                  <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-md mt-1 ${CATEGORY_COLORS[n.category]}`}>{n.category}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditItem(n); setFormOpen(true); }} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleteId(n.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-pre-wrap line-clamp-5">{n.content}</p>
              <p className="text-[10px] text-slate-400 mt-2">Updated {n.updatedAt}</p>
            </div>
          ))}
        </div>
      )}

      <NoteForm open={formOpen} onClose={() => { setFormOpen(false); setEditItem(null); }} onSave={handleSave} initial={editItem} />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Note"
        message="Are you sure you want to delete this note?"
        onConfirm={() => { if (deleteId) deleteNote(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

interface NoteFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initial?: Note | null;
}

function NoteForm({ open, onClose, onSave, initial }: NoteFormProps) {
  const [title, setTitle] = useState(initial?.title || '');
  const [content, setContent] = useState(initial?.content || '');
  const [category, setCategory] = useState<Note['category']>(initial?.category || 'College');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!content.trim()) errs.content = 'Content is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave({ title: title.trim(), content: content.trim(), category });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Note' : 'Add Note'}>
      <Field label="Title" required error={errors.title}>
        <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" />
      </Field>
      <Field label="Category">
        <Select value={category} onChange={(e) => setCategory(e.target.value as Note['category'])}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </Field>
      <Field label="Content" required error={errors.content}>
        <TextArea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your note..." rows={6} />
      </Field>
      <div className="flex gap-3 mt-4">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
        <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 transition-colors">{initial ? 'Update' : 'Add Note'}</button>
      </div>
    </Modal>
  );
}
