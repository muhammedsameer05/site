import React, { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Video, Plus, X } from 'lucide-react';

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold emerald-gradient-text flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <span>Milad Festival Photo & Video Gallery</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">Capture highlights, stage performances, and award ceremonies</p>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map(item => (
          <div 
            key={item.id}
            onClick={() => setLightbox(item)}
            className="group glass-panel rounded-2xl border border-slate-800 overflow-hidden cursor-pointer hover:border-amber-400/50 transition duration-300 relative"
          >
            <div className="h-48 overflow-hidden bg-slate-950">
              <img 
                src={item.url} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
            </div>
            <div className="p-4 bg-slate-900/90">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
                {item.album_name}
              </span>
              <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition">{item.title}</h4>
              {item.caption && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.caption}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
          <div className="max-w-3xl w-full glass-panel rounded-2xl border border-amber-400/40 p-4 relative bg-slate-900">
            <button 
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={lightbox.url} alt={lightbox.title} className="w-full max-h-[70vh] object-contain rounded-xl mb-4" />
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">{lightbox.title}</h3>
              <p className="text-xs text-slate-300">{lightbox.caption}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
