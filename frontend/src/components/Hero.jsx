import React from 'react';
import { Sparkles, Trophy, Calendar, ArrowRight } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { useLanguage } from '../context/LanguageContext';

export default function Hero({ onNavigate }) {
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden bg-[#021B15] py-12 sm:py-20 border-b border-amber-500/20">
      
      {/* Background Watermark Image Overlay */}
      <div 
        className="absolute inset-0 opacity-10 bg-center bg-no-repeat bg-contain pointer-events-none filter blur-sm scale-110"
        style={{ backgroundImage: `url('/milad-logo.jpg')` }}
      />

      {/* Decorative Glow Orbs */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

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

        {/* Featured Official Milad Logo Card */}
        <div className="my-6 max-w-sm sm:max-w-md mx-auto">
          <div className="relative p-2 rounded-3xl bg-gradient-to-b from-amber-400 via-emerald-600 to-amber-500 shadow-2xl shadow-emerald-950/80 transform hover:scale-105 transition-transform duration-300">
            <div className="bg-[#021B15] rounded-[22px] p-4 flex flex-col items-center border border-amber-400/30">
              <img 
                src="/milad-logo.jpg" 
                alt="വൈബ് ഓഫ് മദീന 2K26 - Jamalulleyli Madrasa" 
                className="w-full max-h-72 object-contain rounded-2xl drop-shadow-2xl"
              />
              <div className="mt-3 text-center">
                <span className="text-xs font-bold text-amber-300 block font-serif">
                  ജമലുല്ലൈലി മദ്റസ, MKMJC - റെ. ഗേറ്റ്, പയ്യന്നൂർ
                </span>
                <span className="text-lg font-black text-white block tracking-tight">
                  വൈബ് ഓഫ് മദീന <span className="gold-gradient-text">2K26</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-semibold mb-4 shadow-xl">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Jamalulleyli Madrasa Annual Milad Fest 2026</span>
        </div>

        <p className="mt-2 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Streamlined event coordination, real-time live scoring, automated house point calculation, digital certificates, and participant analytics.
        </p>

        {/* Countdown Component */}
        <div className="mt-8">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">
            Grand Festival Countdown
          </div>
          <CountdownTimer targetDate={localStorage.getItem('milad_cooldown_target_date') || '2026-08-15T09:00:00'} />
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

      </div>
    </div>
  );
}
