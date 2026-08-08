import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit, Award, Trophy, Users, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function HouseManagement() {
  const { user } = useAuth();
  const isAdmin = ['super_admin', 'admin'].includes(user?.role);

  const [houses, setHouses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingHouseId, setEditingHouseId] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    color_hex: '#10B981',
    motto: '',
    captain_name: ''
  });

  const loadHouses = () => {
    fetch('/api/houses')
      .then(res => res.json())
      .then(data => setHouses(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    loadHouses();
  }, []);

  const openCreateModal = () => {
    setEditingHouseId(null);
    setFormData({ code: `H-${Date.now().toString().slice(-3)}`, name: '', color_hex: '#10B981', motto: '', captain_name: '' });
    setShowModal(true);
  };

  const openEditModal = (house) => {
    setEditingHouseId(house.id);
    setFormData({
      code: house.code,
      name: house.name,
      color_hex: house.color_hex || '#10B981',
      motto: house.motto || '',
      captain_name: house.captain_name || ''
    });
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const method = editingHouseId ? 'PUT' : 'POST';
    const url = editingHouseId ? `/api/houses/${editingHouseId}` : '/api/houses';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(() => {
        setShowModal(false);
        setEditingHouseId(null);
        loadHouses();
      });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold emerald-gradient-text flex items-center space-x-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <span>Madrasa House Standings (2 Main Houses)</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">Customize house names, mottoes, theme colors, and view real-time point standings</p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Additional House</span>
          </button>
        )}
      </div>

      {/* Houses Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {houses.map((house, idx) => (
          <div 
            key={house.id}
            className="glass-panel p-6 sm:p-8 rounded-3xl border-2 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-2xl relative overflow-hidden flex flex-col justify-between"
            style={{ borderColor: `${house.color_hex}90` }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20" style={{ backgroundColor: house.color_hex }} />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg"
                    style={{ backgroundColor: house.color_hex }}
                  >
                    #{idx + 1}
                  </span>
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {house.code}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => openEditModal(house)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-amber-400/40 text-amber-300 hover:bg-slate-700 text-xs font-bold transition shadow"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit House Name</span>
                  </button>
                )}
              </div>

              <h3 className="text-3xl font-black text-white mb-1 tracking-tight" style={{ color: house.color_hex }}>
                {house.name}
              </h3>
              <p className="text-xs text-slate-300 italic mb-6">"{house.motto || 'Faith & Dedication'}"</p>

              <div className="text-xs text-slate-400 space-y-2 mb-6 border-t border-slate-800 pt-4">
                <div className="flex justify-between">
                  <span>House Captain:</span>
                  <span className="font-bold text-slate-200">{house.captain_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Enrolled Students:</span>
                  <span className="font-bold text-emerald-400">{house.student_count || 0} Students</span>
                </div>
              </div>
            </div>

            {/* Medals & Score */}
            <div>
              <div className="grid grid-cols-3 gap-2 py-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-center mb-4">
                <div>
                  <span className="text-[10px] text-amber-400 font-bold block">🥇 GOLD</span>
                  <span className="text-lg font-black text-white font-mono">{house.gold || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-300 font-bold block">🥈 SILVER</span>
                  <span className="text-lg font-black text-white font-mono">{house.silver || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-600 font-bold block">🥉 BRONZE</span>
                  <span className="text-lg font-black text-white font-mono">{house.bronze || 0}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <span className="text-xs font-bold text-slate-400">Total Championship Points</span>
                <span className="text-4xl font-black gold-gradient-text font-mono">{house.total_points || 0}</span>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Edit / Create House Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-amber-400/40 p-6 shadow-2xl bg-slate-900 text-white">
            <h3 className="text-lg font-bold emerald-gradient-text mb-4">
              {editingHouseId ? 'Edit House Details' : 'Create New House'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">House Name (Editable)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Abu Bakr House / Green House"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">House Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">House Theme Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.color_hex}
                    onChange={e => setFormData({ ...formData, color_hex: e.target.value })}
                    className="w-12 h-10 bg-slate-800 border border-slate-700 rounded-xl p-1 cursor-pointer"
                  />
                  <span className="font-mono text-slate-300 font-bold">{formData.color_hex}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">House Motto</label>
                <input
                  type="text"
                  value={formData.motto}
                  onChange={e => setFormData({ ...formData, motto: e.target.value })}
                  placeholder="Knowledge, Faith, and Virtue"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">House Captain Name</label>
                <input
                  type="text"
                  value={formData.captain_name}
                  onChange={e => setFormData({ ...formData, captain_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl glass-panel text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black"
                >
                  Save House Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
