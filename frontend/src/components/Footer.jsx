import React from 'react';
import { Heart, Phone, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-emerald-900/40 text-slate-300 py-10 shadow-xl mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-8">
          {/* Brand */}
          <div className="flex items-center space-x-3.5 text-center md:text-left">
            <img src="/milad-logo.jpg" alt="Logo" className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover bg-white shadow-md shrink-0 mx-auto md:mx-0" />
            <div>
              <span className="text-lg font-black text-white block leading-tight">
                വൈബ് ഓഫ് മദീന <span className="emerald-gradient-text">2K26</span>
              </span>
              <span className="text-xs text-amber-400 font-bold font-mono tracking-wider block mt-0.5">
                Jamalullaili Secondary Madrasa, MKMJC - Payyanur
              </span>
            </div>
          </div>

          {/* Presented By SM VEXOR Badge */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 bg-slate-800/90 border border-amber-500/30 px-5 py-3 rounded-2xl shadow-lg backdrop-blur-md">
            <div className="flex items-center space-x-2 text-xs font-extrabold text-amber-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Presented by <strong className="text-white text-sm font-black tracking-widest underline decoration-amber-400">SM VEXOR</strong></span>
            </div>
            <a 
              href="tel:6282330381"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition transform hover:scale-105"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Contact: 6282330381</span>
            </a>
          </div>
        </div>

        {/* Bottom Credits Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-medium pt-2">
          <p>© 2026 Jamalullaili Secondary Madrasa, MKMJC - Payyanur • Vibe of Madeena 2K26.</p>
          <div className="flex items-center space-x-1.5 mt-2 sm:mt-0 text-slate-400">
            <span>Crafted with devotion by <strong className="text-amber-400 font-extrabold">SM VEXOR</strong> (6282330381)</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>

      </div>
    </footer>
  );
}
