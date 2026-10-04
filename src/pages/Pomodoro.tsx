import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { PageHeader } from '@/components/ui/Form';
import { Play, Pause, RotateCcw, Coffee, BookOpen, Bell } from 'lucide-react';

type TimerMode = 'study' | 'break';

export function Pomodoro() {
  const { data, updateSettings } = useApp();
  const studyMin = data.settings.pomodoroStudy;
  const breakMin = data.settings.pomodoroBreak;

  const [mode, setMode] = useState<TimerMode>('study');
  const [secondsLeft, setSecondsLeft] = useState(studyMin * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = mode === 'study' ? studyMin * 60 : breakMin * 60;

  useEffect(() => {
    // Reset timer when settings change and not running
    if (!isRunning) {
      setSecondsLeft(mode === 'study' ? studyMin * 60 : breakMin * 60);
    }
  }, [studyMin, breakMin, mode, isRunning]);

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    setShowNotification(true);

    // Browser notification
    if (data.settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(mode === 'study' ? 'Study session complete!' : 'Break over!', {
        body: mode === 'study' ? 'Great work! Time for a break.' : 'Let\'s get back to studying!',
      });
    }

    if (mode === 'study') {
      setCompletedSessions((c) => c + 1);
      setMode('break');
      setSecondsLeft(breakMin * 60);
    } else {
      setMode('study');
      setSecondsLeft(studyMin * 60);
    }
    setTimeout(() => setShowNotification(false), 4000);
  }, [mode, studyMin, breakMin, data.settings.notificationsEnabled]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, handleComplete]);

  const handleStart = () => {
    if (data.settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(totalSeconds);
  };

  const switchMode = (m: TimerMode) => {
    setIsRunning(false);
    setMode(m);
    setSecondsLeft(m === 'study' ? studyMin * 60 : breakMin * 60);
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 130;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div>
      <PageHeader title="Pomodoro Timer" subtitle="Stay focused with timed study sessions" />

      {/* Notification banner */}
      {showNotification && (
        <div className="mb-4 p-4 rounded-2xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 text-center font-medium animate-slideUp">
          {mode === 'break' ? 'Study session complete! Time for a break.' : 'Break over! Let\'s get back to studying.'}
        </div>
      )}

      <div className="flex flex-col items-center">
        {/* Mode switcher */}
        <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => switchMode('study')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'study' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400'}`}
          >
            <BookOpen size={16} /> Study
          </button>
          <button
            onClick={() => switchMode('break')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'break' ? 'bg-green-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400'}`}
          >
            <Coffee size={16} /> Break
          </button>
        </div>

        {/* Timer circle */}
        <div className="relative w-72 h-72 mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 300 300">
            <circle cx="150" cy="150" r="130" fill="none" stroke="currentColor" strokeWidth="12" className="text-slate-100 dark:text-slate-700" />
            <circle
              cx="150" cy="150" r="130" fill="none" strokeWidth="12"
              strokeLinecap="round"
              stroke="currentColor"
              className={mode === 'study' ? 'text-sky-500' : 'text-green-500'}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-slate-800 dark:text-slate-100 tabular-nums">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
            <span className="text-sm text-slate-400 mt-2 capitalize">{mode}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleReset}
            className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <RotateCcw size={22} />
          </button>
          <button
            onClick={() => isRunning ? setIsRunning(false) : handleStart()}
            className={`w-16 h-16 rounded-full text-white flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 ${mode === 'study' ? 'bg-sky-500' : 'bg-green-500'}`}
          >
            {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
          </button>
        </div>

        {/* Session counter */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <span className="font-semibold text-slate-700 dark:text-slate-200">{completedSessions}</span>
          <span>study sessions completed today</span>
        </div>

        {/* Settings */}
        <div className="w-full max-w-xs space-y-3">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-2">Study Duration (minutes)</label>
            <input
              type="range" min="5" max="60" step="5"
              value={studyMin}
              onChange={(e) => updateSettings({ pomodoroStudy: Number(e.target.value) })}
              className="w-full accent-sky-500"
            />
            <span className="text-sm text-slate-500">{studyMin} min</span>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-2">Break Duration (minutes)</label>
            <input
              type="range" min="5" max="30" step="5"
              value={breakMin}
              onChange={(e) => updateSettings({ pomodoroBreak: Number(e.target.value) })}
              className="w-full accent-green-500"
            />
            <span className="text-sm text-slate-500">{breakMin} min</span>
          </div>
        </div>

        {data.settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'default' && (
          <button
            onClick={() => Notification.requestPermission()}
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-sky-500 hover:text-sky-600 font-medium"
          >
            <Bell size={15} /> Enable browser notifications
          </button>
        )}
      </div>
    </div>
  );
}
