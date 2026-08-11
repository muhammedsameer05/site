import React, { useState } from 'react';
import { Sparkles, Trophy, Calendar, ArrowRight } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { useLanguage } from '../context/LanguageContext';

export default function Hero({ onNavigate }) {
  const { t } = useLanguage();
  const [timerFinished, setTimerFinished] = useState(false);

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/60 to-slate-50 py-12 sm:py-16 border-b border-emerald-100 rounded-3xl my-4 shadow-sm">
      
      {/* Background Watermark Image Overlay */}
      <div 
        className="absolute inset-0 opacity-5 bg-center bg-no-repeat bg-contain pointer-events-none filter blur-sm scale-110"
        style={{ backgroundImage: `url('/milad-logo.jpg')` }}
      />

      {/* Decorative Glow Orbs */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Arabic Calligraphy Header */}
        <div className="mb-4">
          <span className="text-2xl sm:text-4xl font-serif gold-gradient-text tracking-widest block font-bold">
            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </span>
          <span className="text-xs sm:text-sm text-emerald-800/80 font-mono tracking-widest mt-1 block uppercase font-bold">
            In the Name of Allah, the Most Gracious, the Most Merciful
          </span>
        </div>

        {/* Featured Official Milad Logo Card */}
        <div className="my-6 max-w-sm sm:max-w-md mx-auto">
          <div className="relative p-1.5 rounded-3xl bg-gradient-to-b from-emerald-400 via-amber-400 to-emerald-600 shadow-xl transform hover:scale-105 transition-transform duration-300">
            <div className="bg-white rounded-[22px] p-4 flex flex-col items-center border border-emerald-100">
              <img 
                src="/milad-logo.jpg" 
                alt="വൈബ് ഓഫ് മദീന 2K26 - Jamalullaili Secondary Madrasa, MKMJC - Payyanur" 
                className="w-full max-h-72 object-contain rounded-2xl drop-shadow-md"
              />
              <div className="mt-3 text-center">
                <span className="text-xs font-extrabold text-amber-600 block font-serif">
                  ജമലുല്ലൈലി സെക്കൻഡറി മദ്റസ, MKMJC - പയ്യന്നൂർ
                </span>
                <span className="text-lg font-black text-slate-900 block tracking-tight">
                  വൈബ് ഓഫ് മദീന <span className="emerald-gradient-text">2K26</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-extrabold mb-4 shadow-sm">
          <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>Jamalullaili Secondary Madrasa, MKMJC - Payyanur • Annual Milad Fest 2026</span>
        </div>



        {/* Countdown Component */}
        {!timerFinished && (
          <div className="mt-8">
            <div className="text-xs font-extrabold text-amber-700 uppercase tracking-widest mb-3">
              Grand Festival Countdown
            </div>
            <CountdownTimer 
              targetDate={localStorage.getItem('milad_cooldown_target_date') || '2026-08-15T09:00:00'} 
              onFinish={() => setTimerFinished(true)}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('live-scoring')}
            className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 transition transform hover:-translate-y-0.5"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Watch Live Scoring</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('programs')}
            className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 text-sm font-extrabold shadow-sm transition transform hover:-translate-y-0.5"
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>View All Programs</span>
          </button>
        </div>

      </div>
    </div>
  );
}
