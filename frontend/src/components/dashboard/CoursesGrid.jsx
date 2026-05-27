import React from 'react';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const CoursesGrid = ({ courses = [], loading = false, searchQuery = '' }) => {

  const getGradientColor = (subject) => {
    const gradients = {
      'Telugu': 'from-amber-500 to-orange-600',
      'Hindi': 'from-rose-500 to-red-600',
      'English': 'from-blue-500 to-indigo-600',
      'Maths': 'from-purple-500 to-violet-600',
      'Physics': 'from-cyan-500 to-blue-600',
      'Chemistry': 'from-emerald-500 to-teal-600',
      'Biology': 'from-green-500 to-emerald-600',
      'Social Studies': 'from-fuchsia-500 to-pink-600',
      'Social': 'from-fuchsia-500 to-pink-600'
    };
    return gradients[subject] || 'from-slate-500 to-slate-700';
  };

  const getSubjectIcon = (subject, fallbackIcon) => {
    const normalized = (subject || '').trim().toLowerCase();
    switch (normalized) {
      case 'telugu':
        return '📙';
      case 'hindi':
        return '📔';
      case 'english':
        return '📕';
      case 'maths':
      case 'mathematics':
        return '📐';
      case 'physics':
        return '⚛️';
      case 'chemistry':
        return '🧪';
      case 'biology':
        return '🌿';
      case 'social':
      case 'social studies':
        return '🌍';
      default:
        return fallbackIcon || '📚';
    }
  };

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 80 } }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-saas h-[300px] skeleton-pulse" />
        ))}
      </div>
    );
  }

  // Restrict to standard 8 subjects & filter based on search query
  const allowedSubjects = ['TELUGU', 'HINDI', 'ENGLISH', 'SOCIAL', 'PHYSICS', 'CHEMISTRY', 'MATHS', 'BIOLOGY', 'SOCIAL STUDIES'];
  const filteredCourses = courses.filter(course => {
    const isAllowed = allowedSubjects.includes(course.subject?.toUpperCase());
    const matchesSearch = searchQuery 
      ? course.subject?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return isAllowed && matchesSearch;
  });

  const formatSubjectName = (subject) => {
    if (!subject) return '';
    const lower = subject.toLowerCase();
    if (lower === 'social studies' || lower === 'social') return 'Social Studies';
    return subject.charAt(0).toUpperCase() + lower.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h3 className="font-black text-slate-800 dark:text-white text-xl tracking-tight font-sans">Active Courses</h3>
        <p className="text-xs font-semibold text-slate-400 mt-0.5">Pick up right where you left off</p>
      </div>

      {/* Courses Cards Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {filteredCourses.map((course) => {
          const displaySubject = formatSubjectName(course.subject);
          return (
            <motion.div
              key={course.id}
              variants={cardVariants}
              whileHover={{ y: -6, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-saas overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-smooth flex flex-col h-[310px] group"
            >
              {/* Course Card Cover (Thumbnail) with gradient & Subject Title */}
              <div className={`relative h-32 bg-gradient-to-br ${getGradientColor(course.subject)} p-5 flex flex-col justify-between text-white shrink-0`}>
                {/* Decorative Pattern overlay */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-indigo-900 to-black mix-blend-overlay" />
                
                <div className="flex items-center justify-between z-10">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                    Syllabus
                  </span>
                  <span className="text-2xl">{getSubjectIcon(course.subject, course.icon)}</span>
                </div>

                <div className="z-10 mt-2">
                  <h4 className="font-extrabold text-white text-base tracking-tight leading-snug line-clamp-2 font-sans group-hover:text-indigo-100 transition-smooth">
                    {displaySubject}
                  </h4>
                </div>
              </div>

              {/* Card Body Info */}
              <div className="flex-1 p-5 flex flex-col justify-between">
                {/* Progress bar */}
                <div className="space-y-2 py-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500">
                    <span>{course.lessonsCompleted}/{course.totalLessons} Lessons</span>
                    <span className="text-slate-700 dark:text-slate-300">{course.progress}% Complete</span>
                  </div>
                  {/* Progress Line */}
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full rounded-full bg-indigo-500"
                    />
                  </div>
                </div>

                {/* Action button */}
                <a
                  href="/student/videos"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white font-bold text-xs tracking-wide transition-smooth group/btn"
                >
                  <PlayCircle className="w-4 h-4 transition-smooth group-hover/btn:scale-110" />
                  Continue Learning
                  <ArrowRight className="w-3.5 h-3.5 transition-smooth group-hover/btn:translate-x-1" />
                </a>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default CoursesGrid;
