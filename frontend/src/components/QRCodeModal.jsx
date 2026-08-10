import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Download, ShieldCheck, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function QRCodeModal({ student, onClose }) {
  const cardRef = useRef(null);

  if (!student) return null;

  const downloadCard = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { scale: 2 });
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `${student.name.replace(/\s+/g, '_')}_ID_Card.png`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-amber-400/40 p-6 shadow-2xl relative bg-slate-900 text-white">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold emerald-gradient-text mb-4 text-center">
          Official Student ID Badge
        </h3>

        {/* Printable ID Card */}
        <div 
          ref={cardRef} 
          className="bg-gradient-to-b from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-2xl border-2 border-amber-400/50 shadow-2xl text-center space-y-4"
        >
          {/* Header */}
          <div className="border-b border-amber-400/30 pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-serif text-amber-300 font-bold text-sm">
                م
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-amber-300 block">MADRASA MILAD 2026</span>
                <span className="text-[9px] text-emerald-400 block font-mono">OFFICIAL PARTICIPANT BADGE</span>
              </div>
            </div>
            <ShieldCheck className="w-6 h-6 text-amber-400" />
          </div>

          {/* Student Info */}
          <div className="space-y-1">
            <h4 className="text-xl font-bold text-white">{student.name}</h4>
            {student.arabic_name && (
              <p className="text-lg font-serif text-amber-300">{student.arabic_name}</p>
            )}
            <p className="text-xs text-slate-300 font-mono">
              Code No: {student.admission_no || student.student_id}
            </p>
          </div>

          {/* Details Pill */}
          <div className="grid grid-cols-3 gap-2 text-xs py-2 bg-slate-900/60 rounded-xl border border-slate-700/60">
            <div>
              <span className="text-[10px] text-slate-400 block">Class</span>
              <span className="font-bold text-emerald-300">{student.class_name} ({student.division})</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">House</span>
              <span className="font-bold" style={{ color: student.house_color || '#10b981' }}>
                {student.house_name || 'Green'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Age</span>
              <span className="font-bold text-amber-300">{student.age || 12} Yrs</span>
            </div>
          </div>

          {/* QR Code Canvas */}
          <div className="flex justify-center py-2">
            <div className="p-3 bg-white rounded-xl shadow-inner border border-amber-400">
              <QRCodeCanvas 
                value={JSON.stringify({ id: student.id, student_id: student.student_id, name: student.name, class: student.class_name })}
                size={120}
                level="H"
              />
            </div>
          </div>

          <p className="text-[10px] text-slate-400 font-mono">Scan for Instant Check-in & Result Verification</p>
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            onClick={downloadCard}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl glass-panel text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Badge</span>
          </button>
        </div>

      </div>
    </div>
  );
}
