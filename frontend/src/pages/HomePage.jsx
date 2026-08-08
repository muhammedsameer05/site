import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import { 
  Trophy, Calendar, Megaphone, Clock, ArrowRight 
} from 'lucide-react';

export default function HomePage({ onNavigate }) {
  const [houses, setHouses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetch('/api/houses')
      .then(res => res.json())
      .then(data => setHouses(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch('/api/programs')
      .then(res => res.json())
      .then(data => setPrograms(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => {});

    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-16">
      
      {/* Hero Section */}
      <Hero onNavigate={onNavigate} />

      {/* Welcome Message */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-2">
              Principal's Welcome Note
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
              Inspiring Eloquence, Tajweed & Virtuous Leadership
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
              "We welcome all students, parents, honorable judges, and guests to the Jamalulleyli Madrasa Annual Milad Festival 2026. This platform is dedicated to showcasing our students' dedication to Qiraat, Islamic speeches, nasheeds, and academic art."
            </p>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center font-serif text-slate-950 font-bold text-lg">
                ج
              </div>
              <div>
                <span className="text-sm font-bold text-amber-300 block">Usthad Sayyid Muhammed</span>
                <span className="text-xs text-emerald-400">Principal & Milad Fest Chairman</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Leaderboard Snippet */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold emerald-gradient-text flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              <span>Live House Standings</span>
            </h2>
            <p className="text-xs text-slate-400">Instant score tallies updated via WebSockets</p>
          </div>
          <button
            onClick={() => onNavigate('live-scoring')}
            className="flex items-center space-x-1 text-xs font-bold text-amber-400 hover:text-amber-300"
          >
            <span>View Full Leaderboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {houses.map((house, idx) => (
            <div 
              key={house.id} 
              className="glass-panel p-5 rounded-2xl border transition hover:scale-105 duration-200"
              style={{ borderColor: `${house.color_hex}60` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white font-extrabold text-sm" style={{ backgroundColor: house.color_hex }}>
                  #{idx + 1}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">{house.code}</span>
              </div>
              <h3 className="text-lg font-extrabold text-white mb-1" style={{ color: house.color_hex }}>
                {house.name}
              </h3>
              <p className="text-xs text-slate-400 italic mb-4 line-clamp-1">{house.motto || 'Virtue & Faith'}</p>
              
              <div className="flex items-baseline justify-between border-t border-slate-800 pt-3">
                <span className="text-xs font-semibold text-slate-400">Total Points</span>
                <span className="text-2xl font-black gold-gradient-text font-mono">{house.total_points || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Programs Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-emerald-400" />
              <span>Upcoming Programs</span>
            </h2>
            <p className="text-xs text-slate-400">Featured competitions scheduled for today</p>
          </div>
          <button
            onClick={() => onNavigate('timetable')}
            className="flex items-center space-x-1 text-xs font-bold text-emerald-400 hover:text-emerald-300"
          >
            <span>Full Schedule</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {programs.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl border border-slate-800 text-slate-400 text-xs">
            No scheduled competition programs added yet. Admin can create new programs in Program Management.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.map((p) => (
              <div key={p.id} className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between hover:border-amber-400/40 transition">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 mb-2 inline-block">
                    {p.category_name} ({p.age_group})
                  </span>
                  <h4 className="text-base font-bold text-white mb-1">{p.name}</h4>
                  <div className="flex items-center space-x-4 text-xs text-slate-400 font-mono">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{p.start_time || '09:00 AM'}</span>
                    </span>
                    <span>Venue: {p.venue_name || 'Stage 1'}</span>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  p.status === 'running' 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-400/40 animate-pulse'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Latest Announcements */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-slate-900/90">
          <h2 className="text-xl font-extrabold text-white mb-6 flex items-center space-x-2">
            <Megaphone className="w-5 h-5 text-amber-400" />
            <span>Latest Announcements & Emergency Notices</span>
          </h2>

          {announcements.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              No active announcements. Admin can post notices on the Notice Board.
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-800/80 border-l-4 border-amber-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-amber-300">{item.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{item.posted_by}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
