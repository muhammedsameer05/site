import React, { useState, useEffect } from 'react';
import { Layers, Download, Printer, FileSpreadsheet, FileText, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Reports() {
  const [activeReport, setActiveReport] = useState('house');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (activeReport === 'house') {
      fetch('/api/houses')
        .then(res => res.json())
        .then(data => {
          setReportData(Array.isArray(data) ? data : []);
          setLoading(false);
        });
    } else if (activeReport === 'students') {
      fetch('/api/students')
        .then(res => res.json())
        .then(data => {
          setReportData(Array.isArray(data) ? data : []);
          setLoading(false);
        });
    } else if (activeReport === 'programs') {
      fetch('/api/programs')
        .then(res => res.json())
        .then(data => {
          setReportData(Array.isArray(data) ? data : []);
          setLoading(false);
        });
    } else {
      setReportData([
        { id: 1, item: 'Stage Sound & Lighting', category: 'Infrastructure', cost: '₹25,000', status: 'Paid' },
        { id: 2, item: 'Certificates & Trophy Printing', category: 'Awards', cost: '₹18,500', status: 'Paid' },
        { id: 3, item: 'Food & Refreshments', category: 'Catering', cost: '₹32,000', status: 'Approved' }
      ]);
      setLoading(false);
    }
  }, [activeReport]);

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Milad_Report");
    XLSX.writeFile(wb, `Madrasa_Milad_${activeReport}_Report.xlsx`);
  };

  const exportPDF = async () => {
    const element = document.getElementById('report-table-content');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    pdf.addImage(imgData, 'PNG', 0, 0, width, 0);
    pdf.save(`Madrasa_Milad_${activeReport}_Report.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold emerald-gradient-text flex items-center space-x-2">
            <Layers className="w-6 h-6 text-amber-400" />
            <span>Comprehensive Analytics & Reports</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">Export Student, Program, House & Financial data to PDF & Excel</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportExcel}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow transition"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="glass-panel p-2 rounded-xl border border-slate-800 flex flex-wrap gap-2 text-xs">
        {[
          { id: 'house', label: 'House Standings Report' },
          { id: 'students', label: 'Student Roster Report' },
          { id: 'programs', label: 'Program Execution Report' },
          { id: 'financial', label: 'Financial Expense Report' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id)}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              activeReport === tab.id
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Output Content */}
      <div id="report-table-content" className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 pb-4 mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white uppercase">{activeReport} Analytics Summary</h3>
            <p className="text-xs text-slate-400 font-mono">Madrasat-ul-Huda Islamic Academy | Grand Milad 2026</p>
          </div>
          <span className="text-xs font-mono text-emerald-400">Total Entries: {reportData.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-amber-400 uppercase font-mono border-b border-slate-800">
              <tr>
                {activeReport === 'house' && (
                  <>
                    <th className="p-3">House Code</th>
                    <th className="p-3">House Name</th>
                    <th className="p-3">Captain</th>
                    <th className="p-3">Total Points</th>
                  </>
                )}
                {activeReport === 'students' && (
                  <>
                    <th className="p-3">Student ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">House</th>
                    <th className="p-3">Phone</th>
                  </>
                )}
                {activeReport === 'programs' && (
                  <>
                    <th className="p-3">Code</th>
                    <th className="p-3">Program Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Status</th>
                  </>
                )}
                {activeReport === 'financial' && (
                  <>
                    <th className="p-3">Expenditure Item</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Cost</th>
                    <th className="p-3">Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {reportData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  {activeReport === 'house' && (
                    <>
                      <td className="p-3 font-mono text-amber-300">{row.code}</td>
                      <td className="p-3 font-bold text-white">{row.name}</td>
                      <td className="p-3">{row.captain_name || 'N/A'}</td>
                      <td className="p-3 font-mono font-bold text-emerald-400 text-sm">{row.total_points} Pts</td>
                    </>
                  )}
                  {activeReport === 'students' && (
                    <>
                      <td className="p-3 font-mono text-amber-300">{row.student_id}</td>
                      <td className="p-3 font-bold text-white">{row.name}</td>
                      <td className="p-3">{row.class_name}</td>
                      <td className="p-3">{row.house_name}</td>
                      <td className="p-3 font-mono">{row.phone}</td>
                    </>
                  )}
                  {activeReport === 'programs' && (
                    <>
                      <td className="p-3 font-mono text-amber-300">{row.code}</td>
                      <td className="p-3 font-bold text-white">{row.name}</td>
                      <td className="p-3">{row.category_name}</td>
                      <td className="p-3 uppercase font-bold text-emerald-400">{row.status}</td>
                    </>
                  )}
                  {activeReport === 'financial' && (
                    <>
                      <td className="p-3 font-bold text-white">{row.item}</td>
                      <td className="p-3">{row.category}</td>
                      <td className="p-3 font-mono text-amber-300">{row.cost}</td>
                      <td className="p-3 text-emerald-400">{row.status}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
