import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Award, Shield, Layers, Play, CheckCircle, 
  Clock, Trophy, BarChart3, PieChart 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const role = user?.role || 'public';
  const isAdmin = ['super_admin', 'admin', 'stage_coordinator'].includes(role);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;

    const loadDashboardStats = async () => {
      try {
        const res = await fetch('/api/reports/dashboard-stats', { 
          cache: 'no-store',
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.cards && (data.cards.totalStudents > 0 || data.cards.totalPrograms > 0 || data.cards.totalHouses > 0)) {
            if (isSubscribed) {
              setStats(data);
              setLoading(false);
              return;
            }
          }
        }
      } catch (e) {}

      // Fallback: Fetch directly from endpoints
      try {
        const [studentsRes, programsRes, housesRes, categoriesRes] = await Promise.all([
          fetch('/api/students', { cache: 'no-store' }).then(r => r.json()).catch(() => []),
          fetch('/api/programs', { cache: 'no-store' }).then(r => r.json()).catch(() => []),
          fetch('/api/houses', { cache: 'no-store' }).then(r => r.json()).catch(() => []),
          fetch('/api/categories', { cache: 'no-store' }).then(r => r.json()).catch(() => [])
        ]);

        const students = Array.isArray(studentsRes) ? studentsRes : [];
        const programs = Array.isArray(programsRes) ? programsRes : [];
        const houses = Array.isArray(housesRes) ? housesRes : [];
        const categories = Array.isArray(categoriesRes) ? categoriesRes : [];

        const runningPrograms = programs.filter(p => p.status === 'ongoing').length;
        const completedPrograms = programs.filter(p => p.status === 'completed').length;
        const pendingPrograms = programs.filter(p => !p.status || p.status === 'pending').length;

        // Distinct participants
        const participantSet = new Set();
        programs.forEach(p => {
          if (p.participants && Array.isArray(p.participants)) {
            p.participants.forEach(pt => {
              if (pt.student_id || pt.id) participantSet.add(String(pt.student_id || pt.id));
            });
          }
        });

        // Category breakdown
        const categoryMap = new Map();
        categories.forEach(c => categoryMap.set(String(c.id), { id: c.id, name: c.name, program_count: 0 }));
        programs.forEach(p => {
          const catKey = String(p.category_id || 1);
          if (categoryMap.has(catKey)) {
            categoryMap.get(catKey).program_count += 1;
          } else {
            categoryMap.set(catKey, { id: p.category_id || 1, name: p.category_name || 'Category', program_count: 1 });
          }
        });

        if (isSubscribed) {
          setStats({
            cards: {
              totalStudents: students.length,
              totalPrograms: programs.length,
              totalJudges: 0,
              totalHouses: houses.length,
              totalCategories: categories.length,
              runningPrograms,
              completedPrograms,
              pendingPrograms,
              totalParticipants: participantSet.size
            },
            houses: houses.map(h => ({
              id: h.id,
              name: h.name,
              code: h.code,
              color_hex: h.color_hex,
              total_points: h.total_points || 0
            })).sort((a, b) => (b.total_points || 0) - (a.total_points || 0)),
            categoryStats: Array.from(categoryMap.values())
          });
          setLoading(false);
        }
      } catch (err) {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    loadDashboardStats();
    return () => { isSubscribed = false; };
  }, []);

  if (!isAdmin) {
    return (
      <div className="glass-panel p-8 sm:p-12 text-center rounded-3xl border border-amber-500/40 max-w-lg mx-auto my-12 bg-white shadow-2xl animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4 text-amber-600">
          <Shield className="w-8 h-8 opacity-80" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 mb-2">Admin Portal Authentication Required</h3>
        <p className="text-xs text-slate-500 mb-6 font-medium">The Admin Control Dashboard and festival overview analytics are confidential and restricted to authorized administrators.</p>
        <button
          onClick={() => { window.location.hash = 'login'; window.location.reload(); }}
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition"
        >
          Sign In to Admin Portal
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-emerald-700 font-mono text-xs flex items-center justify-center space-x-2">
        <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading Admin Control Dashboard...</span>
      </div>
    );
  }

  const cards = stats?.cards || {
    totalStudents: 0,
    totalPrograms: 0,
    totalJudges: 0,
    totalHouses: 0,
    totalCategories: 0,
    runningPrograms: 0,
    completedPrograms: 0,
    pendingPrograms: 0,
    totalParticipants: 0
  };
  const houses = stats?.houses || [];
  const categoryStats = stats?.categoryStats || [];

  const cardConfig = [
    { title: 'Total Students', val: cards.totalStudents, icon: Users, color: 'text-emerald-700', bg: 'from-emerald-50 via-white to-slate-50 border-emerald-200' },
    { title: 'Total Programs', val: cards.totalPrograms, icon: Calendar, color: 'text-emerald-700', bg: 'from-amber-50 via-white to-slate-50 border-amber-200' },
    { title: 'Total Judges', val: cards.totalJudges, icon: Award, color: 'text-emerald-700', bg: 'from-blue-50 via-white to-slate-50 border-blue-200' },
    { title: 'Total Houses', val: cards.totalHouses, icon: Shield, color: 'text-emerald-700', bg: 'from-indigo-50 via-white to-slate-50 border-indigo-200' },
    { title: 'Categories', val: cards.totalCategories, icon: Layers, color: 'text-emerald-700', bg: 'from-purple-50 via-white to-slate-50 border-purple-200' },
    { title: 'Running Now', val: cards.runningPrograms, icon: Play, color: 'text-amber-700 animate-pulse', bg: 'from-amber-100 via-white to-amber-50 border-amber-300' },
    { title: 'Completed', val: cards.completedPrograms, icon: CheckCircle, color: 'text-emerald-700', bg: 'from-emerald-100 via-white to-emerald-50 border-emerald-300' },
    { title: 'Pending Programs', val: cards.pendingPrograms, icon: Clock, color: 'text-slate-700', bg: 'from-slate-100 via-white to-slate-50 border-slate-200' },
    { title: 'Total Participants', val: cards.totalParticipants, icon: Trophy, color: 'text-emerald-800', bg: 'from-amber-50 via-white to-emerald-50 border-emerald-200' }
  ];

  const maxHousePoints = Math.max(...houses.map(h => h.total_points || 0), 100);
  const maxCategoryPrograms = Math.max(...categoryStats.map(c => c.program_count || 0), 10);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold emerald-gradient-text">Admin Control Dashboard</h1>
        <p className="text-xs text-slate-500 font-mono font-bold mt-1">Real-time Milad Festival Overview & Analytics</p>
      </div>

      {/* 9 Dashboard Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {cardConfig.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className={`glass-panel p-5 rounded-2xl border bg-gradient-to-br ${c.bg} flex items-center justify-between shadow-xs hover:shadow-sm transition`}>
              <div>
                <span className="text-xs font-extrabold text-slate-600 block mb-1">{c.title}</span>
                <span className="text-3xl font-black font-mono text-slate-900">{c.val}</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                <Icon className={`w-6 h-6 ${c.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Dashboard Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* House Points Leaderboard Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-emerald-600" />
              <span>Overall House Championship Standings</span>
            </h3>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>
          
          {houses.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 font-medium">No house score tallies registered yet.</div>
          ) : (
            <div className="space-y-4">
              {houses.map((h, idx) => {
                const percentage = Math.min(100, Math.round(((h.total_points || 0) / maxHousePoints) * 100));
                return (
                  <div key={h.id || idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-900 flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: h.color_hex || '#10b981' }} />
                        <span>{h.name}</span>
                      </span>
                      <span className="font-mono font-black emerald-gradient-text text-sm">{h.total_points || 0} pts</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3.5 p-0.5 overflow-hidden border border-slate-200">
                      <div 
                        className="h-full rounded-full transition-all duration-700" 
                        style={{ 
                          width: `${Math.max(percentage, 5)}%`, 
                          backgroundColor: h.color_hex || '#10b981' 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Programs by Category Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-emerald-600" />
              <span>Programs Distribution by Category</span>
            </h3>
          </div>

          {categoryStats.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 font-medium">No category breakdown data available.</div>
          ) : (
            <div className="space-y-4">
              {categoryStats.map((c, idx) => {
                const percentage = Math.min(100, Math.round(((c.program_count || 0) / maxCategoryPrograms) * 100));
                const colors = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6'];
                const barColor = colors[idx % colors.length];
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{c.category_name}</span>
                      <span className="font-mono font-bold text-emerald-700">{c.program_count || 0} Programs</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 p-0.5 overflow-hidden border border-slate-200">
                      <div 
                        className="h-full rounded-full transition-all duration-700" 
                        style={{ 
                          width: `${Math.max(percentage, 5)}%`, 
                          backgroundColor: barColor 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
