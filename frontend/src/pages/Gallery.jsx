import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, X, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Gallery() {
  const { user } = useAuth();
  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');

  const [items, setItems] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    album_name: 'Milad 2026',
    url: '',
    caption: ''
  });
  const [previewUrl, setPreviewUrl] = useState('');

  const loadGallery = () => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, url: reader.result }));
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.url) return alert('Please choose an image file to upload.');

    fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(() => {
        setShowUploadModal(false);
        setFormData({ title: '', album_name: 'Milad 2026', url: '', caption: '' });
        setPreviewUrl('');
        loadGallery();
      });
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this photo from the gallery?')) {
      fetch(`/api/gallery/${id}`, { method: 'DELETE' })
        .then(() => loadGallery());
    }
  };

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

        {/* Upload Button ONLY visible for Admins */}
        {isAdmin && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Image to Gallery</span>
          </button>
        )}
      </div>

      {/* Gallery Grid */}
      {items.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 text-slate-400 text-xs">
          No gallery photos uploaded yet. {isAdmin ? 'Click "+ Add Image to Gallery" above to upload photos.' : 'Check back during live festival events!'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map(item => (
            <div 
              key={item.id}
              onClick={() => setLightbox(item)}
              className="group glass-panel rounded-2xl border border-slate-800 overflow-hidden cursor-pointer hover:border-amber-400/50 transition duration-300 relative flex flex-col justify-between"
            >
              <div className="h-52 overflow-hidden bg-slate-950 relative">
                <img 
                  src={item.url} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                
                {/* Delete button for Admin */}
                {isAdmin && (
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-950/80 text-red-300 hover:bg-red-900 border border-red-500/40 transition z-10"
                    title="Delete Image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="p-4 bg-slate-900/90">
                <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition">{item.title}</h4>
                {item.caption && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.caption}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-amber-400/40 p-6 shadow-2xl bg-[#03241C] text-white my-8">
            <div className="flex items-center justify-between border-b border-amber-400/30 pb-3 mb-4">
              <h3 className="text-base font-bold emerald-gradient-text flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-amber-400" />
                <span>Upload Image to Gallery</span>
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Image Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Qiraat Competition Stage 1"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Upload Photo File</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleFileChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-300 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600"
                />
              </div>

              {previewUrl && (
                <div className="mt-2 text-center">
                  <span className="text-[10px] text-slate-400 block mb-1">Image Preview:</span>
                  <img src={previewUrl} alt="Preview" className="h-36 mx-auto object-cover rounded-lg border border-amber-400/40" />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Caption / Details (Optional)</label>
                <textarea
                  rows="2"
                  value={formData.caption}
                  onChange={e => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="Additional details about the event photo..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl glass-panel text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center space-x-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>Publish Image</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              {lightbox.caption && <p className="text-xs text-slate-300">{lightbox.caption}</p>}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
