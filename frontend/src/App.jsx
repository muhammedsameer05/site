import React, { useState } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';
import ErrorBoundary from './components/ErrorBoundary';

import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import StudentManagement from './pages/StudentManagement';
import HouseManagement from './pages/HouseManagement';
import ProgramManagement from './pages/ProgramManagement';
import Timetable from './pages/Timetable';
import LiveScoring from './pages/LiveScoring';
import ResultsSystem from './pages/ResultsSystem';
import Certificates from './pages/Certificates';
import Reports from './pages/Reports';
import Gallery from './pages/Gallery';
import NoticeBoard from './pages/NoticeBoard';
import Settings from './pages/Settings';
import LoginPage from './pages/LoginPage';
import ArchiveManagement from './pages/ArchiveManagement';

function MainContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const role = user?.role || 'public';

  const handleSelectSearchResult = (type, item) => {
    if (type === 'students') setActiveTab('students');
    else if (type === 'programs') setActiveTab('programs');
  };

  // Permission guard
  const renderTabContent = () => {
    if (activeTab === 'login') {
      return <LoginPage onLoginSuccess={(targetTab) => setActiveTab(targetTab)} />;
    }

    // Public / Unauthenticated User Restriction Guard for Admin Only modules
    if (role === 'public') {
      const protectedAdminTabs = ['dashboard', 'reports', 'settings', 'archive', 'audit-logs'];
      if (protectedAdminTabs.includes(activeTab)) {
        return (
          <div className="glass-panel p-8 text-center rounded-3xl border border-amber-500/40 max-w-lg mx-auto my-12 bg-white shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Admin Portal Authentication Required</h3>
            <p className="text-xs text-slate-500 mb-6">Administrator credentials required to access system settings & management modules.</p>
            <button
              onClick={() => setActiveTab('login')}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition"
            >
              Sign In to Admin Portal
            </button>
          </div>
        );
      }
    }

    switch (activeTab) {
      case 'home':
        return <HomePage onNavigate={setActiveTab} />;
      case 'dashboard':
        return <AdminDashboard />;
      case 'students':
        return <StudentManagement />;
      case 'houses':
        return <HouseManagement />;
      case 'programs':
        return <ProgramManagement />;
      case 'timetable':
        return <Timetable />;
      case 'live-scoring':
        return <LiveScoring />;
      case 'results':
        return <ResultsSystem />;
      case 'certificates':
        return <Certificates />;
      case 'reports':
        return <Reports />;
      case 'gallery':
        return <Gallery />;
      case 'notice':
        return <NoticeBoard />;
      case 'archive':
        return <ArchiveManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between selection:bg-emerald-600 selection:text-white bg-islamic-pattern">
      
      <div>
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorBoundary>
            <div key={activeTab} className="animate-fade-in-up">
              {renderTabContent()}
            </div>
          </ErrorBoundary>
        </main>
      </div>

      <Footer />

      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onSelectResult={handleSelectSearchResult}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <MainContent />
        <SpeedInsights />
      </LanguageProvider>
    </AuthProvider>
  );
}
