import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Award, Shield, Layers, Play, CheckCircle, 
  Clock, Trophy, BarChart3, PieChart 
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/dashboard-stats')
      .then(res => res.json())
      .then(data => {
        if (data && data.cards) {
          setStats(data);
        } else {
          setStats({
            cards: {
              totalStudents: 0,
              totalPrograms: 0,
              totalJudges: 0,
              totalHouses: 0,
              totalCategories: 0,
              runningPrograms: 0,
              completedPrograms: 0,
              pendingPrograms: 0,
              totalParticipants: 0
            },
            houses: [],
            categoryStats: []
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setStats({
          cards: {
            totalStudents: 0,
            totalPrograms: 0,
            totalJudges: 0,
            totalHouses: 0,
            totalCategories: 0,
            runningPrograms: 0,
            completedPrograms: 0,
            pendingPrograms: 0,
            totalParticipants: 0
          },
          houses: [],
          categoryStats: []
        });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-amber-400 font-mono text-xs flex items-center justify-center space-x-2">
        <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
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
    { title: 'Total Students', val: cards.totalStudents, icon: Users, color: 'text-emerald-400', bg: 'from-emerald-950/60 to-slate-900' },
    { title: 'Total Programs', val: cards.totalPrograms, icon: Calendar, color: 'text-amber-400', bg: 'from-amber-950/60 to-slate-900' },
    { title: 'Total Judges', val: cards.totalJudges, icon: Award, color: 'text-blue-400', bg: 'from-blue-950/60 to-slate-900' },
    { title: 'Total Houses', val: cards.totalHouses, icon: Shield, color: 'text-indigo-400', bg: 'from-indigo-950/60 to-slate-900' },
    { title: 'Categories', val: cards.totalCategories, icon: Layers, color: 'text-purple-400', bg: 'from-purple-950/60 to-slate-900' },
    { title: 'Running Now', val: cards.runningPrograms, icon: Play, color: 'text-yellow-400 animate-pulse', bg: 'from-yellow-950/60 to-slate-900' },
    { title: 'Completed', val: cards.completedPrograms, icon: CheckCircle, color: 'text-green-400', bg: 'from-green-950/60 to-slate-900' },
    { title: 'Pending Programs', val: cards.pendingPrograms, icon: Clock, color: 'text-amber-400', bg: 'from-amber-950/60 to-slate-900' },
    { title: 'Total Participants', val: cards.totalParticipants, icon: Trophy, color: 'text-amber-300', bg: 'from-amber-950/60 to-slate-900' }
  ];

  // Chart 1 Data: House Points
  const houseChartData = {
    labels: houses.map(h => h.name),
    datasets: [
      {
        label: 'Overall House Points',
        data: houses.map(h => h.total_points || 0),
        backgroundColor: houses.map(h => h.color_hex || '#10b981'),
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderRadius: 8
      }
    ]
  };

  // Chart 2 Data: Programs by Category
  const categoryChartData = {
    labels: categoryStats.map(c => c.category_name),
    datasets: [
      {
        label: 'Program Count',
        data: categoryStats.map(c => c.program_count || 0),
        backgroundColor: ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6'],
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold emerald-gradient-text">Admin Control Dashboard</h1>
        <p className="text-xs text-slate-400 font-mono mt-1">Real-time Milad Festival Overview & Analytics</p>
      </div>

      {/* 9 Dashboard Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {cardConfig.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className={`glass-panel p-5 rounded-2xl border border-slate-800 bg-gradient-to-br ${c.bg} flex items-center justify-between shadow-xl`}>
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">{c.title}</span>
                <span className="text-3xl font-black font-mono text-white">{c.val}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/50">
                <Icon className={`w-6 h-6 ${c.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Dashboard Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* House Points Leaderboard Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Overall House Championship Points</span>
            </h3>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="h-64 flex items-center justify-center">
            {houses.length > 0 ? (
              <Bar 
                data={houseChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                    y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } }
                  }
                }}
              />
            ) : (
              <div className="text-xs text-slate-400">No house score data calculated yet.</div>
            )}
          </div>
        </div>

        {/* Programs by Category Doughnut */}
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-emerald-400" />
              <span>Programs Distribution by Category</span>
            </h3>
          </div>
          <div className="h-64 flex items-center justify-center">
            {categoryStats.length > 0 ? (
              <Doughnut 
                data={categoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { 
                      position: 'bottom',
                      labels: { color: '#94a3b8', font: { size: 11 } }
                    } 
                  }
                }}
              />
            ) : (
              <div className="text-xs text-slate-400">No program categories registered yet.</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
