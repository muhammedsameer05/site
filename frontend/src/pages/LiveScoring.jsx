import React, { useState, useEffect } from 'react';
import { Trophy, Radio, Sparkles, Award, ArrowUp, RefreshCw, Zap, CheckCircle2, User, Save, Star } from 'lucide-react';
import { io } from 'socket.io-client';
import confetti from 'canvas-confetti';

export default function LiveScoring() {
  const [programs, setPrograms] = useState([]);
  const [students, setStudents] = useState([]);
  const [houses, setHouses] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  
  // Marks criteria breakdown
  const [presentation, setPresentation] = useState(15);
  const [pronunciation, setPronunciation] = useState(15);
  const [confidence, setConfidence] = useState(15);
  const [contentScore, setContentScore] = useState(15);
  const [timeScore, setTimeScore] = useState(15);
  const [savingMark, setSavingMark] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Manual winners assignment
  const [winner1st, setWinner1st] = useState('');
  const [winner2nd, setWinner2nd] = useState('');
  const [winner3rd, setWinner3rd] = useState('');
  const [publishingWinners, setPublishingWinners] = useState(false);
  const [winnerSuccess, setWinnerSuccess] = useState(false);

  const [liveLog, setLiveLog] = useState([
    { id: 1, time: 'System Ready', text: 'Live scoring websocket engine connected and monitoring judge evaluations.' }
  ]);

  const totalCalculatedMark = Number(presentation) + Number(pronunciation) + Number(confidence) + Number(contentScore) + Number(timeScore);

  const loadData = () => {
    fetch('/api/programs')
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setPrograms(list);
        if (list.length > 0 && !selectedProgramId) {
          setSelectedProgramId(list[0].id);
        }
      })
      .catch(() => {});

    fetch('/api/students')
      .then(res => res.json())
      .then(data => setStudents(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch('/api/houses')
      .then(res => res.json())
      .then(data => setHouses(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    loadData();

    const SERVER_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://site-lq13.onrender.com');
    const socket = io(SERVER_URL);

    socket.on('connect', () => {
      console.log('Connected to Live Scoring WebSockets');
    });

    socket.on('score_updated', (data) => {
      setLiveLog(prev => [
        { id: Date.now(), time: new Date().toLocaleTimeString(), text: `New live score recorded for Program #${data.program_id || selectedProgramId}` },
        ...prev
      ]);
      loadData();
    });

    socket.on('results_published', () => {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      loadData();
    });

    return () => socket.disconnect();
  }, []);

  const handleSaveScore = async (e) => {
    e.preventDefault();
    if (!selectedProgramId || !selectedStudentId) {
      alert('Please select both a Program and a Student to evaluate.');
      return;
    }

    setSavingMark(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program_id: selectedProgramId,
          student_id: selectedStudentId,
          judge_id: 1,
          presentation: Number(presentation),
          pronunciation: Number(pronunciation),
          confidence: Number(confidence),
          voice: Number(confidence),
          content: Number(contentScore),
          memorization: Number(contentScore),
          time_management: Number(timeScore),
          overall_impression: Number(timeScore),
          total_mark: totalCalculatedMark,
          status: 'final'
        })
      });

      if (res.ok) {
        setSaveSuccess(true);
        confetti({ particleCount: 40, spread: 60 });
        setTimeout(() => setSaveSuccess(false), 3000);
        loadData();
      } else {
        const errData = await res.json();
        alert(`Error saving mark: ${errData.error || 'Failed to save score'}`);
      }
    } catch (err) {
      alert(`Network error saving mark: ${err.message}`);
    } finally {
      setSavingMark(false);
    }
  };

  const handlePublishWinners = async (e) => {
    e.preventDefault();
    if (!selectedProgramId) {
      alert('Please select a program.');
      return;
    }

    setPublishingWinners(true);
    setWinnerSuccess(false);

    try {
      const res = await fetch(`/api/results/manual/${selectedProgramId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_student_id: winner1st,
          second_student_id: winner2nd,
          third_student_id: winner3rd
        })
      });

      if (res.ok) {
        setWinnerSuccess(true);
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
        setTimeout(() => setWinnerSuccess(false), 3000);
        loadData();
      } else {
        const errData = await res.json();
        alert(`Error publishing winners: ${errData.error || 'Failed to publish'}`);
      }
    } catch (err) {
      alert(`Network error publishing winners: ${err.message}`);
    } finally {
      setPublishingWinners(false);
    }
  };

  const currentProgObj = programs.find(p => String(p.id) === String(selectedProgramId));

  return (
    <div className="space-y-8">
      
      {/* Live Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-amber-300 text-xs font-extrabold uppercase mb-2 animate-pulse">
            <Radio className="w-3.5 h-3.5" />
            <span>ADMIN LIVE SCORING & PODIUM CONTROL PANEL</span>
          </div>
          <h1 className="text-3xl font-black tracking-wide text-white">Live Scoring Desk</h1>
          <p className="text-xs text-emerald-100 font-mono font-bold mt-1">
            Evaluate participants live and assign 1st, 2nd, 3rd place winners with instant leaderboard point calculations
          </p>
        </div>

        <button
          onClick={() => {
            loadData();
            confetti({ particleCount: 40 });
          }}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs shadow-md transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Live Feed</span>
        </button>
      </div>

      {/* Program Selector Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-emerald-100 bg-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-1/2">
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
            Select Active Competition Item:
          </label>
          <select
            value={selectedProgramId}
            onChange={(e) => {
              setSelectedProgramId(e.target.value);
              setSelectedStudentId('');
            }}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 font-extrabold text-slate-800 text-sm outline-none transition"
          >
            {programs.length === 0 ? (
              <option value="">No Programs Created Yet</option>
            ) : (
              programs.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category_name || p.category || 'General'}) — Code #{p.code || p.id}
                </option>
              ))
            )}
          </select>
        </div>

        {currentProgObj && (
          <div className="flex items-center space-x-3 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl">
            <Trophy className="w-6 h-6 text-amber-500 shrink-0" />
            <div>
              <span className="text-xs font-black text-emerald-900 block leading-tight">{currentProgObj.name}</span>
              <span className="text-[11px] text-emerald-700 font-mono font-bold">Category: {currentProgObj.category_name || currentProgObj.category || 'General'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Dual Panel Layout: Live Scoring Form + Winner Podium */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Panel 1: Live Evaluation Criteria Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white shadow-md">
            
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-black text-slate-900">1-Click Live Student Evaluation</h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono font-extrabold text-xs">
                Total Score: {totalCalculatedMark} / 100
              </span>
            </div>

            <form onSubmit={handleSaveScore} className="space-y-5">
              
              {/* Select Student */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Student Participant:
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 font-extrabold text-slate-800 text-sm outline-none transition"
                >
                  <option value="">-- Choose Registered Student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.admission_no || s.student_id}) — {s.class_name || 'Class 1'} | House: {s.house_name || (s.house_id === 1 ? 'Green House' : s.house_id === 2 ? 'Blue House' : 'Default')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Criteria Sliders */}
              <div className="space-y-4 pt-2">
                
                <div>
                  <div className="flex justify-between text-xs font-black text-slate-700 mb-1">
                    <span>Presentation & Stage Presence (Max 20)</span>
                    <span className="text-emerald-700 font-mono font-bold">{presentation} / 20</span>
                  </div>
                  <input
                    type="range" min="0" max="20" step="0.5"
                    value={presentation}
                    onChange={(e) => setPresentation(e.target.value)}
                    className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-black text-slate-700 mb-1">
                    <span>Pronunciation & Diction / Tajweed (Max 20)</span>
                    <span className="text-emerald-700 font-mono font-bold">{pronunciation} / 20</span>
                  </div>
                  <input
                    type="range" min="0" max="20" step="0.5"
                    value={pronunciation}
                    onChange={(e) => setPronunciation(e.target.value)}
                    className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-black text-slate-700 mb-1">
                    <span>Confidence & Voice Clarity (Max 20)</span>
                    <span className="text-emerald-700 font-mono font-bold">{confidence} / 20</span>
                  </div>
                  <input
                    type="range" min="0" max="20" step="0.5"
                    value={confidence}
                    onChange={(e) => setConfidence(e.target.value)}
                    className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-black text-slate-700 mb-1">
                    <span>Content & Accuracy / Memorization (Max 20)</span>
                    <span className="text-emerald-700 font-mono font-bold">{contentScore} / 20</span>
                  </div>
                  <input
                    type="range" min="0" max="20" step="0.5"
                    value={contentScore}
                    onChange={(e) => setContentScore(e.target.value)}
                    className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-black text-slate-700 mb-1">
                    <span>Time Management & Impression (Max 20)</span>
                    <span className="text-emerald-700 font-mono font-bold">{timeScore} / 20</span>
                  </div>
                  <input
                    type="range" min="0" max="20" step="0.5"
                    value={timeScore}
                    onChange={(e) => setTimeScore(e.target.value)}
                    className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                </div>

              </div>

              {/* Submit Score Button */}
              <button
                type="submit"
                disabled={savingMark}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-sm shadow-md flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-amber-300" />
                    <span>Score Saved & Broadcasted Live!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{savingMark ? 'Broadcasting Score...' : `Submit Live Score (${totalCalculatedMark} Pts)`}</span>
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* Panel 2: Quick Assign 1st, 2nd, 3rd Winner Podium */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-amber-200 bg-gradient-to-b from-amber-50/60 via-white to-white shadow-md">
            
            <div className="flex items-center space-x-2 pb-4 mb-5 border-b border-amber-100">
              <Trophy className="w-6 h-6 text-amber-600" />
              <div>
                <h2 className="text-lg font-black text-slate-900">Assign Competition Winners</h2>
                <p className="text-[11px] text-slate-500 font-mono font-bold">1st = 10 Pts | 2nd = 7 Pts | 3rd = 5 Pts</p>
              </div>
            </div>

            <form onSubmit={handlePublishWinners} className="space-y-4">
              
              {/* 1st Place */}
              <div>
                <label className="block text-xs font-black text-amber-800 uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <span>🥇 1st Place Winner (10 Points)</span>
                </label>
                <select
                  value={winner1st}
                  onChange={(e) => setWinner1st(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white font-extrabold text-slate-800 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="">-- Choose 1st Place Winner --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.house_name || (s.house_id === 1 ? 'Green House' : 'Blue House')})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2nd Place */}
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <span>🥈 2nd Place Winner (7 Points)</span>
                </label>
                <select
                  value={winner2nd}
                  onChange={(e) => setWinner2nd(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-extrabold text-slate-800 text-xs focus:ring-2 focus:ring-slate-500 outline-none"
                >
                  <option value="">-- Choose 2nd Place Winner --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.house_name || (s.house_id === 1 ? 'Green House' : 'Blue House')})
                    </option>
                  ))}
                </select>
              </div>

              {/* 3rd Place */}
              <div>
                <label className="block text-xs font-black text-amber-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <span>🥉 3rd Place Winner (5 Points)</span>
                </label>
                <select
                  value={winner3rd}
                  onChange={(e) => setWinner3rd(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white font-extrabold text-slate-800 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="">-- Choose 3rd Place Winner --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.house_name || (s.house_id === 1 ? 'Green House' : 'Blue House')})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={publishingWinners}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md flex items-center justify-center space-x-2 transition disabled:opacity-50 mt-2"
              >
                {winnerSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                    <span>Winners Published & House Points Calculated!</span>
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    <span>{publishingWinners ? 'Publishing Winners...' : 'Publish Winners & Recalculate Points'}</span>
                  </>
                )}
              </button>

            </form>

          </div>

          {/* Current House Ranks */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Current Live House Standings</span>
              </span>
              <span className="text-[10px] text-emerald-700 font-mono font-extrabold uppercase">Live Desk</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {houses.map(h => (
                <div 
                  key={h.id}
                  className="p-4 rounded-2xl border flex flex-col justify-between bg-slate-50 space-y-3"
                  style={{ borderColor: h.color_hex }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black" style={{ color: h.color_hex }}>{h.name}</span>
                    <span className="text-2xl font-black text-slate-900 font-mono">{h.total_points || 0} Pts</span>
                  </div>

                  {/* 1-Click Live Adjustment Buttons */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    <button
                      onClick={async () => {
                        await fetch(`/api/houses/${h.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ total_points: (h.total_points || 0) + 10 })
                        });
                        loadData();
                      }}
                      className="py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] transition text-center shadow-xs"
                      title="Add 10 Points"
                    >
                      +10
                    </button>
                    <button
                      onClick={async () => {
                        await fetch(`/api/houses/${h.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ total_points: (h.total_points || 0) + 5 })
                        });
                        loadData();
                      }}
                      className="py-1 px-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[11px] transition text-center shadow-xs"
                      title="Add 5 Points"
                    >
                      +5
                    </button>
                    <button
                      onClick={async () => {
                        await fetch(`/api/houses/${h.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ total_points: (h.total_points || 0) + 1 })
                        });
                        loadData();
                      }}
                      className="py-1 px-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-black text-[11px] transition text-center shadow-xs"
                      title="Add 1 Point"
                    >
                      +1
                    </button>
                    <button
                      onClick={async () => {
                        await fetch(`/api/houses/${h.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ total_points: Math.max(0, (h.total_points || 0) - 5) })
                        });
                        loadData();
                      }}
                      className="py-1 px-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-black text-[11px] transition text-center shadow-xs"
                      title="Deduct 5 Points"
                    >
                      -5
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Live WebSockets Audit Feed */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            <span>Real-time Judge Evaluation Broadcast Feed</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Live Socket Connection</span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-xs">
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
