import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, AlertTriangle, Bell, Plus, Send, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NoticeBoard() {
  const { user, token } = useAuth();
  const isAdmin = ['super_admin', 'admin', 'stage_coordinator'].includes(user?.role);

  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', priority: 'normal' });

  const loadAnnouncements = () => {
    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(() => setAnnouncements([]));
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreateNotice = (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    fetch('/api/announcements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ ...formData, posted_by: user?.name || 'Admin' })
    })
      .then(res => res.json())
      .then(() => {
        setSubmitting(false);
        setShowModal(false);
        setFormData({ title: '', content: '', priority: 'normal' });
        setSuccessMsg('Announcement published successfully!');
        setTimeout(() => setSuccessMsg(null), 3000);
        loadAnnouncements();
      })
      .catch(() => {
        setSubmitting(false);
        setShowModal(false);
        loadAnnouncements();
      });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold emerald-gradient-text flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            <span>Madrasa Public Notice Board & Prayer Times</span>
          </h1>
          <p className="text-xs text-slate-500 font-mono font-bold">Announcements, Stage Schedules, and Festival Guidelines</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Post Announcement</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Notice Board Announcements */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 bg-white shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
              <Bell className="w-5 h-5 text-emerald-600" />
              <span>Official Announcements</span>
            </h2>

            <div className="space-y-3">
              {announcements.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium italic">No announcements posted yet.</p>
              ) : (
                announcements.map(item => (
                  <div key={item.id} className="p-4 rounded-xl bg-slate-50 border-l-4 border-emerald-500 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                      <span className="text-[10px] text-emerald-700 font-mono font-bold">{item.posted_by || 'Admin'}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Prayer Times & Guidelines */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-emerald-200 bg-gradient-to-b from-white via-emerald-50/50 to-slate-50 text-center shadow-sm">
            <Clock className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-base font-extrabold text-slate-900">Daily Prayer Timings</h3>
            <p className="text-[10px] text-emerald-700 font-mono font-bold mb-4">Madrasa Masjid Schedule</p>

            <div className="space-y-2 text-xs font-mono font-bold">
              {[
                { name: 'Fajr', time: '05:00 AM' },
                { name: 'Dhuhr', time: '12:30 PM' },
                { name: 'Asr', time: '04:15 PM' },
                { name: 'Maghrib', time: '06:45 PM' },
                { name: 'Isha', time: '08:00 PM' }
              ].map((p, idx) => (
                <div key={idx} className="flex justify-between py-2 px-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-slate-700 font-bold">{p.name}</span>
                  <span className="text-emerald-700 font-extrabold">{p.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Post Announcement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/60 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
          <div className="glass-panel w-full max-w-3xl rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xl relative bg-white text-slate-900 my-4 sm:my-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold emerald-gradient-text mb-4 text-center">
              Post Official Announcement
            </h3>

            <form onSubmit={handleCreateNotice} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Announcement Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Title of announcement..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Announcement Content</label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter detailed notice content..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Publishing...' : 'Publish Notice'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
