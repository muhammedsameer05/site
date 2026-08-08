import React, { useState, useEffect } from 'react';
import { 
  User, Plus, Search, QrCode, Edit, Trash2, Shield, Eye, Award, CheckCircle
} from 'lucide-react';
import QRCodeModal from '../components/QRCodeModal';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [houses, setHouses] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [qrStudent, setQrStudent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    admission_no: '',
    name: '',
    arabic_name: '',
    gender: 'male',
    dob: '',
    age: 10,
    class_name: 'Class 5',
    division: 'A',
    house_id: 1,
    parent_name: '',
    phone: '',
    email: '',
    address: ''
  });

  const loadData = () => {
    fetch('/api/students')
      .then(res => res.json())
      .then(data => setStudents(Array.isArray(data) ? data : []))
      .catch(() => {});

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
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id ? `/api/students/${formData.id}` : '/api/students';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(() => {
        setShowForm(false);
        setFormData({ id: null, admission_no: '', name: '', arabic_name: '', gender: 'male', dob: '', age: 10, class_name: 'Class 5', division: 'A', house_id: 1, parent_name: '', phone: '', email: '', address: '' });
        loadData();
      });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this student profile?')) {
      fetch(`/api/students/${id}`, { method: 'DELETE' })
        .then(() => loadData());
    }
  };

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.student_id.toLowerCase().includes(search.toLowerCase()) ||
    (s.arabic_name && s.arabic_name.includes(search))
  );

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold emerald-gradient-text flex items-center space-x-2">
            <User className="w-6 h-6 text-amber-400" />
            <span>Student Management Directory</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">Manage student records, Arabic names, QR codes, and profiles</p>
        </div>

        <button
          onClick={() => {
            setFormData({ id: null, admission_no: `ADM-${Date.now().toString().slice(-4)}`, name: '', arabic_name: '', gender: 'male', dob: '2014-05-10', age: 12, class_name: 'Class 6', division: 'A', house_id: 1, parent_name: '', phone: '', email: '', address: '' });
            setShowForm(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-amber-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, Arabic name, ID..."
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
                <th className="p-4">Student ID</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Class & Div</th>
                <th className="p-4">House</th>
                <th className="p-4">Parent Phone</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 font-mono text-emerald-400 font-bold">{s.student_id}</td>
                  <td className="p-4">
                    <div className="font-bold text-white text-sm">{s.name}</div>
                    {s.arabic_name && <div className="text-xs font-serif text-amber-300">{s.arabic_name}</div>}
                  </td>
                  <td className="p-4 font-semibold">{s.class_name} ({s.division})</td>
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
                  <td className="p-4 font-mono">{s.phone || 'N/A'}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => setQrStudent(s)}
                      className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-900"
                      title="Generate QR ID Card"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setFormData(s);
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-2xl rounded-2xl border border-amber-400/40 p-6 shadow-2xl bg-slate-900 text-white my-8">
            <h3 className="text-lg font-bold emerald-gradient-text mb-4">
              {formData.id ? 'Edit Student Profile' : 'Add New Student'}
            </h3>

            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Admission No</label>
                <input
                  type="text"
                  required
                  value={formData.admission_no}
                  onChange={e => setFormData({ ...formData, admission_no: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Full Name (English)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Arabic Name (الاسم بالعربية)</label>
                <input
                  type="text"
                  value={formData.arabic_name}
                  onChange={e => setFormData({ ...formData, arabic_name: e.target.value })}
                  placeholder="محمد دانش"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-serif"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Class</label>
                <input
                  type="text"
                  value={formData.class_name}
                  onChange={e => setFormData({ ...formData, class_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Division</label>
                <input
                  type="text"
                  value={formData.division}
                  onChange={e => setFormData({ ...formData, division: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">House</label>
                <select
                  value={formData.house_id}
                  onChange={e => setFormData({ ...formData, house_id: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  {houses.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Parent Name</label>
                <input
                  type="text"
                  value={formData.parent_name}
                  onChange={e => setFormData({ ...formData, parent_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Parent Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl glass-panel text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
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
