import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { todayISO, toISODate, daysUntil, minutesBetween } from '@/lib/dateUtils';
import { PageHeader } from '@/components/ui/Form';
import { CheckSquare, Clock, FileText, GraduationCap, BookOpen, Flame, TrendingUp, Target } from 'lucide-react';

export function Analytics() {
  const { data } = useApp();

  const stats = useMemo(() => {
    const completedTasks = data.tasks.filter((t) => t.completed).length;
    const totalTasks = data.tasks.length;
    const completedAssignments = data.assignments.filter((a) => a.status === 'completed').length;
    const totalAssignments = data.assignments.length;
    const upcomingExams = data.exams.filter((e) => daysUntil(e.date) >= 0).length;
    const completedExams = data.exams.filter((e) => daysUntil(e.date) < 0).length;

    // Study hours this week
    let weeklyHours = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = toISODate(d);
      data.studySessions.filter((s) => s.date === ds).forEach((s) => {
        weeklyHours += minutesBetween(s.startTime, s.endTime) / 60;
      });
    }

    // Total study hours all time
    let totalHours = 0;
    data.studySessions.forEach((s) => {
      totalHours += minutesBetween(s.startTime, s.endTime) / 60;
    });

    // Classes this week
    let weeklyClasses = 0;
    const today = new Date().getDay();
    for (let i = 0; i < 7; i++) {
      const day = (today - i + 7) % 7;
      weeklyClasses += data.classes.filter((c) => c.day === day).length;
    }

    // Study streak
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = toISODate(d);
      const hasStudy = data.studySessions.some((s) => s.date === ds);
      if (hasStudy) streak++;
      else if (i > 0) break;
    }

    // Weekly productivity (tasks completed this week)
    let weeklyTasksCompleted = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = toISODate(d);
      // Approximate: tasks completed (we don't track completion date, so use createdAt match)
    }
    weeklyTasksCompleted = completedTasks; // simplified

    return {
      completedTasks, totalTasks,
      completedAssignments, totalAssignments,
      upcomingExams, completedExams,
      weeklyHours, totalHours,
      weeklyClasses, streak,
      weeklyTasksCompleted,
    };
  }, [data]);

  const statCards = [
    { icon: <CheckSquare size={20} />, label: 'Tasks Completed', value: `${stats.completedTasks}/${stats.totalTasks}`, color: 'text-sky-500 bg-sky-50 dark:bg-sky-900/30', pct: stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0 },
    { icon: <FileText size={20} />, label: 'Assignments Done', value: `${stats.completedAssignments}/${stats.totalAssignments}`, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/30', pct: stats.totalAssignments > 0 ? Math.round((stats.completedAssignments / stats.totalAssignments) * 100) : 0 },
    { icon: <BookOpen size={20} />, label: 'Study Hours (Week)', value: `${stats.weeklyHours.toFixed(1)}h`, color: 'text-green-500 bg-green-50 dark:bg-green-900/30', pct: Math.min(100, Math.round((stats.weeklyHours / 35) * 100)) },
    { icon: <Clock size={20} />, label: 'Classes (Week)', value: stats.weeklyClasses, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/30', pct: 0 },
    { icon: <GraduationCap size={20} />, label: 'Upcoming Exams', value: stats.upcomingExams, color: 'text-red-500 bg-red-50 dark:bg-red-900/30', pct: 0 },
    { icon: <Flame size={20} />, label: 'Study Streak', value: `${stats.streak} days`, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/30', pct: Math.min(100, stats.streak * 5) },
  ];

  // Weekly study data for chart
  const weeklyData = useMemo(() => {
    const days: { label: string; hours: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = toISODate(d);
      const hours = data.studySessions.filter((s) => s.date === ds).reduce((sum, s) => sum + minutesBetween(s.startTime, s.endTime) / 60, 0);
      days.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' }), hours });
    }
    return days;
  }, [data.studySessions]);

  const maxHours = Math.max(...weeklyData.map((d) => d.hours), 1);

  // Subject distribution
  const subjectStats = useMemo(() => {
    const map: Record<string, number> = {};
    data.studySessions.forEach((s) => {
      const name = data.subjects.find((sub) => sub.id === s.subjectId)?.name || 'General';
      const hours = minutesBetween(s.startTime, s.endTime) / 60;
      map[name] = (map[name] || 0) + hours;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [data.studySessions, data.subjects]);

  const totalSubjectHours = subjectStats.reduce((sum, [, h]) => sum + h, 0);

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Your productivity at a glance" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className={`inline-flex p-2 rounded-lg ${s.color} mb-2`}>{s.icon}</div>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
            {s.pct > 0 && (
              <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-sky-400 rounded-full transition-all duration-500" style={{ width: `${s.pct}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Weekly study chart */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-sky-500" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Weekly Study Hours</h3>
        </div>
        <div className="flex items-end justify-between gap-2 h-40">
          {weeklyData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-sky-400 to-blue-500 rounded-t-lg transition-all duration-500 min-h-[2px] relative group"
                  style={{ height: `${(d.hours / maxHours) * 100}%` }}
                >
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.hours.toFixed(1)}h
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Subject distribution */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} className="text-sky-500" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Study Time by Subject</h3>
        </div>
        {subjectStats.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No study data yet</p>
        ) : (
          <div className="space-y-3">
            {subjectStats.map(([name, hours], i) => {
              const pct = totalSubjectHours > 0 ? Math.round((hours / totalSubjectHours) * 100) : 0;
              const colors = ['bg-sky-400', 'bg-green-400', 'bg-orange-400', 'bg-purple-400', 'bg-pink-400'];
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{name}</span>
                    <span className="text-xs text-slate-400">{hours.toFixed(1)}h ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
