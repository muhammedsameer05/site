import React, { useState, useEffect } from 'react';
import { Calendar, Printer, Filter, Clock, MapPin, Award, Users } from 'lucide-react';

export default function Timetable() {
  const [programs, setPrograms] = useState([]);
  const [venues, setVenues] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [selectedVenue, setSelectedVenue] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetch('/api/programs')
      .then(res => res.json())
      .then(data => setPrograms(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch('/api/venues')
      .then(res => res.json())
      .then(data => setVenues(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const filtered = programs.filter(p => {
    if (selectedVenue !== 'all' && String(p.venue_id) !== String(selectedVenue)) return false;
    if (selectedCategory !== 'all' && String(p.category_id) !== String(selectedCategory)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-extrabold emerald-gradient-text flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-amber-400" />
            <span>Milad Festival Program Schedule</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">Master timetable & venue stage allocations</p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg transition"
        >
          <Printer className="w-4 h-4" />
          <span>Print Schedule</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center space-x-3 text-xs">
          <Filter className="w-4 h-4 text-amber-400" />
          
          <select
            value={selectedVenue}
            onChange={e => setSelectedVenue(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
          >
            <option value="all">All Stages / Venues</option>
            {venues.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-400 font-mono">Showing {filtered.length} Scheduled Programs</span>
      </div>

      {/* Print-Ready Schedule Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl bg-slate-900 text-white">
        
        {/* Printable Header */}
        <div className="p-6 border-b border-slate-800 text-center bg-slate-950">
          <h2 className="text-xl font-bold text-amber-400">Madrasat-ul-Huda Islamic Academy</h2>
          <h3 className="text-sm font-semibold text-emerald-300">Grand Milad-un-Nabi Festival 2026 - Master Timetable</h3>
          <p className="text-xs text-slate-400 font-mono mt-1">Date: Saturday, August 15, 2026</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-amber-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-4">Time Slot</th>
                <th className="p-4">Venue / Stage</th>
                <th className="p-4">Program & Code</th>
                <th className="p-4">Category & Age</th>
                <th className="p-4">Assigned Judges</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 font-mono text-amber-300 font-bold">
                    {p.start_time || '09:00'} - {p.end_time || '10:30'}
                  </td>
                  <td className="p-4 font-semibold text-emerald-300">
                    {p.venue_name || 'Stage 1'}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-white text-sm">{p.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.code}</div>
                  </td>
                  <td className="p-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {p.category_name} ({p.age_group})
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">
                    {(p.assigned_judges || []).map(j => j.name).join(', ') || 'Qari Zakariya / Dr. Luqman'}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      p.status === 'running' 
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-400/40'
                        : p.status === 'completed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
