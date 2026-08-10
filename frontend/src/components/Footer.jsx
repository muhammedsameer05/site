import React from 'react';
import { Heart, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-white border-t border-emerald-100 text-slate-700 py-12 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img src="/milad-logo.jpg" alt="Logo" className="w-10 h-10 rounded-full border border-amber-400 object-cover bg-white shadow-sm" />
              <div>
                <span className="text-base font-black emerald-gradient-text block leading-tight">
                  വൈബ് ഓഫ് മദീന 2K26
                </span>
                <span className="text-[10px] text-amber-600 font-bold font-mono">JAMALULLEYLI MADRASA, MKMJC</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Jamalulleyli Madrasa, MKMJC. Dedicated to nurturing Tajweed, Islamic eloquence, nasheeds, and character through annual Milad-un-Nabi celebrations.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider mb-4 font-mono">Quick Links</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><button onClick={() => onNavigate('home')} className="hover:text-emerald-600 transition">Home Page</button></li>
              <li><button onClick={() => onNavigate('live-scoring')} className="hover:text-emerald-600 transition">Live Leaderboard</button></li>
              <li><button onClick={() => onNavigate('timetable')} className="hover:text-emerald-600 transition">Program Schedule</button></li>
              <li><button onClick={() => onNavigate('results')} className="hover:text-emerald-600 transition">Official Results</button></li>
              <li><button onClick={() => onNavigate('gallery')} className="hover:text-emerald-600 transition">Photo & Video Gallery</button></li>
            </ul>
          </div>

          {/* Col 3: House System */}
          <div>
            <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider mb-4 font-mono">House Championship</h4>
            <div className="space-y-2 text-xs font-medium">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span>Green House</span></div>
              <div className="flex items-center space-x-2 text-blue-700 font-bold"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span><span>Blue House</span></div>
            </div>
          </div>

          {/* Col 4: Contact */}
          <div className="space-y-2 text-xs font-medium">
            <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider mb-4 font-mono">Madrasa Contact</h4>
            <div className="flex items-center space-x-2"><MapPin className="w-4 h-4 text-emerald-600 shrink-0" /><span>Red Gate, Payyannur</span></div>
            <div className="flex items-center space-x-2"><Phone className="w-4 h-4 text-emerald-600 shrink-0" /><span>+91 98765 43210</span></div>
            <div className="flex items-center space-x-2"><Mail className="w-4 h-4 text-emerald-600 shrink-0" /><span>info@jamalulleyli-madrasa.org</span></div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium">
          <p>© 2026 Jamalulleyli Madrasa, MKMJC - Vibe of Madeena 2K26. All rights reserved.</p>
          <div className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Crafted with devotion for Islamic Education</span>
            <Heart className="w-3.5 h-3.5 text-red-500 inline fill-red-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
