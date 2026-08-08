import React, { useState, useEffect } from 'react';
import { Trophy, Award, CheckCircle, RefreshCw, Printer, Shield, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ResultsSystem() {
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState(4); // Default to completed program 4
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetch('/api/programs')
      .then(res => res.json())
      .then(data => {
        const progs = Array.isArray(data) ? data : [];
        setPrograms(progs);
      })
      .catch(() => {});
  }, []);

  const loadResults = (pId) => {
    setLoading(true);
    fetch(`/api/results/program/${pId}`)
      .then(res => res.json())
      .then(data => {
        setResults(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedProgramId) {
      loadResults(selectedProgramId);
    }
  }, [selectedProgramId]);

  const handleAutoCalculate = () => {
    setLoading(true);
    fetch(`/api/results/calculate/${selectedProgramId}`, { method: 'POST' })
      .then(res => res.json())
      .then(res => {
        if (res.error) {
          setMsg({ type: 'error', text: res.error });
        } else {
          setMsg({ type: 'success', text: `Results calculated & house points awarded for ${res.count} participants!` });
          confetti({ particleCount: 80, spread: 60 });
          loadResults(selectedProgramId);
        }
        setLoading(false);
      });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold emerald-gradient-text flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <span>Official Results & Prize Allocation System</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">Automated 1st/2nd/3rd prize calculation & tie-breaking rules</p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 font-bold text-xs shadow hover:bg-slate-700 transition"
        >
          <Printer className="w-4 h-4" />
          <span>Print Result Sheet</span>
        </button>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-xs font-bold ${
          msg.type === 'error' ? 'bg-red-950/80 text-red-300 border border-red-500/40' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Program Selector Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-300 shrink-0">Select Program:</label>
          <select
            value={selectedProgramId}
            onChange={e => setSelectedProgramId(e.target.value)}
            className="w-full sm:w-80 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white"
          >
            {programs.map(p => (
              <option key={p.id} value={p.id}>{p.code} - {p.name} ({p.status})</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleAutoCalculate}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Calculate & Award Prizes</span>
        </button>
      </div>

      {/* Point Rules Card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        {[
          { prize: '1st Prize', pts: '10 Points', bg: 'border-amber-400/50 bg-amber-500/10 text-amber-300' },
          { prize: '2nd Prize', pts: '7 Points', bg: 'border-slate-400/50 bg-slate-500/10 text-slate-300' },
          { prize: '3rd Prize', pts: '5 Points', bg: 'border-amber-700/50 bg-amber-700/10 text-amber-500' },
          { prize: 'Participation', pts: '3 Points', bg: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' }
        ].map((item, idx) => (
          <div key={idx} className={`p-3 rounded-xl border ${item.bg} text-xs font-bold`}>
            <span className="block text-[10px] uppercase opacity-80">{item.prize}</span>
            <span className="text-base font-mono font-black">{item.pts}</span>
          </div>
        ))}
      </div>

      {/* Results Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl bg-slate-900">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-amber-400">Official Result Sheet</h3>
          <span className="text-xs text-slate-400 font-mono">Tie breaking: Presentation → Pronunciation → Admin</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-amber-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-4">Rank / Prize</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Class</th>
                <th className="p-4">House</th>
                <th className="p-4">Score</th>
                <th className="p-4 text-right">House Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-amber-400 font-mono">Loading Results...</td></tr>
              ) : results.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">No results calculated yet for this program. Click 'Calculate & Award Prizes' above.</td></tr>
              ) : (
                results.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold font-mono ${
                        r.prize === '1st' ? 'bg-amber-500 text-slate-950' :
                        r.prize === '2nd' ? 'bg-slate-300 text-slate-950' :
                        r.prize === '3rd' ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {r.prize === '1st' ? '🥇 1st Prize' : r.prize === '2nd' ? '🥈 2nd Prize' : r.prize === '3rd' ? '🥉 3rd Prize' : 'Participation'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{r.student_name}</div>
                      {r.arabic_name && <div className="text-xs font-serif text-amber-300">{r.arabic_name}</div>}
                    </td>
                    <td className="p-4 font-mono">{r.class_name}</td>
                    <td className="p-4">
                      <span 
                        className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase"
                        style={{ color: r.house_color || '#10b981' }}
                      >
                        {r.house_name}
                      </span>
                    </td>
                    <td className="p-4 font-black font-mono text-amber-300 text-sm">{r.total_score} / 100</td>
                    <td className="p-4 text-right font-black font-mono text-emerald-400 text-base">+{r.points_awarded} Pts</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
