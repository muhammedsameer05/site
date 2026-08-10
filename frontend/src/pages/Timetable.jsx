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
            <Calendar className="w-6 h-6 text-emerald-600" />
            <span>Milad Festival Program Schedule</span>
          </h1>
          <p className="text-xs text-slate-500 font-mono font-bold">Master timetable & venue stage allocations</p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition"
        >
          <Printer className="w-4 h-4" />
          <span>Print Schedule</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4 no-print shadow-sm">
        <div className="flex items-center space-x-3 text-xs">
          <Filter className="w-4 h-4 text-emerald-600" />
          
          <select
            value={selectedVenue}
            onChange={e => setSelectedVenue(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-emerald-500"
          >
            <option value="all">All Stages / Venues</option>
            {venues.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500 font-mono font-bold">Showing {filtered.length} Scheduled Programs</span>
      </div>

      {/* Print-Ready Schedule Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white text-slate-900">
        
        {/* Printable Header */}
        <div className="p-6 border-b border-slate-200 text-center bg-slate-50">
          <h2 className="text-xl font-bold text-emerald-950">Madrasat-ul-Huda Islamic Academy</h2>
          <h3 className="text-sm font-extrabold emerald-gradient-text">Grand Milad-un-Nabi Festival 2026 - Master Timetable</h3>
          <p className="text-xs text-slate-500 font-mono font-bold mt-1">Date: Saturday, August 15, 2026</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-emerald-50/80 text-emerald-950 uppercase font-mono border-b border-emerald-100 font-bold">
              <tr>
                <th className="p-4">Time Slot</th>
                <th className="p-4">Venue / Stage</th>
                <th className="p-4">Program & Code</th>
                <th className="p-4">Category & Age</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-emerald-50/30 transition">
                  <td className="p-4 font-mono text-emerald-700 font-bold">
                    {p.start_time || '09:00'} - {p.end_time || '10:30'}
                  </td>
                  <td className="p-4 font-bold text-slate-800">
                    {p.venue_name || 'Stage 1'}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{p.code}</div>
                  </td>
                  <td className="p-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                      {p.category_name} ({p.age_group})
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      p.status === 'running' 
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                        : p.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
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
