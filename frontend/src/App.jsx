import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';

import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import StudentManagement from './pages/StudentManagement';
import HouseManagement from './pages/HouseManagement';
import ProgramManagement from './pages/ProgramManagement';
import Timetable from './pages/Timetable';
import JudgePanel from './pages/JudgePanel';
import LiveScoring from './pages/LiveScoring';
import ResultsSystem from './pages/ResultsSystem';
import Certificates from './pages/Certificates';
import Reports from './pages/Reports';
import Gallery from './pages/Gallery';
import NoticeBoard from './pages/NoticeBoard';
import Settings from './pages/Settings';
import LoginPage from './pages/LoginPage';

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

    // Public / Unauthenticated User Restriction Guard
    if (role === 'public') {
      const protectedTabs = ['dashboard', 'students', 'houses', 'programs', 'judge', 'reports', 'settings'];
      if (protectedTabs.includes(activeTab)) {
        return (
          <div className="glass-panel p-8 text-center rounded-3xl border border-amber-500/40 max-w-lg mx-auto my-12 bg-slate-900 shadow-2xl">
            <h3 className="text-xl font-bold text-amber-400 mb-2">Portal Authentication Required</h3>
            <p className="text-xs text-slate-300 mb-6">You must log in to access the {activeTab.toUpperCase()} module. Please select your portal below.</p>
            <button
              onClick={() => setActiveTab('login')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg transition"
            >
              Go to Portal Login Page
            </button>
          </div>
        );
      }
    }

    // Judge Portal Guard
    if (role === 'judge') {
      const judgeForbiddenTabs = ['dashboard', 'students', 'houses', 'programs', 'reports', 'settings'];
      if (judgeForbiddenTabs.includes(activeTab)) {
        return (
          <div className="glass-panel p-8 text-center rounded-3xl border border-red-500/40 max-w-lg mx-auto my-12 bg-slate-900 shadow-2xl">
            <h3 className="text-xl font-bold text-red-400 mb-2">Access Restricted (Judge Portal)</h3>
            <p className="text-xs text-slate-300 mb-6">Judges are restricted exclusively to the Judge Evaluation Marks Panel.</p>
            <button
              onClick={() => setActiveTab('judge')}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
            >
              Go to Judge Panel
            </button>
          </div>
        );
      }
    }

    // Student Portal Guard
    if (role === 'student') {
      const studentForbiddenTabs = ['dashboard', 'houses', 'programs', 'judge', 'reports', 'settings'];
      if (studentForbiddenTabs.includes(activeTab)) {
        return (
          <div className="glass-panel p-8 text-center rounded-3xl border border-blue-500/40 max-w-lg mx-auto my-12 bg-slate-900 shadow-2xl">
            <h3 className="text-xl font-bold text-blue-400 mb-2">Access Restricted (Student Portal)</h3>
            <p className="text-xs text-slate-300 mb-6">Students are restricted to Student Details entry & certificates view.</p>
            <button
              onClick={() => setActiveTab('students')}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
            >
              Go to My Student Details
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
      case 'judge':
        return <JudgePanel />;
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
      case 'settings':
        return <Settings />;
      default:
        return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#021B15] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      
      <div>
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderTabContent()}
        </main>
      </div>

      <Footer onNavigate={setActiveTab} />

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
      </LanguageProvider>
    </AuthProvider>
  );
}
