import React, { useState } from 'react';
import { 
  Globe, Shield, User, LogOut, Search, Moon, Sun, 
  Menu, X, Sparkles, Trophy, Calendar, Award, BookOpen, Layers, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ activeTab, setActiveTab, onOpenSearch }) {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = user?.role || 'public';

  const navItems = [
    { id: 'home', label: t('home'), icon: BookOpen, roles: ['all'] },
    { id: 'dashboard', label: t('dashboard'), icon: Layers, roles: ['super_admin', 'admin', 'stage_coordinator'] },
    { id: 'students', label: role === 'student' ? 'My Student Details' : t('students'), icon: User, roles: ['super_admin', 'admin', 'stage_coordinator', 'student'] },
    { id: 'houses', label: t('houses'), icon: Shield, roles: ['super_admin', 'admin', 'stage_coordinator'] },
    { id: 'programs', label: t('programs'), icon: Calendar, roles: ['super_admin', 'admin', 'stage_coordinator'] },
    { id: 'timetable', label: t('timetable'), icon: Calendar, roles: ['all'] },
    { id: 'judge', label: t('judge_panel'), icon: Award, roles: ['super_admin', 'admin', 'judge'] },
    { id: 'results', label: t('results'), icon: Trophy, roles: ['all'] },
    { id: 'reports', label: t('reports'), icon: Layers, roles: ['super_admin', 'admin'] },
    { id: 'gallery', label: t('gallery'), icon: Sparkles, roles: ['all'] },
    { id: 'settings', label: t('settings'), icon: Shield, roles: ['super_admin', 'admin'] }
  ];

  const visibleNav = navItems.filter(item => {
    if (role === 'judge') {
      return ['judge', 'timetable', 'live-scoring'].includes(item.id);
    }
    if (role === 'student') {
      return ['students', 'results', 'live-scoring'].includes(item.id);
    }
    if (role === 'public') {
      return ['home', 'timetable', 'live-scoring', 'results', 'gallery'].includes(item.id);
    }
    return item.roles.includes('all') || item.roles.includes(role);
  });

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-amber-400/30 bg-[#03241C]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-lg shadow-emerald-900/50 bg-white p-0.5 flex items-center justify-center">
              <img src="/milad-logo.jpg" alt="Vibe of Madeena Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black emerald-gradient-text tracking-wide block leading-tight">
                വൈബ് ഓഫ് മദീന 2K26
              </span>
              <span className="text-[10px] text-amber-400/90 tracking-widest font-mono uppercase">
                JAMALULLEYLI MADRASA, PAYYANNUR
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 overflow-x-auto py-2">
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-600/30 text-amber-300 border border-amber-400/40 shadow-sm'
                      : 'text-slate-300 hover:text-emerald-300 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Tools */}
          <div className="flex items-center space-x-2">
            
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500/50 transition-colors"
              title={t('search')}
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'ml' : lang === 'ml' ? 'ar' : 'en')}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-semibold text-amber-400 hover:border-amber-400 transition"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="uppercase">{lang}</span>
            </button>

            {/* Active User Badge / Portal Switch */}
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-xs font-medium text-amber-300 hidden sm:flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span className="capitalize font-bold">{role.replace('_', ' ')} Portal</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setActiveTab('login');
                  }}
                  className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-red-400 hover:bg-red-950 hover:border-red-500/40 transition"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow hover:brightness-110 transition"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Portal Login</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-amber-400"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 glass-panel bg-slate-900/95 px-4 pt-3 pb-6 space-y-2">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-600/30 text-amber-300 border border-amber-400/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-emerald-300'
                }`}
              >
                <Icon className="w-5 h-5 text-amber-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
