import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Users, Clock, Edit, Trash2, Award } from 'lucide-react';

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

  const loadData = () => {
    fetch('/api/programs')
      .then(res => res.json())
      .then(data => setPrograms(Array.isArray(data) ? data : []))
      .catch(() => {});

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
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id ? `/api/programs/${formData.id}` : '/api/programs';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(() => {
        setShowModal(false);
        setFormData({ id: null, code: '', name: '', category_id: 1, type: 'individual', venue_id: 1, program_date: '2026-08-15', start_time: '09:00', end_time: '10:30', max_participants: 15, status: 'pending' });
        loadData();
      });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      fetch(`/api/programs/${id}`, { method: 'DELETE' })
        .then(() => loadData());
    }
  };

  const updateStatus = (id, newStatus) => {
    fetch(`/api/programs/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).then(() => loadData());
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold emerald-gradient-text flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-amber-400" />
            <span>Program & Competition Management</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">Create, edit programs, assign judges, and manage live execution status</p>
        </div>

        <button
          onClick={() => {
            setFormData({ id: null, code: `PRG-${100 + programs.length + 1}`, name: '', category_id: 1, type: 'individual', venue_id: 1, program_date: '2026-08-15', start_time: '09:00', end_time: '10:30', max_participants: 15, status: 'pending' });
            setShowModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Program</span>
        </button>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map((p) => (
          <div key={p.id} className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-amber-400/40 transition">
            
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
                  {/* Edit & Delete Action Icons */}
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

              <div className="space-y-1 text-xs text-slate-400 font-mono border-t border-slate-800/80 pt-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{p.start_time || '09:00'} - {p.end_time || '10:30'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{p.participant_count || 0} / {p.max_participants || 20} Participants</span>
                </div>
              </div>

              {/* Winners Podium Display */}
              {p.winners && p.winners.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-amber-400/40 space-y-2">
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
              <span className="text-[11px] text-slate-400">Judges: {p.assigned_judges?.length || 0}</span>

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

      {/* Create / Edit Program Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-amber-400/40 p-6 shadow-2xl bg-slate-900 text-white my-8">
            <h3 className="text-lg font-bold emerald-gradient-text mb-4">
              {formData.id ? 'Edit Program Details' : 'Create New Program'}
            </h3>
            
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4 text-xs">
              <div className="col-span-2">
                <label className="block text-slate-400 mb-1">Program Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Quran Recitation"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <select
                  value={formData.category_id}
                  onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Event Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-semibold capitalize"
                >
                  <option value="individual">Individual</option>
                  <option value="group">Group</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Max Participants</label>
                <input
                  type="number"
                  value={formData.max_participants}
                  onChange={e => setFormData({ ...formData, max_participants: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Execution Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
                >
                  <option value="pending">Pending</option>
                  <option value="running">Running (Live)</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Start Time</label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">End Time</label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="col-span-2 flex justify-end space-x-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl glass-panel text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                >
                  {formData.id ? 'Save Program Changes' : 'Create Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
