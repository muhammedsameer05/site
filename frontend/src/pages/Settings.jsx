import React, { useState, useEffect } from 'react';
import { Shield, Save, Database, Clock } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    school_name: 'Jamalulleyli Madrasa, MKMJC - Payyanur',
    milad_title: 'വൈബ് ഓഫ് മദീന 2K26',
    academic_year: '2026-2027',
    point_1st: '10',
    point_2nd: '7',
    point_3rd: '5',
    point_participation: '3',
    theme_primary: '#065F46',
    cooldown_target: localStorage.getItem('milad_cooldown_target_date') || '2026-08-15T09:00'
  });

  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('milad_system_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({
          ...prev,
          ...parsed,
          cooldown_target: parsed.cooldown_target || localStorage.getItem('milad_cooldown_target_date') || '2026-08-15T09:00'
        }));
      } catch (e) {}
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('milad_system_settings', JSON.stringify(settings));
    if (settings.cooldown_target) {
      localStorage.setItem('milad_cooldown_target_date', settings.cooldown_target);
    }
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const handleBackup = () => {
    const backupJson = JSON.stringify(settings, null, 2);
    const blob = new Blob([backupJson], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Madrasa_Milad_Backup_${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold emerald-gradient-text flex items-center space-x-2">
          <Shield className="w-6 h-6 text-emerald-600" />
          <span>System Settings & Configuration</span>
        </h1>
        <p className="text-xs text-slate-500 font-mono font-bold">Madrasa branding, festival cooldown countdown, point rules & backups</p>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-xs">
          ✅ Settings & Festival Cooldown Timer updated successfully!
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-6 bg-white shadow-sm">
        
        {/* Section 1: Festival Cooldown Timer Setting */}
        <div>
          <h3 className="text-sm font-extrabold emerald-gradient-text uppercase tracking-wider mb-4 border-b border-slate-200 pb-2 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Festival Cooldown & Countdown Timer Setting</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Festival Start Date & Time (Cooldown Target)</label>
              <input
                type="datetime-local"
                value={settings.cooldown_target}
                onChange={e => setSettings({ ...settings, cooldown_target: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-bold text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500 font-mono font-bold mt-1.5">
                Sets the live grand festival countdown timer on the Home Page hero banner.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Madrasa Identity */}
        <div>
          <h3 className="text-sm font-extrabold emerald-gradient-text uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
            Madrasa & Festival Branding
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
            <div>
              <label className="block text-slate-700 font-bold mb-1">School / Madrasa Name</label>
              <input
                type="text"
                value={settings.school_name}
                onChange={e => setSettings({ ...settings, school_name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Milad Festival Title</label>
              <input
                type="text"
                value={settings.milad_title}
                onChange={e => setSettings({ ...settings, milad_title: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Point Allocation Rules */}
        <div>
          <h3 className="text-sm font-extrabold emerald-gradient-text uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
            House Point Allocation Rules
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
            <div>
              <label className="block text-slate-700 font-bold mb-1">1st Prize Points</label>
              <input
                type="number"
                value={settings.point_1st}
                onChange={e => setSettings({ ...settings, point_1st: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">2nd Prize Points</label>
              <input
                type="number"
                value={settings.point_2nd}
                onChange={e => setSettings({ ...settings, point_2nd: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">3rd Prize Points</label>
              <input
                type="number"
                value={settings.point_3rd}
                onChange={e => setSettings({ ...settings, point_3rd: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Participation</label>
              <input
                type="number"
                value={settings.point_participation}
                onChange={e => setSettings({ ...settings, point_participation: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Save & Backup Controls */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={handleBackup}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 text-xs font-bold transition"
          >
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Download Database Backup</span>
          </button>

          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
}
