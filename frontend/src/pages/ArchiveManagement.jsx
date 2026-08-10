import React, { useState, useEffect } from 'react';
import { Archive, RefreshCw, User, Calendar, Megaphone, Trophy, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function ArchiveManagement() {
  const { token } = useAuth();
  const [archivedData, setArchivedData] = useState({ students: [], programs: [], announcements: [], results: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  const [restoringId, setRestoringId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const fetchArchive = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/archive/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setArchivedData({
          students: data.students || [],
          programs: data.programs || [],
          announcements: data.announcements || [],
          results: data.results || []
        });
      }
    } catch (err) {
      console.error('Failed to fetch archive:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchive();
  }, [token]);

  const handleRestore = async (type, id, name) => {
    if (!window.confirm(`Are you sure you want to restore "${name || id}" back to active status?`)) return;

    setRestoringId(id);
    try {
      const res = await fetch(`/api/${type}/${id}/restore`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback(`Restored "${name || id}" successfully!`);
        setTimeout(() => setFeedback(null), 4000);
        fetchArchive();
      } else {
        alert(data.error || 'Failed to restore record');
      }
    } catch (err) {
      alert('Unable to connect to server');
    } finally {
      setRestoringId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading archived records..." />;

  const currentList = archivedData[activeTab] || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black emerald-gradient-text flex items-center space-x-2">
            <Archive className="w-6 h-6 text-amber-500" />
            <span>Archive Management</span>
          </h1>
          <p className="text-xs text-slate-500 font-mono font-bold mt-1">
            Safely view and restore archived records without data loss
          </p>
        </div>
        <button
          onClick={fetchArchive}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 font-bold text-xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
            activeTab === 'students' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Archived Students ({archivedData.students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('programs')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
            activeTab === 'programs' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Archived Programs ({archivedData.programs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
            activeTab === 'announcements' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Archived Announcements ({archivedData.announcements.length})</span>
        </button>
      </div>

      {/* Content List */}
      {currentList.length === 0 ? (
        <EmptyState message={`No archived ${activeTab} found.`} icon={Archive} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentList.map((item) => (
            <div key={item.id} className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                    Archived
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.archived_at ? new Date(item.archived_at).toLocaleString() : 'Archived'}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 mb-1">
                  {item.name || item.title || `Record #${item.id}`}
                </h3>

                {item.admission_no && (
                  <p className="text-xs text-slate-500 font-mono font-bold">Code No: {item.admission_no}</p>
                )}
                {item.category_name && (
                  <p className="text-xs text-slate-500 font-medium">Category: {item.category_name}</p>
                )}
                {item.content && (
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">{item.content}</p>
                )}
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleRestore(activeTab, item.id, item.name || item.title)}
                  disabled={restoringId === item.id}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${restoringId === item.id ? 'animate-spin' : ''}`} />
                  <span>Restore Record</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
