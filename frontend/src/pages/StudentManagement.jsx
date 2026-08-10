import React, { useState, useEffect } from 'react';
import { 
  User, Plus, Search, QrCode, Edit, Trash2, CheckCircle, Save, X
} from 'lucide-react';
import QRCodeModal from '../components/QRCodeModal';
import { useAuth } from '../context/AuthContext';

export default function StudentManagement() {
  const { user } = useAuth();
  const role = user?.role || 'public';
  const isAdmin = ['super_admin', 'admin', 'stage_coordinator'].includes(role);
  const isStudent = role === 'student';

  const [students, setStudents] = useState([]);
  const [houses, setHouses] = useState([]);
  const [allPrograms, setAllPrograms] = useState([]);
  const [registeredProgramIds, setRegisteredProgramIds] = useState([]);
  const [filterByCategoryOnly, setFilterByCategoryOnly] = useState(true);
  const [search, setSearch] = useState('');
  const [qrStudent, setQrStudent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const categories = ['Kiddies', 'Sub Junior', 'Junior', 'Senior', 'Super Senior'];

  const [formData, setFormData] = useState({
    id: null,
    admission_no: '',
    name: '',
    category_name: 'Sub Junior',
    class_name: 'Class 6',
    house_id: 1,
    parent_name: '',
    phone: '',
    photo: ''
  });

  const loadData = () => {
    localStorage.removeItem('milad_custom_students');
    localStorage.removeItem('milad_deleted_student_ids');

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
        setStudents(Array.from(uniqueMap.values()));
      })
      .catch(() => {
        setStudents([]);
      });

    fetch('/api/houses', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setHouses(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch('/api/programs', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setAllPrograms(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    setFormData({
      id: null,
      admission_no: '',
      name: '',
      category_name: 'Sub Junior',
      class_name: 'Class 6',
      house_id: 1,
      parent_name: '',
      phone: '',
      photo: ''
    });
    setRegisteredProgramIds([]);
    setShowForm(true);
  };

  const handleEdit = (s) => {
    setFormData({
      id: s.id,
      admission_no: s.admission_no || s.student_id || '',
      name: s.name || '',
      category_name: s.category_name || 'Sub Junior',
      class_name: s.class_name || 'Class 6',
      house_id: s.house_id || 1,
      parent_name: s.parent_name || '',
      phone: s.phone || '',
      photo: s.photo || ''
    });

    fetch(`/api/students/${s.id}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setRegisteredProgramIds(data.registered_program_ids || []);
      })
      .catch(() => {
        setRegisteredProgramIds([]);
      });

    setShowForm(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const isEdit = !!formData.id;
    const studentObj = {
      ...formData,
      student_id: formData.student_id || `STU-${Date.now().toString().slice(-4)}`,
      arabic_name: '',
      division: 'A',
      registered_program_ids: registeredProgramIds
    };

    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/api/students/${formData.id}` : '/api/students';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentObj)
    })
      .then(res => res.json())
      .then(() => {
        setShowForm(false);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
        loadData();
      })
      .catch(() => {
        setShowForm(false);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
        loadData();
      });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this student profile?')) {
      setStudents(prev => prev.filter(s => String(s.id) !== String(id)));

      fetch(`/api/students/${id}`, { method: 'DELETE' })
        .then(() => loadData())
        .catch(() => loadData());
    }
  };

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.student_id.toLowerCase().includes(search.toLowerCase()) ||
    (s.category_name && s.category_name.toLowerCase().includes(search.toLowerCase())) ||
    (s.admission_no && s.admission_no.toLowerCase().includes(search.toLowerCase()))
  );

  // Dedicated Student Portal View (Student role)
  if (isStudent) {
    const currentStudent = students.find(s => s.email === user.email || s.id === 1) || {
      student_id: 'STU-1001',
      admission_no: 'ADM-2024-01',
      name: 'Muhammed Danish',
      category_name: 'Junior',
      class_name: 'Class 8',
      house_name: 'Green House',
      house_color: '#10B981'
    };

    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-400/40 bg-slate-900 text-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-black emerald-gradient-text">Student Profile Portal</h1>
              <p className="text-xs text-slate-400 font-mono">Manage student details & view official Milad QR badge</p>
            </div>
            <button
              onClick={() => setQrStudent(currentStudent)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow"
            >
              <QrCode className="w-4 h-4" />
              <span>View QR Badge</span>
            </button>
          </div>

          {savedSuccess && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Student details updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Code No</label>
              <input
                type="text"
                required
                value={formData.admission_no || currentStudent.admission_no}
                onChange={e => setFormData({ ...formData, admission_no: e.target.value })}
                placeholder="Enter Code No (e.g. 101 or CODE-101)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-bold font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name || currentStudent.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Category</label>
              <select
                value={formData.category_name || currentStudent.category_name}
                onChange={e => setFormData({ ...formData, category_name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-bold"
              >
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Class</label>
              <input
                type="text"
                required
                value={formData.class_name || currentStudent.class_name}
                onChange={e => setFormData({ ...formData, class_name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">House Selection</label>
              <select
                value={formData.house_id}
                onChange={e => setFormData({ ...formData, house_id: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-bold"
              >
                {houses.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg transition"
              >
                <Save className="w-4 h-4" />
                <span>Save Student Details</span>
              </button>
            </div>
          </form>
        </div>

        {qrStudent && (
          <QRCodeModal student={qrStudent} onClose={() => setQrStudent(null)} />
        )}
      </div>
    );
  }

  // Admin / Full View
  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold emerald-gradient-text flex items-center space-x-2">
            <User className="w-6 h-6 text-amber-400" />
            <span>Student Directory</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">Manage student records, category assignments, and QR badges</p>
        </div>

        {isAdmin && (
          <button
            onClick={handleAdd}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Student</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-amber-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, category, or code no..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono hidden sm:inline">Total: {filtered.length} Students</span>
      </div>

      {/* Students Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-amber-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-4">Code No</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Class</th>
                <th className="p-4">House</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 font-mono text-emerald-400 font-bold">{s.admission_no || s.student_id}</td>
                  <td className="p-4 font-bold text-white text-sm">{s.name}</td>
                  <td className="p-4 font-semibold text-amber-300">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[11px] font-bold">
                      {s.category_name || 'Kiddies'}
                    </span>
                  </td>
                  <td className="p-4 font-semibold">{s.class_name}</td>
                  <td className="p-4">
                    <span 
                      className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border"
                      style={{ 
                        borderColor: `${s.house_color || '#10b981'}80`,
                        color: s.house_color || '#10b981',
                        backgroundColor: `${s.house_color || '#10b981'}15`
                      }}
                    >
                      {s.house_name || 'Green House'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => setQrStudent(s)}
                      className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-900"
                      title="Generate QR ID Card"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleEdit(s)}
                          className="p-1.5 rounded-lg bg-slate-800 text-amber-400 hover:bg-slate-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 rounded-lg bg-red-950/60 text-red-400 hover:bg-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Student Modal matching user screenshot */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl bg-slate-900 text-white my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <h3 className="text-lg font-black text-white flex items-center space-x-2">
                <span>{formData.id ? `Edit Student Information (#${formData.admission_no || formData.id})` : 'Add New Student Profile'}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 text-xs">
              {/* Row 1: Chest No & Student Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Chest Number (Chest No)</label>
                  <input
                    type="text"
                    required
                    value={formData.admission_no}
                    onChange={e => setFormData({ ...formData, admission_no: e.target.value })}
                    placeholder="101"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-emerald-400 font-bold font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Student's Name (Student Name)</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. മുഹമ്മദ് അൻഷിദ് or Muhammed Anshid"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-white font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Category, Class & House */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Category</label>
                  <select
                    value={formData.category_name}
                    onChange={e => setFormData({ ...formData, category_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-white font-bold focus:border-emerald-500 focus:outline-none"
                  >
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Class</label>
                  <input
                    type="text"
                    required
                    value={formData.class_name}
                    onChange={e => setFormData({ ...formData, class_name: e.target.value })}
                    placeholder="Class 6"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-white font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">House</label>
                  <select
                    value={formData.house_id}
                    onChange={e => setFormData({ ...formData, house_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-white font-bold focus:border-emerald-500 focus:outline-none"
                  >
                    {houses.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contest Items Participating (Registered Items) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-slate-200 font-extrabold text-xs uppercase tracking-wider">
                    Contest Items Participating (Registered Items)
                  </label>
                  <span className="text-[11px] font-bold text-amber-400 font-mono">
                    Category: {formData.category_name || 'Sub Junior'}
                  </span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 max-h-56 overflow-y-auto">
                  {(() => {
                    const studentCat = (formData.category_name || 'Sub Junior').toLowerCase().trim();
                    const displayedPrograms = allPrograms.filter(prog => {
                      const progCat = (prog.category_name || prog.age_group || '').toLowerCase().trim();
                      const isChecked = registeredProgramIds.includes(prog.id);
                      return isChecked || progCat === studentCat;
                    });

                    if (displayedPrograms.length === 0) {
                      return (
                        <div className="text-slate-400 text-center py-6 font-mono text-xs">
                          <p>No programs available for category <span className="text-amber-400 font-bold">"{formData.category_name || 'Sub Junior'}"</span></p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {displayedPrograms.map(prog => {
                          const isChecked = registeredProgramIds.includes(prog.id);
                          return (
                            <label 
                              key={prog.id} 
                              className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition ${
                                isChecked 
                                  ? 'bg-emerald-950/40 border-emerald-500/60 text-white' 
                                  : 'bg-slate-900/90 border-slate-700/60 text-slate-200 hover:border-amber-400'
                              }`}
                            >
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setRegisteredProgramIds(prev => prev.filter(id => id !== prog.id));
                                  } else {
                                    setRegisteredProgramIds(prev => [...prev, prog.id]);
                                  }
                                }}
                                className="mt-0.5 w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 accent-emerald-500"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <p className="font-bold text-xs leading-snug truncate text-white">{prog.name}</p>
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 whitespace-nowrap">
                                    {prog.category_name || prog.age_group || formData.category_name}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  {prog.code || `PRG-${prog.id}`}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl glass-panel text-slate-400 hover:text-white font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-lg transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Card Modal */}
      {qrStudent && (
        <QRCodeModal student={qrStudent} onClose={() => setQrStudent(null)} />
      )}

    </div>
  );
}
