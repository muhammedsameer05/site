import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Users, Award, Play, CheckCircle, Clock, MapPin, Edit, Trash2 } from 'lucide-react';

export default function ProgramManagement() {
  const [programs, setPrograms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category_id: 1,
    age_group: 'Junior',
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

    fetch('/api/venues')
      .then(res => res.json())
      .then(data => setVenues(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    fetch('/api/programs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(() => {
        setShowModal(false);
        setFormData({ code: '', name: '', category_id: 1, age_group: 'Junior', type: 'individual', venue_id: 1, program_date: '2026-08-15', start_time: '09:00', end_time: '10:30', max_participants: 15, status: 'pending' });
        loadData();
      });
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
          <p className="text-xs text-slate-400 font-mono">Create programs, allocate venues, assign judges, and manage live execution status</p>
        </div>

        <button
          onClick={() => {
            setFormData({ code: `PRG-${100 + programs.length + 1}`, name: '', category_id: 1, age_group: 'Junior', type: 'individual', venue_id: 1, program_date: '2026-08-15', start_time: '09:00', end_time: '10:30', max_participants: 15, status: 'pending' });
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
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                  {p.code}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  p.status === 'running' 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-400/40 animate-pulse'
                    : p.status === 'completed'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {p.status}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{p.name}</h3>
              <p className="text-xs text-emerald-400 font-semibold mb-3">
                {p.category_name || 'Category'} | {p.age_group} ({p.type})
              </p>

              <div className="space-y-1 text-xs text-slate-400 font-mono border-t border-slate-800/80 pt-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{p.venue_name || 'Auditorium Main Stage'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{p.start_time || '09:00'} - {p.end_time || '10:30'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{p.participant_count || 0} / {p.max_participants || 20} Participants</span>
                </div>
              </div>
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

      {/* Create Program Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-amber-400/40 p-6 shadow-2xl bg-slate-900 text-white">
            <h3 className="text-lg font-bold emerald-gradient-text mb-4">Create New Program</h3>
            
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Program Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
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
                <label className="block text-slate-400 mb-1">Age Group</label>
                <select
                  value={formData.age_group}
                  onChange={e => setFormData({ ...formData, age_group: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="Kids">Kids (Class 1-3)</option>
                  <option value="Sub Junior">Sub Junior (Class 4-6)</option>
                  <option value="Junior">Junior (Class 7-9)</option>
                  <option value="Senior">Senior (Class 10+)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Venue Stage</label>
                <select
                  value={formData.venue_id}
                  onChange={e => setFormData({ ...formData, venue_id: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  {venues.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
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

              <div className="col-span-2 flex justify-end space-x-3 pt-2">
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
                  Create Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
