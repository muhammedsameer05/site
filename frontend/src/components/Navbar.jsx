import React, { useState } from 'react';
import { 
  BookOpen, Layers, User, Shield, Calendar, Award, Trophy, Sparkles, 
  Search, Globe, LogOut, Lock, Menu, X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ activeTab, setActiveTab, onOpenSearch }) {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = user?.role || 'public';

  const navItems = [
    { id: 'home', label: t('home'), icon: BookOpen, roles: ['all'] },
    { id: 'dashboard', label: t('dashboard'), icon: Layers, roles: ['super_admin', 'admin', 'stage_coordinator'] },
    { id: 'students', label: t('students'), icon: User, roles: ['super_admin', 'admin', 'stage_coordinator'] },
    { id: 'houses', label: t('houses'), icon: Shield, roles: ['super_admin', 'admin', 'stage_coordinator'] },
    { id: 'programs', label: t('programs'), icon: Calendar, roles: ['super_admin', 'admin', 'stage_coordinator'] },
    { id: 'timetable', label: t('timetable'), icon: Calendar, roles: ['all'] },
    { id: 'results', label: t('results'), icon: Trophy, roles: ['all'] },
    { id: 'gallery', label: t('gallery'), icon: Sparkles, roles: ['all'] },
    { id: 'settings', label: t('settings'), icon: Shield, roles: ['super_admin', 'admin'] }
  ];

  const visibleNav = navItems.filter(item => {
    if (role === 'public') {
      return ['home', 'timetable', 'live-scoring', 'results', 'gallery'].includes(item.id);
    }
    return item.roles.includes('all') || item.roles.includes(role);
  });

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-emerald-100 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-amber-500/80 shadow-md bg-white p-0.5 flex items-center justify-center shrink-0">
              <img src="/milad-logo.jpg" alt="Vibe of Madeena Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <span className="text-sm sm:text-lg font-black emerald-gradient-text tracking-wide block leading-tight">
                വൈബ് ഓഫ് മദീന 2K26
              </span>
              <span className="text-[9px] sm:text-[10px] text-amber-600 font-bold tracking-widest font-mono uppercase block">
                JAMALULLEYLI MADRASA
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
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
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
              className="p-1.5 sm:p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-400 transition-colors"
              title={t('search')}
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'ml' : lang === 'ml' ? 'ar' : 'en')}
              className="flex items-center space-x-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-emerald-800 hover:border-emerald-400 transition"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="uppercase">{lang}</span>
            </button>

            {/* Active User Badge / Portal Switch */}
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] sm:text-xs font-bold text-emerald-900 hidden sm:flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="capitalize">{(role || 'public').replace('_', ' ')} Portal</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setActiveTab('login');
                  }}
                  className="p-1.5 sm:p-2 rounded-lg bg-slate-100 border border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="flex items-center space-x-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow hover:brightness-105 transition"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Portal Login</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-700 hover:text-emerald-700"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Scrollable Quick Tabs */}
      <div className="lg:hidden bg-white border-t border-slate-200 px-3 py-2 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center space-x-2">
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold shrink-0 transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md font-extrabold scale-105'
                  : 'bg-slate-100 text-slate-700 border border-slate-200 hover:text-emerald-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 glass-panel bg-white/98 px-4 pt-3 pb-6 space-y-2">
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
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-bold ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-emerald-700'
                }`}
              >
                <Icon className="w-5 h-5 text-amber-500" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
