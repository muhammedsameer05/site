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
    point_participation: '0',
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

  const handleExportFullDatabase = () => {
    window.open('/api/database/export', '_blank');
  };

  const handleImportFullDatabase = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonContent = JSON.parse(event.target.result);
        const res = await fetch('/api/database/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
          },
          body: JSON.stringify(jsonContent)
        });

        const data = await res.json();
        if (res.ok) {
          alert('✅ Database successfully restored! All students, programs, and results have been re-imported.');
          window.location.reload();
        } else {
          alert(`❌ Import Failed: ${data.error || 'Unknown error'}`);
        }
      } catch (err) {
        alert('❌ Invalid JSON backup file format.');
      }
    };
    reader.readAsText(file);
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

      {/* Database Backup & Restore Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-emerald-200 bg-emerald-50/40 space-y-3 shadow-xs">
        <h3 className="text-sm font-extrabold emerald-gradient-text flex items-center space-x-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <span>Full Production Database Backup & Instant Restore</span>
        </h3>
        <p className="text-xs text-slate-600 font-medium">
          Export a complete backup file containing all your real registered students, programs, participants, and marks. You can restore this backup anytime in 1 click.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportFullDatabase}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition btn-interactive"
          >
            <Database className="w-4 h-4" />
            <span>Export Database Backup (.JSON)</span>
          </button>

          <label className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-emerald-500 text-slate-800 text-xs font-bold shadow-xs cursor-pointer transition btn-interactive">
            <span>📥 Import Database Backup</span>
            <input 
              type="file" 
              accept=".json"
              onChange={handleImportFullDatabase}
              className="hidden"
            />
          </label>
        </div>
      </div>

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        </div>

        {/* Save & Backup Controls */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={handleExportFullDatabase}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 text-xs font-bold transition btn-interactive"
          >
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Export Database Backup (.JSON)</span>
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
