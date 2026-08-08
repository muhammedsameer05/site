import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, Save, Lock, AlertCircle, Sparkles, User, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function JudgePanel() {
  const { user } = useAuth();
  const judgeId = user?.judgeId || 1;

  const [assignedPrograms, setAssignedPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [marks, setMarks] = useState({
    presentation: 12,
    pronunciation: 13,
    confidence: 12,
    voice: 12,
    content: 13,
    memorization: 8,
    time_management: 8,
    overall_impression: 4
  });

  const [isFinalSubmitted, setIsFinalSubmitted] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetch(`/api/marks/judge/${judgeId}`)
      .then(res => res.json())
      .then(data => {
        const progs = Array.isArray(data) ? data : [];
        setAssignedPrograms(progs);
        if (progs.length > 0) {
          selectProgram(progs[0].id);
        }
      })
      .catch(() => {});
  }, [judgeId]);

  const selectProgram = (programId) => {
    fetch(`/api/programs/${programId}`)
      .then(res => res.json())
      .then(data => {
        setSelectedProgram(data.program);
        setParticipants(data.participants || []);
        if (data.participants?.length > 0) {
          setSelectedStudent(data.participants[0]);
        }
      });
  };

  const calculateTotal = () => {
    return (
      parseFloat(marks.presentation || 0) +
      parseFloat(marks.pronunciation || 0) +
      parseFloat(marks.confidence || 0) +
      parseFloat(marks.voice || 0) +
      parseFloat(marks.content || 0) +
      parseFloat(marks.memorization || 0) +
      parseFloat(marks.time_management || 0) +
      parseFloat(marks.overall_impression || 0)
    );
  };

  const handleSaveMarks = (statusType) => {
    if (!selectedProgram || !selectedStudent) return;

    const bodyData = {
      program_id: selectedProgram.id,
      student_id: selectedStudent.student_id,
      judge_id: judgeId,
      ...marks,
      status: statusType
    };

    fetch('/api/marks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    })
      .then(res => res.json())
      .then(res => {
        if (res.error) {
          setMsg({ type: 'error', text: res.error });
        } else {
          setMsg({ type: 'success', text: statusType === 'final' ? 'Final Marks Submitted & Locked!' : 'Draft Saved Successfully' });
          if (statusType === 'final') setIsFinalSubmitted(true);
        }
      });
  };

  const totalScore = calculateTotal();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold emerald-gradient-text flex items-center space-x-2">
          <Award className="w-6 h-6 text-amber-400" />
          <span>Judge Evaluation & Scoring Panel</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono">Assigned Judge: {user?.name || 'Qari Zakariya Al-Hafiz'}</p>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center space-x-2 ${
          msg.type === 'error' ? 'bg-red-950/80 text-red-300 border border-red-500/40' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
        }`}>
          <AlertCircle className="w-4 h-4" />
          <span>{msg.text}</span>
        </div>
      )}

      {/* Main Scoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Programs & Participants List */}
        <div className="space-y-4">
          
          {/* Program Select */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Assigned Programs</h3>
            <div className="space-y-1">
              {assignedPrograms.map(p => (
                <button
                  key={p.id}
                  onClick={() => selectProgram(p.id)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                    selectedProgram?.id === p.id
                      ? 'bg-emerald-600/30 text-amber-300 border border-amber-400/40 shadow'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <span className="block font-bold">{p.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{p.code} | Stage {p.stage_number}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Participants List */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Chest No / Participants</h3>
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {participants.map(st => (
                <button
                  key={st.id}
                  onClick={() => {
                    setSelectedStudent(st);
                    setIsFinalSubmitted(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                    selectedStudent?.id === st.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                      : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-300 font-mono font-extrabold flex items-center justify-center border border-emerald-500/30">
                      #{st.chest_no}
                    </span>
                    <div>
                      <span className="block text-white">{st.student_name}</span>
                      <span className="text-[10px] text-slate-400">{st.house_name}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right 2 Cols: Evaluation Criteria Sheet */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-amber-500/30 bg-slate-900">
          
          {selectedStudent ? (
            <div className="space-y-6">
              
              {/* Student Selected Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-mono font-black text-amber-300 text-lg">
                    #{selectedStudent.chest_no}
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white">{selectedStudent.student_name}</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {selectedStudent.student_code} | {selectedStudent.class_name} | {selectedStudent.house_name}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-mono">Calculated Total</span>
                  <span className="text-3xl font-black gold-gradient-text font-mono">{totalScore.toFixed(1)} / 100</span>
                </div>
              </div>

              {/* 8 Criteria Sliders & Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'presentation', label: 'Presentation & Stage Presence', max: 15 },
                  { key: 'pronunciation', label: 'Pronunciation / Tajweed', max: 15 },
                  { key: 'confidence', label: 'Confidence & Body Language', max: 15 },
                  { key: 'voice', label: 'Voice Culture & Pitch Modulation', max: 15 },
                  { key: 'content', label: 'Content Depth & Accuracy', max: 15 },
                  { key: 'memorization', label: 'Memorization & Fluency', max: 10 },
                  { key: 'time_management', label: 'Time Management', max: 10 },
                  { key: 'overall_impression', label: 'Overall Impression', max: 5 }
                ].map((crit) => (
                  <div key={crit.key} className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{crit.label}</span>
                      <span className="font-mono font-bold text-amber-400">
                        {marks[crit.key] || 0} / {crit.max}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max={crit.max}
                      step="0.5"
                      disabled={isFinalSubmitted}
                      value={marks[crit.key] || 0}
                      onChange={(e) => setMarks({ ...marks, [crit.key]: parseFloat(e.target.value) })}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              {/* Submission Controls */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                <span className="text-xs text-slate-400 font-mono">
                  {isFinalSubmitted ? '🔒 Final submission locked' : 'Draft mode active'}
                </span>

                <div className="flex items-center space-x-3">
                  <button
                    disabled={isFinalSubmitted}
                    onClick={() => handleSaveMarks('draft')}
                    className="flex items-center space-x-2 px-4 py-2.5 rounded-xl glass-panel text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Draft</span>
                  </button>

                  <button
                    disabled={isFinalSubmitted}
                    onClick={() => handleSaveMarks('final')}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4 text-slate-950" />
                    <span>Submit Final Marks</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center text-slate-400 py-12 text-xs font-mono">Select a program and student participant to start evaluation</div>
          )}

        </div>

      </div>

    </div>
  );
}
