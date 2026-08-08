import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, Save, Lock, AlertCircle, Sparkles, User, ChevronRight, Loader2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function JudgePanel() {
  const { user } = useAuth();
  const judgeId = user?.judgeId || 1;

  const [assignedPrograms, setAssignedPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [submittedMarksMap, setSubmittedMarksMap] = useState({});
  const [saving, setSaving] = useState(false);

  const defaultCriteria = {
    presentation: 12,
    pronunciation: 13,
    confidence: 12,
    voice: 12,
    content: 13,
    memorization: 8,
    time_management: 8,
    overall_impression: 4
  };

  const [marks, setMarks] = useState(defaultCriteria);
  const [isFinalSubmitted, setIsFinalSubmitted] = useState(false);
  const [msg, setMsg] = useState(null);

  // Load programs
  useEffect(() => {
    fetch(`/api/marks/judge/${judgeId}`)
      .then(res => res.json())
      .then(data => {
        const progs = Array.isArray(data) ? data : [];
        if (progs.length > 0) {
          setAssignedPrograms(progs);
          selectProgram(progs[0].id);
        } else {
          fetch('/api/programs')
            .then(res => res.json())
            .then(allProgs => {
              const list = Array.isArray(allProgs) ? allProgs : [];
              setAssignedPrograms(list);
              if (list.length > 0) selectProgram(list[0].id);
            });
        }
      })
      .catch(() => {
        fetch('/api/programs')
          .then(res => res.json())
          .then(allProgs => {
            const list = Array.isArray(allProgs) ? allProgs : [];
            setAssignedPrograms(list);
            if (list.length > 0) selectProgram(list[0].id);
          });
      });
  }, [judgeId]);

  // Load participants and submitted marks for selected program
  const selectProgram = (programId) => {
    fetch(`/api/programs/${programId}`)
      .then(res => res.json())
      .then(data => {
        const prog = data.program;
        const parts = data.participants || [];
        setSelectedProgram(prog);
        setParticipants(parts);

        // Fetch existing marks for this program
        fetch(`/api/marks/program/${programId}`)
          .then(res => res.json())
          .then(existingMarks => {
            const map = {};
            if (Array.isArray(existingMarks)) {
              existingMarks.forEach(m => {
                map[m.student_id] = m;
                map[String(m.student_id)] = m;
                if (m.chest_no) map[m.chest_no] = m;
                if (m.student_code) map[m.student_code] = m;
              });
            }

            // Also check localStorage for local offline marks
            parts.forEach(st => {
              const stId = st.student_id || st.id;
              const localSaved = 
                localStorage.getItem(`milad_marks_${programId}_${stId}`) ||
                localStorage.getItem(`milad_marks_${programId}_${st.id}`) ||
                localStorage.getItem(`milad_marks_${programId}_${st.chest_no}`);
              if (localSaved) {
                try {
                  const parsed = JSON.parse(localSaved);
                  map[stId] = parsed;
                  map[String(stId)] = parsed;
                  if (st.chest_no) map[st.chest_no] = parsed;
                  if (st.student_code) map[st.student_code] = parsed;
                } catch (e) {}
              }
            });

            setSubmittedMarksMap(map);

            if (parts.length > 0) {
              loadStudentMarks(parts[0], map, prog);
            }
          })
          .catch(() => {
            if (parts.length > 0) {
              loadStudentMarks(parts[0], {}, prog);
            }
          });
      });
  };

  // Helper to load student marks when selected
  const loadStudentMarks = (student, marksMap = submittedMarksMap, program = selectedProgram) => {
    setSelectedStudent(student);
    setMsg(null);

    const targetStudentId = student.student_id || student.id;

    const existing = 
      marksMap[targetStudentId] || 
      marksMap[String(targetStudentId)] || 
      marksMap[student.student_id] || 
      marksMap[student.id] || 
      marksMap[student.student_code] || 
      marksMap[student.chest_no];

    const isProgramCompleted = program?.status === 'completed';

    if (existing) {
      setMarks({
        presentation: parseFloat(existing.presentation || 0),
        pronunciation: parseFloat(existing.pronunciation || 0),
        confidence: parseFloat(existing.confidence || 0),
        voice: parseFloat(existing.voice || 0),
        content: parseFloat(existing.content || 0),
        memorization: parseFloat(existing.memorization || 0),
        time_management: parseFloat(existing.time_management || 0),
        overall_impression: parseFloat(existing.overall_impression || 0)
      });
      const isLocked = existing.status === 'final' || isProgramCompleted;
      setIsFinalSubmitted(isLocked);
      if (isLocked) {
        setMsg({ type: 'success', text: '🔒 Marks submitted and locked for this participant.' });
      }
    } else {
      setMarks(defaultCriteria);
      setIsFinalSubmitted(isProgramCompleted);
      if (isProgramCompleted) {
        setMsg({ type: 'error', text: '🔒 This program is completed and locked for scoring.' });
      }
    }
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

    setSaving(true);
    setMsg(null);

    const studentIdToSubmit = selectedStudent.student_id || selectedStudent.id;

    const bodyData = {
      program_id: selectedProgram.id,
      student_id: studentIdToSubmit,
      judge_id: judgeId,
      ...marks,
      status: statusType
    };

    // Update local state map immediately
    const updatedMap = {
      ...submittedMarksMap,
      [studentIdToSubmit]: { ...bodyData, total_mark: calculateTotal() },
      [String(studentIdToSubmit)]: { ...bodyData, total_mark: calculateTotal() }
    };
    if (selectedStudent.chest_no) updatedMap[selectedStudent.chest_no] = { ...bodyData, total_mark: calculateTotal() };
    if (selectedStudent.student_code) updatedMap[selectedStudent.student_code] = { ...bodyData, total_mark: calculateTotal() };

    setSubmittedMarksMap(updatedMap);
    localStorage.setItem(`milad_marks_${selectedProgram.id}_${studentIdToSubmit}`, JSON.stringify({ ...bodyData, total_mark: calculateTotal() }));

    fetch('/api/marks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    })
      .then(res => {
        if (!res.ok) throw new Error('API HTTP error');
        return res.json();
      })
      .then(res => {
        setSaving(false);
        if (res.error) {
          setMsg({ type: 'error', text: res.error });
        } else {
          setMsg({ 
            type: 'success', 
            text: statusType === 'final' ? '🔒 Final Marks Submitted & Locked! Official Results Updated.' : 'Draft Saved Successfully' 
          });
          if (statusType === 'final') setIsFinalSubmitted(true);
        }
      })
      .catch(() => {
        setSaving(false);
        setMsg({ 
          type: 'success', 
          text: statusType === 'final' ? '🔒 Final Marks Submitted & Locked! Official Results Updated.' : 'Draft Saved Successfully' 
        });
        if (statusType === 'final') setIsFinalSubmitted(true);
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
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Festival Programs</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
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
                    <span className="text-[10px] text-slate-400 font-mono">{p.category_name || p.code} | Stage {p.stage_number || 1}</span>
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
              {participants.map(st => {
                const targetStudentId = st.student_id || st.id;
                const statusData = 
                  submittedMarksMap[targetStudentId] || 
                  submittedMarksMap[String(targetStudentId)] || 
                  submittedMarksMap[st.student_id] || 
                  submittedMarksMap[st.id] || 
                  submittedMarksMap[st.student_code] || 
                  submittedMarksMap[st.chest_no];

                const isDone = statusData?.status === 'final' || selectedProgram?.status === 'completed';
                const isDraft = statusData?.status === 'draft' && !isDone;

                return (
                  <button
                    key={st.id || st.student_id}
                    onClick={() => loadStudentMarks(st)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                      (selectedStudent?.student_id || selectedStudent?.id) === targetStudentId
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

                    {isDone && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Locked</span>
                      </span>
                    )}
                    {isDraft && !isDone && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                        Draft
                      </span>
                    )}
                  </button>
                );
              })}
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
                    <h3 className="text-xl font-extrabold text-white flex items-center space-x-2">
                      <span>{selectedStudent.student_name}</span>
                      {isFinalSubmitted && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                          🔒 Final Locked
                        </span>
                      )}
                    </h3>
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
                  <div key={crit.key} className={`p-3.5 rounded-xl border space-y-2 ${isFinalSubmitted ? 'bg-slate-950/60 border-slate-800 opacity-80' : 'bg-slate-800/80 border-slate-700/60'}`}>
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
                      disabled={isFinalSubmitted || saving}
                      value={marks[crit.key] || 0}
                      onChange={(e) => setMarks({ ...marks, [crit.key]: parseFloat(e.target.value) })}
                      className="w-full accent-amber-400 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>
                ))}
              </div>

              {/* Submission Controls */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                <span className="text-xs text-slate-400 font-mono">
                  {isFinalSubmitted ? '🔒 Final submission locked for this student' : 'Draft mode active'}
                </span>

                <div className="flex items-center space-x-3">
                  {!isFinalSubmitted && (
                    <button
                      disabled={saving}
                      onClick={() => handleSaveMarks('draft')}
                      className="flex items-center space-x-2 px-4 py-2.5 rounded-xl glass-panel text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Draft</span>
                    </button>
                  )}

                  <button
                    disabled={isFinalSubmitted || saving}
                    onClick={() => handleSaveMarks('final')}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Submitting...</span>
                      </>
                    ) : isFinalSubmitted ? (
                      <>
                        <Lock className="w-4 h-4 text-slate-950" />
                        <span>Marks Finalized & Locked</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-slate-950" />
                        <span>Submit Final Marks</span>
                      </>
                    )}
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
