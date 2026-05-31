import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI } from '../services/api';
import StudentLayout from '../layouts/StudentLayout';
import PageHeader from '../components/layout/PageHeader';
import GoBackButton from '../components/layout/GoBackButton';
import { 
  Play, 
  Tv, 
  Search, 
  User, 
  Video, 
  Radio, 
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StudentVideos = () => {
  const navigate = useNavigate();

  // Component States
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('All');

  const subscribedList = JSON.parse(localStorage.getItem('subscribedSubjects') || '[]');
  const subjects = ['All', ...subscribedList];

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await videoAPI.getVideos();
      
      // Restrict raw videos to 8 subjects and check subscription list
      const allowed = ['TELUGU', 'HINDI', 'ENGLISH', 'SOCIAL', 'PHYSICS', 'CHEMISTRY', 'MATHS', 'BIOLOGY', 'SOCIAL STUDIES'];
      const subscribed = JSON.parse(localStorage.getItem('subscribedSubjects') || '[]');
      
      const filteredRaw = (response.data || []).filter(v => 
        allowed.includes(v.subject?.toUpperCase()) &&
        subscribed.some(s => s.toLowerCase() === v.subject?.toLowerCase())
      );
      
      setVideos(filteredRaw);
      setFilteredVideos(filteredRaw);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (type, subject, query) => {
    let filtered = videos;

    // Filter by type
    if (type !== 'all') {
      filtered = filtered.filter(v => v.video_type === type);
    }

    // Filter by subject
    if (subject !== 'All') {
      filtered = filtered.filter(v => v.subject === subject);
    }

    // Filter by search query
    if (query.trim() !== '') {
      const q = query.toLowerCase();
      filtered = filtered.filter(v => 
        v.title.toLowerCase().includes(q) || 
        v.description.toLowerCase().includes(q)
      );
    }

    setFilteredVideos(filtered);
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    applyFilters(selectedType, selectedSubject, val);
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    applyFilters(selectedType, subject, searchQuery);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    applyFilters(type, selectedSubject, searchQuery);
  };

  // Get Video ID from YouTube URL
  const getYoutubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    return match ? match[1] : null;
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

  // Render Category filter badges
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
      
      {/* Header wrapper component */}
      <PageHeader 
        title="Video Lessons & Live Classes"
        subtitle="Stream dynamic subject tutorials, view archived lectures, or join active interactive rooms."
        parentLabel="Dashboard"
        parentPath="/student/dashboard"
      />

      {/* Toolbar / Search / Filter section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-saas space-y-5 mb-8">
        
        {/* Search Bar & Type Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search bar wrapper */}
          <div className="relative flex-grow max-w-md">
            <Search className="absolute top-1/2 left-3.5 w-4.5 h-4.5 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search lectures, topics, concepts..." 
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10 transition-smooth"
            />
          </div>

          {/* Type filters tabs (SaaS selector button group) */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0 self-start md:self-auto">
            <button
              onClick={() => handleTypeChange('all')}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-smooth ${
                selectedType === 'all' 
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Tv className="w-4 h-4" />
              All
            </button>
            <button
              onClick={() => handleTypeChange('recorded')}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-smooth ${
                selectedType === 'recorded' 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              <Video className="w-4 h-4" />
              Recorded
            </button>
            <button
              onClick={() => handleTypeChange('live')}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-smooth ${
                selectedType === 'live' 
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm' 
                  : 'text-slate-500 hover:text-rose-600 dark:hover:text-rose-400'
              }`}
            >
              <Radio className="w-4 h-4" />
              Live Rooms
            </button>
          </div>
        </div>

        {/* Subject Pills horizontal scroll list */}
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

      {/* Main Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-saas h-[320px] skeleton-pulse" />
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-saas max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <HelpCircle className="w-8 h-8 stroke-1.5" />
          </div>
          <h4 className="font-extrabold text-slate-800 dark:text-white text-lg leading-tight">
            {(JSON.parse(localStorage.getItem('subscribedSubjects') || '[]')).length === 0 
              ? 'No Subscribed Subjects' 
              : 'No Videos Found'}
          </h4>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {(JSON.parse(localStorage.getItem('subscribedSubjects') || '[]')).length === 0 
              ? 'You have not subscribed to any subjects yet. Customize your curriculum on the subscription page to unlock streamable video lectures and live classrooms!' 
              : 'There are no recorded lessons or live classes matching your current subject filter or search keyword. Try selecting another topic!'}
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredVideos.map((video) => {
            const ytId = getYoutubeId(video.youtube_url);
            const coverUrl = ytId 
              ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
              : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=640"; // Default generic edtech img
            
            const isLive = video.video_type === 'live';

            return (
              <motion.div
                key={video.id}
                variants={cardVariants}
                whileHover={{ y: -6, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-saas overflow-hidden hover:border-slate-300 dark:hover:border-slate-750 transition-smooth flex flex-col h-[340px] group cursor-pointer"
                onClick={() => navigate(`/student/videos/${video.id}`)}
              >
                {/* Thumbnail Section */}
                <div className="relative h-44 bg-slate-900 overflow-hidden shrink-0">
                  <img 
                    src={coverUrl} 
                    alt={video.title} 
                    className="w-full h-full object-cover transition-smooth group-hover:scale-105 opacity-80"
                  />
                  {/* Subject Tag */}
                  <span className="absolute top-3 left-3 text-[9px] font-extrabold uppercase tracking-wider bg-indigo-600/90 backdrop-blur-md text-white py-1 px-2.5 rounded-lg border border-indigo-500/20 shadow-md">
                    {video.subject === 'Social' ? 'Social Studies' : video.subject}
                  </span>

                  {/* Play overlay button (Netflix style) */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 group-hover:opacity-100 transition-smooth">
                    <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 border border-indigo-500 scale-90 group-hover:scale-100 transition-smooth">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Live badge overlay / Duration badge */}
                  {isLive ? (
                    <span className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider bg-rose-500 text-white py-1 px-2.5 rounded-lg shadow-md animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      Live Room
                    </span>
                  ) : (
                    <span className="absolute bottom-3 right-3 text-[9px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white py-1 px-2.5 rounded-lg">
                      {video.duration_minutes || 20} Mins
                    </span>
                  )}
                </div>

                {/* Info Section */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-base leading-snug line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-smooth font-sans">
                      {video.title}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold leading-normal line-clamp-2">
                      {video.description || "Learn fundamental subject parameters, formulas, calculations, and analytical equations."}
                    </p>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
                      <span>Instructor Lesson</span>
                    </div>
                    <span className="text-indigo-500 dark:text-indigo-400 font-extrabold hover:underline inline-flex items-center gap-1">
                      Stream Now
                      <Play className="w-3 h-3 fill-indigo-500 dark:fill-indigo-400" />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </StudentLayout>
  );
};

export default StudentVideos;
