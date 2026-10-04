import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { DAY_NAMES, todayISO, toISODate, getGreeting, formatTime, formatDate, daysUntil } from '@/lib/dateUtils';
import { getSubjectName, getSubjectColor } from '@/lib/colors';
import { PageHeader } from '@/components/ui/Form';
import { Clock, CheckSquare, FileText, GraduationCap, BookOpen, ChevronRight, Plus } from 'lucide-react';
import type { PageId } from '@/components/Navigation';

export function Dashboard({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  const { data } = useApp();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = todayISO();
  const dayOfWeek = now.getDay();
  const greeting = getGreeting(now.getHours());
  const tf = data.settings.timeFormat;

  const todayClasses = data.classes
    .filter((c) => c.day === dayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const pendingTasks = data.tasks.filter((t) => !t.completed);
  const tasksToday = pendingTasks.filter((t) => t.dueDate === today);
  const upcomingExams = data.exams
    .filter((e) => daysUntil(e.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const pendingAssignments = data.assignments.filter((a) => a.status === 'pending');
  const assignmentsToday = pendingAssignments.filter((a) => a.dueDate === today);
  const overdueAssignments = pendingAssignments.filter((a) => daysUntil(a.dueDate) < 0);

  const todayStudy = data.studySessions.filter((s) => s.date === today);
  const studyHours = todayStudy.reduce((sum, s) => {
    const [sh, sm] = s.startTime.split(':').map(Number);
    const [eh, em] = s.endTime.split(':').map(Number);
    return sum + (eh * 60 + em - sh * 60 - sm) / 60;
  }, 0);

  const completedTasks = data.tasks.filter((t) => t.completed).length;
  const totalTasks = data.tasks.length;

  const studyProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div>
      {/* Greeting */}
      <div className="mb-6 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
        <h2 className="text-xl font-bold">{greeting}, {data.settings.studentName} <span className="inline-block animate-pulse-slow">👋</span></h2>
        <p className="text-sm text-white/90 mt-1">
          {DAY_NAMES[dayOfWeek]}, {now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <p className="text-2xl font-bold mt-2 tabular-nums">
          {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: tf === '12h' })}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<Clock size={18} />} label="Today's Classes" value={todayClasses.length} color="sky" onClick={() => onNavigate('timetable')} />
        <StatCard icon={<CheckSquare size={18} />} label="Pending Tasks" value={pendingTasks.length} color="amber" onClick={() => onNavigate('tasks')} />
        <StatCard icon={<GraduationCap size={18} />} label="Upcoming Exams" value={upcomingExams.length} color="red" onClick={() => onNavigate('exams')} />
        <StatCard icon={<BookOpen size={18} />} label="Study Hours Today" value={`${studyHours.toFixed(1)}h`} color="green" onClick={() => onNavigate('study')} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Today's Schedule */}
        <SectionCard title="Today's Schedule" onAction={() => onNavigate('timetable')}>
          {todayClasses.length === 0 ? (
            <EmptyMsg text="No classes scheduled today" />
          ) : (
            <div className="space-y-2">
              {todayClasses.slice(0, 5).map((c) => {
                const color = getSubjectColor(data.subjects.find((s) => s.id === c.subjectId)?.color || 'blue');
                return (
                  <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                    <div className={`w-1 h-10 rounded-full ${color.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{getSubjectName(data.subjects, c.subjectId)}</p>
                      <p className="text-xs text-slate-400">{c.classroom} · {c.teacher}</p>
                    </div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatTime(c.startTime, tf)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Pending Tasks */}
        <SectionCard title="Pending Tasks" onAction={() => onNavigate('tasks')}>
          {pendingTasks.length === 0 ? (
            <EmptyMsg text="No pending tasks. Great job!" />
          ) : (
            <div className="space-y-2">
              {pendingTasks.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <CheckSquare size={16} className="text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{t.title}</p>
                    {t.dueDate && <p className={`text-xs ${t.dueDate === today ? 'text-amber-500' : 'text-slate-400'}`}>{formatDate(t.dueDate)}</p>}
                  </div>
                  <PriorityDot priority={t.priority} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Upcoming Exams */}
        <SectionCard title="Upcoming Exams" onAction={() => onNavigate('exams')}>
          {upcomingExams.length === 0 ? (
            <EmptyMsg text="No upcoming exams" />
          ) : (
            <div className="space-y-2">
              {upcomingExams.map((e) => {
                const days = daysUntil(e.date);
                return (
                  <div key={e.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-500 shrink-0">
                      <span className="text-lg font-bold leading-none">{days}</span>
                      <span className="text-[9px] leading-none mt-0.5">days</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{e.name}</p>
                      <p className="text-xs text-slate-400">{getSubjectName(data.subjects, e.subjectId)} · {formatDate(e.date)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Assignment Deadlines */}
        <SectionCard title="Assignment Deadlines" onAction={() => onNavigate('assignments')}>
          {overdueAssignments.length > 0 && (
            <div className="mb-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-xs font-medium">
              {overdueAssignments.length} overdue assignment{overdueAssignments.length > 1 ? 's' : ''}!
            </div>
          )}
          {assignmentsToday.length === 0 && overdueAssignments.length === 0 ? (
            <EmptyMsg text="No urgent assignments" />
          ) : (
            <div className="space-y-2">
              {[...overdueAssignments, ...assignmentsToday].slice(0, 5).map((a) => {
                const days = daysUntil(a.dueDate);
                return (
                  <div key={a.id} className={`flex items-center gap-3 p-2.5 rounded-xl ${days < 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                    <FileText size={16} className={days < 0 ? 'text-red-400' : 'text-amber-400'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{a.title}</p>
                      <p className={`text-xs ${days < 0 ? 'text-red-500' : 'text-amber-500'}`}>
                        {days < 0 ? `${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''} overdue` : 'Due today'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Study Progress */}
      <div className="mt-5 bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">Study Progress</h3>
          <span className="text-sm text-slate-400">{completedTasks}/{totalTasks} tasks done</span>
        </div>
        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-sky-400 to-blue-600 rounded-full transition-all duration-500" style={{ width: `${studyProgress}%` }} />
        </div>
        <p className="text-right text-xs text-slate-400 mt-1">{studyProgress}%</p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, onClick }: { icon: React.ReactNode; label: string; value: React.ReactNode; color: string; onClick: () => void }) {
  const colorMap: Record<string, string> = {
    sky: 'text-sky-500 bg-sky-50 dark:bg-sky-900/30',
    amber: 'text-amber-500 bg-amber-50 dark:bg-amber-900/30',
    red: 'text-red-500 bg-red-50 dark:bg-red-900/30',
    green: 'text-green-500 bg-green-50 dark:bg-green-900/30',
  };
  return (
    <button onClick={onClick} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 text-left hover:shadow-md transition-all active:scale-95">
      <div className={`inline-flex p-2 rounded-lg ${colorMap[color]}`}>{icon}</div>
      <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">{value}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
    </button>
  );
}

function SectionCard({ title, onAction, children }: { title: string; onAction: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
        <button onClick={onAction} className="text-slate-400 hover:text-sky-500 transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>
      {children}
    </div>
  );
}

function EmptyMsg({ text }: { text: string }) {
  return <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">{text}</p>;
}

function PriorityDot({ priority }: { priority: 'low' | 'medium' | 'high' }) {
  const colors = { low: 'bg-emerald-400', medium: 'bg-amber-400', high: 'bg-red-400' };
  return <div className={`w-2 h-2 rounded-full ${colors[priority]} shrink-0`} />;
}
