import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';
import StudentLayout from '../layouts/StudentLayout';
import PageHeader from '../components/layout/PageHeader';
import GoBackButton from '../components/layout/GoBackButton';
import { 
  ClipboardList, 
  Search, 
  Clock, 
  HelpCircle,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';

const QuizzesPage = () => {
  const navigate = useNavigate();

  // Component States
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('All');

  const subscribedList = JSON.parse(localStorage.getItem('subscribedSubjects') || '[]');
  const subjects = ['All', ...subscribedList];

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getQuizzes();
      
      // Restrict to authorized 8 subjects & check subscription list
      const allowed = ['TELUGU', 'HINDI', 'ENGLISH', 'SOCIAL', 'PHYSICS', 'CHEMISTRY', 'MATHS', 'BIOLOGY', 'SOCIAL STUDIES'];
      const subscribed = JSON.parse(localStorage.getItem('subscribedSubjects') || '[]');
      
      const filteredRaw = (response.data || []).filter(q => 
        allowed.includes(q.subject?.toUpperCase()) &&
        subscribed.some(s => s.toLowerCase() === q.subject?.toLowerCase())
      );
      
      setQuizzes(filteredRaw);
      setFilteredQuizzes(filteredRaw);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (status, subject, query) => {
    let filtered = quizzes;

    // Filter by status/duration type
    if (status === 'short') {
      filtered = quizzes.filter(q => q.time_limit_minutes <= 15);
    } else if (status === 'long') {
      filtered = quizzes.filter(q => q.time_limit_minutes > 15);
    }

    // Filter by subject
    if (subject !== 'All') {
      filtered = filtered.filter(q => q.subject === subject);
    }

    // Filter by search query
    if (query.trim() !== '') {
      const q = query.toLowerCase();
      filtered = filtered.filter(quiz => 
        quiz.title.toLowerCase().includes(q) || 
        (quiz.description && quiz.description.toLowerCase().includes(q))
      );
    }

    setFilteredQuizzes(filtered);
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    applyFilters(selectedFilter, selectedSubject, val);
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    applyFilters(selectedFilter, subject, searchQuery);
  };

  const handleStatusChange = (status) => {
    setSelectedFilter(status);
    applyFilters(status, selectedSubject, searchQuery);
  };

  const containerVariants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.05 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80 } }
  };

  const getSubjectColor = (sub) => {
    const activeColors = {
      'All': 'bg-indigo-600 text-white shadow-indigo-600/30',
      'Telugu': 'bg-amber-500 text-white shadow-amber-500/30',
      'Hindi': 'bg-rose-500 text-white shadow-rose-500/30',
      'English': 'bg-blue-500 text-white shadow-blue-500/30',
      'Maths': 'bg-purple-500 text-white shadow-purple-500/30',
      'Physics': 'bg-cyan-500 text-white shadow-cyan-500/30',
      'Chemistry': 'bg-emerald-500 text-white shadow-emerald-500/30',
      'Biology': 'bg-green-500 text-white shadow-green-500/30',
      'Social': 'bg-fuchsia-500 text-white shadow-fuchsia-500/30'
    };
    
    if (selectedSubject === sub) {
      return activeColors[sub] || 'bg-slate-800 text-white shadow-slate-800/30';
    }
    
    return 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800';
  };

  return (
    <StudentLayout>
      <GoBackButton />

      {/* Page Header */}
      <PageHeader 
        title="Quizzes & Test Portal"
        subtitle="Complete auto-graded mock assessments, view your accuracy scores, and challenge peers on subject metrics."
        parentLabel="Dashboard"
        parentPath="/student/dashboard"
      />

      {/* Mini Stats strip */}
      <div className="mb-8 max-w-xs">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-saas flex items-center justify-between">
          <div className="overflow-hidden">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total Quizzes</span>
            <span className="text-xl font-black text-slate-800 dark:text-white leading-none">{quizzes.length}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-indigo-500 dark:text-indigo-400 shrink-0">
            <ClipboardList className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-saas space-y-5 mb-8">
        
        {/* Search Input & Duration selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute top-1/2 left-3.5 w-4.5 h-4.5 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search mock exams, quiz subjects, concepts..." 
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10 transition-smooth"
            />
          </div>

          {/* Quick tab filters */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 overflow-x-auto max-w-full no-scrollbar shrink-0 self-start md:self-auto">
            <button
              onClick={() => handleStatusChange('all')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-smooth whitespace-nowrap ${
                selectedFilter === 'all' 
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              All Tests
            </button>
            <button
              onClick={() => handleStatusChange('short')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-smooth whitespace-nowrap ${
                selectedFilter === 'short' 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              ⚡ Quick (&le;15 min)
            </button>
            <button
              onClick={() => handleStatusChange('long')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-smooth whitespace-nowrap ${
                selectedFilter === 'long' 
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-455 shadow-sm' 
                  : 'text-slate-500 hover:text-rose-600 dark:hover:text-rose-400'
              }`}
            >
              📖 Comprehensive
            </button>
          </div>
        </div>

        {/* Subject Pills list */}
        <div className="space-y-1.5">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Filter by subject</span>
          <div className="flex flex-wrap gap-2 py-1 max-h-[85px] overflow-y-auto">
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => handleSubjectChange(sub)}
                className={`py-2 px-4 rounded-full text-xs font-bold border transition-smooth shadow-sm tracking-wide ${getSubjectColor(sub)}`}
              >
                {sub === 'Social' ? 'Social Studies' : sub}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Quizzes List Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-saas h-[220px] skeleton-pulse" />
          ))}
        </div>
      ) : filteredQuizzes.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-saas max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <HelpCircle className="w-8 h-8 stroke-1.5" />
          </div>
          <h4 className="font-extrabold text-slate-800 dark:text-white text-lg leading-tight">
            {(JSON.parse(localStorage.getItem('subscribedSubjects') || '[]')).length === 0 
              ? 'No Subscribed Subjects' 
              : 'No Assessments Found'}
          </h4>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {(JSON.parse(localStorage.getItem('subscribedSubjects') || '[]')).length === 0 
              ? 'You have not subscribed to any subjects yet. Customize your curriculum on the subscription page to unlock auto-graded mock assessments!' 
              : 'There are no quizzes matching your filters. Complete study courses to unlock new quiz assessments!'}
          </p>
          {(JSON.parse(localStorage.getItem('subscribedSubjects') || '[]')).length === 0 && (
            <a
              href="/student/subscription"
              className="inline-flex items-center gap-2 mt-5 py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-755 text-white font-bold text-xs tracking-wide transition-smooth shadow-md shadow-indigo-600/10 shrink-0"
            >
              Go to Subscription
            </a>
          )}
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredQuizzes.map((quiz) => (
            <motion.div
              key={quiz.id}
              variants={cardVariants}
              whileHover={{ y: -6, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-saas p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-smooth flex flex-col justify-between h-[230px] group cursor-pointer"
              onClick={() => navigate(`/student/quiz/${quiz.id}`)}
            >
              <div className="space-y-3">
                {/* Subject badge and question counts */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-indigo-500 dark:text-indigo-400 px-2 py-0.5 rounded-md">
                      {quiz.subject === 'Social' ? 'Social Studies' : quiz.subject}
                    </span>
                    {quiz.attempt && (
                      <span className="inline-flex items-center gap-0.5 text-[9.5px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-450 px-2 py-0.5 rounded-md shadow-sm">
                        ✓ Completed
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    {quiz.total_questions || 5} Questions
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-800 dark:text-white text-base leading-snug line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-455 transition-smooth font-sans">
                    {quiz.title}
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold leading-normal line-clamp-2">
                    {quiz.description || "A standard diagnostic test evaluating conceptual knowledge of formulas and reasoning queries."}
                  </p>
                </div>
              </div>

              {/* Bottom specs and Start button */}
              <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-4 mt-2">
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-wide">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    {quiz.time_limit_minutes || 15} Mins
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    Min {quiz.passing_score || 50}%
                  </span>
                </div>

                {quiz.attempt ? (
                  <a 
                    href={`/student/quiz/${quiz.id}`}
                    className="py-2 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 group-hover:bg-emerald-600 group-hover:text-white text-emerald-600 dark:text-emerald-400 font-bold text-xs tracking-wide transition-smooth"
                  >
                    View Results
                  </a>
                ) : (
                  <a 
                    href={`/student/quiz/${quiz.id}`}
                    className="py-2 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 group-hover:bg-indigo-600 group-hover:text-white text-indigo-600 dark:text-indigo-400 font-bold text-xs tracking-wide transition-smooth"
                  >
                    Start Quiz
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </StudentLayout>
  );
};

export default QuizzesPage;
