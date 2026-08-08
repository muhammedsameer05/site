import React from 'react';
import { Heart, Globe, Phone, Mail, MapPin, Shield } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-slate-950 border-t border-emerald-500/20 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-serif text-white font-bold">
                م
              </div>
              <span className="text-lg font-bold emerald-gradient-text">MADRASA MILAD</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Madrasat-ul-Huda Islamic Academy. Dedicated to nurturing knowledge, Tajweed, Islamic eloquence, and character through annual Milad-un-Nabi celebrations.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('home')} className="hover:text-emerald-300 transition">Home Page</button></li>
              <li><button onClick={() => onNavigate('live-scoring')} className="hover:text-emerald-300 transition">Live Leaderboard</button></li>
              <li><button onClick={() => onNavigate('timetable')} className="hover:text-emerald-300 transition">Program Schedule</button></li>
              <li><button onClick={() => onNavigate('results')} className="hover:text-emerald-300 transition">Official Results</button></li>
              <li><button onClick={() => onNavigate('gallery')} className="hover:text-emerald-300 transition">Photo & Video Gallery</button></li>
            </ul>
          </div>

          {/* Col 3: House System */}
          <div>
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4">House Colors</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span>Green House</span></div>
              <div className="flex items-center space-x-2 text-blue-400"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span><span>Blue House</span></div>
              <div className="flex items-center space-x-2 text-red-400"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span><span>Red House</span></div>
              <div className="flex items-center space-x-2 text-amber-400"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span>Yellow House</span></div>
            </div>
          </div>

          {/* Col 4: Contact */}
          <div className="space-y-2 text-xs">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4">Madrasa Contact</h4>
            <div className="flex items-center space-x-2"><MapPin className="w-4 h-4 text-emerald-400 shrink-0" /><span>Madrasa Nagar, Main Road, Calicut</span></div>
            <div className="flex items-center space-x-2"><Phone className="w-4 h-4 text-emerald-400 shrink-0" /><span>+91 98765 43210</span></div>
            <div className="flex items-center space-x-2"><Mail className="w-4 h-4 text-emerald-400 shrink-0" /><span>info@madrasat-ul-huda.org</span></div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 Madrasa Milad Management System. All rights reserved.</p>
          <div className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Crafted with devotion for Islamic Education</span>
            <Heart className="w-3.5 h-3.5 text-red-500 inline fill-red-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
