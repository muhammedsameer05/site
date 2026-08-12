import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-emerald-900/30 text-slate-400 py-3 mt-8 text-xs">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        
        {/* Brand */}
        <div className="flex items-center space-x-2.5 justify-center md:justify-start">
          <img src="/milad-logo.jpg" alt="Logo" className="w-8 h-8 rounded-full border border-amber-400 object-cover bg-white shadow-xs shrink-0" />
          <div>
            <div className="font-extrabold text-white text-xs sm:text-sm leading-none flex items-center space-x-1 justify-center md:justify-start">
              <span>വൈബ് ഓഫ് മദീന</span>
              <span className="text-emerald-400 font-black">2K26</span>
            </div>
            <span className="text-[10px] text-amber-400 font-bold font-mono tracking-tight block mt-0.5">
              Jamalullaili Secondary Madrasa, MKMJC - Payyanur
            </span>
          </div>
        </div>

        {/* Copyright notice */}
        <div className="text-[11px] text-slate-400 font-medium my-1 md:my-0">
          © 2026 Jamalullaili Secondary Madrasa • Vibe of Madeena 2K26. All rights reserved.
        </div>

        {/* Presented By SM VEXOR */}
        <div className="flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] justify-center">
          <img 
            src="/sm-vexor-logo.png" 
            alt="SM VEXOR Logo" 
            className="w-6 h-6 object-contain bg-white rounded-md p-0.5" 
          />
          <div className="flex flex-col text-left md:text-right leading-tight">
            <div className="flex items-center space-x-1">
              <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold">Presented by</span>
              <span className="text-white font-black text-xs">SM VEXOR</span>
            </div>
            <span className="text-[10px] text-slate-300 font-mono">
              Contact: <span className="text-emerald-400 font-bold">6282330381</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
