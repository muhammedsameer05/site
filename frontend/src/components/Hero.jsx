import React from 'react';
import { Sparkles, Trophy, Calendar, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { useLanguage } from '../context/LanguageContext';

export default function Hero({ onNavigate }) {
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden bg-islamic-pattern py-16 sm:py-24 border-b border-amber-500/20">
      
      {/* Decorative Glow Orbs */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Arabic Calligraphy Header */}
        <div className="mb-4">
          <span className="text-2xl sm:text-4xl font-serif gold-gradient-text tracking-widest block font-bold">
            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </span>
          <span className="text-xs sm:text-sm text-emerald-300/80 font-mono tracking-widest mt-1 block uppercase">
            In the Name of Allah, the Most Gracious, the Most Merciful
          </span>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-semibold mb-6 shadow-xl">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Annual Grand Milad-un-Nabi Festival 2026</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Madrasa Milad <span className="gold-gradient-text">Management System</span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Streamlined event coordination, real-time live scoring, automated house point calculation, digital certificates, and participant analytics for our Madrasa Milad celebrations.
        </p>

        {/* Countdown Component */}
        <div className="mt-8">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">
            Grand Festival Countdown
          </div>
          <CountdownTimer targetDate="2026-08-15T09:00:00" />
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('live-scoring')}
            className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 text-slate-950 font-extrabold text-sm hover:brightness-110 shadow-lg shadow-amber-500/20 transition transform hover:-translate-y-0.5"
          >
            <Trophy className="w-4 h-4 text-slate-950" />
            <span>Watch Live Scoring</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('timetable')}
            className="flex items-center space-x-2 px-6 py-3.5 rounded-xl glass-panel text-amber-300 border border-amber-400/40 hover:bg-slate-800/80 text-sm font-bold transition transform hover:-translate-y-0.5"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>View Program Timetable</span>
          </button>
        </div>

        {/* Feature Pill Highlights */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          {[
            { title: 'Real-Time WebSockets', desc: 'Instant live leaderboard updates' },
            { title: '8-Criteria Judge Panel', desc: 'Transparent automated total scores' },
            { title: 'QR Code ID Cards', desc: 'Instant student check-in & badges' },
            { title: 'Dynamic PDF Reports', desc: 'Certificates & Excel data export' }
          ].map((item, idx) => (
            <div key={idx} className="glass-panel p-3.5 rounded-xl border border-emerald-500/20 bg-slate-900/60">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold mb-1">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{item.title}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
