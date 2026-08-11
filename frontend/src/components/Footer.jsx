import React from 'react';
import { Sparkles } from 'lucide-react';

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

          {/* Presented By SM VEXOR */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right">
            <div className="flex items-center space-x-3 text-xs font-extrabold text-amber-400 uppercase tracking-wider">
              <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-md border border-amber-400/50 flex items-center justify-center shrink-0">
                <img 
                  src="/sm-vexor-logo.png" 
                  alt="SM VEXOR Logo" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <div className="flex flex-col items-start md:items-end">
                <div className="flex items-center space-x-1.5">
                  <span className="text-amber-400 font-extrabold text-xs uppercase tracking-wider">Presented by</span>
                  <span className="text-white text-sm sm:text-base font-black tracking-wider underline decoration-amber-400">SM VEXOR</span>
                </div>
                <div className="text-xs font-bold text-slate-300 font-mono mt-0.5">
                  Contact: <span className="text-emerald-400 font-extrabold">6282330381</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div className="text-center text-xs text-slate-400 font-medium pt-2">
          <p>© 2026 Jamalullaili Secondary Madrasa, MKMJC - Payyanur • Vibe of Madeena 2K26. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}
