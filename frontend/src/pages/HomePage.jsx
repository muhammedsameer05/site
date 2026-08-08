import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import { 
  Trophy, Calendar, Megaphone, Clock, ArrowRight, Award 
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
      .then(data => setPrograms(Array.isArray(data) ? data.slice(0, 6) : []))
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

      {/* Upcoming & Completed Programs Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-emerald-400" />
              <span>Programs & Competition Results</span>
            </h2>
            <p className="text-xs text-slate-400">Featured competitions scheduled & official winners</p>
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
              <div key={p.id} className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-amber-400/40 transition">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 inline-block">
                      {p.category_name} ({p.age_group})
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      p.status === 'running' 
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-400/40 animate-pulse'
                        : p.status === 'completed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white mb-1">{p.name}</h4>
                  <div className="flex items-center space-x-4 text-xs text-slate-400 font-mono mb-2">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{p.start_time || '09:00 AM'}</span>
                    </span>
                    <span>Venue: {p.venue_name || 'Stage 1'}</span>
                  </div>

                  {/* Winners Podium Display on Home Page */}
                  {p.winners && p.winners.length > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-amber-400/40 space-y-2">
                      <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-400 border-b border-slate-800 pb-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>Official Winners Podium</span>
                      </div>
                      {p.winners.map((w, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              w.prize === '1st' ? 'bg-amber-500 text-slate-950 shadow' :
                              w.prize === '2nd' ? 'bg-slate-300 text-slate-950 shadow' :
                              'bg-amber-700 text-white shadow'
                            }`}>
                              {w.prize === '1st' ? '🥇 1st' : w.prize === '2nd' ? '🥈 2nd' : '🥉 3rd'}
                            </span>
                            <span className="text-white font-bold">{w.student_name}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded border" style={{ color: w.house_color || '#10b981', borderColor: `${w.house_color || '#10b981'}80` }}>
                              {w.house_name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
