import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Users, Clock, Edit, Trash2, Award, Trophy, CheckCircle, X, Sparkles, Search } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export default function ProgramManagement() {
  const { user, token } = useAuth();
  const role = user?.role || 'public';
  const isAdmin = ['super_admin', 'admin', 'stage_coordinator'].includes(role);

  const [programs, setPrograms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    code: '',
    name: '',
    category_id: 1,
    type: 'individual',
    venue_id: 1,
    program_date: '2026-08-15',
    start_time: '09:00',
    end_time: '10:30',
    max_participants: 15,
    status: 'pending'
  });

  // Modal & state for adding 1st, 2nd, 3rd winners directly
  const [showWinnersModal, setShowWinnersModal] = useState(false);
  const [targetProgramForWinners, setTargetProgramForWinners] = useState(null);
  const [allStudentsList, setAllStudentsList] = useState([]);
  
  const [winnerSearchInput, setWinnerSearchInput] = useState({
    first: '',
    second: '',
    third: ''
  });
  const [winnersForm, setWinnersForm] = useState({
    first_student_id: '',
    second_student_id: '',
    third_student_id: ''
  });
  const [activeDropdown, setActiveDropdown] = useState(null); // 'first', 'second', 'third' or null
  const [winnersSaving, setWinnersSaving] = useState(false);

  const loadData = () => {
    fetch('/api/programs', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        const backendItems = Array.isArray(data) ? data : [];
        const uniqueMap = new Map();
        backendItems.forEach(p => {
          const key = (p.code || p.name || String(p.id)).toString().trim().toLowerCase();
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, p);
          }
        });
        setPrograms(Array.from(uniqueMap.values()));
      })
      .catch(() => {
        setPrograms([]);
      });

    fetch('/api/categories', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProgram = (e) => {
    e.preventDefault();

    const isEdit = Boolean(formData.id);
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/api/programs/${formData.id}` : '/api/programs';

    fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(() => {
        setShowModal(false);
        loadData();
      })
      .catch(() => {
        setShowModal(false);
        loadData();
      });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to archive this program? The record can be restored anytime from Archive Management.')) {
      setPrograms(prev => prev.filter(p => String(p.id) !== String(id)));

      fetch(`/api/programs/${id}/archive`, { 
        method: 'PUT',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      })
        .then(() => loadData())
        .catch(() => loadData());
    }
  };

  const updateStatus = (id, newStatus) => {
    setPrograms(prev => prev.map(p => String(p.id) === String(id) ? { ...p, status: newStatus } : p));
    fetch(`/api/programs/${id}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ status: newStatus })
    })
      .then(() => loadData())
      .catch(() => {});
  };

  // Open Winners Assignment Modal
  const handleOpenWinnersModal = (program) => {
    setTargetProgramForWinners(program);
    setActiveDropdown(null);

    const existing1st = program.winners?.find(w => w.prize === '1st');
    const existing2nd = program.winners?.find(w => w.prize === '2nd');
    const existing3rd = program.winners?.find(w => w.prize === '3rd');

    const name1st = existing1st?.student_name || existing1st?.student_id || '';
    const name2nd = existing2nd?.student_name || existing2nd?.student_id || '';
    const name3rd = existing3rd?.student_name || existing3rd?.student_id || '';

    setWinnerSearchInput({
      first: name1st,
      second: name2nd,
      third: name3rd
    });

    setWinnersForm({
      first_student_id: existing1st?.student_id || name1st,
      second_student_id: existing2nd?.student_id || name2nd,
      third_student_id: existing3rd?.student_id || name3rd
    });

    fetch('/api/students', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        const backendItems = Array.isArray(data) ? data : [];
        const uniqueMap = new Map();
        backendItems.forEach(s => {
          const key = (s.admission_no || s.student_id || s.name || String(s.id)).toString().trim().toLowerCase();
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, s);
          }
        });
        setAllStudentsList(Array.from(uniqueMap.values()));
      })
      .catch(() => {
        setAllStudentsList([]);
      });

    setShowWinnersModal(true);
  };

  // Save manual winners
  const handleSaveWinners = (e) => {
    e.preventDefault();
    if (!targetProgramForWinners) return;

    setWinnersSaving(true);
    const pId = targetProgramForWinners.id;

    fetch(`/api/results/manual/${pId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(winnersForm)
    })
      .then(res => res.json())
      .then(() => {
        setWinnersSaving(false);
        setShowWinnersModal(false);
        loadData();
      })
      .catch(() => {
        setWinnersSaving(false);
        setShowWinnersModal(false);
        loadData();
      });
  };

  const getFilteredStudents = (query) => {
    const q = (query || '').toLowerCase().trim();
    if (!q) return allStudentsList;
    return allStudentsList.filter(st => (
      st.name?.toLowerCase().includes(q) ||
      st.student_id?.toLowerCase().includes(q) ||
      st.admission_no?.toLowerCase().includes(q) ||
      st.class_name?.toLowerCase().includes(q) ||
      st.house_name?.toLowerCase().includes(q) ||
      String(st.chest_no || '').includes(q)
    ));
  };

  return (
    <div className="space-y-6" onClick={() => setActiveDropdown(null)}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold emerald-gradient-text flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-emerald-600" />
            <span>Program & Competition Items</span>
          </h1>
          <p className="text-xs text-slate-500 font-mono font-bold">
            {isAdmin ? 'Create, edit programs, assign 1st/2nd/3rd winners, and manage live execution status' : 'Browse festival competition categories, schedules, and official winner standings'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setFormData({
                id: null,
                code: `PRG-${Date.now().toString().slice(-4)}`,
                name: '',
                category_id: 1,
                type: 'individual',
                venue_id: 1,
                program_date: '2026-08-15',
                start_time: '09:00',
                end_time: '10:30',
                max_participants: 15,
                status: 'pending'
              });
              setShowModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Program</span>
          </button>
        )}
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map((p) => (
          <div key={p.id} className="glass-panel p-4 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between hover:border-emerald-400 transition shadow-sm">
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                    {p.category_name || 'Category'} • {p.type || 'individual'}
                  </span>

                  {isAdmin && (
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          setFormData({
                            id: p.id,
                            code: p.code || '',
                            name: p.name,
                            category_id: p.category_id || 1,
                            type: p.type || 'individual',
                            venue_id: p.venue_id || 1,
                            program_date: p.program_date || '2026-08-15',
                            start_time: p.start_time || '09:00',
                            end_time: p.end_time || '10:30',
                            max_participants: p.max_participants || 15,
                            status: p.status || 'pending'
                          });
                          setShowModal(true);
                        }}
                        className="p-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                        title="Edit Program"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition"
                        title="Delete Program"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">{p.name}</h3>

                <div className="flex items-center space-x-3 text-xs text-slate-500 font-mono mb-2 font-bold">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{p.start_time || '09:00'} - {p.end_time || '10:30'}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{p.participant_count || 0} / {p.max_participants || 20}</span>
                  </span>
                </div>

                {/* Add 1st, 2nd, 3rd Winners Button (Admin only) */}
                {isAdmin && (
                  <button
                    onClick={() => handleOpenWinnersModal(p)}
                    className="w-full py-1.5 px-3 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold flex items-center justify-center space-x-2 transition shadow-sm mb-2"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-600" />
                    <span>🏆 Add / Edit 1st, 2nd, 3rd Winners</span>
                  </button>
                )}

                {/* Compact Winners Podium */}
                {p.winners && p.winners.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
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

            {/* Status Controls */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Status: {p.status}</span>

              {isAdmin && (
                <div className="flex items-center space-x-1">
                  {p.status !== 'running' && (
                    <button
                      onClick={() => updateStatus(p.id, 'running')}
                      className="px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-[10px] font-bold"
                    >
                      Start Live
                    </button>
                  )}
                  {p.status !== 'completed' && (
                    <button
                      onClick={() => updateStatus(p.id, 'completed')}
                      className="px-2.5 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 text-[10px] font-bold"
                    >
                      Mark Done
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        ))}
      </div>

      {/* Assign 1st, 2nd, 3rd Winners Modal with Searchable Autocomplete Inputs */}
      {showWinnersModal && targetProgramForWinners && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div 
            onClick={e => e.stopPropagation()}
            className="glass-panel p-6 rounded-3xl border border-slate-200 max-w-lg w-full bg-white text-slate-900 shadow-2xl space-y-5"
          >
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-amber-600" />
                  <span>Assign 1st, 2nd, 3rd Winners</span>
                </h3>
                <p className="text-xs text-amber-700 font-bold">{targetProgramForWinners.name}</p>
              </div>
              <button 
                onClick={() => setShowWinnersModal(false)}
                className="p-1 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWinners} className="space-y-4">
              
              {/* 🥇 1st Place Searchable Autocomplete Combobox */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5 relative">
                <label className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                  <span className="text-base">🥇</span>
                  <span>1st Place Winner (10 Points)</span>
                </label>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search or type 1st place student name..."
                    value={winnerSearchInput.first}
                    onFocus={() => setActiveDropdown('first')}
                    onChange={e => {
                      const val = e.target.value;
                      setWinnerSearchInput({ ...winnerSearchInput, first: val });
                      setWinnersForm({ ...winnersForm, first_student_id: val });
                      setActiveDropdown('first');
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none"
                  />
                  {winnerSearchInput.first && (
                    <button
                      type="button"
                      onClick={() => {
                        setWinnerSearchInput({ ...winnerSearchInput, first: '' });
                        setWinnersForm({ ...winnersForm, first_student_id: '' });
                      }}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Floating Autocomplete Suggestions Dropdown */}
                {activeDropdown === 'first' && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto p-1 space-y-0.5">
                    {getFilteredStudents(winnerSearchInput.first).length === 0 ? (
                      <div className="p-2.5 text-[11px] text-slate-500 italic text-center">
                        No matching student found. "{winnerSearchInput.first}" will be added.
                      </div>
                    ) : (
                      getFilteredStudents(winnerSearchInput.first).map(st => (
                        <button
                          key={st.id || st.admission_no}
                          type="button"
                          onClick={() => {
                            setWinnerSearchInput({ ...winnerSearchInput, first: st.name });
                            setWinnersForm({ ...winnersForm, first_student_id: st.id || st.student_id || st.name });
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left p-2 rounded-lg hover:bg-amber-50 text-xs font-bold flex items-center justify-between transition"
                        >
                          <div>
                            <span className="text-slate-900 block font-bold">{st.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{st.class_name} | {st.house_name || 'House'}</span>
                          </div>
                          <span className="text-[10px] font-mono text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            #{st.chest_no || st.admission_no}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* 🥈 2nd Place Searchable Autocomplete Combobox */}
              <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <span className="text-base">🥈</span>
                  <span>2nd Place Winner (7 Points)</span>
                </label>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search or type 2nd place student name..."
                    value={winnerSearchInput.second}
                    onFocus={() => setActiveDropdown('second')}
                    onChange={e => {
                      const val = e.target.value;
                      setWinnerSearchInput({ ...winnerSearchInput, second: val });
                      setWinnersForm({ ...winnersForm, second_student_id: val });
                      setActiveDropdown('second');
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                  />
                  {winnerSearchInput.second && (
                    <button
                      type="button"
                      onClick={() => {
                        setWinnerSearchInput({ ...winnerSearchInput, second: '' });
                        setWinnersForm({ ...winnersForm, second_student_id: '' });
                      }}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Floating Autocomplete Suggestions Dropdown */}
                {activeDropdown === 'second' && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto p-1 space-y-0.5">
                    {getFilteredStudents(winnerSearchInput.second).length === 0 ? (
                      <div className="p-2.5 text-[11px] text-slate-500 italic text-center">
                        No matching student found. "{winnerSearchInput.second}" will be added.
                      </div>
                    ) : (
                      getFilteredStudents(winnerSearchInput.second).map(st => (
                        <button
                          key={st.id || st.admission_no}
                          type="button"
                          onClick={() => {
                            setWinnerSearchInput({ ...winnerSearchInput, second: st.name });
                            setWinnersForm({ ...winnersForm, second_student_id: st.id || st.student_id || st.name });
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-100 text-xs font-bold flex items-center justify-between transition"
                        >
                          <div>
                            <span className="text-slate-900 block font-bold">{st.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{st.class_name} | {st.house_name || 'House'}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            #{st.chest_no || st.admission_no}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* 🥉 3rd Place Searchable Autocomplete Combobox */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1.5 relative">
                <label className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                  <span className="text-base">🥉</span>
                  <span>3rd Place Winner (5 Points)</span>
                </label>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search or type 3rd place student name..."
                    value={winnerSearchInput.third}
                    onFocus={() => setActiveDropdown('third')}
                    onChange={e => {
                      const val = e.target.value;
                      setWinnerSearchInput({ ...winnerSearchInput, third: val });
                      setWinnersForm({ ...winnersForm, third_student_id: val });
                      setActiveDropdown('third');
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none"
                  />
                  {winnerSearchInput.third && (
                    <button
                      type="button"
                      onClick={() => {
                        setWinnerSearchInput({ ...winnerSearchInput, third: '' });
                        setWinnersForm({ ...winnersForm, third_student_id: '' });
                      }}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Floating Autocomplete Suggestions Dropdown */}
                {activeDropdown === 'third' && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto p-1 space-y-0.5">
                    {getFilteredStudents(winnerSearchInput.third).length === 0 ? (
                      <div className="p-2.5 text-[11px] text-slate-500 italic text-center">
                        No matching student found. "{winnerSearchInput.third}" will be added.
                      </div>
                    ) : (
                      getFilteredStudents(winnerSearchInput.third).map(st => (
                        <button
                          key={st.id || st.admission_no}
                          type="button"
                          onClick={() => {
                            setWinnerSearchInput({ ...winnerSearchInput, third: st.name });
                            setWinnersForm({ ...winnersForm, third_student_id: st.id || st.student_id || st.name });
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left p-2 rounded-lg hover:bg-amber-50 text-xs font-bold flex items-center justify-between transition"
                        >
                          <div>
                            <span className="text-slate-900 block font-bold">{st.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{st.class_name} | {st.house_name || 'House'}</span>
                          </div>
                          <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                            #{st.chest_no || st.admission_no}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowWinnersModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={winnersSaving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center space-x-2 transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{winnersSaving ? 'Saving Winners...' : 'Save & Publish Winners'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Program Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 max-w-lg w-full bg-white text-slate-900 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">
                {formData.id ? 'Edit Program' : 'Create New Program'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold text-slate-700">
              
              <div>
                <label className="block mb-1 text-slate-900 font-bold">Program Code</label>
                <input 
                  type="text"
                  required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. PRG-101"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-900 font-bold">Program Name / Title</label>
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. Quran Recitation (Tilawat)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-900 font-bold">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={e => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-900 font-bold">Competition Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="individual">Individual</option>
                    <option value="group">Group</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-900 font-bold">Start Time</label>
                  <input 
                    type="time"
                    value={formData.start_time}
                    onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-900 font-bold">End Time</label>
                  <input 
                    type="time"
                    value={formData.end_time}
                    onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold border border-slate-200"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md transition"
                >
                  {formData.id ? 'Save Changes' : 'Create Program'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
