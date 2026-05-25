import React, { useState, useEffect, useCallback } from 'react';
import { quizAPI } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import StudentLayout from '../layouts/StudentLayout';
import PageHeader from '../components/layout/PageHeader';
import GoBackButton from '../components/layout/GoBackButton';
import {
  Clock,
  Award,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

// Helper function to format seconds to readable format
const formatTimeTaken = (seconds) => {
  if (!seconds) return '0s';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
};

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Core States
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [responses, setResponses] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [attemptId, setAttemptId] = useState(null);

  // Submit Quiz Callback
  const handleSubmitQuiz = useCallback(async () => {
    try {
      if (!quiz || !quiz.questions) return;
      const answersArray = quiz.questions.map((q) => {
        const studentAnswer = answers[q.id];
        return {
          question_id: q.id,
          option_id: q.question_type === 'multiple_choice' ? studentAnswer : null,
          text_response: q.question_type !== 'multiple_choice' ? studentAnswer : null
        };
      });

      const response = await quizAPI.submitQuiz(id, answersArray);
      console.log('📊 Submit response:', response.data);
      console.log('📊 Result from response:', response.data.result);
      
      setAttemptId(response.data.attempt?.id || response.data.id || null);
      setResult(response.data.result);
      setResponses(response.data.responses || []);
      setSubmitted(true);
    } catch (error) {
      alert('Failed to submit quiz');
      console.error(error);
    }
  }, [quiz, answers, id]);

  // Fetch Quiz & Attempts
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // Check if student already attempted
        try {
          const attemptResponse = await quizAPI.getMyAttempts(id);
          console.log('🔍 Full attemptResponse:', attemptResponse);
          console.log('🔍 attemptResponse.data:', attemptResponse.data);
          
          if (attemptResponse.data && attemptResponse.data.length > 0) {
            console.log('🔍 First attempt object:', attemptResponse.data[0]);
            const { attempt, result, responses } = attemptResponse.data[0];
            console.log('🔍 Destructured attempt:', attempt);
            console.log('🔍 Destructured result:', result);
            console.log('🔍 Setting result:', result);
            
            setAttemptId(attempt.id);
            setResult(result);
            setResponses(responses);

            const response = await quizAPI.getQuiz(id);
            setQuiz(response.data);
            setSubmitted(true);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Error checking previous attempts:', err);
        }

        const response = await quizAPI.getQuiz(id);
        setQuiz(response.data);
        if (response.data.time_limit_minutes) {
          setTimeLeft(response.data.time_limit_minutes * 60);
        }
      } catch (error) {
        console.error('Failed to fetch quiz:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  // Countdown timer thread
  useEffect(() => {
    if (timeLeft === null || submitted) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, submitted, handleSubmitQuiz]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };

  const getOptionLetter = (idx) => String.fromCharCode(65 + idx);

  // ----------------------------------------------------
  // RENDER COMPONENT: LOADING STATE
  // ----------------------------------------------------
  if (loading) {
    return (
      <StudentLayout>
        <div className="h-[500px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-saas skeleton-pulse" />
      </StudentLayout>
    );
  }

  // ----------------------------------------------------
  // RENDER COMPONENT: QUIZ SUBMITTED SUMMARY RESULTS
  // ----------------------------------------------------
  if (submitted && result) {
    console.log('📈 RENDERING RESULTS PAGE');
    console.log('📈 Result object:', result);
    console.log('📈 Result percentage:', result?.percentage);
    console.log('📈 Result marksObtained:', result?.marksObtained);
    console.log('📈 Result totalMarks:', result?.totalMarks);
    console.log('📈 Result isPassed:', result?.isPassed);
    
    return (
      <StudentLayout>
        <GoBackButton />

        {/* Results PageHeader */}
        <PageHeader
          title="Assessment Summary Report"
          subtitle={quiz.title}
          parentLabel="Tests"
          parentPath="/student/quizzes"
          showBackButton={true}
        />

        {/* Inner Results Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Grade Score badge ring (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-saas text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-650" />

              <div>
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Grade Score</span>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 leading-none">
                  🔒 Locked attempt
                </span>
              </div>

              {/* Score Circular ring */}
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="62" stroke="rgba(241, 245, 249, 0.1)" strokeWidth="10" fill="transparent" />
                  <circle
                    cx="72"
                    cy="72"
                    r="62"
                    stroke={result?.isPassed ? "#10b981" : "#ef4444"}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 62}
                    strokeDashoffset={2 * Math.PI * 62 * (1 - parseFloat(result?.percentage || 0) / 100)}
                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
                  <span className="text-3xl font-black tracking-tighter text-slate-800 dark:text-white leading-none">
                    {Number(result?.percentage || 0).toFixed(1)}%
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">
                    Total Accuracy
                  </span>
                </div>
              </div>

              {/* Pass/Fail badge */}
              <div className="space-y-2">
                <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black tracking-wide border shadow-sm ${result?.isPassed
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-450'
                    : 'bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-450'
                  }`}>
                  {result?.isPassed ? 'PASSED COURSE TEST' : 'FAILED COURSES TEST'}
                </div>

                <div className="space-y-3 mt-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Marks Obtained: <strong className="text-slate-800 dark:text-white">{result?.marksObtained ?? 0}</strong> out of <strong className="text-slate-800 dark:text-white">{result?.totalMarks ?? 0}</strong>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 inline mr-1" />
                    Time Taken: <strong className="text-slate-800 dark:text-white">{formatTimeTaken(result?.timeTaken)}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                <button
                  onClick={() => navigate('/student/quizzes')}
                  className="w-full py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs tracking-wide transition-smooth"
                >
                  Back to Assessments
                </button>
                <button
                  onClick={() => navigate('/student/leaderboard')}
                  className="w-full py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs tracking-wide transition-smooth shadow-md"
                >
                  View Rankings Board
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Review Questions list (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-saas space-y-6">
              <div>
                <h3 className="font-black text-slate-800 dark:text-white text-lg tracking-tight font-sans">Review Attempt Responses</h3>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Read solutions and detailed reference notes</p>
              </div>

              <div className="space-y-6">
                {quiz.questions.map((question, qIdx) => {
                  const response = responses.find(r => r.question_id === question.id);
                  const isCorrect = response?.is_correct;

                  return (
                    <div
                      key={question.id}
                      className={`p-5 rounded-2xl border transition-smooth ${isCorrect
                          ? 'border-emerald-250/80 dark:border-emerald-900 bg-emerald-50/10 dark:bg-emerald-950/10'
                          : 'border-rose-250/80 dark:border-rose-900 bg-rose-50/10 dark:bg-rose-950/10'
                        }`}
                    >
                      {/* Response header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4 text-xs font-bold font-sans">
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                          )}
                          <span className={isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-455'}>
                            Question {qIdx + 1} ({isCorrect ? 'Correct' : 'Incorrect'})
                          </span>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] ${isCorrect
                            ? 'bg-emerald-100 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400'
                            : 'bg-rose-100 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400'
                          }`}>
                          {response?.marks_obtained || 0}/{question.marks || 1} Marks
                        </span>
                      </div>

                      {/* Question text */}
                      <p className="text-sm font-extrabold text-slate-800 dark:text-white leading-relaxed font-sans mb-4">
                        {question.question_text}
                      </p>

                      {/* Options listing */}
                      {question.question_type === 'multiple_choice' ? (
                        <div className="space-y-2">
                          {question.quiz_options && question.quiz_options.map((option, oIdx) => {
                            let selected = response?.selected_option_id === option.id;
                            if (!selected && response?.text_response && response.text_response.startsWith('[')) {
                              try {
                                const parsed = JSON.parse(response.text_response);
                                if (Array.isArray(parsed) && parsed.includes(option.id)) selected = true;
                              } catch (e) { }
                            }

                            const isCorrectAns = option.is_correct;

                            return (
                              <div
                                key={option.id}
                                className={`flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-bold border transition-smooth ${isCorrectAns
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400'
                                    : selected && !isCorrectAns
                                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-400'
                                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                  }`}
                              >
                                <span className={`flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-black shrink-0 border ${isCorrectAns
                                    ? 'bg-emerald-500 text-white border-emerald-400'
                                    : selected && !isCorrectAns
                                      ? 'bg-rose-500 text-white border-rose-400'
                                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                                  }`}>
                                  {getOptionLetter(oIdx)}
                                </span>

                                <span className="flex-grow">{option.option_text}</span>

                                {isCorrectAns && (
                                  <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 shrink-0">Correct Choice</span>
                                )}
                                {selected && !isCorrectAns && (
                                  <span className="text-[9px] font-black uppercase text-rose-600 dark:text-rose-400 shrink-0">Your Answer</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs font-bold font-sans space-y-2">
                          <p className="text-slate-600 dark:text-slate-400">Your Response: <strong className="text-rose-500">{response?.text_response || 'No answer'}</strong></p>
                          <p className="text-slate-600 dark:text-slate-400">Correct Solution: <strong className="text-emerald-500">{question.correct_answer}</strong></p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // ----------------------------------------------------
  // RENDER COMPONENT: ACTIVE QUIZ ATTEMPT INTERACTIVE SOLVER
  // ----------------------------------------------------
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <StudentLayout>
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 max-w-sm mx-auto shadow-saas">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h4 className="font-extrabold text-slate-800 dark:text-white text-lg">No Questions Found</h4>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            This quiz contains no questions. Please back to the assessments list.
          </p>
          <button onClick={() => navigate('/student/quizzes')} className="mt-4 py-2.5 px-6 rounded-xl bg-indigo-600 text-white text-xs font-bold transition-smooth">
            Back to Quizzes
          </button>
        </div>
      </StudentLayout>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIdx];
  const progress = ((currentQuestionIdx + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestionIdx === quiz.questions.length - 1;

  const multipleCorrect = currentQuestion.question_type === 'multiple_choice' && currentQuestion.quiz_options && currentQuestion.quiz_options.filter(o => o.is_correct).length > 1;

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remains = secs % 60;
    return `${mins}:${remains.toString().padStart(2, '0')}`;
  };

  return (
    <StudentLayout>
      <GoBackButton />

      {/* Quiz Solver Header */}
      <PageHeader
        title={quiz.title}
        subtitle={`Assessment in progress. Subject: ${quiz.subject}`}
        parentLabel="Tests"
        parentPath="/student/quizzes"
        showBackButton={true}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Core Question card (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-saas flex flex-col justify-between min-h-[380px] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600" />

            {/* Header info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Question {currentQuestionIdx + 1} of {quiz.questions.length}
                </span>

                {/* Pulsing Timer block */}
                {timeLeft !== null && (
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-smooth ${timeLeft < 60
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900 text-rose-500 animate-pulse'
                      : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50 text-indigo-500 dark:text-indigo-400'
                    }`}>
                    <Clock className="w-3.5 h-3.5" />
                    Timer: {formatTimer(timeLeft)}
                  </div>
                )}
              </div>

              {/* Progress Line */}
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>

              {/* Question Text */}
              <h3 className="text-base md:text-lg font-black text-slate-800 dark:text-white leading-snug font-sans pt-2">
                {currentQuestion.question_text}
              </h3>
            </div>

            {/* Answer inputs options grid */}
            <div className="py-6 flex-grow flex flex-col justify-center">
              {currentQuestion.question_type === 'multiple_choice' ? (
                <div className="space-y-3">
                  {currentQuestion.quiz_options && currentQuestion.quiz_options.map((option, oIdx) => {
                    const isChecked = multipleCorrect
                      ? (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].includes(option.id))
                      : answers[currentQuestion.id] === option.id;

                    return (
                      <button
                        key={option.id}
                        onClick={() => {
                          if (multipleCorrect) {
                            const curAnswers = Array.isArray(answers[currentQuestion.id]) ? [...answers[currentQuestion.id]] : [];
                            if (!curAnswers.includes(option.id)) {
                              curAnswers.push(option.id);
                            } else {
                              const idx = curAnswers.indexOf(option.id);
                              curAnswers.splice(idx, 1);
                            }
                            handleAnswerChange(currentQuestion.id, curAnswers);
                          } else {
                            handleAnswerChange(currentQuestion.id, option.id);
                          }
                        }}
                        className={`flex items-center gap-3 w-full text-left py-3.5 px-4 rounded-2xl text-xs font-bold border transition-smooth group ${isChecked
                            ? 'bg-indigo-50 dark:bg-indigo-950/45 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-sm'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 text-slate-600 dark:text-slate-405'
                          }`}
                      >
                        <span className={`flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-black shrink-0 border transition-smooth ${isChecked
                            ? 'bg-indigo-500 text-white border-indigo-400'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-100 dark:group-hover:bg-slate-850'
                          }`}>
                          {getOptionLetter(oIdx)}
                        </span>
                        <span>{option.option_text}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input
                  type="text"
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Enter your short written response here..."
                  className="w-full p-4 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-700 dark:text-slate-205 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10 transition-smooth font-bold"
                />
              )}
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-4 shrink-0">
              <button
                onClick={() => setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1))}
                disabled={currentQuestionIdx === 0}
                className="flex items-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-xs tracking-wide transition-smooth disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                Previous
              </button>

              {isLastQuestion ? (
                <button
                  onClick={handleSubmitQuiz}
                  className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-650 text-white font-bold text-xs tracking-wide shadow-md shadow-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/20 transition-smooth"
                >
                  Submit Quiz Responses
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
                  className="flex items-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-xs tracking-wide transition-smooth"
                >
                  Next Question
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Question Navigator Index (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-saas space-y-6">
            <div>
              <h3 className="font-black text-slate-800 dark:text-white text-sm tracking-tight font-sans">Question Navigator Matrix</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">Index Tracker</p>
            </div>

            {/* Dot grid */}
            <div className="grid grid-cols-5 gap-3.5">
              {quiz.questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '';
                const isCurrent = idx === currentQuestionIdx;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`flex items-center justify-center h-10 rounded-xl text-xs font-black transition-smooth border shadow-sm ${isCurrent
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-600/20'
                        : isAnswered
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-600'
                      }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Grid Legend indicators */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wide text-center">
              <div className="flex flex-col items-center gap-1">
                <span className="w-4 h-4 rounded-md bg-indigo-600 border border-indigo-500 shrink-0" />
                Current
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="w-4 h-4 rounded-md bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 shrink-0" />
                Answered
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="w-4 h-4 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0" />
                Skipped
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default QuizPage;
