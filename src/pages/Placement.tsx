import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Field, TextInput, PageHeader } from '@/components/ui/Form';
import { Plus, Pencil, Trash2, Target, TrendingUp } from 'lucide-react';
import type { PlacementGoal } from '@/lib/types';

const CATEGORY_COLORS: Record<string, string> = {
  Aptitude: 'from-blue-400 to-blue-600',
  Python: 'from-green-400 to-green-600',
  Java: 'from-orange-400 to-orange-600',
  DSA: 'from-cyan-400 to-cyan-600',
  DBMS: 'from-sky-400 to-sky-600',
  SQL: 'from-teal-400 to-teal-600',
  OOP: 'from-purple-400 to-purple-600',
  'Computer Networks': 'from-pink-400 to-pink-600',
  'Operating Systems': 'from-amber-400 to-amber-600',
  'Coding Practice': 'from-red-400 to-red-600',
  'Interview Preparation': 'from-indigo-400 to-indigo-600',
};

function getColor(category: string): string {
  return CATEGORY_COLORS[category] || 'from-slate-400 to-slate-600';
}

export function Placement() {
  const { data, addPlacementGoal, updatePlacementGoal, deletePlacementGoal } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<PlacementGoal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = (g: Omit<PlacementGoal, 'id'>) => {
    if (editItem) updatePlacementGoal(editItem.id, g);
    else addPlacementGoal(g);
    setEditItem(null);
  };

  const overallProgress = data.placementGoals.length > 0
    ? Math.round(data.placementGoals.reduce((sum, g) => sum + (g.completedItems / g.totalItems) * 100, 0) / data.placementGoals.length)
    : 0;

  const adjustProgress = (g: PlacementGoal, delta: number) => {
    const newVal = Math.max(0, Math.min(g.totalItems, g.completedItems + delta));
    updatePlacementGoal(g.id, { completedItems: newVal });
  };

  return (
    <div>
      <PageHeader
        title="Placement Preparation"
        subtitle="Track your readiness for campus placements"
        action={
          <button onClick={() => { setEditItem(null); setFormOpen(true); }} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-colors">
            <Plus size={18} /> <span className="hidden sm:inline">Add Goal</span>
          </button>
        }
      />

      {/* Overall progress */}
      <div className="mb-5 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={20} />
          <h3 className="font-semibold">Overall Placement Readiness</h3>
        </div>
        <p className="text-4xl font-bold mb-2">{overallProgress}%</p>
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
        </div>
      </div>

      {/* Goals list */}
      <div className="space-y-3">
        {data.placementGoals.map((g) => {
          const pct = g.totalItems > 0 ? Math.round((g.completedItems / g.totalItems) * 100) : 0;
          const color = getColor(g.category);
          return (
            <div key={g.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Target size={18} className="text-slate-400 shrink-0" />
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{g.category}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{pct}%</span>
                  <span className="text-xs text-slate-400">({g.completedItems}/{g.totalItems})</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditItem(g); setFormOpen(true); }} className="p-1 rounded-lg text-slate-400 hover:text-sky-500">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteId(g.id)} className="p-1 rounded-lg text-slate-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
              </div>
              {/* Adjust buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustProgress(g, -1)}
                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  disabled={g.completedItems === 0}
                >
                  −
                </button>
                <button
                  onClick={() => adjustProgress(g, 1)}
                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  disabled={g.completedItems >= g.totalItems}
                >
                  +
                </button>
                <span className="text-xs text-slate-400 ml-auto">{g.totalItems - g.completedItems} items remaining</span>
              </div>
            </div>
          );
        })}
      </div>

      {data.placementGoals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Target size={48} className="text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">No placement goals yet</h3>
          <p className="text-sm text-slate-400">Add your first placement preparation goal</p>
        </div>
      )}

      <GoalForm open={formOpen} onClose={() => { setFormOpen(false); setEditItem(null); }} onSave={handleSave} initial={editItem} />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Goal"
        message="Are you sure you want to delete this placement goal?"
        onConfirm={() => { if (deleteId) deletePlacementGoal(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

interface GoalFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (g: Omit<PlacementGoal, 'id'>) => void;
  initial?: PlacementGoal | null;
}

function GoalForm({ open, onClose, onSave, initial }: GoalFormProps) {
  const [category, setCategory] = useState(initial?.category || '');
  const [totalItems, setTotalItems] = useState(initial?.totalItems || 50);
  const [completedItems, setCompletedItems] = useState(initial?.completedItems || 0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!category.trim()) errs.category = 'Category is required';
    if (totalItems < 1) errs.totalItems = 'Total must be at least 1';
    if (completedItems > totalItems) errs.completedItems = 'Completed cannot exceed total';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave({ category: category.trim(), totalItems, completedItems });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Goal' : 'Add Placement Goal'}>
      <Field label="Category" required error={errors.category}>
        <TextInput value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., DSA, Python, Aptitude" list="placement-categories" />
        <datalist id="placement-categories">
          {Object.keys(CATEGORY_COLORS).map((c) => <option key={c} value={c} />)}
        </datalist>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Total Items" required error={errors.totalItems}>
          <TextInput type="number" min={1} value={totalItems} onChange={(e) => setTotalItems(Number(e.target.value))} />
        </Field>
        <Field label="Completed Items" error={errors.completedItems}>
          <TextInput type="number" min={0} value={completedItems} onChange={(e) => setCompletedItems(Number(e.target.value))} />
        </Field>
      </div>
      <div className="flex gap-3 mt-4">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
        <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 transition-colors">{initial ? 'Update' : 'Add Goal'}</button>
      </div>
    </Modal>
  );
}
