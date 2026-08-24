import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit, Award, Trophy, Users, CheckCircle, X } from 'lucide-react';
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

  const [adjustingHouseId, setAdjustingHouseId] = useState(null);
  const [adjustPoints, setAdjustPoints] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  const loadHouses = () => {
    fetch('/api/houses')
      .then(res => res.json())
      .then(data => setHouses(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    loadHouses();
  }, []);

  const handleAdjustPoints = async (houseId, pts, reason) => {
    try {
      const res = await fetch(`/api/houses/${houseId}/adjust-points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: Number(pts), reason: reason || 'Admin Live House Scoring' })
      });
      if (res.ok) {
        loadHouses();
        setAdjustingHouseId(null);
        setAdjustPoints('');
        setAdjustReason('');
      } else {
        const err = await res.json();
        alert(`Error adjusting points: ${err.error || 'Failed'}`);
      }
    } catch (err) {
      alert(`Error adjusting points: ${err.message}`);
    }
  };

  const openCreateModal = () => {
    setEditingHouseId(null);
    setFormData({ code: `H-${Date.now().toString().slice(-3)}`, name: '', color_hex: '#10B981', motto: '', captain_name: '', total_points: 0 });
    setShowModal(true);
  };

  const openEditModal = (house) => {
    setEditingHouseId(house.id);
    setFormData({
      code: house.code,
      name: house.name,
      color_hex: house.color_hex || '#10B981',
      motto: house.motto || '',
      captain_name: house.captain_name || '',
      total_points: house.total_points !== undefined ? house.total_points : 0
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
      .then((data) => {
        if (data.error) {
          alert(`Error saving house: ${data.error}`);
        } else {
          setShowModal(false);
          setEditingHouseId(null);
          loadHouses();
        }
      })
      .catch(err => {
        alert(`Error saving house: ${err.message}`);
      });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold emerald-gradient-text flex items-center space-x-2">
            <Shield className="w-6 h-6 text-emerald-600" />
            <span>Madrasa House Standings (2 Main Houses)</span>
          </h1>
          <p className="text-xs text-slate-500 font-mono font-bold">Customize house names, mottoes, theme colors, and view real-time point standings</p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition"
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
            className="glass-panel p-6 sm:p-8 rounded-3xl border-2 bg-white shadow-sm relative overflow-hidden flex flex-col justify-between"
            style={{ borderColor: `${house.color_hex}90` }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-10" style={{ backgroundColor: house.color_hex }} />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-md"
                    style={{ backgroundColor: house.color_hex }}
                  >
                    #{idx + 1}
                  </span>
                </div>

                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(house);
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 hover:bg-emerald-100 text-xs font-bold transition shadow-xs"
                  >
                    <Edit className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Edit House & Points</span>
                  </button>
                )}
              </div>

              <h3 className="text-3xl font-black mb-1 tracking-tight" style={{ color: house.color_hex }}>
                {house.name}
              </h3>
              <p className="text-xs text-slate-500 italic mb-6 font-medium">"{house.motto || 'Faith & Dedication'}"</p>

              <div className="text-xs text-slate-600 font-medium space-y-2 mb-6 border-t border-slate-200 pt-4">
                <div className="flex justify-between">
                  <span>House Captain:</span>
                  <span className="font-bold text-slate-800">{house.captain_name || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Score Display */}
            <div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-600">Total Championship Points</span>
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(house);
                      }}
                      className="p-1 px-2 rounded bg-amber-100 text-amber-900 hover:bg-amber-200 transition text-[10px] font-extrabold border border-amber-300 flex items-center space-x-1 shadow-xs"
                      title="Edit Points"
                    >
                      <Edit className="w-3 h-3 text-amber-700" />
                      <span>Edit Points</span>
                    </button>
                  )}
                </div>
                <span className="text-4xl font-black emerald-gradient-text font-mono">{house.total_points || 0}</span>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Edit / Create House Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[88vh] text-slate-900 animate-scale-up">
              {/* Header Banner matching screenshot theme */}
              <div 
                className="p-6 text-white flex items-center justify-between transition-all"
                style={{ backgroundColor: formData.color_hex || '#10B981' }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl border border-white/30">
                    <Shield className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">
                      {editingHouseId ? 'Edit House Details & Points' : 'Create New House'}
                    </h2>
                    <p className="text-xs font-mono font-bold text-white/80">
                      {editingHouseId ? `Code: #${formData.code || editingHouseId}` : 'Create a main competition team house'}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowModal(false)}
                  className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-5 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">House Name (Editable)</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Abu Bakr House / Green House"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-bold text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">
                    🏆 Total Championship Points (Admin Edit)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.total_points !== undefined ? formData.total_points : 0}
                    onChange={e => setFormData({ ...formData, total_points: parseInt(e.target.value) || 0 })}
                    placeholder="e.g. 15"
                    className="w-full bg-amber-50/70 border border-amber-300 rounded-xl p-3 text-slate-900 font-black text-lg focus:outline-none focus:border-amber-500 shadow-xs"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Admins can directly edit or adjust this house's total championship points score.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">House Theme Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.color_hex}
                      onChange={e => setFormData({ ...formData, color_hex: e.target.value })}
                      className="w-12 h-10 bg-slate-50 border border-slate-300 rounded-xl p-1 cursor-pointer"
                    />
                    <span className="font-mono text-slate-700 font-bold">{formData.color_hex}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">House Motto</label>
                  <input
                    type="text"
                    value={formData.motto}
                    onChange={e => setFormData({ ...formData, motto: e.target.value })}
                    placeholder="Knowledge, Faith, and Virtue"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">House Captain Name</label>
                  <input
                    type="text"
                    value={formData.captain_name}
                    onChange={e => setFormData({ ...formData, captain_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 font-extrabold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold shadow-lg transition"
                  >
                    Save House Details
                  </button>
                </div>
              </form>
            </div>
        </div>
      )}

    </div>
  );
}
