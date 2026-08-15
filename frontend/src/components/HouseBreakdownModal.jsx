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
    : 0;

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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-xs">
              <span className="text-[9px] sm:text-[10px] font-black uppercase block tracking-tight">1st Places</span>
              <span className="text-lg sm:text-xl font-black font-mono">🥇 {count1st}</span>
              <span className="text-[9px] sm:text-[10px] block font-bold text-amber-700">Gold Medals</span>
            </div>
            <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-100 border border-slate-300 text-slate-900 shadow-xs">
              <span className="text-[9px] sm:text-[10px] font-black uppercase block tracking-tight">2nd Places</span>
              <span className="text-lg sm:text-xl font-black font-mono">🥈 {count2nd}</span>
              <span className="text-[9px] sm:text-[10px] block font-bold text-slate-600">Silver Medals</span>
            </div>
            <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-100/60 border border-amber-300 text-amber-950 shadow-xs">
              <span className="text-[9px] sm:text-[10px] font-black uppercase block tracking-tight">3rd Places</span>
              <span className="text-lg sm:text-xl font-black font-mono">🥉 {count3rd}</span>
              <span className="text-[9px] sm:text-[10px] block font-bold text-amber-800">Bronze Medals</span>
            </div>
            <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-600 text-white shadow-md">
              <span className="text-[9px] sm:text-[10px] font-black uppercase block opacity-80 tracking-tight">Total Points</span>
              <span className="text-xl sm:text-2xl font-black font-mono block leading-tight">{housePoints}</span>
              <span className="text-[8px] sm:text-[9px] block font-extrabold uppercase tracking-tight opacity-90">Championship Score</span>
            </div>
          </div>

          {/* Point Allocation breakdown list */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Competition Wins Breakdown ({results.length} Wins)</span>
            </h3>

            {loading && results.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-bold text-xs">
                Fetching competition winners...
              </div>
            ) : results.length === 0 ? (
              <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs font-bold italic">
                No official competition results recorded for this house yet.
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((r, idx) => {
                  return (
                    <div 
                      key={r.id || idx}
                      className="p-3 sm:p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2.5 hover:border-emerald-300 transition min-w-0"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span className="text-xl sm:text-2xl shrink-0">
                          {r.prize === '1st' ? '🥇' : r.prize === '2nd' ? '🥈' : '🥉'}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">{r.program_name || 'Competition Item'}</h4>
                            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9px] font-mono font-bold shrink-0">
                              #{r.program_code || r.program_id}
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs font-bold text-slate-600 mt-0.5 truncate">
                            Winner: <span className="text-emerald-700 font-extrabold">{r.student_name || 'Student'}</span> {r.chest_no ? `(Chest #${r.chest_no})` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`px-2.5 py-1 rounded-xl font-mono font-black text-xs sm:text-sm block whitespace-nowrap ${
                          r.prize === '1st' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          r.prize === '2nd' ? 'bg-slate-100 text-slate-800 border border-slate-300' :
                          'bg-amber-50 text-amber-950 border border-amber-200'
                        }`}>
                          {r.prize === '1st' ? '1st Place' : r.prize === '2nd' ? '2nd Place' : '3rd Place'}
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
