import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Field, TextInput, Select, PageHeader } from '@/components/ui/Form';
import { Sun, Moon, Bell, Trash2, Download, Upload, User } from 'lucide-react';
import type { AppData } from '@/lib/types';

export function Settings() {
  const { data, updateSettings, resetData, loadSampleData } = useApp();
  const s = data.settings;
  const [showReset, setShowReset] = useState(false);
  const [showLoadSample, setShowLoadSample] = useState(false);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string) as AppData;
        localStorage.setItem('studyflow_data_v1', JSON.stringify(imported));
        window.location.reload();
      } catch {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Customize StudyFlow to your needs" />

      <div className="space-y-4">
        {/* Profile */}
        <Section title="Profile" icon={<User size={18} />}>
          <Field label="Student Name">
            <TextInput value={s.studentName} onChange={(e) => updateSettings({ studentName: e.target.value })} placeholder="Your name" />
          </Field>
          <Field label="College Name">
            <TextInput value={s.collegeName} onChange={(e) => updateSettings({ collegeName: e.target.value })} placeholder="College name" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Course">
              <TextInput value={s.course} onChange={(e) => updateSettings({ course: e.target.value })} placeholder="Course" />
            </Field>
            <Field label="Semester / Year">
              <TextInput value={s.semester} onChange={(e) => updateSettings({ semester: e.target.value })} placeholder="e.g., 3rd Year" />
            </Field>
          </div>
        </Section>

        {/* Appearance */}
        <Section title="Appearance" icon={<Sun size={18} />}>
          <Field label="Theme">
            <div className="flex gap-2">
              <button
                onClick={() => updateSettings({ theme: 'light' })}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${s.theme === 'light' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}
              >
                <Sun size={16} /> Light
              </button>
              <button
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${s.theme === 'dark' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}
              >
                <Moon size={16} /> Dark
              </button>
            </div>
          </Field>
        </Section>

        {/* Preferences */}
        <Section title="Preferences" icon={<Bell size={18} />}>
          <Field label="Start of Week">
            <Select value={s.startOfWeek} onChange={(e) => updateSettings({ startOfWeek: Number(e.target.value) as 0 | 1 })}>
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
            </Select>
          </Field>
          <Field label="Time Format">
            <Select value={s.timeFormat} onChange={(e) => updateSettings({ timeFormat: e.target.value as '12h' | '24h' })}>
              <option value="12h">12-hour (AM/PM)</option>
              <option value="24h">24-hour</option>
            </Select>
          </Field>
          <Field label="Notifications">
            <button
              onClick={() => updateSettings({ notificationsEnabled: !s.notificationsEnabled })}
              className={`w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${s.notificationsEnabled ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}
            >
              <span className="flex items-center gap-2"><Bell size={16} /> Browser notifications</span>
              <span className={`w-10 h-5 rounded-full relative transition-colors ${s.notificationsEnabled ? 'bg-green-400' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${s.notificationsEnabled ? 'left-5' : 'left-0.5'}`} />
              </span>
            </button>
          </Field>
        </Section>

        {/* Data Management */}
        <Section title="Data Management" icon={<Download size={18} />}>
          <div className="space-y-2">
            <button onClick={handleExport} className="w-full flex items-center gap-2 py-2.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <Download size={16} /> Export data (backup)
            </button>
            <label className="w-full flex items-center gap-2 py-2.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer">
              <Upload size={16} /> Import data (restore)
              <input type="file" accept="application/json" onChange={handleImport} className="hidden" />
            </label>
            <button onClick={() => setShowLoadSample(true)} className="w-full flex items-center gap-2 py-2.5 px-3 rounded-lg bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-300 text-sm font-medium hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors">
              <Download size={16} /> Load sample data
            </button>
            <button onClick={() => setShowReset(true)} className="w-full flex items-center gap-2 py-2.5 px-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
              <Trash2 size={16} /> Reset all data
            </button>
          </div>
        </Section>

        {/* About */}
        <div className="text-center py-4">
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">StudyFlow</p>
          <p className="text-xs text-slate-400">Plan. Study. Achieve.</p>
          <p className="text-xs text-slate-400 mt-1">v1.0 · Data stored locally on your device</p>
        </div>
      </div>

      <ConfirmDialog
        open={showReset}
        title="Reset All Data"
        message="This will permanently delete all your tasks, assignments, exams, notes, and settings. This cannot be undone."
        confirmLabel="Reset Everything"
        onConfirm={() => { resetData(); setShowReset(false); }}
        onCancel={() => setShowReset(false)}
      />
      <ConfirmDialog
        open={showLoadSample}
        title="Load Sample Data"
        message="This will replace your current data with sample data. Continue?"
        confirmLabel="Load Sample Data"
        onConfirm={() => { loadSampleData(); setShowLoadSample(false); }}
        onCancel={() => setShowLoadSample(false)}
      />
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}
