import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import { 
  Trophy, Calendar, Clock, ArrowRight, Award, Sparkles, Image as ImageIcon 
} from 'lucide-react';
import { io } from 'socket.io-client';

export default function HomePage({ onNavigate }) {
  const [houses, setHouses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [gallery, setGallery] = useState([]);

  const loadData = () => {
    fetch('/api/houses', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setHouses(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch('/api/programs', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setPrograms(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch('/api/gallery', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        const backendItems = Array.isArray(data) ? data : [];
        const localItems = JSON.parse(localStorage.getItem('milad_local_gallery') || '[]');
        const deletedIds = JSON.parse(localStorage.getItem('milad_deleted_gallery_ids') || '[]');

        const filteredBackend = backendItems.filter(item => !deletedIds.includes(String(item.id)));
        const filteredLocal = localItems.filter(item => !deletedIds.includes(String(item.id)));

        const combined = [...filteredLocal, ...filteredBackend];
        const unique = Array.from(new Map(combined.map(item => [String(item.id || item.url), item])).values());
        
        if (unique.length === 0) {
          setGallery([
            { id: 1, title: 'വൈബ് ഓഫ് മദീന 2K26 - Festival Emblem', url: '/milad-logo.jpg', caption: 'Jamalulleyli Madrasa Payyanur' }
          ]);
        } else {
          setGallery(unique.slice(0, 6));
        }
      })
      .catch(() => {
        const localItems = JSON.parse(localStorage.getItem('milad_local_gallery') || '[]');
        const deletedIds = JSON.parse(localStorage.getItem('milad_deleted_gallery_ids') || '[]');
        const filteredLocal = localItems.filter(item => !deletedIds.includes(String(item.id)));
        if (filteredLocal.length === 0) {
          setGallery([
            { id: 1, title: 'വൈബ് ഓഫ് മദീന 2K26 - Festival Emblem', url: '/milad-logo.jpg', caption: 'Jamalulleyli Madrasa Payyanur' }
          ]);
        } else {
          setGallery(filteredLocal.slice(0, 6));
        }
      });
  };

  useEffect(() => {
    loadData();

    // Auto-refresh interval every 3 seconds for instant score sync
    const interval = setInterval(() => {
      loadData();
    }, 3000);

    // Socket.io real-time broadcast listener
    const SERVER_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://site-lq13.onrender.com');
    let socket;
    try {
      socket = io(SERVER_URL);
      socket.on('score_updated', () => loadData());
      socket.on('results_published', () => loadData());
    } catch (e) {}

    return () => {
      clearInterval(interval);
      if (socket) socket.disconnect();
    };
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
            <p className="text-xs text-slate-400">Instant score tallies updated live</p>
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
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white font-extrabold text-sm shadow-md" style={{ backgroundColor: house.color_hex }}>
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
              <div key={p.id} className="glass-panel p-4 rounded-xl border border-slate-800/80 hover:border-amber-400/40 transition shadow-md flex flex-col justify-between">
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-emerald-500/30">
                      {p.category_name} • {p.type || 'individual'}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      p.status === 'running' 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 animate-pulse'
                        : p.status === 'completed'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white mb-1">{p.name}</h4>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono mb-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{p.start_time || '09:00 AM'}</span>
                  </div>

                  {/* Compact Winners Podium */}
                  {p.winners && p.winners.length > 0 && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950/80 border border-amber-400/30 space-y-1.5">
                      <div className="flex items-center space-x-1.5 text-[9px] font-black uppercase tracking-widest text-amber-400 border-b border-slate-800/80 pb-1">
                        <Award className="w-3 h-3 text-amber-400" />
                        <span>Winners Podium</span>
                      </div>
                      <div className="space-y-1">
                        {p.winners.map((w, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2">
                              <span className={`px-1.5 py-0.2 rounded font-black text-[9px] uppercase ${
                                w.prize === '1st' ? 'bg-amber-400 text-slate-950' :
                                w.prize === '2nd' ? 'bg-slate-300 text-slate-950' :
                                'bg-amber-700 text-white'
                              }`}>
                                {w.prize === '1st' ? '🥇 1st' : w.prize === '2nd' ? '🥈 2nd' : '🥉 3rd'}
                              </span>
                              <span className="text-white font-bold">{w.student_name}</span>
                            </div>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded border" style={{ color: w.house_color || '#10b981', borderColor: `${w.house_color || '#10b981'}50` }}>
                              {w.house_name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* Festival Photo Gallery Highlights Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold emerald-gradient-text flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <span>Milad Festival Photo Gallery</span>
            </h2>
            <p className="text-xs text-slate-400">Stage performances, Qiraat competitions & festival highlights</p>
          </div>
          <button
            onClick={() => onNavigate('gallery')}
            className="flex items-center space-x-1 text-xs font-bold text-amber-400 hover:text-amber-300"
          >
            <span>View Full Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {gallery.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl border border-slate-800 text-slate-400 text-xs">
            No gallery photos uploaded yet. Admins can upload event photos in the Gallery tab.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map(item => (
              <div 
                key={item.id}
                onClick={() => onNavigate('gallery')}
                className="group glass-panel rounded-2xl border border-slate-800 overflow-hidden cursor-pointer hover:border-amber-400/50 transition duration-300 relative flex flex-col justify-between"
              >
                <div className="h-48 overflow-hidden bg-slate-950">
                  <img 
                    src={item.url} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                </div>
                <div className="p-4 bg-slate-900/90">
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition">{item.title}</h4>
                  {item.caption && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.caption}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
