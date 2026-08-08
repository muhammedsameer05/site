import React, { useState } from 'react';
import { Shield, Award, User, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onLoginSuccess }) {
  const { login } = useAuth();
  const [activePortal, setActivePortal] = useState('admin'); // 'admin', 'judge', 'student'

  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  // Strict Form Submit Login Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!credentials.username.trim() || !credentials.password.trim()) {
      setErrorMsg('Please enter both username/email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: credentials.username.trim(),
        password: credentials.password.trim()
      })
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.error) {
          setErrorMsg(data.error);
        } else {
          login(data.user, data.token);
          if (onLoginSuccess) {
            if (data.user?.role === 'judge') onLoginSuccess('judge');
            else if (data.user?.role === 'student') onLoginSuccess('students');
            else onLoginSuccess('dashboard');
          }
        }
      })
      .catch(() => {
        setLoading(false);
        setErrorMsg('Unable to connect to login server. Please verify your credentials and try again.');
      });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      
      {/* Title */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-amber-400 p-0.5 mx-auto mb-3 shadow-xl flex items-center justify-center">
          <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
            <span className="text-2xl font-black gold-gradient-text font-serif">م</span>
          </div>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Madrasa Milad <span className="gold-gradient-text">Authentication Portals</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">Select your designated portal to sign in with valid credentials</p>
      </div>

      {/* 3 Portal Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        
        {/* Admin Portal Card */}
        <div 
          onClick={() => { setActivePortal('admin'); setErrorMsg(null); }}
          className={`glass-panel p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
            activePortal === 'admin' 
              ? 'border-amber-400 bg-emerald-950/40 shadow-2xl scale-105' 
              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
          }`}
        >
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 w-fit mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-extrabold text-white mb-1">Admin Portal</h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">Requires Admin account. Full access to management modules.</p>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
            Sign In Required
          </span>
        </div>

        {/* Judge Portal Card */}
        <div 
          onClick={() => { setActivePortal('judge'); setErrorMsg(null); }}
          className={`glass-panel p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
            activePortal === 'judge' 
              ? 'border-amber-400 bg-emerald-950/40 shadow-2xl scale-105' 
              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
          }`}
        >
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 w-fit mb-3">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-extrabold text-white mb-1">Judge Scoring Portal</h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">Requires Judge credentials. Access exclusively to Judge Marks Panel.</p>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            Sign In Required
          </span>
        </div>

        {/* Student Portal Card */}
        <div 
          onClick={() => { setActivePortal('student'); setErrorMsg(null); }}
          className={`glass-panel p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
            activePortal === 'student' 
              ? 'border-amber-400 bg-emerald-950/40 shadow-2xl scale-105' 
              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
          }`}
        >
          <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 w-fit mb-3">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-extrabold text-white mb-1">Student Portal</h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">Requires Student account. Access to personal details & ID card.</p>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
            Sign In Required
          </span>
        </div>

      </div>

      {/* Login Box */}
      <div className="glass-panel max-w-md mx-auto p-6 sm:p-8 rounded-3xl border border-amber-400/40 bg-slate-900/90 shadow-2xl">
        <h2 className="text-xl font-extrabold text-white mb-1 flex items-center space-x-2">
          <Lock className="w-5 h-5 text-amber-400" />
          <span className="capitalize">{activePortal} Sign In</span>
        </h2>
        <p className="text-xs text-slate-400 mb-6">Enter your username/email and password to log into the {activePortal} portal</p>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-red-950 text-red-300 border border-red-500/40 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">
              Username or Email
            </label>
            <input
              type="text"
              required
              value={credentials.username}
              onChange={e => setCredentials({ ...credentials, username: e.target.value })}
              placeholder={activePortal === 'judge' ? 'judge1' : activePortal === 'student' ? 'STU-1001' : 'admin'}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Password</label>
            <input
              type="password"
              required
              value={credentials.password}
              onChange={e => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating Credentials...' : `Sign In to ${activePortal.toUpperCase()} Portal`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
}
