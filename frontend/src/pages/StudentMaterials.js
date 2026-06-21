import React, { useState, useEffect } from 'react';
import { materialAPI } from '../services/api';
import StudentLayout from '../layouts/StudentLayout';
import PageHeader from '../components/layout/PageHeader';
import GoBackButton from '../components/layout/GoBackButton';
import { 
  FileText, 
  Search, 
  Download, 
  BookOpen,
  HelpCircle,
  FileCode,
  Files
} from 'lucide-react';
import { motion } from 'framer-motion';

const StudentMaterials = () => {

  // Component States
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('All');

  const subscribedList = JSON.parse(localStorage.getItem('subscribedSubjects') || '[]');
  const subjectOrder = {
    'telugu': 1,
    'hindi': 2,
    'english': 3,
    'maths': 4,
    'physics': 5,
    'chemistry': 6,
    'biology': 7,
    'social': 8,
    'social studies': 8
  };
  const sortedSubscribedList = [...subscribedList].sort((a, b) => {
    const aOrder = subjectOrder[a.toLowerCase().trim()] || 99;
    const bOrder = subjectOrder[b.toLowerCase().trim()] || 99;
    return aOrder - bOrder;
  });
  const subjects = ['All', ...sortedSubscribedList];

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await materialAPI.getMaterials();
      
      // Restrict to authorized 8 subjects & check subscription
      const allowed = ['TELUGU', 'HINDI', 'ENGLISH', 'SOCIAL', 'PHYSICS', 'CHEMISTRY', 'MATHS', 'BIOLOGY', 'SOCIAL STUDIES'];
      const subscribed = JSON.parse(localStorage.getItem('subscribedSubjects') || '[]');
      
      const filteredRaw = (response.data || []).filter(m => 
        allowed.includes(m.subject?.toUpperCase()) &&
        subscribed.some(s => {
          const sNorm = s.toLowerCase();
          const mNorm = m.subject?.toLowerCase() || '';
          return sNorm === mNorm || 
            ((sNorm === 'social' || sNorm === 'social studies') && (mNorm === 'social' || mNorm === 'social studies'));
        })
      );
      
      setMaterials(filteredRaw);
      setFilteredMaterials(filteredRaw);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (type, subject, query) => {
    let filtered = materials;

    // Filter by type
    if (type !== 'all') {
      filtered = filtered.filter(m => m.file_type === type);
    }

    // Filter by subject
    if (subject !== 'All') {
      filtered = filtered.filter(m => m.subject === subject);
    }

    // Filter by search query
    if (query.trim() !== '') {
      const q = query.toLowerCase();
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(q) || 
        (m.description && m.description.toLowerCase().includes(q)) ||
        m.file_name.toLowerCase().includes(q)
      );
    }

    setFilteredMaterials(filtered);
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

  const handleTypeChange = (type) => {
    setSelectedFilter(type);
    applyFilters(type, selectedSubject, searchQuery);
  };

  const getSubjectColorBadge = (subject) => {
    const colors = {
      'Telugu': 'bg-amber-50 dark:bg-amber-955 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900',
      'Hindi': 'bg-rose-50 dark:bg-rose-955 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900',
      'English': 'bg-blue-50 dark:bg-blue-955 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900',
      'Maths': 'bg-purple-50 dark:bg-purple-955 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900',
      'Physics': 'bg-cyan-50 dark:bg-cyan-955 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900',
      'Chemistry': 'bg-emerald-50 dark:bg-emerald-955 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900',
      'Biology': 'bg-green-50 dark:bg-green-955 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900',
      'Social Studies': 'bg-fuchsia-50 dark:bg-fuchsia-955 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-100 dark:border-fuchsia-900',
      'Social': 'bg-fuchsia-50 dark:bg-fuchsia-955 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-100 dark:border-fuchsia-900'
    };
    return colors[subject] || 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800';
  };

  const getFileIcon = (fileType) => {
    if (fileType === 'pdf') {
      return <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0 shadow-sm"><FileText className="w-6 h-6" /></div>;
    }
    if (fileType === 'doc' || fileType === 'docx') {
      return <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0 shadow-sm"><BookOpen className="w-6 h-6" /></div>;
    }
    return <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center shrink-0 shadow-sm"><FileCode className="w-6 h-6" /></div>;
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

  const getSubjectColorPill = (sub) => {
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
        title="Study Materials & Notebooks"
        subtitle="Browse curriculum textbooks, archived lesson notes, source codes, and interactive references."
        parentLabel="Dashboard"
        parentPath="/student/dashboard"
      />

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-saas space-y-5 mb-8">
        
        {/* Search bar & Type group */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute top-1/2 left-3.5 w-4.5 h-4.5 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search reference notes, PDF titles, documents..." 
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10 transition-smooth"
            />
          </div>

          {/* Quick tab button selectors */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 overflow-x-auto max-w-full no-scrollbar shrink-0 self-start md:self-auto">
            <button
              onClick={() => handleTypeChange('all')}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-smooth whitespace-nowrap ${
                selectedFilter === 'all' 
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Files className="w-4 h-4" />
              All
            </button>
            <button
              onClick={() => handleTypeChange('pdf')}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-smooth whitespace-nowrap ${
                selectedFilter === 'pdf' 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              <FileText className="w-4 h-4" />
              PDFs
            </button>
            <button
              onClick={() => handleTypeChange('doc')}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-smooth whitespace-nowrap ${
                selectedFilter === 'doc' 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Docs
            </button>
            <button
              onClick={() => handleTypeChange('txt')}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-smooth whitespace-nowrap ${
                selectedFilter === 'txt' 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              <FileCode className="w-4 h-4" />
              Text/Code
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
                className={`py-2 px-4 rounded-full text-xs font-bold border transition-smooth shadow-sm tracking-wide ${getSubjectColorPill(sub)}`}
              >
                {sub === 'Social' ? 'Social Studies' : sub}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-saas h-[200px] skeleton-pulse" />
          ))}
        </div>
      ) : filteredMaterials.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-saas max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <HelpCircle className="w-8 h-8 stroke-1.5" />
          </div>
          <h4 className="font-extrabold text-slate-800 dark:text-white text-lg leading-tight">
            {(JSON.parse(localStorage.getItem('subscribedSubjects') || '[]')).length === 0 
              ? 'No Subscribed Subjects' 
              : 'No Materials Found'}
          </h4>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {(JSON.parse(localStorage.getItem('subscribedSubjects') || '[]')).length === 0 
              ? 'You have not subscribed to any subjects yet. Customize your curriculum on the subscription page to unlock reference resources and notebooks!' 
              : 'There are no reference documents or study guide notes matching your filter choices.'}
          </p>
          {(JSON.parse(localStorage.getItem('subscribedSubjects') || '[]')).length === 0 && (
            <a
              href="/student/subscription"
              className="inline-flex items-center gap-2 mt-5 py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs tracking-wide transition-smooth shadow-md shadow-indigo-600/10 shrink-0"
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredMaterials.map((material) => {
            const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const token = localStorage.getItem('token') || '';
            const subs = localStorage.getItem('subscribedSubjects') || '[]';
            const proxyUrl = `${API_BASE}/materials/render?id=${material.id}&token=${encodeURIComponent(token)}&subjects=${encodeURIComponent(subs)}`;

            return (
              <motion.div
                key={material.id}
                variants={cardVariants}
                whileHover={{ y: -6, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-saas p-6 pb-7 hover:border-slate-300 dark:hover:border-slate-700 transition-smooth flex flex-col justify-between h-[225px] group cursor-pointer"
              >
                {/* Header section */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(material.file_type)}
                      <div className="overflow-hidden">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${getSubjectColorBadge(material.subject)}`}>
                          {material.subject === 'Social' ? 'Social Studies' : material.subject}
                        </span>
                        <span className="block text-[10px] font-black text-slate-400 dark:text-slate-500 truncate max-w-[130px] mt-1 font-sans">
                          {material.file_name}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase shrink-0">
                      {material.file_type?.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-sm leading-snug line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-smooth font-sans">
                      {material.title}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold leading-normal line-clamp-2">
                      {material.description || "In-depth chapter notes, solutions, explanations, and workbook exercises compiled by teachers."}
                    </p>
                  </div>
                </div>

                {/* Footer download button */}
                <div className="pt-3 border-t border-slate-50 dark:border-slate-800 mt-2 shrink-0">
                  {/* Real Download button */}
                  <a
                    href={proxyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs tracking-wide transition-smooth shadow-md shadow-indigo-600/10 shrink-0"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    Download
                  </a>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </StudentLayout>
  );
};

export default StudentMaterials;
