import React, { useState, useEffect } from 'react';
import { Trophy, Radio, Sparkles, Award, RefreshCw, Search, Calendar, User, Shield } from 'lucide-react';
import { io } from 'socket.io-client';
import confetti from 'canvas-confetti';

export default function LiveScoring() {
  const [houses, setHouses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [liveLog, setLiveLog] = useState([
    { id: 1, time: 'System Ready', text: 'Live scoring websocket stream active. Real-time updates enabled.' }
  ]);

  const loadData = () => {
    fetch('/api/houses', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setHouses(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch('/api/programs', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setPrograms(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch('/api/results', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setResults(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    loadData();

    const SERVER_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://site-lq13.onrender.com');
    const socket = io(SERVER_URL);

    socket.on('connect', () => {
      console.log('Connected to Live Scoring Stream');
    });

    socket.on('score_updated', (data) => {
      setLiveLog(prev => [
        { id: Date.now(), time: new Date().toLocaleTimeString(), text: `Live score update received for House Standing / Program!` },
        ...prev
      ]);
      loadData();
    });

    socket.on('results_published', () => {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setLiveLog(prev => [
        { id: Date.now(), time: new Date().toLocaleTimeString(), text: `🎉 New Competition Winners Official Results Published!` },
        ...prev
      ]);
      loadData();
    });

    return () => socket.disconnect();
  }, []);

  const categories = ['all', 'Kiddies', 'Sub Junior', 'Junior', 'Senior', 'Super Senior'];

  // Filter programs by category & search term
  const filteredPrograms = programs.filter(p => {
    const matchesCategory = selectedCategory === 'all' || 
      (p.category_name && p.category_name.toLowerCase() === selectedCategory.toLowerCase()) ||
      (p.age_group && p.age_group.toLowerCase() === selectedCategory.toLowerCase());
    
    const matchesSearch = !searchTerm || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Live Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-amber-300 text-xs font-extrabold uppercase mb-2 animate-pulse">
            <Radio className="w-3.5 h-3.5" />
            <span>REAL-TIME LIVE SCORING & LEADERBOARD STREAM</span>
          </div>
          <h1 className="text-3xl font-black tracking-wide text-white">Live Competition Results Desk</h1>
          <p className="text-xs text-emerald-100 font-mono font-bold mt-1">
            Real-time House championship scores and official student winner announcements
          </p>
        </div>

        <button
          onClick={() => {
            loadData();
            confetti({ particleCount: 50 });
          }}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs shadow-md transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Live Scores</span>
        </button>
      </div>

      {/* SECTION 1: LIVE HOUSE CHAMPIONSHIP STANDINGS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
            <Trophy className="w-7 h-7 text-amber-500" />
            <span>Live House Championship Standings</span>
          </h2>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Instant Score Tallies
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {houses.map((house, idx) => (
            <div
              key={house.id}
              className="glass-panel p-6 rounded-3xl border-2 bg-white shadow-md relative overflow-hidden flex flex-col justify-between"
              style={{ borderColor: `${house.color_hex}80` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-md"
                    style={{ backgroundColor: house.color_hex }}
                  >
                    #{idx + 1}
                  </span>
                  <div>
                    <h3 className="text-2xl font-black" style={{ color: house.color_hex }}>
                      {house.name}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-extrabold block uppercase tracking-wider mb-1">Total Points</span>
                  <div className="px-5 py-1.5 bg-emerald-50/60 border border-slate-200 rounded-xl shadow-xs inline-block text-center min-w-16">
                    <span className="text-3xl font-black emerald-gradient-text font-mono">
                      {house.total_points || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-600 font-medium border-t border-slate-100 pt-3">
                <span className="italic">"{house.motto || 'Faith & Devotion'}"</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: OFFICIAL COMPETITION RESULTS & STUDENT WINNERS */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
              <Award className="w-7 h-7 text-emerald-600" />
              <span>Official Student Winners & Podium</span>
            </h2>
            <p className="text-xs text-slate-500 font-bold">Published winners with points awarded for Green House & Blue House</p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search student or program..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black capitalize transition-all whitespace-nowrap ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Competition Items & Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.length === 0 ? (
            <div className="col-span-full glass-panel p-8 text-center rounded-3xl bg-white text-slate-500 font-bold text-sm">
              No competition items found matching the selected category or search filter.
            </div>
          ) : (
            filteredPrograms.map(prog => {
              // Find winners for this program
              const progWinners = results.filter(r => 
                String(r.program_id) === String(prog.id) || 
                (r.program_code && prog.code && String(r.program_code).toLowerCase() === String(prog.code).toLowerCase())
              );

              return (
                <div 
                  key={prog.id}
                  className="glass-panel p-5 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase font-mono">
                        {prog.category_name || prog.category || prog.age_group || 'General'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono font-bold">#{prog.code || prog.id}</span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 leading-snug">{prog.name}</h3>
                  </div>

                  {/* Winners Podium List */}
                  <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                      Official Winners Podium:
                    </span>

                    {progWinners.length === 0 ? (
                      <p className="text-xs text-slate-400 italic font-medium py-2">
                        Winners not published yet for this program item.
                      </p>
                    ) : (
                      progWinners.map(w => (
                        <div 
                          key={w.id || `${w.program_id}-${w.prize}`}
                          className="flex items-center space-x-2 text-xs py-1.5 border-b border-slate-200/60 last:border-0"
                        >
                          <span className="font-mono text-sm">
                            {w.prize === '1st' ? '🥇' : w.prize === '2nd' ? '🥈' : '🥉'}
                          </span>
                          <span className="font-extrabold text-slate-900">{w.student_name || w.name || 'Participant'}</span>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECTION 3: REAL-TIME WEBSOCKET FEED */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            <span>Real-time Live Scoring Stream Feed</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Live Socket Connection</span>
        </div>

        <div className="space-y-2 max-h-40 overflow-y-auto font-mono text-xs">
          {liveLog.map(log => (
            <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-700 font-bold">{log.text}</span>
              <span className="text-slate-400 text-[10px]">{log.time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
