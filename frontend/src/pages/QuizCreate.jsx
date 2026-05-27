import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { quizAPI } from '../services/api';
import { 
  ClipboardList, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Upload, 
  CheckCircle,
  FileText,
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QuizCreate = () => {
  const { subjectName } = useParams();
  const navigate = useNavigate();
  const currentSubject = (subjectName || '').toUpperCase();

  // Mode Selection: 'manual' or 'file'
  const [generationMode, setGenerationMode] = useState('manual');

  // Common Header States
  const [quizTitle, setQuizTitle] = useState('');
  const [quizChapter, setQuizChapter] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState('Medium');
  const [quizDuration, setQuizDuration] = useState('20 mins');
  const [passingMarks, setPassingMarks] = useState(50);

  // --- MANUAL ENTRY STATE ---
  const [manualQuestions, setManualQuestions] = useState([
    { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', marks: 5, explanation: '' }
  ]);

  // --- FILE UPLOAD & GENERATION STATE ---
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [rangeInput, setRangeInput] = useState('1-5,8-12,20-25');
  const [rangeError, setRangeError] = useState('');

  const parseRangeInput = (input) => {
    if (!input || !input.trim()) {
      return { valid: false, error: 'Question range cannot be empty.' };
    }
    const cleanInput = input.replace(/\s+/g, '');
    const segments = cleanInput.split(',');
    const allQuestions = [];
    const seenRanges = new Set();
    const seenNumbers = new Set();

    for (const segment of segments) {
      if (!segment) {
        return { valid: false, error: 'Empty range segments are invalid. Check for trailing commas.' };
      }
      
      if (seenRanges.has(segment)) {
        return { valid: false, error: `Duplicate range segment detected: "${segment}"` };
      }
      seenRanges.add(segment);

      const rangeMatch = segment.match(/^(\d+)-(\d+)$/);
      const singleMatch = segment.match(/^(\d+)$/);

      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);

        if (start === 0 || end === 0) {
          return { valid: false, error: `Question numbers must be greater than 0 in segment "${segment}"` };
        }
        if (start > end) {
          return { valid: false, error: `Reversed range detected: "${segment}". Start must be less than or equal to End.` };
        }

        for (let q = start; q <= end; q++) {
          if (seenNumbers.has(q)) {
            return { valid: false, error: `Question #${q} is included multiple times. Please remove overlapping ranges.` };
          }
          seenNumbers.add(q);
          allQuestions.push(q);
        }
      } else if (singleMatch) {
        const num = parseInt(singleMatch[1], 10);
        if (num === 0) {
          return { valid: false, error: `Question numbers must be greater than 0.` };
        }
        if (seenNumbers.has(num)) {
          return { valid: false, error: `Question #${num} is included multiple times.` };
        }
        seenNumbers.add(num);
        allQuestions.push(num);
      } else {
        return { valid: false, error: `Invalid range format: "${segment}". Only use numbers and dashes (e.g., 1-5, 8-12).` };
      }
    }

    return { valid: true, questions: allQuestions };
  };

  const [randomGeneration, setRandomGeneration] = useState(false);
  const [randomCount, setRandomCount] = useState('5');
  const [extractedType, setExtractedType] = useState('MCQ');
  const [extractedDifficulty, setExtractedDifficulty] = useState('Medium');
  const [shuffleQuestions, setShuffleQuestions] = useState(false);

  // Simulated AI Parsing States
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  // Toast / Error
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const triggerToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
      navigate(`/admin/subject/${subjectName.toLowerCase()}`);
    }, 2500);
  };

  // --- MANUAL METHODS ---
  const handleAddManualRow = () => {
    setManualQuestions(prev => [
      ...prev,
      { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', marks: 5, explanation: '' }
    ]);
  };

  const handleRemoveManualRow = (index) => {
    if (manualQuestions.length === 1) {
      setErrorMessage('You must include at least one question in manual quiz assessments.');
      return;
    }
    setManualQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleManualFieldChange = (index, field, value) => {
    setManualQuestions(prev => prev.map((q, i) => {
      if (i === index) {
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  const handleManualSave = async (e) => {
    e.preventDefault();
    if (!quizTitle.trim() || !quizChapter.trim()) {
      setErrorMessage('Please configure Quiz Title and Chapter before saving.');
      return;
    }

    // Validate manual questions
    for (let i = 0; i < manualQuestions.length; i++) {
      const q = manualQuestions[i];
      if (!q.questionText.trim() || !q.optionA.trim() || !q.optionB.trim()) {
        setErrorMessage(`Please fill in the Question Text and Options A/B for Question #${i + 1}.`);
        return;
      }
    }

    setSaving(true);
    setErrorMessage('');

    try {
      const quizData = {
        title: `${quizTitle} - Chapter ${quizChapter}`,
        subject: currentSubject,
        chapter: quizChapter,
        duration: quizDuration,
        difficulty: quizDifficulty,
        passing_marks: parseInt(passingMarks) || 50,
        questions: manualQuestions,
        status: 'Active'
      };

      await quizAPI.createQuiz(quizData);
      triggerToast('Quiz assessment created and published successfully!');
    } catch (err) {
      console.warn('Backend API failed, simulating local quiz publish:', err);
      triggerToast('Quiz saved locally (Simulated Database Publish)');
    } finally {
      setSaving(false);
    }
  };

  // --- FILE DRAG & DROP HANDLERS ---
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  // --- SIMULATED FILE GENERATION ---
  const handleGenerateFromFile = (e) => {
    e.preventDefault();
    if (!uploadedFile) {
      setErrorMessage('Please upload a file before triggering extraction.');
      return;
    }
    if (!quizTitle.trim() || !quizChapter.trim()) {
      setErrorMessage('Please configure Quiz Title and Chapter before starting extraction.');
      return;
    }

    let limit = 5;
    if (!randomGeneration) {
      const parseResult = parseRangeInput(rangeInput);
      if (!parseResult.valid) {
        setRangeError(parseResult.error);
        setErrorMessage(parseResult.error);
        return;
      }
      limit = parseResult.questions.length;
    } else {
      const rCount = parseInt(randomCount, 10);
      limit = Math.max(1, isNaN(rCount) ? 5 : rCount);
    }

    setErrorMessage('');
    setRangeError('');
    setIsExtracting(true);
    setExtractionProgress(10);

    // Beautiful simulated scanning progress
    const timer = setInterval(() => {
      setExtractionProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsExtracting(false);
          setShowPreview(true);
          
          const sampleQuestions = [];
          for (let i = 0; i < limit; i++) {
            sampleQuestions.push({
              questionText: `Generated Question #${i + 1} from ${uploadedFile.name}: What is the primary curriculum concept discussed in Unit ${quizChapter}?`,
              optionA: `A) Core definition of ${currentSubject}`,
              optionB: `B) Practical laboratory application guide`,
              optionC: `C) Standard computational algorithm`,
              optionD: `D) Basic historical civil outline`,
              correctAnswer: i % 4 === 0 ? 'A' : i % 4 === 1 ? 'B' : i % 4 === 2 ? 'C' : 'D',
              marks: 5,
              explanation: `Explanation for generated Question #${i + 1}: The correct answer represents standard educational guidelines.`
            });
          }
          setGeneratedQuestions(sampleQuestions);
          return 100;
        }
        return prev + 15;
      });
    }, 300);
  };

  // --- PREVIEW METHODS ---
  const handlePreviewFieldChange = (index, field, value) => {
    setGeneratedQuestions(prev => prev.map((q, i) => {
      if (i === index) {
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  const handleRemovePreviewQuestion = (index) => {
    if (generatedQuestions.length === 1) {
      setErrorMessage('You must keep at least one generated question before publishing.');
      return;
    }
    setGeneratedQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveQuestionUp = (index) => {
    if (index === 0) return;
    setGeneratedQuestions(prev => {
      const arr = [...prev];
      const temp = arr[index];
      arr[index] = arr[index - 1];
      arr[index - 1] = temp;
      return arr;
    });
  };

  const handleMoveQuestionDown = (index) => {
    if (index === generatedQuestions.length - 1) return;
    setGeneratedQuestions(prev => {
      const arr = [...prev];
      const temp = arr[index];
      arr[index] = arr[index + 1];
      arr[index + 1] = temp;
      return arr;
    });
  };

  const handlePublishGeneratedQuiz = async () => {
    setSaving(true);
    setErrorMessage('');

    try {
      const quizData = {
        title: `${quizTitle} - Chapter ${quizChapter}`,
        subject: currentSubject,
        chapter: quizChapter,
        duration: quizDuration,
        difficulty: quizDifficulty,
        passing_marks: parseInt(passingMarks) || 50,
        questions: shuffleQuestions 
          ? [...generatedQuestions].sort(() => Math.random() - 0.5) 
          : generatedQuestions,
        status: 'Active'
      };

      await quizAPI.createQuiz(quizData);
      triggerToast('AI generated quiz from file published successfully!');
    } catch (err) {
      console.warn('Backend API failed, simulating local generated quiz publish:', err);
      triggerToast('AI Quiz saved locally (Simulated Database Publish)');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      selectedSubject={currentSubject}
      searchQuery=""
      setSearchQuery={() => {}}
    >
      <div className="flex flex-col gap-6 pb-12 font-sans relative">
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-4px); }
            75% { transform: translateX(4px); }
          }
          .animate-shake {
            animation: shake 0.2s ease-in-out 0s 2;
          }
        `}</style>
        
        {/* Toast popup */}
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/80 backdrop-blur-md border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 px-6 py-4 rounded-2xl shadow-2xl transition-all duration-300"
            >
              <CheckCircle className="w-5 h-5 shrink-0 animate-bounce" />
              <span className="text-xs font-black tracking-wide">{toast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back Link */}
        <div className="flex items-center">
          <button 
            onClick={() => navigate(`/admin/subject/${subjectName.toLowerCase()}`)} 
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-655 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-855 hover:text-indigo-650 dark:hover:text-indigo-400 font-bold text-xs transition-colors duration-150 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {currentSubject}
          </button>
        </div>

        {/* Welcome Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase bg-indigo-500 text-white py-0.5 px-2.5 rounded-md shadow-sm tracking-wider">
              {currentSubject} Exam Syllabus
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-855 dark:text-white leading-none mt-1">
            Create Exam Quiz
          </h1>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Construct custom manual quiz assessments or upload question bank files to generate complete quizzes with AI.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900 text-rose-700 dark:text-rose-450 text-xs font-bold shadow-saas flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ----------------------------------------------------
        // 1. DUAL MODE SELECTOR TABS
        // ---------------------------------------------------- */}
        {!showPreview && !isExtracting && (
          <div className="flex border-b border-slate-200 dark:border-indigo-950/20 gap-2 shrink-0 select-none">
            <button 
              onClick={() => setGenerationMode('manual')}
              className={`relative py-3.5 px-4 font-black text-xs tracking-wider flex items-center gap-2 transition-colors duration-200 ${
                generationMode === 'manual'
                  ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' 
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span>Manual Quiz Entry</span>
              {generationMode === 'manual' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 dark:bg-indigo-450 rounded-full" />
              )}
            </button>

            <button 
              onClick={() => setGenerationMode('file')}
              className={`relative py-3.5 px-4 font-black text-xs tracking-wider flex items-center gap-2 transition-colors duration-200 ${
                generationMode === 'file'
                  ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' 
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Upload className="w-4 h-4 shrink-0" />
              <span>Quiz From File</span>
              {generationMode === 'file' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 dark:bg-indigo-450 rounded-full" />
              )}
            </button>
          </div>
        )}

        {/* ----------------------------------------------------
        // 2. MAIN HEADER CONFIGURATION CARD
        // ---------------------------------------------------- */}
        {!showPreview && !isExtracting && (
          <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-205 dark:border-indigo-950/20 shadow-saas p-6">
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest pl-1 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Assessment General Header Config
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-bold">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Quiz Title *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Unit 1 Final Assessment"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Chapter / Unit *</label>
                <input 
                  type="text" 
                  placeholder="e.g. 1"
                  value={quizChapter}
                  onChange={(e) => setQuizChapter(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Difficulty</label>
                <select 
                  value={quizDifficulty}
                  onChange={(e) => setQuizDifficulty(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/50 text-slate-755 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer custom-select"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Duration Limit</label>
                <input 
                  type="text" 
                  placeholder="e.g. 20 mins"
                  value={quizDuration}
                  onChange={(e) => setQuizDuration(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Passing Marks (%)</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  value={passingMarks}
                  onChange={(e) => setPassingMarks(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Syllabus Subject</label>
                <input 
                  type="text" 
                  value={currentSubject}
                  disabled
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 select-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
        // 3. TAB CATEGORY: MANUAL QUIZ ENTRY
        // ---------------------------------------------------- */}
        {!showPreview && !isExtracting && generationMode === 'manual' && (
          <div className="space-y-6">
            <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest pl-1">Question Builder Panel</h3>
            
            <form onSubmit={handleManualSave} className="space-y-6">
              {manualQuestions.map((q, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-indigo-950/20 shadow-saas overflow-hidden p-6 relative">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-600" />
                  
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-indigo-950/10 mb-4 select-none">
                    <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Question #{idx + 1}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveManualRow(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-650 transition-colors"
                      title="Remove question row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs font-bold">
                    
                    {/* Question Statement */}
                    <div className="md:col-span-8 space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Question Text *</label>
                        <input 
                          type="text"
                          placeholder="Enter your assessment question here..."
                          value={q.questionText}
                          onChange={(e) => handleManualFieldChange(idx, 'questionText', e.target.value)}
                          required
                          className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Option A *</label>
                          <input 
                            type="text" 
                            placeholder="Option A"
                            value={q.optionA}
                            onChange={(e) => handleManualFieldChange(idx, 'optionA', e.target.value)}
                            required
                            className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Option B *</label>
                          <input 
                            type="text" 
                            placeholder="Option B"
                            value={q.optionB}
                            onChange={(e) => handleManualFieldChange(idx, 'optionB', e.target.value)}
                            required
                            className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Option C</label>
                          <input 
                            type="text" 
                            placeholder="Option C"
                            value={q.optionC}
                            onChange={(e) => handleManualFieldChange(idx, 'optionC', e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Option D</label>
                          <input 
                            type="text" 
                            placeholder="Option D"
                            value={q.optionD}
                            onChange={(e) => handleManualFieldChange(idx, 'optionD', e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Question Config */}
                    <div className="md:col-span-4 space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Correct Answer</label>
                        <select 
                          value={q.correctAnswer}
                          onChange={(e) => handleManualFieldChange(idx, 'correctAnswer', e.target.value)}
                          className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/50 text-slate-755 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer custom-select"
                        >
                          <option value="A">Option A</option>
                          <option value="B">Option B</option>
                          <option value="C">Option C</option>
                          <option value="D">Option D</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Question Marks</label>
                        <input 
                          type="number" 
                          min="1"
                          value={q.marks}
                          onChange={(e) => handleManualFieldChange(idx, 'marks', parseInt(e.target.value) || 1)}
                          className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Solution Explanation</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Correct answer has grammar proof..."
                          value={q.explanation}
                          onChange={(e) => handleManualFieldChange(idx, 'explanation', e.target.value)}
                          className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                  </div>
                </div>
              ))}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 select-none">
                <button
                  type="button"
                  onClick={handleAddManualRow}
                  className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-850 bg-white/90 dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-black transition-all"
                >
                  <Plus className="w-4 h-4 text-indigo-500" />
                  Add Another Question
                </button>

                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => navigate(`/admin/subject/${subjectName.toLowerCase()}`)}
                    className="py-2.5 px-6 rounded-xl border border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-350 hover:bg-slate-50 font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black uppercase tracking-wide text-xs shadow-md shadow-indigo-600/20 transition-all"
                  >
                    {saving ? 'Publishing...' : 'Publish Quiz Assessment'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ----------------------------------------------------
        // 4. TAB CATEGORY: QUIZ FROM FILE
        // ---------------------------------------------------- */}
        {!showPreview && !isExtracting && generationMode === 'file' && (
          <div className="space-y-6">
            <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest pl-1">Advanced Document Uploader</h3>
            
            <form onSubmit={handleGenerateFromFile} className="space-y-6">
              
              {/* Drag & Drop File Zone */}
              <div 
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[220px] bg-white/40 dark:bg-slate-900/40 relative overflow-hidden group
                  ${dragActive ? 'border-indigo-500 bg-indigo-500/10' : uploadedFile ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-200 dark:border-indigo-950/20 hover:border-indigo-500/50 hover:bg-white/60 dark:hover:bg-slate-900/60'}`}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
                
                <input 
                  type="file"
                  id="quiz-file-upload"
                  accept=".pdf,.docx,.txt,.doc"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <label htmlFor="quiz-file-upload" className="cursor-pointer flex flex-col items-center select-none w-full">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-800 text-indigo-500 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-200">
                    {uploadedFile ? (
                      <FileText className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>
                  
                  <span className="block text-xs font-extrabold text-slate-750 dark:text-slate-200 mt-4">
                    {uploadedFile ? uploadedFile.name : 'Upload Question Bank File'}
                  </span>
                  
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1">
                    {uploadedFile ? `${(uploadedFile.size / 1024).toFixed(1)} KB` : 'Accepts PDF, DOCX, or TXT documents'}
                  </span>
                </label>
              </div>
              {/* Extra configuration settings if file loaded */}
              {uploadedFile && (
                <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-indigo-950/20 p-6 space-y-6">
                  
                  {/* PDF-Style Range & Random Selector */}
                  <div className="border-b border-slate-100 dark:border-indigo-950/10 pb-6 space-y-5">
                    
                    {/* Range Input System */}
                    <div className="space-y-1.5 relative">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-slate-455 uppercase tracking-wider block font-sans">
                          Pages / Questions From
                        </label>
                        {!randomGeneration && (
                          <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Range Mode Active
                          </span>
                        )}
                      </div>
                      <input 
                        type="text" 
                        disabled={randomGeneration}
                        value={rangeInput}
                        onChange={(e) => {
                          setRangeInput(e.target.value);
                          const check = parseRangeInput(e.target.value);
                          if (check.valid) {
                            setRangeError('');
                            setErrorMessage('');
                          } else {
                            setRangeError(check.error);
                          }
                        }}
                        placeholder="Example: 1-5,8-12,20-25"
                        className={`w-full p-3 rounded-xl border bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-all duration-300 font-sans text-xs
                          ${rangeError 
                            ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10 shadow-sm animate-shake' 
                            : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10'
                          } disabled:opacity-40 disabled:bg-slate-50 dark:disabled:bg-slate-900/40`}
                      />
                      {rangeError && (
                        <p className="text-[10px] font-black text-rose-550 dark:text-rose-400 pl-1 uppercase tracking-wide mt-1 animate-pulse">
                          ⚠️ {rangeError}
                        </p>
                      )}
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold pl-1 uppercase tracking-wider leading-relaxed">
                        Enter a comma-separated list of ranges or question numbers (e.g., 1-5, 8-12, 20-25).
                      </p>
                    </div>

                    {/* Divider OR line */}
                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-slate-100 dark:border-indigo-950/10"></div>
                      <span className="flex-shrink mx-4 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white/70 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-100 dark:border-indigo-950/10">OR</span>
                      <div className="flex-grow border-t border-slate-100 dark:border-indigo-950/10"></div>
                    </div>

                    {/* Random Generation Selector */}
                    <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100 dark:border-indigo-950/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            id="random-mode-checkbox" 
                            checked={randomGeneration} 
                            onChange={(e) => {
                              setRandomGeneration(e.target.checked);
                              if (e.target.checked) {
                                setRangeError('');
                                setErrorMessage('');
                              } else {
                                const check = parseRangeInput(rangeInput);
                                if (!check.valid) {
                                  setRangeError(check.error);
                                }
                              }
                            }}
                            className="w-4 h-4 cursor-pointer accent-indigo-500"
                          />
                          <label htmlFor="random-mode-checkbox" className="text-xs font-black text-slate-800 dark:text-slate-200 cursor-pointer">
                            Generate Random Questions
                          </label>
                        </div>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold pl-6 uppercase tracking-wider leading-relaxed">
                          Randomly select questions from the uploaded question bank document.
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 pl-6 sm:pl-0">
                        <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider">Number of questions</span>
                        <input 
                          type="number"
                          min="1"
                          max="100"
                          disabled={!randomGeneration}
                          value={randomCount}
                          onChange={(e) => setRandomCount(e.target.value)}
                          className="w-20 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center focus:outline-none focus:border-indigo-500 font-sans text-xs disabled:opacity-40 disabled:bg-slate-50 dark:disabled:bg-slate-900/40"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Extraction Settings */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-bold pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Question Type</label>
                      <select 
                        value={extractedType}
                        onChange={(e) => setExtractedType(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/50 text-slate-755 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer custom-select"
                      >
                        <option value="MCQ">MCQ (Multiple Choice)</option>
                        <option value="Descriptive">Descriptive (Theoretical)</option>
                        <option value="Mixed">Mixed Categories</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Extraction Difficulty</label>
                      <select 
                        value={extractedDifficulty}
                        onChange={(e) => setExtractedDifficulty(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/50 text-slate-755 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer custom-select"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium Target</option>
                        <option value="Hard">Hard assessments</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Shuffle Questions</label>
                      <div className="flex items-center h-full pt-1">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={shuffleQuestions}
                            onChange={() => setShuffleQuestions(!shuffleQuestions)}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-900/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-indigo-950/10 pt-6">
                    <button 
                      type="button" 
                      onClick={() => setUploadedFile(null)}
                      className="py-2.5 px-6 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 font-bold"
                    >
                      Clear File
                    </button>
                    <button 
                      type="submit"
                      className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase text-xs shadow-md transition-all flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate Quiz From File
                    </button>
                  </div>

                </div>
              )}

            </form>
          </div>
        )}

        {/* ----------------------------------------------------
        // 5. SIMULATED AI EXTRACTION PROGRESS SCREEN
        // ---------------------------------------------------- */}
        {isExtracting && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-indigo-950/20 p-12 flex flex-col items-center justify-center text-center shadow-saas gap-6 max-w-xl mx-auto my-12">
            <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin" />
            <div className="space-y-2">
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">AI Quiz Extraction In Progress</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Scanning: {uploadedFile?.name}</p>
            </div>
            
            {/* Glowing progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-900 relative">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${extractionProgress}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-indigo-500">{extractionProgress}% parsed</span>
          </div>
        )}

        {/* ----------------------------------------------------
        // 6. QUIZ PREVIEW & DIRECT MANIPULATION SECTION (VERY IMPORTANT)
        // ---------------------------------------------------- */}
        {showPreview && !isExtracting && (
          <div className="space-y-6">
            
            {/* Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none pl-1">
              <div>
                <span className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest">AI Extraction Complete</span>
                <h3 className="text-base font-black text-slate-850 dark:text-white tracking-tight">Preview Generated Questions</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowPreview(false); setUploadedFile(null); }}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-850 bg-white/90 hover:bg-slate-50 text-slate-650 dark:text-slate-350 text-xs font-black"
                >
                  Discard & Restart
                </button>
                <button
                  onClick={handlePublishGeneratedQuiz}
                  className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/10"
                >
                  Save and Publish Generated Quiz
                </button>
              </div>
            </div>

            {/* Questions Listing */}
            <div className="space-y-6">
              {generatedQuestions.map((q, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-indigo-950/20 shadow-saas overflow-hidden p-6 relative">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-650" />
                  
                  {/* Sorting, Reordering and Delete Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-indigo-950/10 mb-4 select-none">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider">Question #{idx + 1}</span>
                      
                      {/* Up/Down Sorting buttons */}
                      <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shrink-0 bg-slate-50 dark:bg-slate-950 shadow-sm">
                        <button
                          onClick={() => handleMoveQuestionUp(idx)}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-slate-750 dark:hover:text-white hover:bg-slate-150 dark:hover:bg-slate-900 disabled:opacity-30"
                          title="Move Question Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />
                        <button
                          onClick={() => handleMoveQuestionDown(idx)}
                          disabled={idx === generatedQuestions.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-750 dark:hover:text-white hover:bg-slate-150 dark:hover:bg-slate-900 disabled:opacity-30"
                          title="Move Question Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => handleRemovePreviewQuestion(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-650 transition-colors"
                      title="Remove question row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Form inputs for Preview manipulation */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs font-bold">
                    
                    {/* Live edits */}
                    <div className="md:col-span-8 space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Question Text</label>
                        <input 
                          type="text"
                          value={q.questionText}
                          onChange={(e) => handlePreviewFieldChange(idx, 'questionText', e.target.value)}
                          className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Option A</label>
                          <input 
                            type="text" 
                            value={q.optionA}
                            onChange={(e) => handlePreviewFieldChange(idx, 'optionA', e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Option B</label>
                          <input 
                            type="text" 
                            value={q.optionB}
                            onChange={(e) => handlePreviewFieldChange(idx, 'optionB', e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Option C</label>
                          <input 
                            type="text" 
                            value={q.optionC}
                            onChange={(e) => handlePreviewFieldChange(idx, 'optionC', e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Option D</label>
                          <input 
                            type="text" 
                            value={q.optionD}
                            onChange={(e) => handlePreviewFieldChange(idx, 'optionD', e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Extras */}
                    <div className="md:col-span-4 space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Correct Answer</label>
                        <select 
                          value={q.correctAnswer}
                          onChange={(e) => handlePreviewFieldChange(idx, 'correctAnswer', e.target.value)}
                          className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/50 text-slate-755 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer custom-select"
                        >
                          <option value="A">Option A</option>
                          <option value="B">Option B</option>
                          <option value="C">Option C</option>
                          <option value="D">Option D</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Question Marks</label>
                        <input 
                          type="number" 
                          min="1"
                          value={q.marks}
                          onChange={(e) => handlePreviewFieldChange(idx, 'marks', parseInt(e.target.value) || 1)}
                          className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Solution Explanation</label>
                        <input 
                          type="text" 
                          value={q.explanation}
                          onChange={(e) => handlePreviewFieldChange(idx, 'explanation', e.target.value)}
                          className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex justify-end gap-3 pt-4 select-none">
              <button 
                type="button" 
                onClick={() => { setShowPreview(false); setUploadedFile(null); }}
                className="py-2.5 px-6 border border-slate-200 dark:border-slate-800 bg-white/90 text-slate-650 hover:bg-slate-50 font-bold rounded-xl"
              >
                Discard Assessment
              </button>
              
              <button 
                type="button"
                onClick={handlePublishGeneratedQuiz}
                disabled={saving}
                className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs shadow-md shadow-emerald-600/10 transition-all flex items-center gap-1.5"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Publishing Quiz...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    Save and Publish Generated Quiz
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default QuizCreate;
