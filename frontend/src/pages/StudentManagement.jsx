import React, { useState, useEffect } from 'react';
import { 
  User, Plus, Search, QrCode, Edit, Trash2, CheckCircle, Save
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
  const [search, setSearch] = useState('');
  const [qrStudent, setQrStudent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const categories = ['Kiddies', 'Sub Junior', 'Junior', 'Senior', 'Super Senior'];

  const [formData, setFormData] = useState({
    id: null,
    admission_no: `CODE-${Date.now().toString().slice(-4)}`,
    name: '',
    category_name: 'Kiddies',
    class_name: 'Class 6',
    house_id: 1
  });

  const loadData = () => {
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
        setStudents(unique);
        localStorage.setItem('milad_cached_students', JSON.stringify(unique));
      })
      .catch(() => {
        const cached = JSON.parse(localStorage.getItem('milad_cached_students') || '[]');
        setStudents(cached);
      });

    fetch('/api/houses')
      .then(res => res.json())
      .then(data => setHouses(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    const isEdit = !!formData.id;
    const studentObj = {
      ...formData,
      id: formData.id || Date.now(),
      student_id: formData.student_id || `STU-${Date.now().toString().slice(-4)}`,
      arabic_name: '',
      division: 'A',
      parent_name: '',
      phone: '',
      gender: 'male',
      age: 10
    };

    // Save to local storage immediately
    const customItems = JSON.parse(localStorage.getItem('milad_custom_students') || '[]');
    let updatedCustom;
    if (isEdit) {
      updatedCustom = customItems.map(s => String(s.id) === String(studentObj.id) ? studentObj : s);
    } else {
      updatedCustom = [studentObj, ...customItems];
    }
    localStorage.setItem('milad_custom_students', JSON.stringify(updatedCustom));

    // Also update UI state immediately
    setStudents(prev => {
      const filtered = prev.filter(s => String(s.id) !== String(studentObj.id));
      return [studentObj, ...filtered];
    });

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
      });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this student profile?')) {
      const deletedIds = JSON.parse(localStorage.getItem('milad_deleted_student_ids') || '[]');
      if (!deletedIds.includes(String(id))) {
        deletedIds.push(String(id));
        localStorage.setItem('milad_deleted_student_ids', JSON.stringify(deletedIds));
      }

      const customItems = JSON.parse(localStorage.getItem('milad_custom_students') || '[]');
      const filteredCustom = customItems.filter(s => String(s.id) !== String(id));
      localStorage.setItem('milad_custom_students', JSON.stringify(filteredCustom));

      setStudents(prev => prev.filter(s => String(s.id) !== String(id)));

      fetch(`/api/students/${id}`, { method: 'DELETE' })
        .then(() => loadData())
        .catch(() => {});
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
            onClick={() => {
              setFormData({ id: null, admission_no: `CODE-${Date.now().toString().slice(-4)}`, name: '', category_name: 'Kiddies', class_name: 'Class 6', house_id: 1 });
              setShowForm(true);
            }}
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
                          onClick={() => {
                            setFormData({
                              id: s.id,
                              admission_no: s.admission_no || s.student_id,
                              name: s.name,
                              category_name: s.category_name || 'Kiddies',
                              class_name: s.class_name,
                              house_id: s.house_id || 1
                            });
                            setShowForm(true);
                          }}
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

      {/* Simplified Add / Edit Modal with Category */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-amber-400/40 p-6 sm:p-8 shadow-2xl bg-slate-900 text-white my-8">
            <h3 className="text-xl font-black emerald-gradient-text mb-4">
              {formData.id ? 'Edit Student Profile' : 'Add New Student'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Code No</label>
                <input
                  type="text"
                  required
                  value={formData.admission_no}
                  onChange={e => setFormData({ ...formData, admission_no: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Student Full Name"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Category</label>
                <select
                  value={formData.category_name}
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
                  value={formData.class_name}
                  onChange={e => setFormData({ ...formData, class_name: e.target.value })}
                  placeholder="Class 6"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">House</label>
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

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-xl glass-panel text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                >
                  Save Student Profile
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
