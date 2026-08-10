import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Users, Clock, Edit, Trash2, Award, Trophy, CheckCircle, X, Sparkles, Search } from 'lucide-react';

export default function ProgramManagement() {
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
  const [winnerSearch, setWinnerSearch] = useState('');
  const [winnersForm, setWinnersForm] = useState({
    first_student_id: '',
    second_student_id: '',
    third_student_id: ''
  });
  const [winnersSaving, setWinnersSaving] = useState(false);

  const loadData = () => {
    fetch('/api/programs')
      .then(res => res.json())
      .then(data => {
        const backendItems = Array.isArray(data) ? data : [];
        const customItems = JSON.parse(localStorage.getItem('milad_custom_programs') || '[]');
        const deletedIds = JSON.parse(localStorage.getItem('milad_deleted_program_ids') || '[]');

        const filteredBackend = backendItems.filter(p => !deletedIds.includes(String(p.id)));
        const filteredCustom = customItems.filter(p => !deletedIds.includes(String(p.id)));

        const merged = [...filteredCustom, ...filteredBackend];
        const unique = Array.from(new Map(merged.map(p => [String(p.id || p.code), p])).values());
        setPrograms(unique);
        localStorage.setItem('milad_cached_programs', JSON.stringify(unique));
      })
      .catch(() => {
        const cached = JSON.parse(localStorage.getItem('milad_cached_programs') || '[]');
        setPrograms(cached);
      });

    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    const isEdit = !!formData.id;
    const progObj = {
      ...formData,
      id: formData.id || Date.now(),
      code: formData.code || `PRG-${Date.now().toString().slice(-4)}`
    };

    // Save to local storage immediately
    const customItems = JSON.parse(localStorage.getItem('milad_custom_programs') || '[]');
    let updatedCustom;
    if (isEdit) {
      updatedCustom = customItems.map(p => String(p.id) === String(progObj.id) ? progObj : p);
    } else {
      updatedCustom = [progObj, ...customItems];
    }
    localStorage.setItem('milad_custom_programs', JSON.stringify(updatedCustom));

    setPrograms(prev => {
      const filtered = prev.filter(p => String(p.id) !== String(progObj.id));
      return [progObj, ...filtered];
    });

    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/api/programs/${formData.id}` : '/api/programs';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progObj)
    })
      .then(res => res.json())
      .then(() => {
        setShowModal(false);
        setFormData({ id: null, code: '', name: '', category_id: 1, type: 'individual', venue_id: 1, program_date: '2026-08-15', start_time: '09:00', end_time: '10:30', max_participants: 15, status: 'pending' });
        loadData();
      })
      .catch(() => {
        setShowModal(false);
        setFormData({ id: null, code: '', name: '', category_id: 1, type: 'individual', venue_id: 1, program_date: '2026-08-15', start_time: '09:00', end_time: '10:30', max_participants: 15, status: 'pending' });
      });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      const deletedIds = JSON.parse(localStorage.getItem('milad_deleted_program_ids') || '[]');
      if (!deletedIds.includes(String(id))) {
        deletedIds.push(String(id));
        localStorage.setItem('milad_deleted_program_ids', JSON.stringify(deletedIds));
      }

      const customItems = JSON.parse(localStorage.getItem('milad_custom_programs') || '[]');
      const filteredCustom = customItems.filter(p => String(p.id) !== String(id));
      localStorage.setItem('milad_custom_programs', JSON.stringify(filteredCustom));

      setPrograms(prev => prev.filter(p => String(p.id) !== String(id)));

      fetch(`/api/programs/${id}`, { method: 'DELETE' })
        .then(() => loadData())
        .catch(() => {});
    }
  };

  const updateStatus = (id, newStatus) => {
    setPrograms(prev => prev.map(p => String(p.id) === String(id) ? { ...p, status: newStatus } : p));
    fetch(`/api/programs/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then(() => loadData())
      .catch(() => {});
  };

  // Open Winners Assignment Modal
  const handleOpenWinnersModal = (program) => {
    setTargetProgramForWinners(program);
    setWinnerSearch('');

    const existing1st = program.winners?.find(w => w.prize === '1st')?.student_name || program.winners?.find(w => w.prize === '1st')?.student_id || '';
    const existing2nd = program.winners?.find(w => w.prize === '2nd')?.student_name || program.winners?.find(w => w.prize === '2nd')?.student_id || '';
    const existing3rd = program.winners?.find(w => w.prize === '3rd')?.student_name || program.winners?.find(w => w.prize === '3rd')?.student_id || '';

    setWinnersForm({
      first_student_id: existing1st,
      second_student_id: existing2nd,
      third_student_id: existing3rd
    });

    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        const backendItems = Array.isArray(data) ? data : [];
        const customItems = JSON.parse(localStorage.getItem('milad_custom_students') || '[]');
        const deletedIds = JSON.parse(localStorage.getItem('milad_deleted_student_ids') || '[]');

        const filteredBackend = backendItems.filter(s => !deletedIds.includes(String(s.id)));
        const filteredCustom = customItems.filter(s => !deletedIds.includes(String(s.id)));

        const merged = [...filteredCustom, ...filteredBackend];
        const unique = Array.from(new Map(merged.map(s => [String(s.id || s.admission_no), s])).values());
        setAllStudentsList(unique);
      })
      .catch(() => {
        const cached = JSON.parse(localStorage.getItem('milad_cached_students') || '[]');
        setAllStudentsList(cached);
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

  const filteredStudentsForWinners = allStudentsList.filter(st => {
    const q = winnerSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      st.name?.toLowerCase().includes(q) ||
      st.student_id?.toLowerCase().includes(q) ||
      st.admission_no?.toLowerCase().includes(q) ||
      st.class_name?.toLowerCase().includes(q) ||
      st.house_name?.toLowerCase().includes(q) ||
      String(st.chest_no || '').includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold emerald-gradient-text flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-amber-400" />
            <span>Program & Competition Management</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">Create, edit programs, assign 1st/2nd/3rd winners, and manage live execution status</p>
        </div>

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
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Program</span>
        </button>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map((p) => (
          <div key={p.id} className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-amber-400/40 transition relative">
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  p.status === 'running' 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-400/40 animate-pulse'
                    : p.status === 'completed'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {p.status}
                </span>

                <div className="flex items-center space-x-2">
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
                    className="p-1.5 rounded bg-slate-800 text-amber-400 hover:bg-slate-700 transition"
                    title="Edit Program"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 rounded bg-red-950/60 text-red-400 hover:bg-red-900 transition"
                    title="Delete Program"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{p.name}</h3>
              <p className="text-xs text-emerald-400 font-semibold mb-3">
                {p.category_name || 'Category'} | <span className="capitalize font-bold text-amber-300">{p.type || 'individual'}</span>
              </p>

              <div className="space-y-1 text-xs text-slate-400 font-mono border-t border-slate-800/80 pt-3 mb-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{p.start_time || '09:00'} - {p.end_time || '10:30'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{p.participant_count || 0} / {p.max_participants || 20} Participants</span>
                </div>
              </div>

              {/* Add 1st, 2nd, 3rd Winners Button */}
              <button
                onClick={() => handleOpenWinnersModal(p)}
                className="w-full mb-3 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/30 hover:from-amber-500/30 hover:to-amber-600/40 text-amber-300 border border-amber-400/50 text-xs font-bold flex items-center justify-center space-x-2 transition shadow-sm"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>🏆 Add / Edit 1st, 2nd, 3rd Winners</span>
              </button>

              {/* Winners Podium Display */}
              {p.winners && p.winners.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-400/40 space-y-2">
                  <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-400 border-b border-slate-800 pb-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Official Winners Podium</span>
                  </div>
                  {p.winners.map((w, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          w.prize === '1st' ? 'bg-amber-500 text-slate-950 shadow' :
                          w.prize === '2nd' ? 'bg-slate-300 text-slate-950 shadow' :
                          'bg-amber-700 text-white shadow'
                        }`}>
                          {w.prize === '1st' ? '🥇 1st' : w.prize === '2nd' ? '🥈 2nd' : '🥉 3rd'}
                        </span>
                        <span className="text-white font-bold">{w.student_name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded border" style={{ color: w.house_color || '#10b981', borderColor: `${w.house_color || '#10b981'}80` }}>
                          {w.house_name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Status Controls */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Status: {p.status}</span>

              <div className="flex items-center space-x-1">
                {p.status !== 'running' && (
                  <button
                    onClick={() => updateStatus(p.id, 'running')}
                    className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[10px] font-bold"
                  >
                    Start Live
                  </button>
                )}
                {p.status !== 'completed' && (
                  <button
                    onClick={() => updateStatus(p.id, 'completed')}
                    className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold"
                  >
                    Mark Done
                  </button>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Assign 1st, 2nd, 3rd Winners Modal with Live Search & Custom Name Input */}
      {showWinnersModal && targetProgramForWinners && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel p-6 rounded-3xl border border-amber-500/50 max-w-lg w-full bg-slate-900 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>Assign 1st, 2nd, 3rd Winners</span>
                </h3>
                <p className="text-xs text-amber-300 font-bold">{targetProgramForWinners.name}</p>
              </div>
              <button 
                onClick={() => setShowWinnersModal(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search student by name, ID, class, or house..."
                value={winnerSearch}
                onChange={e => setWinnerSearch(e.target.value)}
                className="w-full bg-slate-950 border border-amber-400/40 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <form onSubmit={handleSaveWinners} className="space-y-4">
              
              {/* 🥇 1st Place Selector & Custom Name */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/40 space-y-2">
                <label className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                  <span className="text-base">🥇</span>
                  <span>1st Place Winner (10 Points)</span>
                </label>
                
                <select
                  value={winnersForm.first_student_id}
                  onChange={e => setWinnersForm({ ...winnersForm, first_student_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-amber-400"
                >
                  <option value="">-- Select 1st Place Student from List --</option>
                  {filteredStudentsForWinners.map(st => (
                    <option key={st.id || st.admission_no} value={st.id || st.student_id}>
                      {st.name} ({st.class_name} | {st.house_name || 'House'})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Or type custom student name directly..."
                  value={winnersForm.first_student_id}
                  onChange={e => setWinnersForm({ ...winnersForm, first_student_id: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-amber-200 placeholder-slate-500 font-semibold"
                />
              </div>

              {/* 🥈 2nd Place Selector & Custom Name */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-600/40 space-y-2">
                <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                  <span className="text-base">🥈</span>
                  <span>2nd Place Winner (7 Points)</span>
                </label>
                
                <select
                  value={winnersForm.second_student_id}
                  onChange={e => setWinnersForm({ ...winnersForm, second_student_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-amber-400"
                >
                  <option value="">-- Select 2nd Place Student from List --</option>
                  {filteredStudentsForWinners.map(st => (
                    <option key={st.id || st.admission_no} value={st.id || st.student_id}>
                      {st.name} ({st.class_name} | {st.house_name || 'House'})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Or type custom student name directly..."
                  value={winnersForm.second_student_id}
                  onChange={e => setWinnersForm({ ...winnersForm, second_student_id: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-semibold"
                />
              </div>

              {/* 🥉 3rd Place Selector & Custom Name */}
              <div className="p-3.5 rounded-2xl bg-amber-900/20 border border-amber-700/40 space-y-2">
                <label className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                  <span className="text-base">🥉</span>
                  <span>3rd Place Winner (5 Points)</span>
                </label>
                
                <select
                  value={winnersForm.third_student_id}
                  onChange={e => setWinnersForm({ ...winnersForm, third_student_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-amber-400"
                >
                  <option value="">-- Select 3rd Place Student from List --</option>
                  {filteredStudentsForWinners.map(st => (
                    <option key={st.id || st.admission_no} value={st.id || st.student_id}>
                      {st.name} ({st.class_name} | {st.house_name || 'House'})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Or type custom student name directly..."
                  value={winnersForm.third_student_id}
                  onChange={e => setWinnersForm({ ...winnersForm, third_student_id: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-amber-200 placeholder-slate-500 font-semibold"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowWinnersModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={winnersSaving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-lg flex items-center space-x-2"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel p-6 rounded-3xl border border-emerald-500/40 max-w-lg w-full bg-slate-900 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {formData.id ? 'Edit Program' : 'Create New Program'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold text-slate-300">
              
              <div>
                <label className="block mb-1">Program Code</label>
                <input 
                  type="text"
                  required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  placeholder="e.g. PRG-101"
                />
              </div>

              <div>
                <label className="block mb-1">Program Name / Title</label>
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                  placeholder="e.g. Quran Recitation (Tilawat)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={e => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Competition Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="individual">Individual</option>
                    <option value="group">Group</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Start Time</label>
                  <input 
                    type="time"
                    value={formData.start_time}
                    onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block mb-1">End Time</label>
                  <input 
                    type="time"
                    value={formData.end_time}
                    onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg"
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
