import React, { useState, useRef } from 'react';
import { Award, Download, Printer, ShieldCheck, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Certificates() {
  const certificateRef = useRef(null);

  const [certData, setCertData] = useState({
    type: 'winner',
    recipient_name: 'Muhammed Danish',
    arabic_name: 'محمد دانش',
    program_name: 'Quran Recitation (Tilawat)',
    prize: '1st Prize',
    house_name: 'Green House',
    issue_date: 'August 15, 2026'
  });

  const generatePDF = async () => {
    if (!certificateRef.current) return;
    const canvas = await html2canvas(certificateRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save(`Certificate_${certData.recipient_name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold emerald-gradient-text flex items-center space-x-2">
            <Award className="w-6 h-6 text-amber-400" />
            <span>Digital PDF Certificate Generator</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">Generate official certificates for Winners, Participants, Judges, Volunteers & Coordinators</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl glass-panel text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <button
            onClick={generatePDF}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg transition"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Control Inputs */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <label className="block text-slate-400 mb-1">Certificate Type</label>
          <select
            value={certData.type}
            onChange={e => setCertData({ ...certData, type: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
          >
            <option value="winner">Winner Certificate</option>
            <option value="participation">Participation Certificate</option>
            <option value="judge">Judge Certificate</option>
            <option value="volunteer">Volunteer Certificate</option>
            <option value="coordinator">Coordinator Certificate</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 mb-1">Recipient Name</label>
          <input
            type="text"
            value={certData.recipient_name}
            onChange={e => setCertData({ ...certData, recipient_name: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1">Program / Competition</label>
          <input
            type="text"
            value={certData.program_name}
            onChange={e => setCertData({ ...certData, program_name: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1">Prize / Rank</label>
          <input
            type="text"
            value={certData.prize}
            onChange={e => setCertData({ ...certData, prize: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
          />
        </div>
      </div>

      {/* Certificate Preview Frame */}
      <div className="flex justify-center overflow-x-auto p-4">
        
        <div 
          ref={certificateRef}
          className="w-[842px] h-[595px] bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 border-[12px] border-amber-500/80 p-10 relative flex flex-col justify-between text-center shadow-2xl text-white rounded-xl"
        >
          {/* Outer Ornamental Frame Accent */}
          <div className="absolute inset-2 border-2 border-amber-400/40 pointer-events-none rounded-lg" />
          
          {/* Certificate Header */}
          <div>
            <div className="text-xl font-serif gold-gradient-text tracking-widest block font-bold mb-1">
              بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </div>
            <h2 className="text-2xl font-bold text-amber-400 tracking-wider">MADRASAT-UL-HUDA ISLAMIC ACADEMY</h2>
            <p className="text-xs text-emerald-400 font-mono tracking-widest uppercase">Annual Grand Milad-un-Nabi Festival 2026</p>
          </div>

          {/* Certificate Title */}
          <div className="my-2">
            <h1 className="text-4xl font-serif font-black tracking-wider uppercase text-amber-300">
              {certData.type === 'winner' ? 'CERTIFICATE OF EXCELLENCE' : 
               certData.type === 'participation' ? 'CERTIFICATE OF PARTICIPATION' :
               certData.type === 'judge' ? 'CERTIFICATE OF APPRECIATION' : 'CERTIFICATE OF HONOR'}
            </h1>
            <div className="w-48 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-2" />
          </div>

          {/* Body Statement */}
          <div className="space-y-3 max-w-2xl mx-auto">
            <p className="text-sm text-slate-300">This is to proudly certify that</p>
            <h3 className="text-3xl font-extrabold text-white font-serif tracking-wide text-amber-300">
              {certData.recipient_name}
            </h3>
            {certData.arabic_name && (
              <p className="text-xl font-serif text-amber-400/90">{certData.arabic_name}</p>
            )}

            <p className="text-sm text-slate-300 leading-relaxed">
              has secured <span className="font-extrabold text-amber-400">{certData.prize}</span> in the <span className="font-bold text-emerald-300">{certData.program_name}</span> competition representing <span className="font-bold text-amber-300">{certData.house_name}</span> during the Grand Milad Celebrations.
            </p>
          </div>

          {/* Signatures & Seal */}
          <div className="flex items-center justify-between border-t border-amber-400/30 pt-6 px-8">
            <div className="text-center">
              <div className="font-serif italic text-amber-300 text-sm font-bold">Sayyid Muhammed</div>
              <div className="w-32 border-b border-slate-600 mx-auto my-1" />
              <span className="text-[10px] font-mono text-slate-400 uppercase">Principal & Chairman</span>
            </div>

            <div className="w-16 h-16 rounded-full border-2 border-amber-400 flex items-center justify-center bg-emerald-950/80 shadow-lg">
              <ShieldCheck className="w-8 h-8 text-amber-400" />
            </div>

            <div className="text-center">
              <div className="font-serif italic text-amber-300 text-sm font-bold">Abdul Rahman</div>
              <div className="w-32 border-b border-slate-600 mx-auto my-1" />
              <span className="text-[10px] font-mono text-slate-400 uppercase">Convener & Secretary</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
