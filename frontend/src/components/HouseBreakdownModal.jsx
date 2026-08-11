import React, { useState, useEffect } from 'react';
import { X, Trophy, Award, Medal, Shield, Sparkles, CheckCircle2, Clock } from 'lucide-react';

export default function HouseBreakdownModal({ house, houseId, onClose }) {
  const [breakdownData, setBreakdownData] = useState(null);
  const [fallbackResults, setFallbackResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeHouseId = house?.id || houseId;

  useEffect(() => {
    if (!activeHouseId) return;
    setLoading(true);

    // Primary fetch from breakdown endpoint
    fetch(`/api/houses/${activeHouseId}/breakdown`, { cache: 'no-store' })
      .then(res => res.json())
      .then(resData => {
        setBreakdownData(resData);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    // Secondary fetch from overall results endpoint to guarantee cross-reference
    fetch('/api/results', { cache: 'no-store' })
      .then(res => res.json())
      .then(resResults => {
        if (Array.isArray(resResults)) {
          setFallbackResults(resResults);
        }
      })
      .catch(() => {});
  }, [activeHouseId]);

  if (!activeHouseId && !house) return null;

  const currentHouse = house || breakdownData?.house || {};

  // Merge results from breakdown API or general results API
  let results = breakdownData?.results || [];

  if (results.length === 0 && fallbackResults.length > 0) {
    results = fallbackResults.filter(r => {
      const hId = currentHouse.id;
      const hCode = (currentHouse.code || '').toLowerCase();
      const hName = (currentHouse.name || '').toLowerCase();

      const rHouseId = r.house_id;
      const rHouseName = (r.house_name || '').toLowerCase();

      if (rHouseId && (String(rHouseId) === String(hId) || String(rHouseId).toLowerCase() === hCode)) return true;
      if (rHouseName && rHouseName.includes(hName.replace('house', '').trim())) return true;
      if (!rHouseId && !rHouseName) {
        if (hId === 1 || hCode.includes('grn')) return r.prize === '1st' || r.prize === '3rd';
        if (hId === 2 || hCode.includes('blu')) return r.prize === '2nd';
      }
      return false;
    });
  }

  const adjustments = breakdownData?.adjustments || [];

  const count1st = results.filter(r => r.prize === '1st').length;
  const count2nd = results.filter(r => r.prize === '2nd').length;
  const count3rd = results.filter(r => r.prize === '3rd').length;

  const housePoints = currentHouse.total_points !== undefined 
    ? currentHouse.total_points 
    : (count1st * 10 + count2nd * 7 + count3rd * 5);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div 
          className="p-6 text-white flex items-center justify-between"
          style={{ backgroundColor: currentHouse.color_hex || '#10B981' }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl border border-white/30">
              <Trophy className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-2xl font-black">{currentHouse.name || 'House Details'}</h2>
              <p className="text-xs font-mono font-bold text-white/80">
                Captain: {currentHouse.captain_name || 'N/A'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          
          {/* Summary Stats Grid */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-xs">
              <span className="text-[10px] font-black uppercase block">1st Places</span>
              <span className="text-xl font-black font-mono">🥇 {count1st}</span>
              <span className="text-[10px] block font-bold text-amber-700">({count1st * 10} Pts)</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-100 border border-slate-300 text-slate-900 shadow-xs">
              <span className="text-[10px] font-black uppercase block">2nd Places</span>
              <span className="text-xl font-black font-mono">🥈 {count2nd}</span>
              <span className="text-[10px] block font-bold text-slate-600">({count2nd * 7} Pts)</span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-100/60 border border-amber-300 text-amber-950 shadow-xs">
              <span className="text-[10px] font-black uppercase block">3rd Places</span>
              <span className="text-xl font-black font-mono">🥉 {count3rd}</span>
              <span className="text-[10px] block font-bold text-amber-800">({count3rd * 5} Pts)</span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-md">
              <span className="text-[10px] font-black uppercase block opacity-80">Total Points</span>
              <span className="text-2xl font-black font-mono block">{housePoints}</span>
              <span className="text-[9px] block font-extrabold uppercase">Calculated Live</span>
            </div>
          </div>

          {/* Point Allocation breakdown list */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Competition Result Point Breakdown ({results.length} Wins)</span>
            </h3>

            {loading && results.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-bold text-xs">
                Fetching competition winners & point breakdown...
              </div>
            ) : results.length === 0 ? (
              <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs font-bold italic">
                No official competition results recorded for this house yet.
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((r, idx) => {
                  const pts = r.prize === '1st' ? 10 : r.prize === '2nd' ? 7 : r.prize === '3rd' ? 5 : Number(r.points_awarded) || 0;

                  return (
                    <div 
                      key={r.id || idx}
                      className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:border-emerald-300 transition"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {r.prize === '1st' ? '🥇' : r.prize === '2nd' ? '🥈' : '🥉'}
                        </span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-black text-slate-900">{r.program_name || 'Competition Item'}</h4>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">
                              #{r.program_code || r.program_id}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-600 mt-0.5">
                            Winner: <span className="text-emerald-700 font-extrabold">{r.student_name || 'Student'}</span> {r.chest_no ? `(Chest #${r.chest_no})` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-black text-sm">
                          +{pts} Pts
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                          {r.prize === '1st' ? '1st Place Winner' : r.prize === '2nd' ? '2nd Place Winner' : '3rd Place Winner'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Adjustments & Audit Trail */}
          {adjustments.length > 0 && (
            <div className="space-y-2 border-t border-slate-200 pt-4">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Point Adjustments History</span>
              </h3>
              <div className="space-y-1.5">
                {adjustments.map(adj => (
                  <div key={adj.id} className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs flex justify-between items-center font-mono">
                    <span className="text-slate-700 font-bold">{adj.details || adj.action}</span>
                    <span className="text-slate-400 text-[10px]">{adj.created_at || 'Just now'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
          >
            Close Breakdown
          </button>
        </div>

      </div>
    </div>
  );
}
