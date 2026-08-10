import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit, Award, Trophy, Users, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import HouseBreakdownModal from '../components/HouseBreakdownModal';

export default function HouseManagement() {
  const { user } = useAuth();
  const isAdmin = ['super_admin', 'admin'].includes(user?.role);

  const [houses, setHouses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingHouseId, setEditingHouseId] = useState(null);
  const [selectedHouseObj, setSelectedHouseObj] = useState(null);
  
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
            onClick={() => setSelectedHouseObj(house)}
            className="glass-panel p-6 sm:p-8 rounded-3xl border-2 bg-white shadow-sm relative overflow-hidden flex flex-col justify-between cursor-pointer hover:shadow-xl transition-all duration-300 group"
            style={{ borderColor: `${house.color_hex}90` }}
            title="Click to view full house score breakdown & winner results"
          >
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-10" style={{ backgroundColor: house.color_hex }} />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-md transition-transform duration-300 group-hover:scale-110"
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
                    <span>Edit House Name</span>
                  </button>
                )}
              </div>

              <h3 className="text-3xl font-black mb-1 tracking-tight group-hover:underline" style={{ color: house.color_hex }}>
                {house.name}
              </h3>
              <p className="text-xs text-slate-500 italic mb-6 font-medium">"{house.motto || 'Faith & Dedication'}"</p>

              <div className="text-xs text-slate-600 font-medium space-y-2 mb-6 border-t border-slate-200 pt-4">
                <div className="flex justify-between">
                  <span>House Captain:</span>
                  <span className="font-bold text-slate-800">{house.captain_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Enrolled Students:</span>
                  <span className="font-bold text-emerald-700">{house.student_count || 0} Students</span>
                </div>
              </div>
            </div>

            {/* Medals & Score */}
            <div>
              <div className="grid grid-cols-3 gap-2 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-center mb-4">
                <div>
                  <span className="text-[10px] text-amber-700 font-extrabold block">🥇 GOLD</span>
                  <span className="text-lg font-black text-slate-900 font-mono">{house.gold || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 font-extrabold block">🥈 SILVER</span>
                  <span className="text-lg font-black text-slate-900 font-mono">{house.silver || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-800 font-extrabold block">🥉 BRONZE</span>
                  <span className="text-lg font-black text-slate-900 font-mono">{house.bronze || 0}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-3 mb-2">
                <span className="text-xs font-bold text-slate-600">Total Championship Points</span>
                <span className="text-4xl font-black emerald-gradient-text font-mono">{house.total_points || 0}</span>
              </div>

              <div className="text-right mb-4">
                <span className="text-[10px] font-black text-emerald-700 underline group-hover:text-emerald-900 transition">
                  View Full Score Breakdown →
                </span>
              </div>

              {/* Admin Live House Scoring Desk */}
              {isAdmin && (
                <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-2xl space-y-3 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center space-x-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>Live House Scoring Desk</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">1-Click Live Adjustment</span>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => handleAdjustPoints(house.id, 10, '1st Prize / Major Award (+10 Pts)')}
                      className="py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition"
                    >
                      +10 Pts
                    </button>
                    <button
                      onClick={() => handleAdjustPoints(house.id, 5, '2nd Prize / Performance Bonus (+5 Pts)')}
                      className="py-1.5 px-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-xs transition"
                    >
                      +5 Pts
                    </button>
                    <button
                      onClick={() => handleAdjustPoints(house.id, 1, 'Discipline / Participation Bonus (+1 Pt)')}
                      className="py-1.5 px-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-xs transition"
                    >
                      +1 Pt
                    </button>
                    <button
                      onClick={() => handleAdjustPoints(house.id, -5, 'Penalty / Violation Deduction (-5 Pts)')}
                      className="py-1.5 px-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-xs transition"
                    >
                      -5 Pts
                    </button>
                  </div>

                  {/* Custom Point Adjustment Trigger */}
                  {adjustingHouseId === house.id ? (
                    <div className="space-y-2 pt-2 border-t border-emerald-200">
                      <input
                        type="number"
                        placeholder="Points amount (e.g. 15 or -5)"
                        value={adjustPoints}
                        onChange={e => setAdjustPoints(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Reason (e.g. March Past Award / Special Bonus)"
                        value={adjustReason}
                        onChange={e => setAdjustReason(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold outline-none"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAdjustPoints(house.id, adjustPoints, adjustReason)}
                          className="flex-1 py-1.5 rounded-lg bg-emerald-700 text-white font-black text-xs shadow hover:bg-emerald-800"
                        >
                          Apply Score
                        </button>
                        <button
                          onClick={() => setAdjustingHouseId(null)}
                          className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 font-bold text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAdjustingHouseId(house.id);
                        setAdjustPoints('');
                        setAdjustReason('');
                      }}
                      className="w-full py-1.5 rounded-xl border border-emerald-300 bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-100/60 transition"
                    >
                      + Custom Points / Deductions
                    </button>
                  )}

                </div>
              )}

            </div>

          </div>
        ))}
      </div>

      {/* Edit / Create House Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-slate-200 p-6 shadow-2xl bg-white text-slate-900">
            <h3 className="text-lg font-extrabold emerald-gradient-text mb-4">
              {editingHouseId ? 'Edit House Details' : 'Create New House'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
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
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md transition"
                >
                  Save House Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* House Breakdown Modal */}
      {selectedHouseObj && (
        <HouseBreakdownModal 
          house={selectedHouseObj} 
          onClose={() => setSelectedHouseObj(null)} 
        />
      )}

    </div>
  );
}
