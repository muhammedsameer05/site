import React, { useState, useEffect } from 'react';
import { Trophy, Radio, Sparkles, Award, ArrowUp, RefreshCw, Zap } from 'lucide-react';
import { io } from 'socket.io-client';
import confetti from 'canvas-confetti';

export default function LiveScoring() {
  const [houses, setHouses] = useState([]);
  const [liveLog, setLiveLog] = useState([
    { id: 1, time: 'Just now', text: 'Judge Qari Zakariya submitted final score for Chest #101 in Quran Recitation' },
    { id: 2, time: '2 mins ago', text: 'Malayalam Speech (PRG-104) completed! 1st Prize awarded to Green House (10 Pts)' }
  ]);

  const loadStandings = () => {
    fetch('/api/houses')
      .then(res => res.json())
      .then(data => setHouses(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    loadStandings();

    // Connect WebSockets dynamically to Render server in production
    const SERVER_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://site-lq13.onrender.com');
    const socket = io(SERVER_URL);

    socket.on('connect', () => {
      console.log('Connected to Live Scoring WebSockets');
    });

    socket.on('score_updated', (data) => {
      setLiveLog(prev => [
        { id: Date.now(), time: 'Just now', text: `New score broadcast received for Program ${data.program_id}! Marks: ${data.total_mark}` },
        ...prev
      ]);
      loadStandings();
    });

    socket.on('results_published', () => {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      loadStandings();
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Live Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-amber-500/40 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 text-xs font-extrabold uppercase mb-2 animate-pulse">
            <Radio className="w-3.5 h-3.5" />
            <span>LIVE WEBSOCKET scoring STREAM ACTIVE</span>
          </div>
          <h1 className="text-3xl font-black gold-gradient-text">Live Milad Leaderboard</h1>
          <p className="text-xs text-slate-300 font-mono mt-1">Real-time instant score sync without page refresh</p>
        </div>

        <button
          onClick={() => {
            loadStandings();
            confetti({ particleCount: 50 });
          }}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Scores</span>
        </button>
      </div>

      {/* Animated Leaderboard Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          <span>Current Overall Championship Rank</span>
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {houses.map((h, idx) => (
            <div 
              key={h.id}
              className="glass-panel p-5 rounded-2xl border-2 flex items-center justify-between transition-all duration-300 hover:scale-[1.01] bg-slate-900/90"
              style={{ borderColor: `${h.color_hex}80` }}
            >
              <div className="flex items-center space-x-4">
                <span 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-xl"
                  style={{ backgroundColor: h.color_hex }}
                >
                  #{idx + 1}
                </span>

                <div>
                  <h3 className="text-xl font-extrabold text-white" style={{ color: h.color_hex }}>
                    {h.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">Captain: {h.captain_name || 'N/A'}</p>
                </div>
              </div>

              {/* Points & Medals */}
              <div className="flex items-center space-x-6">
                <div className="hidden sm:flex items-center space-x-3 text-xs font-mono">
                  <span className="text-amber-400 font-bold">🥇 {h.gold || 0}</span>
                  <span className="text-slate-300 font-bold">🥈 {h.silver || 0}</span>
                  <span className="text-amber-600 font-bold">🥉 {h.bronze || 0}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">TOTAL POINTS</span>
                  <span className="text-3xl font-black gold-gradient-text font-mono">{h.total_points || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
