import React, { useState, useEffect } from 'react';
import { Shield, Save, Database, Download, History, Palette } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    school_name: 'Madrasat-ul-Huda Islamic Academy',
    milad_title: 'Grand Milad-un-Nabi Fest 2026',
    academic_year: '2026-2027',
    point_1st: '10',
    point_2nd: '7',
    point_3rd: '5',
    point_participation: '3',
    theme_primary: '#065F46'
  });

  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
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
          <Shield className="w-6 h-6 text-amber-400" />
          <span>System Settings & Configuration</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono">Madrasa branding, point allocation rules, backups & audit logs</p>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
          Settings saved successfully!
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 bg-slate-900">
        
        {/* Section 1: Madrasa Identity */}
        <div>
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            Madrasa & Festival Branding
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">School / Madrasa Name</label>
              <input
                type="text"
                value={settings.school_name}
                onChange={e => setSettings({ ...settings, school_name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Milad Festival Title</label>
              <input
                type="text"
                value={settings.milad_title}
                onChange={e => setSettings({ ...settings, milad_title: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Point Allocation Rules */}
        <div>
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            House Point Allocation Rules
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">1st Prize Points</label>
              <input
                type="number"
                value={settings.point_1st}
                onChange={e => setSettings({ ...settings, point_1st: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">2nd Prize Points</label>
              <input
                type="number"
                value={settings.point_2nd}
                onChange={e => setSettings({ ...settings, point_2nd: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">3rd Prize Points</label>
              <input
                type="number"
                value={settings.point_3rd}
                onChange={e => setSettings({ ...settings, point_3rd: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Participation</label>
              <input
                type="number"
                value={settings.point_participation}
                onChange={e => setSettings({ ...settings, point_participation: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
              />
            </div>
          </div>
        </div>

        {/* Save & Backup Controls */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={handleBackup}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl glass-panel text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition"
          >
            <Database className="w-4 h-4 text-amber-400" />
            <span>Download Database Backup</span>
          </button>

          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
}
