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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-200 p-6 shadow-2xl relative bg-white text-slate-900">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold emerald-gradient-text mb-4 text-center">
          Official Student ID Badge
        </h3>

        {/* Printable ID Card */}
        <div 
          ref={cardRef} 
          className="bg-gradient-to-b from-emerald-50 via-white to-amber-50 p-6 rounded-2xl border-2 border-emerald-300 shadow-lg text-center space-y-4"
        >
          {/* Header */}
          <div className="border-b border-emerald-200 pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-serif text-white font-bold text-sm">
                م
              </div>
              <div className="text-left">
                <span className="text-xs font-extrabold text-emerald-900 block">MADRASA MILAD 2026</span>
                <span className="text-[9px] text-amber-700 block font-mono font-bold">OFFICIAL PARTICIPANT BADGE</span>
              </div>
            </div>
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>

          {/* Student Info */}
          <div className="space-y-1">
            <h4 className="text-xl font-bold text-slate-900">{student.name}</h4>
            {student.arabic_name && (
              <p className="text-lg font-serif text-emerald-800">{student.arabic_name}</p>
            )}
            <p className="text-xs text-slate-600 font-mono font-bold">
              Code No: {student.admission_no || student.student_id}
            </p>
          </div>

          {/* Details Pill */}
          <div className="grid grid-cols-3 gap-2 text-xs py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div>
              <span className="text-[10px] text-slate-500 block font-bold">Class</span>
              <span className="font-extrabold text-emerald-800">{student.class_name} ({student.division || 'A'})</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-bold">House</span>
              <span className="font-extrabold" style={{ color: student.house_color || '#059669' }}>
                {student.house_name || 'Green'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-bold">Category</span>
              <span className="font-extrabold text-amber-800">{student.category_name || 'Kiddies'}</span>
            </div>
          </div>

          {/* QR Code Canvas */}
          <div className="flex justify-center py-2">
            <div className="p-3 bg-white rounded-xl shadow border border-emerald-200">
              <QRCodeCanvas 
                value={JSON.stringify({ id: student.id, student_id: student.student_id, name: student.name, class: student.class_name })}
                size={120}
                level="H"
              />
            </div>
          </div>

          <p className="text-[10px] text-slate-500 font-mono font-bold">Scan for Instant Check-in & Result Verification</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 mt-6">
          <button
            onClick={downloadCard}
            className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Badge</span>
          </button>
        </div>

      </div>
    </div>
  );
}
