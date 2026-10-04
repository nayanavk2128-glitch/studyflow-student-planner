import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Field, TextInput, Select, TextArea } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { DAY_NAMES, DAY_SHORT } from '@/lib/dateUtils';
import { AVAILABLE_COLORS, getSubjectColor } from '@/lib/colors';
import type { ClassEntry, DayOfWeek, Subject } from '@/lib/types';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';

interface ClassFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (c: Omit<ClassEntry, 'id'>) => void;
  initial?: ClassEntry | null;
}

export function ClassForm({ open, onClose, onSave, initial }: ClassFormProps) {
  const { data, addSubject } = useApp();
  const [subjectId, setSubjectId] = useState(initial?.subjectId || data.subjects[0]?.id || '');
  const [teacher, setTeacher] = useState(initial?.teacher || '');
  const [classroom, setClassroom] = useState(initial?.classroom || '');
  const [day, setDay] = useState<DayOfWeek>(initial?.day ?? 1);
  const [startTime, setStartTime] = useState(initial?.startTime || '09:00');
  const [endTime, setEndTime] = useState(initial?.endTime || '10:00');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newSubjectName, setNewSubjectName] = useState('');
  const [showNewSubject, setShowNewSubject] = useState(false);
  const [newSubjectColor, setNewSubjectColor] = useState('blue');

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!subjectId) errs.subjectId = 'Please select a subject';
    if (!startTime) errs.startTime = 'Start time is required';
    if (!endTime) errs.endTime = 'End time is required';
    if (startTime && endTime && startTime >= endTime) errs.endTime = 'End time must be after start time';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onSave({ subjectId, teacher, classroom, day, startTime, endTime, notes });
    onClose();
  };

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return;
    const id = addSubject({ name: newSubjectName.trim(), color: newSubjectColor });
    setSubjectId(id);
    setNewSubjectName('');
    setShowNewSubject(false);
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Class' : 'Add Class'}>
      <Field label="Subject" required error={errors.subjectId}>
        <div className="flex gap-2">
          <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="flex-1">
            {data.subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
          <button
            type="button"
            onClick={() => setShowNewSubject(!showNewSubject)}
            className="px-3 rounded-lg bg-sky-50 dark:bg-sky-900/30 text-sky-500 text-sm font-medium whitespace-nowrap"
          >
            + New
          </button>
        </div>
      </Field>

      {showNewSubject && (
        <div className="mb-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 space-y-2">
          <TextInput placeholder="Subject name" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} />
          <div className="flex items-center gap-2 flex-wrap">
            {AVAILABLE_COLORS.map((c) => {
              const color = getSubjectColor(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewSubjectColor(c)}
                  className={`w-7 h-7 rounded-full ${color.bg} ${newSubjectColor === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                />
              );
            })}
          </div>
          <button type="button" onClick={handleAddSubject} className="w-full py-2 rounded-lg bg-sky-500 text-white text-sm font-medium">
            Add Subject
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Teacher">
          <TextInput value={teacher} onChange={(e) => setTeacher(e.target.value)} placeholder="Prof. name" />
        </Field>
        <Field label="Classroom">
          <TextInput value={classroom} onChange={(e) => setClassroom(e.target.value)} placeholder="Room 101" />
        </Field>
      </div>

      <Field label="Day" required>
        <Select value={day} onChange={(e) => setDay(Number(e.target.value) as DayOfWeek)}>
          {DAY_NAMES.map((d, i) => (
            <option key={i} value={i}>{d}</option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Start Time" required error={errors.startTime}>
          <TextInput type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </Field>
        <Field label="End Time" required error={errors.endTime}>
          <TextInput type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </Field>
      </div>

      <Field label="Notes">
        <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." rows={2} />
      </Field>

      <div className="flex gap-3 mt-4">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
          Cancel
        </button>
        <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 transition-colors">
          {initial ? 'Update' : 'Add Class'}
        </button>
      </div>
    </Modal>
  );
}

interface TimetableProps {
  open: boolean;
  onClose: () => void;
  onSave: (c: Omit<ClassEntry, 'id'>) => void;
  initial?: ClassEntry | null;
}

export function Timetable({ open, onClose, onSave, initial }: TimetableProps) {
  return <ClassForm open={open} onClose={onClose} onSave={onSave} initial={initial} />;
}
