import { useState } from 'react';
import { AppProvider } from '@/context/AppContext';
import { Sidebar, BottomNav, MobileHeader, QuickAddFab, type PageId } from '@/components/Navigation';
import { Dashboard } from '@/pages/Dashboard';
import { Timetable } from '@/pages/Timetable';
import { DailySchedule } from '@/pages/DailySchedule';
import { Tasks } from '@/pages/Tasks';
import { Assignments } from '@/pages/Assignments';
import { Exams } from '@/pages/Exams';
import { StudyPlanner } from '@/pages/StudyPlanner';
import { Pomodoro } from '@/pages/Pomodoro';
import { Notes } from '@/pages/Notes';
import { Calendar } from '@/pages/Calendar';
import { Placement } from '@/pages/Placement';
import { Analytics } from '@/pages/Analytics';
import { Settings } from '@/pages/Settings';

function App() {
  const [page, setPage] = useState<PageId>('dashboard');

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard onNavigate={setPage} />;
      case 'timetable': return <Timetable />;
      case 'daily': return <DailySchedule />;
      case 'tasks': return <Tasks />;
      case 'assignments': return <Assignments />;
      case 'exams': return <Exams />;
      case 'study': return <StudyPlanner />;
      case 'pomodoro': return <Pomodoro />;
      case 'notes': return <Notes />;
      case 'calendar': return <Calendar />;
      case 'placement': return <Placement />;
      case 'analytics': return <Analytics />;
      case 'settings': return <Settings />;
      default: return <Dashboard onNavigate={setPage} />;
    }
  };

  return (
    <AppProvider>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <Sidebar current={page} onNavigate={setPage} />
        <div className="flex-1 flex flex-col min-w-0">
          <MobileHeader current={page} onNavigate={setPage} />
          <main className="flex-1 px-4 py-5 pb-24 lg:pb-8 max-w-5xl w-full mx-auto">
            {renderPage()}
          </main>
        </div>
        <BottomNav current={page} onNavigate={setPage} />
        <QuickAddFab onNavigate={setPage} />
      </div>
    </AppProvider>
  );
}

export default App;
