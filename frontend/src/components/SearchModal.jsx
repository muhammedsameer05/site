import React, { useState, useEffect } from 'react';
import { Search, X, User, Calendar, Trophy, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SearchModal({ isOpen, onClose, onSelectResult }) {
  const { user, token } = useAuth();
  const role = user?.role || 'public';
  const isAdmin = ['super_admin', 'admin', 'stage_coordinator'].includes(role);

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
      // Perform client side search fetch for students only if admin
      if (isAdmin) {
        fetch('/api/students', {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        })
          .then(res => res.json())
          .then(data => {
            const q = query.toLowerCase();
            const matchedStudents = (data || []).filter(s => 
              s.name?.toLowerCase().includes(q) || 
              s.student_id?.toLowerCase().includes(q) ||
              (s.arabic_name && s.arabic_name.includes(q))
            );
            setResults(prev => ({ ...prev, students: matchedStudents.slice(0, 5) }));
          })
          .catch(() => {});
      } else {
        setResults(prev => ({ ...prev, students: [] }));
      }

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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-200 p-4 shadow-2xl bg-white text-slate-900">
        
        {/* Input Bar */}
        <div className="relative flex items-center mb-4">
          <Search className="absolute left-4 w-5 h-5 text-emerald-600" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, programs, judges..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-12 pr-10 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-14 text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="ml-2 text-slate-500 hover:text-slate-900 font-bold px-2 text-xs">
            Cancel
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto space-y-4 pr-1">
          {loading && <div className="text-center text-xs text-emerald-700 font-bold py-4">Searching database...</div>}

          {!loading && query && results.students.length === 0 && results.programs.length === 0 && (
            <div className="text-center text-xs text-slate-500 py-6">No matching results found for "{query}"</div>
          )}

          {/* Students */}
          {results.students.length > 0 && (
            <div>
              <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider mb-2 flex items-center space-x-1 font-mono">
                <User className="w-3.5 h-3.5" />
                <span>Students ({results.students.length})</span>
              </h4>
              <div className="space-y-1.5">
                {results.students.map(s => (
                  <div 
                    key={s.id} 
                    onClick={() => { onSelectResult('students', s); onClose(); }}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50/60 cursor-pointer transition border border-slate-200"
                  >
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">{s.name} ({s.arabic_name || ''})</span>
                      <span className="text-xs text-slate-500 font-mono">{s.student_id} | {s.class_name}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
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
              <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider mb-2 flex items-center space-x-1 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>Programs ({results.programs.length})</span>
              </h4>
              <div className="space-y-1.5">
                {results.programs.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => { onSelectResult('programs', p); onClose(); }}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50/60 cursor-pointer transition border border-slate-200"
                  >
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">{p.name}</span>
                      <span className="text-xs text-slate-500 font-mono">{p.code} | {p.category_name || 'Junior'}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
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
