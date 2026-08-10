import React, { useState, useEffect } from 'react';
import { 
  User, Plus, Search, Award, Edit, Trash2, CheckCircle, Save, X
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
      <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 bg-white flex items-center justify-between shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-emerald-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, category, or code no..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <span className="text-xs text-slate-500 font-mono hidden sm:inline font-bold">Total: {filtered.length} Students</span>
      </div>

      {/* Students Table */}
      <div className="glass-panel rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-emerald-50/80 text-emerald-950 uppercase font-mono border-b border-emerald-100 font-bold">
              <tr>
                <th className="p-4">Code No</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Class</th>
                <th className="p-4">House</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-emerald-50/30 transition">
                  <td className="p-4 font-mono text-emerald-700 font-bold">{s.admission_no || s.student_id}</td>
                  <td className="p-4 font-bold text-slate-900 text-sm">{s.name}</td>
                  <td className="p-4 font-semibold text-amber-900">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-bold">
                      {s.category_name || 'Kiddies'}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-700">{s.class_name}</td>
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
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleEdit(s)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xl bg-white text-slate-900 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <span>{formData.id ? `Edit Student Information (#${formData.admission_no || formData.id})` : 'Add New Student Profile'}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 text-xs">
              {/* Row 1: Chest No & Student Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">Chest Number (Chest No)</label>
                  <input
                    type="text"
                    required
                    value={formData.admission_no}
                    onChange={e => setFormData({ ...formData, admission_no: e.target.value })}
                    placeholder="101"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-emerald-700 font-bold font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">Student's Name (Student Name)</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. മുഹമ്മദ് അൻഷിദ് or Muhammed Anshid"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Category, Class & House */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">Category</label>
                  <select
                    value={formData.category_name}
                    onChange={e => setFormData({ ...formData, category_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
                  >
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">Class</label>
                  <input
                    type="text"
                    required
                    value={formData.class_name}
                    onChange={e => setFormData({ ...formData, class_name: e.target.value })}
                    placeholder="Class 6"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">House</label>
                  <select
                    value={formData.house_id}
                    onChange={e => setFormData({ ...formData, house_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
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
                  <label className="block text-slate-800 font-extrabold text-xs uppercase tracking-wider">
                    Contest Items Participating (Registered Items)
                  </label>
                  <span className="text-[11px] font-bold text-amber-700 font-mono">
                    Category: {formData.category_name || 'Sub Junior'}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 max-h-56 overflow-y-auto">
                  {(() => {
                    const studentCat = (formData.category_name || 'Sub Junior').toLowerCase().trim();
                    const displayedPrograms = allPrograms.filter(prog => {
                      const progCat = (prog.category_name || prog.age_group || '').toLowerCase().trim();
                      const isChecked = registeredProgramIds.includes(prog.id);
                      return isChecked || progCat === studentCat;
                    });

                    if (displayedPrograms.length === 0) {
                      return (
                        <div className="text-slate-500 text-center py-6 font-mono text-xs">
                          <p>No programs available for category <span className="text-amber-700 font-bold">"{formData.category_name || 'Sub Junior'}"</span></p>
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
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-sm' 
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400'
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
                                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <p className="font-bold text-xs leading-snug truncate text-slate-900">{prog.name}</p>
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap">
                                    {prog.category_name || prog.age_group || formData.category_name}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
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
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md transition"
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
