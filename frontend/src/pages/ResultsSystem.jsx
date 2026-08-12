import React, { useState, useEffect } from 'react';
import { Trophy, Award, RefreshCw, Printer, X, Download } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ResultsSystem() {
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null); // For certificate modal

  useEffect(() => {
    fetch('/api/programs')
      .then(res => res.json())
      .then(data => {
        const progs = Array.isArray(data) ? data : [];
        setPrograms(progs);
        if (progs.length > 0 && !selectedProgramId) {
          const completed = progs.find(p => p.status === 'completed') || progs[0];
          setSelectedProgramId(completed.id);
        }
      })
      .catch(() => {});
  }, []);

  const loadResults = (pId) => {
    if (!pId) return;
    fetch(`/api/results/program/${pId}`)
      .then(res => res.json())
      .then(data => {
        setResults(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/programs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPrograms(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (selectedProgramId) {
      loadResults(selectedProgramId);

      const interval = setInterval(() => {
        loadResults(selectedProgramId);
      }, 3000);

      return () => clearInterval(interval);
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

  const selectedProgram = programs.find(p => String(p.id) === String(selectedProgramId));

  const handlePrintCert = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold emerald-gradient-text flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-emerald-600" />
            <span>Official Results & Prize Allocation System</span>
          </h1>
          <p className="text-xs text-slate-500 font-mono font-bold">Automated 1st/2nd/3rd prize calculation & official student certificate issuance</p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-xs shadow-sm hover:bg-slate-50 transition"
        >
          <Printer className="w-4 h-4 text-emerald-600" />
          <span>Print Result Sheet</span>
        </button>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-xs font-bold ${
          msg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Program Selector Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-700 shrink-0">Select Program:</label>
          <select
            value={selectedProgramId || ''}
            onChange={e => setSelectedProgramId(e.target.value)}
            className="w-full sm:w-96 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500"
          >
            {programs.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.status})</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleAutoCalculate}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Calculate & Award Prizes</span>
        </button>
      </div>

      {/* Point Rules Card */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { prize: '1st Prize', pts: '10 Points', bg: 'border-amber-300 bg-amber-50 text-amber-900' },
          { prize: '2nd Prize', pts: '7 Points', bg: 'border-slate-300 bg-slate-100 text-slate-800' },
          { prize: '3rd Prize', pts: '5 Points', bg: 'border-amber-400 bg-amber-100 text-amber-950' }
        ].map((item, idx) => (
          <div key={idx} className={`p-3 rounded-xl border ${item.bg} text-xs font-bold shadow-xs`}>
            <span className="block text-[10px] uppercase font-bold opacity-80">{item.prize}</span>
            <span className="text-base font-mono font-black">{item.pts}</span>
          </div>
        ))}
      </div>

      {/* Results Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-emerald-950">Official Result Sheet</h3>
          <span className="text-xs text-slate-500 font-mono font-bold">Tie breaking: Presentation → Pronunciation → Admin</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-emerald-50/80 text-emerald-950 uppercase font-mono border-b border-emerald-100 font-bold">
              <tr>
                <th className="p-4">Rank / Prize</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Class</th>
                <th className="p-4">House</th>
                <th className="p-4 text-right">House Points</th>
                <th className="p-4 text-center">Action / Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-emerald-700 font-mono font-bold">Loading Results...</td></tr>
              ) : results.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-500 font-medium">No results calculated yet for this program. Click 'Calculate & Award Prizes' above.</td></tr>
              ) : (
                results.map((r) => (
                  <tr key={r.id} className="hover:bg-emerald-50/30 transition">
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold font-mono ${
                        r.prize === '1st' ? 'bg-amber-400 text-slate-950' :
                        r.prize === '2nd' ? 'bg-slate-200 text-slate-950' :
                        r.prize === '3rd' ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {r.prize === '1st' ? '🥇 1st Prize' : r.prize === '2nd' ? '🥈 2nd Prize' : r.prize === '3rd' ? '🥉 3rd Prize' : 'Participation'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{r.student_name}</div>
                      {r.arabic_name && <div className="text-xs font-serif text-emerald-800">{r.arabic_name}</div>}
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-700">{r.class_name}</td>
                    <td className="p-4">
                      <span 
                        className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase"
                        style={{ color: r.house_color || '#10b981' }}
                      >
                        {r.house_name}
                      </span>
                    </td>
                    <td className="p-4 text-right font-black font-mono text-emerald-700 text-base">+{r.points_awarded} Pts</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedCert({ ...r, program_name: selectedProgram?.name || 'Competition' })}
                        className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-900 font-bold text-xs inline-flex items-center space-x-1.5 transition"
                      >
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Print / Download Certificate</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md p-4 sm:p-6">
          <div className="flex min-h-full items-center justify-center p-2 text-center sm:p-4">
            <div className="relative transform rounded-3xl bg-white text-left shadow-2xl transition-all w-full max-w-4xl p-6 sm:p-8 my-auto border-2 border-emerald-300 text-slate-900">
            
            {/* Modal Top Control Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6 no-print">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-widest flex items-center space-x-2 font-mono">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Official Student Certificate Preview</span>
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrintCert}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF Certificate</span>
                </button>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="p-1.5 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Certificate Artwork Document (Printable) */}
            <div className="printable-cert bg-[#FFFDF5] text-slate-900 p-8 sm:p-12 rounded-xl border-8 border-double border-amber-600 shadow-2xl relative overflow-hidden font-serif text-center">
              
              {/* Background Watermark Logo */}
              <div 
                className="absolute inset-0 opacity-10 bg-center bg-no-repeat bg-contain pointer-events-none filter blur-xs scale-90"
                style={{ backgroundImage: `url('/milad-logo.jpg')` }}
              />

              {/* Corner Ornaments */}
              <div className="absolute top-3 left-3 text-amber-600 font-serif text-2xl">❖</div>
              <div className="absolute top-3 right-3 text-amber-600 font-serif text-2xl">❖</div>
              <div className="absolute bottom-3 left-3 text-amber-600 font-serif text-2xl">❖</div>
              <div className="absolute bottom-3 right-3 text-amber-600 font-serif text-2xl">❖</div>

              {/* Bismillah Header */}
              <div className="mb-4">
                <span className="text-2xl sm:text-3xl font-serif text-amber-800 block font-bold">
                  بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </span>
                <span className="text-[10px] text-amber-900 tracking-widest uppercase font-sans font-bold">
                  Jamalullaili Secondary Madrasa, MKMJC • Payyanur
                </span>
              </div>

              {/* Main Certificate Title */}
              <div className="my-6">
                <span className="text-xs font-bold text-amber-700 tracking-widest uppercase block font-sans mb-1">
                  Annual Milad Fest 2026 • വൈബ് ഓഫ് മദീന 2K26
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-amber-900 tracking-tight font-serif uppercase border-b-2 border-amber-500/50 pb-2 inline-block">
                  {selectedCert.prize === 'participation' ? 'Certificate of Participation' : 'Certificate of Merit'}
                </h2>
              </div>

              {/* Certificate Body Text */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-xl mx-auto my-4 font-sans">
                This is to proudly certify that student
              </p>

              <div className="my-3">
                <h3 className="text-2xl sm:text-3xl font-black text-emerald-950 font-serif underline decoration-amber-500 underline-offset-8">
                  {selectedCert.student_name}
                </h3>
                {selectedCert.arabic_name && (
                  <div className="text-lg font-serif text-amber-800 mt-1 font-bold">
                    {selectedCert.arabic_name}
                  </div>
                )}
                <span className="text-xs font-bold text-slate-600 block mt-2 font-mono">
                  {selectedCert.class_name} • <span style={{ color: selectedCert.house_color || '#059669' }}>{selectedCert.house_name}</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-xl mx-auto my-4 font-sans">
                has secured <span className="font-bold text-amber-800 uppercase px-2 py-0.5 rounded bg-amber-100 border border-amber-400">{selectedCert.prize === '1st' ? '🥇 1ST PRIZE' : selectedCert.prize === '2nd' ? '🥈 2ND PRIZE' : selectedCert.prize === '3rd' ? '🥉 3RD PRIZE' : 'PARTICIPATION'}</span> in the competition
              </p>

              <div className="text-xl sm:text-2xl font-bold text-amber-900 font-serif my-2 uppercase tracking-wide">
                "{selectedCert.program_name}"
              </div>

              <p className="text-xs text-slate-500 font-sans mt-2">
                held on August 15, 2026 at Jamalullaili Secondary Madrasa Campus, MKMJC - Payyanur.
              </p>

              {/* Signatures Row */}
              <div className="mt-12 pt-6 border-t border-amber-300 flex items-center justify-between text-xs font-sans">
                <div className="text-center">
                  <div className="font-serif text-base text-amber-900 font-bold italic mb-1">
                    Sayyid Muhammed
                  </div>
                  <span className="text-[10px] text-slate-600 block font-bold border-t border-slate-400 pt-1">
                    Principal & Chairman
                  </span>
                </div>

                <div className="w-16 h-16 rounded-full border-2 border-amber-600 flex items-center justify-center font-serif text-amber-800 text-[10px] font-bold text-center leading-tight bg-amber-100/50">
                  SEAL<br/>2026
                </div>

                <div className="text-center">
                  <div className="font-serif text-base text-amber-900 font-bold italic mb-1">
                    Convener Team
                  </div>
                  <span className="text-[10px] text-slate-600 block font-bold border-t border-slate-400 pt-1">
                    General Convener
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
      )}

    </div>
  );
}
