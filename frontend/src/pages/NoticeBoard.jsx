import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, AlertTriangle, Bell, Plus } from 'lucide-react';

export default function NoticeBoard() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold emerald-gradient-text flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-amber-400" />
          <span>Madrasa Public Notice Board & Prayer Times</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono">Announcements, Stage Schedules, and Festival Guidelines</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Notice Board Announcements */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 bg-slate-900">
            <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <span>Official Announcements</span>
            </h2>

            <div className="space-y-3">
              {announcements.map(item => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-800/80 border-l-4 border-amber-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-amber-300">{item.title}</h4>
                    <span className="text-[10px] text-emerald-400 font-mono">{item.posted_by}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Prayer Times & Guidelines */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-slate-900 to-emerald-950/40 text-center">
            <Clock className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <h3 className="text-base font-extrabold text-white">Daily Prayer Timings</h3>
            <p className="text-[10px] text-emerald-400 font-mono mb-4">Madrasa Masjid Schedule</p>

            <div className="space-y-2 text-xs font-mono">
              {[
                { name: 'Fajr', time: '05:00 AM' },
                { name: 'Dhuhr', time: '12:30 PM' },
                { name: 'Asr', time: '04:15 PM' },
                { name: 'Maghrib', time: '06:45 PM' },
                { name: 'Isha', time: '08:00 PM' }
              ].map((p, idx) => (
                <div key={idx} className="flex justify-between py-1.5 px-3 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-300 font-bold">{p.name}</span>
                  <span className="text-amber-400 font-extrabold">{p.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
