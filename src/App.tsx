import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider } from '@/context/AppContext';
import { useApp } from '@/context/AppContext';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/pages/Dashboard';
import { Tasks } from '@/pages/Tasks';
import { Streaks } from '@/pages/Streaks';
import { Notes } from '@/pages/Notes';
import { Courses } from '@/pages/Courses';
import { Analytics } from '@/pages/Analytics';
import { Pomodoro } from '@/pages/Pomodoro';
import { AppLauncher } from '@/pages/AppLauncher';
import { Profile } from '@/pages/Profile';
import { Settings } from '@/pages/Settings';
import './App.css';

type Page = 'dashboard' | 'tasks' | 'streaks' | 'notes' | 'courses' | 'analytics' | 'pomodoro' | 'apps' | 'profile' | 'settings';

function AppContent() {
  const { state } = useApp();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const isDarkTheme = state.userProfile.preferences.theme === 'dark';
    document.documentElement.classList.toggle('dark', isDarkTheme);
  }, [state.userProfile.preferences.theme]);

  const handleLogout = () => {
    setCurrentPage('dashboard');
    setIsMobileMenuOpen(false);
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page as Page);
    setIsMobileMenuOpen(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onPageChange={handlePageChange} />;
      case 'tasks':
        return <Tasks />;
      case 'streaks':
        return <Streaks />;
      case 'notes':
        return <Notes />;
      case 'courses':
        return <Courses />;
      case 'analytics':
        return <Analytics />;
      case 'pomodoro':
        return <Pomodoro />;
      case 'apps':
        return <AppLauncher />;
      case 'profile':
        return <Profile onPageChange={handlePageChange} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onPageChange={handlePageChange} />;
    }
  };

  return (
    <motion.div
      key="app"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background text-foreground"
    >
      {/* Sidebar (Desktop) */}
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={handlePageChange}
        onLogout={handleLogout}
      />

      {/* Mobile Navigation */}
      <MobileNav 
        currentPage={currentPage} 
        onPageChange={handlePageChange}
      />

      {/* Main Content */}
      <main className="min-h-screen lg:ml-72">
        <Header
          onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onPageChange={handlePageChange}
        />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="pb-20 lg:pb-8"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </motion.div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
