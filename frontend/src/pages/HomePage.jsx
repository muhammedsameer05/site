import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import HouseBreakdownModal from '../components/HouseBreakdownModal';
import { 
  Trophy, Calendar, Clock, ArrowRight, Award, Sparkles, Image as ImageIcon, Edit3, Check, Plus, Minus
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

export default function HomePage({ onNavigate }) {
  const { user } = useAuth();
  const isAdmin = ['super_admin', 'admin'].includes(user?.role);

  const [houses, setHouses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [editingScoreHouseId, setEditingScoreHouseId] = useState(null);
  const [inputScore, setInputScore] = useState('');
  const [selectedHouseObj, setSelectedHouseObj] = useState(null);

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
        setGallery(Array.isArray(data) ? data.slice(0, 6) : []);
      })
      .catch(() => {
        setGallery([]);
      });
  };

  const handleUpdateHouseScore = async (houseId, newPoints) => {
    try {
      const res = await fetch(`/api/houses/${houseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total_points: Number(newPoints) })
      });
      if (res.ok) {
        loadData();
        setEditingScoreHouseId(null);
      }
    } catch (e) {}
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
              <Trophy className="w-6 h-6 text-emerald-600 animate-float" />
              <span>Live House Standings</span>
            </h2>
            <p className="text-xs text-slate-500 font-bold">Instant score tallies updated live</p>
          </div>
          <button
            onClick={() => onNavigate('results')}
            className="flex items-center space-x-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 btn-interactive"
          >
            <span>View Full Leaderboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {houses.map((house, idx) => (
            <div 
              key={house.id} 
              onClick={() => setSelectedHouseObj(house)}
              className="glass-panel card-hover-effect btn-interactive p-5 rounded-2xl border bg-white shadow-sm flex flex-col justify-between cursor-pointer group"
              style={{ borderColor: `${house.color_hex}60` }}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-white font-extrabold text-sm shadow-md transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: house.color_hex }}>
                    #{idx + 1}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold mb-1 group-hover:underline" style={{ color: house.color_hex }}>
                  {house.name}
                </h3>
                <p className="text-xs text-slate-500 italic mb-3 line-clamp-1 font-medium">{house.motto || 'Virtue & Faith'}</p>
              </div>
              
              <div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="text-xs font-bold text-slate-600">Total Points</span>
                  
                  <div className="flex items-center">
                    <div className="px-5 py-1.5 bg-emerald-50/60 border border-slate-200 rounded-xl shadow-xs text-center min-w-16 flex items-center justify-center">
                      <span className="text-2xl font-black emerald-gradient-text font-mono">
                        {house.total_points || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-right">
                  <span className="text-[10px] font-black text-emerald-700 underline group-hover:text-emerald-900 transition">
                    View Score Breakdown →
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* House Breakdown Modal */}
      {selectedHouseObj && (
        <HouseBreakdownModal 
          house={selectedHouseObj} 
          onClose={() => setSelectedHouseObj(null)} 
        />
      )}

      {/* Upcoming & Completed Programs Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-emerald-600" />
              <span>Programs & Competition Results</span>
            </h2>
            <p className="text-xs text-slate-500 font-bold">Featured competitions scheduled & official winners</p>
          </div>
          <button
            onClick={() => onNavigate('programs')}
            className="flex items-center space-x-1 text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            <span>Full Schedule</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {programs.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl border border-slate-200 bg-white text-slate-500 text-xs font-medium">
            No scheduled competition programs added yet. Admin can create new programs in Program Management.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.map((p) => (
              <div key={p.id} className="glass-panel p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition shadow-sm flex flex-col justify-between">
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                      {p.category_name} • {p.type || 'individual'}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mb-2">{p.name}</h4>

                  {/* Compact Winners Podium */}
                  {p.winners && p.winners.length > 0 && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center space-x-1.5 text-[9px] font-black uppercase tracking-widest text-amber-800 border-b border-slate-200 pb-1">
                        <Award className="w-3 h-3 text-amber-600" />
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
                              <span className="text-slate-900 font-bold">{w.student_name}</span>
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
              <Sparkles className="w-6 h-6 text-emerald-600" />
              <span>Milad Festival Photo Gallery</span>
            </h2>
            <p className="text-xs text-slate-500 font-bold">Stage performances, Qiraat competitions & festival highlights</p>
          </div>
          <button
            onClick={() => onNavigate('gallery')}
            className="flex items-center space-x-1 text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            <span>View Full Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {gallery.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl border border-slate-200 bg-white text-slate-500 text-xs font-medium">
            No gallery photos uploaded yet. Admins can upload event photos in the Gallery tab.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map(item => (
              <div 
                key={item.id}
                onClick={() => onNavigate('gallery')}
                className="group glass-panel rounded-2xl border border-slate-200 bg-white overflow-hidden cursor-pointer hover:border-emerald-400 transition duration-300 relative flex flex-col justify-between shadow-sm"
              >
                <div className="h-48 overflow-hidden bg-slate-100">
                  <img 
                    src={item.url} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                </div>
                <div className="p-4 bg-white">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">{item.title}</h4>
                  {item.caption && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.caption}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
