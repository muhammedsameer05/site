import React, { useState, useEffect } from 'react';
import { Search, X, User, Calendar, Trophy, Award } from 'lucide-react';

export default function SearchModal({ isOpen, onClose, onSelectResult }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    students: [],
    programs: [],
    judges: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ students: [], programs: [], judges: [] });
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      // Perform client side search fetch
      fetch('/api/students')
        .then(res => res.json())
        .then(data => {
          const q = query.toLowerCase();
          const matchedStudents = (data || []).filter(s => 
            s.name.toLowerCase().includes(q) || 
            s.student_id.toLowerCase().includes(q) ||
            (s.arabic_name && s.arabic_name.includes(q))
          );
          setResults(prev => ({ ...prev, students: matchedStudents.slice(0, 5) }));
        })
        .catch(() => {});

      fetch('/api/programs')
        .then(res => res.json())
        .then(data => {
          const q = query.toLowerCase();
          const matchedPrograms = (data || []).filter(p => 
            p.name.toLowerCase().includes(q) || 
            p.code.toLowerCase().includes(q)
          );
          setResults(prev => ({ ...prev, programs: matchedPrograms.slice(0, 5) }));
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-emerald-500/40 p-4 shadow-2xl bg-slate-900 text-white">
        
        {/* Input Bar */}
        <div className="relative flex items-center mb-4">
          <Search className="absolute left-4 w-5 h-5 text-amber-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, programs, judges..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-10 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-12 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="ml-2 text-slate-400 hover:text-white px-2">
            Cancel
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto space-y-4 pr-1">
          {loading && <div className="text-center text-xs text-amber-400 py-4">Searching database...</div>}

          {!loading && query && results.students.length === 0 && results.programs.length === 0 && (
            <div className="text-center text-xs text-slate-400 py-6">No matching results found for "{query}"</div>
          )}

          {/* Students */}
          {results.students.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                <User className="w-3.5 h-3.5" />
                <span>Students ({results.students.length})</span>
              </h4>
              <div className="space-y-1.5">
                {results.students.map(s => (
                  <div 
                    key={s.id} 
                    onClick={() => { onSelectResult('students', s); onClose(); }}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 cursor-pointer transition border border-slate-700/50"
                  >
                    <div>
                      <span className="text-sm font-bold text-white block">{s.name} ({s.arabic_name || ''})</span>
                      <span className="text-xs text-slate-400 font-mono">{s.student_id} | {s.class_name}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      {s.house_name || 'Green House'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Programs */}
          {results.programs.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Programs ({results.programs.length})</span>
              </h4>
              <div className="space-y-1.5">
                {results.programs.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => { onSelectResult('programs', p); onClose(); }}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 cursor-pointer transition border border-slate-700/50"
                  >
                    <div>
                      <span className="text-sm font-bold text-white block">{p.name}</span>
                      <span className="text-xs text-slate-400 font-mono">{p.code} | {p.category_name || 'Junior'}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
