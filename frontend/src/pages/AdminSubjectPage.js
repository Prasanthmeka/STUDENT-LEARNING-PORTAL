import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../layouts/AdminLayout';
import { analyticsAPI, userAPI } from '../services/api';
import { 
  GraduationCap, 
  Crown, 
  AlertTriangle, 
  Search, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Pencil,
  Trash2,
  X,
  FileSpreadsheet,
  FileText,
  Play,
  ClipboardList,
  FileDown,
  Activity,
  Upload,
  Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from '../components/dashboard/CustomSelect';

// Strict Subjects List validation
const VALID_SUBJECTS = ['TELUGU', 'HINDI', 'ENGLISH', 'SOCIAL', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'MATHS'];

const defaultDummyData = {
  TELUGU: {
    overview: "Telugu language curriculum covering comprehensive grammar, regional literature, poetry comprehension, and classical compositions.",
    subscribed: 48,
    unsubscribed: 24,
    passRate: 82.5,
    failRate: 17.5
  },
  HINDI: {
    overview: "Hindi language portal focusing on standard vocabulary, grammatical rules, prose writing, and national secondary educational levels.",
    subscribed: 36,
    unsubscribed: 30,
    passRate: 75.0,
    failRate: 25.0
  },
  ENGLISH: {
    overview: "Comprehensive English studies incorporating creative essays, advanced linguistics, classical literature, and spelling reviews.",
    subscribed: 64,
    unsubscribed: 18,
    passRate: 88.0,
    failRate: 12.0
  },
  SOCIAL: {
    overview: "Social Studies workspace detailing geographic surveys, world historical milestones, local civics administration, and economic outlines.",
    subscribed: 52,
    unsubscribed: 26,
    passRate: 79.2,
    failRate: 20.8
  },
  PHYSICS: {
    overview: "Fundamental physics mechanics, electromagnetic theories, light ray optics, heat thermodynamics, and primary laboratory guidelines.",
    subscribed: 58,
    unsubscribed: 14,
    passRate: 81.6,
    failRate: 18.4
  },
  CHEMISTRY: {
    overview: "Inorganic compound structures, periodic table chemical bonds, acid-base equations, chemical reactions, and experiments guides.",
    subscribed: 50,
    unsubscribed: 20,
    passRate: 76.8,
    failRate: 23.2
  },
  BIOLOGY: {
    overview: "Cell division systems, human body anatomical structures, plant photosynthesis cycles, ecosystems, and genetic codes.",
    subscribed: 42,
    unsubscribed: 28,
    passRate: 74.5,
    failRate: 25.5
  },
  MATHS: {
    overview: "Secondary arithmetic sequences, algebraic equations, geometry theorems, trigonometric calculations, and stats matrices.",
    subscribed: 72,
    unsubscribed: 10,
    passRate: 91.2,
    failRate: 8.8
  }
};

const COLORS = {
  indigo: '#6366f1',
  purple: '#a855f7',
  emerald: '#10b981',
  slateLight: '#f1f5f9',
  slateDark: '#1e293b'
};

const AdminSubjectPage = () => {
  const { subjectName } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Reactive Theme Accent state
  const [themeAccent, setThemeAccent] = useState(() => localStorage.getItem('admin_theme_accent') || 'purple');
  useEffect(() => {
    const handleThemeChange = () => {
      setThemeAccent(localStorage.getItem('admin_theme_accent') || 'purple');
    };
    window.addEventListener('admin-theme-changed', handleThemeChange);
    return () => window.removeEventListener('admin-theme-changed', handleThemeChange);
  }, []);

  const getThemeColors = () => {
    switch (themeAccent) {
      case 'pink':
        return {
          primary: '#EC4899',
          glow: 'from-pink-500 to-rose-500',
          text: 'text-pink-650',
          bg: 'bg-pink-600 hover:bg-pink-700 shadow-pink-600/20',
          badgeText: 'bg-pink-100 text-pink-700 border border-pink-200'
        };
      case 'green':
        return {
          primary: '#10B981',
          glow: 'from-emerald-500 to-green-500',
          text: 'text-emerald-650',
          bg: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20',
          badgeText: 'bg-emerald-100 text-emerald-700 border border-emerald-200'
        };
      case 'orange':
        return {
          primary: '#F97316',
          glow: 'from-orange-500 to-amber-500',
          text: 'text-orange-650',
          bg: 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20',
          badgeText: 'bg-orange-100 text-orange-700 border border-orange-200'
        };
      case 'purple':
      default:
        return {
          primary: '#6366F1',
          glow: 'from-indigo-500 to-purple-500',
          text: 'text-[#6366F1]',
          bg: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20',
          badgeText: 'bg-indigo-100 text-indigo-700 border border-indigo-200'
        };
    }
  };

  const themeColors = getThemeColors();

  // Normalize active subject
  const currentSubject = (subjectName || '').toUpperCase();
  const isValid = VALID_SUBJECTS.includes(currentSubject);

  // Core Layout States
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchQuery, setSearchQuery] = useState('');

  // Table local filters
  const [planFilter, setPlanFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Sorting and Pagination
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Local Subject Dataset State
  const [students, setStudents] = useState([]);
  const [subjectSummary, setSubjectSummary] = useState({
    subscribed: 0,
    unsubscribed: 0,
    passRate: 0,
    failRate: 0
  });
  const [weeklyAnalyticsData, setWeeklyAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState(null);

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPlan, setEditPlan] = useState('');
  const [editStatus, setEditStatus] = useState('');

  // Subject Content Lists
  const [videos, setVideos] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [materials, setMaterials] = useState([]);

  // Reusable Modals States
  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // View Quiz Student Attempts Modal States
  const [showAttemptsModal, setShowAttemptsModal] = useState(false);
  const [modalQuiz, setModalQuiz] = useState(null);
  const [modalAttempts, setModalAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [resettingAttemptId, setResettingAttemptId] = useState(null);

  // Video Player Modal States
  const [activeVideoToPlay, setActiveVideoToPlay] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  const getYoutubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    return match ? match[1] : null;
  };

  const handlePlayVideo = (video) => {
    setActiveVideoToPlay(video);
    setShowPlayerModal(true);
  };

  // Video Form Fields
  const [videoTitle, setVideoTitle] = useState('');
  const [videoType, setVideoType] = useState('Recorded');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoDuration, setVideoDuration] = useState('45 mins');
  const [videoChapter, setVideoChapter] = useState('');
  const [videoVisibility, setVideoVisibility] = useState('Premium Only');
  const [dragVideoActive, setDragVideoActive] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // Material Form Fields
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialType, setMaterialType] = useState('PDF');
  const [materialDescription, setMaterialDescription] = useState('');
  const [materialChapter, setMaterialChapter] = useState('');
  const [materialVisibility, setMaterialVisibility] = useState('Premium Only');
  const [dragMaterialActive, setDragMaterialActive] = useState(false);
  const [materialFile, setMaterialFile] = useState(null);

  // Quiz Form Fields & Question Builder States
  const [quizTitle, setQuizTitle] = useState('');
  const [quizChapter, setQuizChapter] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState('Medium');
  const [quizDuration, setQuizDuration] = useState('20 mins');
  const [quizTotalQuestions, setQuizTotalQuestions] = useState(5);
  const [quizPassingMarks, setQuizPassingMarks] = useState(50);
  const [quizType, setQuizType] = useState('MCQ');

  // Interactive Question Builder structure: list of custom questions
  const [questionsList, setQuestionsList] = useState([
    { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', marks: 5, explanation: '' }
  ]);

  // Video Table local filter states
  const [videoSearch, setVideoSearch] = useState('');
  const [videoTypeFilter, setVideoTypeFilter] = useState('All');
  const [videoVisFilter, setVideoVisFilter] = useState('All');
  const [videoPage, setVideoPage] = useState(1);

  // Material Table local filter states
  const [materialSearch, setMaterialSearch] = useState('');
  const [materialTypeFilter, setMaterialTypeFilter] = useState('All');
  const [materialVisFilter, setMaterialVisFilter] = useState('All');
  const [materialPage, setMaterialPage] = useState(1);

  // Quiz Table local filter states
  const [quizSearch, setQuizSearch] = useState('');
  const [quizStatusFilter, setQuizStatusFilter] = useState('All');
  const [quizPage, setQuizPage] = useState(1);
  const [viewingQuizQuestions, setViewingQuizQuestions] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [modalResponses, setModalResponses] = useState([]);
  const [selectedAttemptForResponse, setSelectedAttemptForResponse] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [loadingResponseDetail, setLoadingResponseDetail] = useState(false);
  const [viewingQuizForResponse, setViewingQuizForResponse] = useState(null);

  const loadRealQuizzes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/quizzes/admin/all-quizzes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Filter quizzes by current subject (case-insensitive)
        const subjectQuizzes = data.filter(q => q.subject && q.subject.toUpperCase() === currentSubject.toUpperCase());
        // Map database fields to the fields expected by the UI and resolve real attempts count
        const mappedQuizzes = await Promise.all(subjectQuizzes.map(async q => {
          let attemptsCount = 0;
          try {
            const attRes = await fetch(`http://localhost:5000/api/quizzes/${q.id}/all-attempts`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            if (attRes.ok) {
              const attData = await attRes.json();
              attemptsCount = attData.attempts ? attData.attempts.length : 0;
            }
          } catch (e) {
            console.error('Error fetching attempts count for quiz:', q.id, e);
          }
          return {
            id: q.id,
            title: q.title,
            questions: q.total_questions || 0,
            passRate: `${q.passing_score || 50}%`,
            limit: `${q.time_limit_minutes || 30} mins`,
            attempts: attemptsCount,
            failedRate: '0%',
            status: q.is_published ? 'Active' : 'Draft',
            chapter: q.chapter || '1',
            difficulty: q.difficulty || 'Medium'
          };
        }));
        setQuizzes(mappedQuizzes);
      }
    } catch (err) {
      console.error('Error fetching backend quizzes in AdminSubjectPage:', err);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to delete quiz');
      }
      alert('Quiz deleted successfully');
      loadRealQuizzes(); // Refresh the list
    } catch (error) {
      alert('Error deleting quiz: ' + error.message);
    }
  };

  const handleViewQuizQuestions = async (quizId) => {
    setLoadingQuestions(true);
    try {
      const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch quiz details');
      }
      const data = await response.json();
      setViewingQuizQuestions(data);
    } catch (error) {
      alert('Error loading quiz details: ' + error.message);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const openAttemptsModal = async (quiz) => {
    setModalQuiz(quiz);
    setShowAttemptsModal(true);
    setLoadingAttempts(true);
    try {
      const response = await fetch(`http://localhost:5000/api/quizzes/${quiz.id}/all-attempts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setModalAttempts(data.attempts || []);
        setModalResponses(data.responses || []);
      } else {
        setModalAttempts([]);
        setModalResponses([]);
      }
    } catch (err) {
      console.error('Error fetching quiz attempts:', err);
      setModalAttempts([]);
      setModalResponses([]);
    } finally {
      setLoadingAttempts(false);
    }
  };

  const handleViewStudentResponse = async (attempt) => {
    setLoadingResponseDetail(true);
    try {
      const response = await fetch(`http://localhost:5000/api/quizzes/${attempt.quiz_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch quiz details');
      }
      const fullQuiz = await response.json();
      setViewingQuizForResponse(fullQuiz);
      setSelectedAttemptForResponse(attempt);
      setShowResponseModal(true);
    } catch (e) {
      alert("Error loading response details: " + e.message);
    } finally {
      setLoadingResponseDetail(false);
    }
  };

  const handleResetAttempt = async (attemptId) => {
    if (!window.confirm('Are you sure you want to reset this student\'s attempt? This will permanently delete their score and answers, allowing them to retake the quiz.')) {
      return;
    }
    setResettingAttemptId(attemptId);
    try {
      const response = await fetch(`http://localhost:5000/api/quizzes/attempt/${attemptId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        alert('Student attempt reset successfully.');
        // Refresh attempts within the modal
        if (modalQuiz) {
          const res = await fetch(`http://localhost:5000/api/quizzes/${modalQuiz.id}/all-attempts`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setModalAttempts(data.attempts || []);
          }
        }
        // Refresh parent quiz table
        loadRealQuizzes();
      } else {
        const errData = await response.json();
        alert('Error resetting attempt: ' + (errData.error || 'Failed response'));
      }
    } catch (err) {
      alert('Error resetting attempt: ' + err.message);
    } finally {
      setResettingAttemptId(null);
    }
  };

  const loadRealVideos = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/videos/admin', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const subjectVideos = data.filter(v => v.subject && v.subject.toUpperCase() === currentSubject.toUpperCase());
        const mappedVideos = subjectVideos.map(v => ({
          id: v.id,
          title: v.title,
          duration: v.duration_minutes ? `${v.duration_minutes} mins` : '45 mins',
          type: v.video_type === 'live' ? 'Live' : 'Recorded',
          url: v.video_type === 'live' ? v.live_stream_url : v.youtube_url,
          visibility: 'Premium Only',
          chapter: '1',
          description: v.description || 'No description provided.'
        }));
        setVideos(mappedVideos);
      }
    } catch (err) {
      console.error('Error fetching backend videos:', err);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to delete video');
      }
      alert('Video deleted successfully');
      loadRealVideos();
    } catch (error) {
      alert('Error deleting video: ' + error.message);
    }
  };

  const loadRealMaterials = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/materials/admin', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const subjectMaterials = data.filter(m => m.subject && m.subject.toUpperCase() === currentSubject.toUpperCase());
        const mappedMaterials = subjectMaterials.map(m => ({
          id: m.id,
          title: m.title,
          size: '2.5 MB',
          link: m.github_url,
          type: m.file_type || 'PDF',
          visibility: 'Premium Only',
          chapter: '1',
          downloads: 0
        }));
        setMaterials(mappedMaterials);
      }
    } catch (err) {
      console.error('Error fetching backend materials:', err);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/materials/${materialId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to delete material');
      }
      alert('Material deleted successfully');
      loadRealMaterials();
    } catch (error) {
      alert('Error deleting material: ' + error.message);
    }
  };

  // Generate deterministic student dataset for this specific subject
  useEffect(() => {
    if (!isValid) {
      navigate('/admin/dashboard');
      return;
    }

    const loadStudents = async () => {
      setLoading(true);
      try {
        const response = await analyticsAPI.getAdminSubjectDashboard(currentSubject.toLowerCase());
        if (response.data && Array.isArray(response.data.students)) {
          setStudents(response.data.students);
          setSubjectSummary(response.data.summary);
          setWeeklyAnalyticsData(response.data.weeklyAnalytics);
        } else {
          setStudents([]);
          setSubjectSummary({ subscribed: 0, unsubscribed: 0, passRate: 0, failRate: 0 });
          setWeeklyAnalyticsData([]);
        }
      } catch (err) {
        console.error('Failed to load students for subject page:', err);
        setStudents([]);
        setSubjectSummary({ subscribed: 0, unsubscribed: 0, passRate: 0, failRate: 0 });
        setWeeklyAnalyticsData([]);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();

    // Fetch quizzes, videos, and materials from database instead of mock
    loadRealQuizzes();
    loadRealVideos();
    loadRealMaterials();
  }, [currentSubject, isValid, navigate]);

  // Subject overall summaries
  const subjectOverview = {
    overview: defaultDummyData[currentSubject]?.overview || 'Educational syllabus materials and exams.',
    subscribed: subjectSummary.subscribed,
    unsubscribed: subjectSummary.unsubscribed,
    passRate: subjectSummary.passRate,
    failRate: subjectSummary.failRate
  };

  // Sorting logic
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const sortedStudents = [...students].sort((a, b) => {
    let aVal = a[sortField] || '';
    let bVal = b[sortField] || '';

    if (sortField === 'expiryDate') {
      aVal = new Date(a.expiryDate || '01/01/1970');
      bVal = new Date(b.expiryDate || '01/01/1970');
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Table filtering chain
  const filteredStudents = sortedStudents.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlan = planFilter === 'All' || 
      (planFilter === 'Premium' && student.plan === 'Premium Plan') ||
      (planFilter === 'Free Trial' && student.plan === 'Free Trial');

    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'Active' && student.status === 'Active') ||
      (statusFilter === 'Expired' && student.status === 'Expired') ||
      (statusFilter === 'Free Trial' && student.status === 'Free Trial');

    return matchesSearch && matchesPlan && matchesStatus;
  });

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / rowsPerPage));
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const paginatedStudents = filteredStudents.slice(indexOfFirstRow, indexOfLastRow);

  // 1. Video Table local filtering & pagination
  const filteredVideos = videos.filter(vid => {
    const matchesSearch = vid.title.toLowerCase().includes(videoSearch.toLowerCase());
    const matchesType = videoTypeFilter === 'All' || vid.type === videoTypeFilter;
    const matchesVis = videoVisFilter === 'All' || vid.title.toLowerCase().includes(videoVisFilter.toLowerCase()) || (videoVisFilter === 'Premium Only' && vid.title.includes('Premium')) || (videoVisFilter === 'Public' && !vid.title.includes('Premium'));
    return matchesSearch && matchesType && matchesVis;
  });
  const totalVideoPages = Math.max(1, Math.ceil(filteredVideos.length / 5));
  const paginatedVideos = filteredVideos.slice((videoPage - 1) * 5, videoPage * 5);

  // 2. Material Table local filtering & pagination
  const filteredMaterials = materials.filter(mat => {
    const matchesSearch = mat.title.toLowerCase().includes(materialSearch.toLowerCase());
    const matchesType = materialTypeFilter === 'All' || mat.title.toLowerCase().includes(materialTypeFilter.toLowerCase());
    const matchesVis = materialVisFilter === 'All' || mat.title.toLowerCase().includes(materialVisFilter.toLowerCase()) || (materialVisFilter === 'Premium Only' && mat.title.includes('Premium')) || (materialVisFilter === 'Public' && !mat.title.includes('Premium'));
    return matchesSearch && matchesType && matchesVis;
  });
  const totalMaterialPages = Math.max(1, Math.ceil(filteredMaterials.length / 5));
  const paginatedMaterials = filteredMaterials.slice((materialPage - 1) * 5, materialPage * 5);

  // 3. Quiz Table local filtering & pagination
  const filteredQuizzes = quizzes.filter(qz => {
    const matchesSearch = qz.title.toLowerCase().includes(quizSearch.toLowerCase());
    const matchesStatus = quizStatusFilter === 'All' || qz.status === quizStatusFilter;
    return matchesSearch && matchesStatus;
  });
  const totalQuizPages = Math.max(1, Math.ceil(filteredQuizzes.length / 5));
  const paginatedQuizzes = filteredQuizzes.slice((quizPage - 1) * 5, quizPage * 5);

  // Edit triggers
  const handleEditClick = (student) => {
    setEditingStudent(student);
    setEditName(student.name);
    setEditEmail(student.email);
    setEditPlan(student.plan);
    setEditStatus(student.status);
  };

  const handleSaveStudent = (e) => {
    e.preventDefault();
    setStudents(prev => prev.map(s => {
      if (s.id === editingStudent.id) {
        return {
          ...s,
          name: editName,
          email: editEmail,
          plan: editPlan,
          status: editStatus,
          attempts: editStatus === 'Expired' ? 0 : s.attempts,
          performance: editStatus === 'Expired' ? 'N/A' : s.performance
        };
      }
      return s;
    }));
    setEditingStudent(null);
  };

  // Custom Form Submit Handlers
  const handleAddVideoSubmit = async (e) => {
    e.preventDefault();
    if (!videoTitle.trim() || !videoUrl.trim() || !videoChapter.trim()) {
      alert('Please fill in Title, YouTube Video Link, and Chapter fields.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/videos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `${videoTitle} - Unit ${videoChapter}`,
          description: videoDescription || 'No description provided.',
          video_type: videoType.toLowerCase() === 'live' ? 'live' : 'recorded',
          youtube_url: videoUrl,
          subject: currentSubject,
          is_published: true
        })
      });
      if (response.ok) {
        alert('Video uploaded successfully!');
        setIsAddVideoOpen(false);
        // Reset Form Fields
        setVideoTitle('');
        setVideoUrl('');
        setVideoDescription('');
        setVideoDuration('45 mins');
        setVideoChapter('');
        setThumbnailFile(null);
        // Reload real videos list
        loadRealVideos();
      } else {
        const errData = await response.json();
        alert('Failed to upload video: ' + (errData.error || 'Server error'));
      }
    } catch (error) {
      alert('Error uploading video: ' + error.message);
    }
  };

  const handleAddMaterialSubmit = async (e) => {
    e.preventDefault();
    if (!materialTitle.trim() || !materialChapter.trim()) {
      alert('Please fill in Title and Chapter fields.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/materials', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `${materialTitle} - Unit ${materialChapter}`,
          description: materialDescription || 'No description provided.',
          file_name: `${materialTitle.toLowerCase().replace(/ /g, '_')}_unit_${materialChapter}.${materialType.toLowerCase() === 'notes' ? 'pdf' : 'zip'}`,
          github_url: 'https://github.com', // fallback URL
          file_type: materialType === 'Notes' ? 'PDF' : 'ZIP',
          subject: currentSubject,
          is_published: true
        })
      });
      if (response.ok) {
        alert('Material uploaded successfully!');
        setIsAddMaterialOpen(false);
        // Reset Form Fields
        setMaterialTitle('');
        setMaterialDescription('');
        setMaterialChapter('');
        setMaterialFile(null);
        // Reload real materials list
        loadRealMaterials();
      } else {
        const errData = await response.json();
        alert('Failed to upload material: ' + (errData.error || 'Server error'));
      }
    } catch (error) {
      alert('Error uploading material: ' + error.message);
    }
  };

  const triggerDeleteConfirm = (id, name) => {
    setStudentToDelete({ id, name });
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (studentToDelete) {
      try {
        await userAPI.deleteUser(studentToDelete.id);
        setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
        alert(`Student "${studentToDelete.name}" has been successfully removed.`);
      } catch (error) {
        console.error('Failed to delete student:', error);
        alert(error.response?.data?.error || 'Failed to remove student. Please try again.');
      } finally {
        setIsDeleteOpen(false);
        setStudentToDelete(null);
      }
    }
  };

  // Delete trigger
  const handleDeleteStudent = (id, name) => {
    triggerDeleteConfirm(id, name);
  };

  // Quiz Creator submit and question builder helpers
  const handleAddQuizSubmit = async (e) => {
    e.preventDefault();
    if (!quizTitle.trim() || !quizChapter.trim()) {
      alert('Please fill in Title and Chapter fields.');
      return;
    }
    try {
      const parsedDuration = parseInt(String(quizDuration).replace(/[^0-9]/g, ''), 10);
      const timeLimit = isNaN(parsedDuration) ? 20 : parsedDuration;

      const response = await fetch('http://localhost:5000/api/quizzes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `${quizTitle} - Unit ${quizChapter}`,
          description: `Assessment for Unit ${quizChapter}`,
          total_questions: questionsList.length,
          passing_score: quizPassingMarks,
          time_limit_minutes: timeLimit,
          subject: currentSubject,
          questions: questionsList
        })
      });
      if (response.ok) {
        alert('Quiz created and published successfully!');
        // Reload real quizzes list
        loadRealQuizzes();
        // Reset Quiz Fields
        setQuizTitle('');
        setQuizChapter('');
        setQuizDifficulty('Medium');
        setQuizDuration('20 mins');
        setQuizType('MCQ');
        setQuestionsList([
          { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', marks: 5, explanation: '' }
        ]);
      } else {
        const errData = await response.json();
        alert('Failed to create quiz: ' + (errData.error || 'Server error'));
      }
    } catch (error) {
      alert('Error creating quiz: ' + error.message);
    }
  };

  const handleAddQuestionRow = () => {
    setQuestionsList(prev => [
      ...prev,
      { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', marks: 5, explanation: '' }
    ]);
  };

  const handleQuestionFieldChange = (index, field, value) => {
    setQuestionsList(prev => prev.map((q, i) => {
      if (i === index) {
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  const handleRemoveQuestionRow = (index) => {
    if (questionsList.length === 1) {
      alert('You must provide at least one question inside a quiz.');
      return;
    }
    setQuestionsList(prev => prev.filter((_, i) => i !== index));
  };

  // Excel download CSV construct
  const downloadExcel = () => {
    const headers = ['Student Name', 'Email Address', 'Status', 'Plan Type', 'Quiz Attempts', 'Average Performance', 'Expiry Date'];
    const rows = filteredStudents.map(student => [
      `"${student.name}"`,
      `"${student.email}"`,
      `"${student.status}"`,
      `"${student.plan}"`,
      `"${student.attempts}"`,
      `"${student.performance}"`,
      `"${student.expiryDate || 'N/A'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `LearnoQube_${currentSubject}_StudentList.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print PDF exporter
  const downloadPDF = () => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <html>
        <head>
          <title>${currentSubject} Subscriptions Report</title>
          <style>
            body { font-family: 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #0f172a; }
            h1 { margin-bottom: 5px; font-size: 26px; color: #6366f1; }
            p { margin-top: 0; margin-bottom: 30px; font-size: 14px; color: #64748b; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { padding: 12px 15px; text-align: left; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
            th { background-color: #f8fafc; font-weight: bold; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
            .active { background-color: #dcfce7; color: #15803d; }
            .trial { background-color: #e0e7ff; color: #4338ca; }
            .expired { background-color: #fee2e2; color: #b91c1c; }
          </style>
        </head>
        <body>
          <h1>LearnoQube - ${currentSubject} Workspace</h1>
          <p>Subject Subscription Cohort List — Generated on ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email Address</th>
                <th>Status</th>
                <th>Plan Type</th>
                <th>Quiz Attempts</th>
                <th>Avg Performance</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredStudents.map(student => `
                <tr>
                  <td><strong>${student.name}</strong></td>
                  <td>${student.email}</td>
                  <td>
                    <span class="badge ${
                      student.status === 'Active' ? 'active' : student.status === 'Free Trial' ? 'trial' : 'expired'
                    }">${student.status}</span>
                  </td>
                  <td>${student.plan}</td>
                  <td>${student.attempts}</td>
                  <td>${student.performance}</td>
                  <td>${student.expiryDate || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
  };
  
  // Videos Exporters
  const downloadVideosExcel = () => {
    const headers = ['Video Title', 'Chapter/Unit', 'Duration', 'Type', 'Visibility', 'URL/Link'];
    const rows = filteredVideos.map(vid => [
      `"${vid.title}"`,
      `"${vid.chapter || 'N/A'}"`,
      `"${vid.duration}"`,
      `"${vid.type}"`,
      `"${vid.visibility || 'Premium Only'}"`,
      `"${vid.url}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `LearnoQube_${currentSubject}_VideoLectures.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadVideosPDF = () => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <html>
        <head>
          <title>${currentSubject} Video Lectures Report</title>
          <style>
            body { font-family: 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #0f172a; }
            h1 { margin-bottom: 5px; font-size: 26px; color: #6366f1; }
            p { margin-top: 0; margin-bottom: 30px; font-size: 14px; color: #64748b; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { padding: 12px 15px; text-align: left; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
            th { background-color: #f8fafc; font-weight: bold; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
            .premium { background-color: #e0e7ff; color: #4338ca; }
            .public { background-color: #dcfce7; color: #15803d; }
          </style>
        </head>
        <body>
          <h1>LearnoQube - ${currentSubject} Video Lectures</h1>
          <p>Video Inventory list — Generated on ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>Lecture Title</th>
                <th>Chapter</th>
                <th>Duration</th>
                <th>Type</th>
                <th>Visibility</th>
                <th>URL</th>
              </tr>
            </thead>
            <tbody>
              ${filteredVideos.map(vid => `
                <tr>
                  <td><strong>${vid.title}</strong></td>
                  <td>Unit ${vid.chapter || 'N/A'}</td>
                  <td>${vid.duration}</td>
                  <td>${vid.type}</td>
                  <td>
                    <span class="badge ${
                      (vid.visibility || 'Premium Only') === 'Public' ? 'public' : 'premium'
                    }">${vid.visibility || 'Premium Only'}</span>
                  </td>
                  <td>${vid.url}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Materials Exporters
  const downloadMaterialsExcel = () => {
    const headers = ['Material Title', 'Type', 'Chapter', 'Size', 'Visibility', 'Downloads'];
    const rows = filteredMaterials.map(mat => [
      `"${mat.title}"`,
      `"${mat.type || 'PDF'}"`,
      `"${mat.chapter || 'N/A'}"`,
      `"${mat.size}"`,
      `"${mat.visibility || 'Premium Only'}"`,
      `"${mat.downloads || 0}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `LearnoQube_${currentSubject}_StudyMaterials.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadMaterialsPDF = () => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <html>
        <head>
          <title>${currentSubject} Study Materials Report</title>
          <style>
            body { font-family: 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #0f172a; }
            h1 { margin-bottom: 5px; font-size: 26px; color: #a855f7; }
            p { margin-top: 0; margin-bottom: 30px; font-size: 14px; color: #64748b; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { padding: 12px 15px; text-align: left; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
            th { background-color: #f8fafc; font-weight: bold; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
            .premium { background-color: #e0e7ff; color: #4338ca; }
            .public { background-color: #dcfce7; color: #15803d; }
          </style>
        </head>
        <body>
          <h1>LearnoQube - ${currentSubject} Study Materials</h1>
          <p>Materials Inventory List — Generated on ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>Material Title</th>
                <th>Type</th>
                <th>Chapter</th>
                <th>File Size</th>
                <th>Visibility</th>
                <th>Total Downloads</th>
              </tr>
            </thead>
            <tbody>
              ${filteredMaterials.map(mat => `
                <tr>
                  <td><strong>${mat.title}</strong></td>
                  <td>${mat.type || 'PDF'}</td>
                  <td>Unit ${mat.chapter || 'N/A'}</td>
                  <td>${mat.size}</td>
                  <td>
                    <span class="badge ${
                      (mat.visibility || 'Premium Only') === 'Public' ? 'public' : 'premium'
                    }">${mat.visibility || 'Premium Only'}</span>
                  </td>
                  <td>${mat.downloads || 0} downloads</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Quizzes Exporters
  const downloadQuizzesExcel = () => {
    const headers = ['Quiz Title', 'Chapter', 'Total Questions', 'Passing Score', 'Duration Limit', 'Total Attempts', 'Pass Rate', 'Status'];
    const rows = filteredQuizzes.map(qz => [
      `"${qz.title}"`,
      `"${qz.chapter || 'N/A'}"`,
      `"${qz.questions}"`,
      `"${qz.passRate}"`,
      `"${qz.limit}"`,
      `"${qz.attempts || 0}"`,
      `"${qz.passRate}"`,
      `"${qz.status || 'Active'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `LearnoQube_${currentSubject}_QuizzesList.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadQuizzesPDF = () => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <html>
        <head>
          <title>${currentSubject} Exam Quizzes Report</title>
          <style>
            body { font-family: 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #0f172a; }
            h1 { margin-bottom: 5px; font-size: 26px; color: #10b981; }
            p { margin-top: 0; margin-bottom: 30px; font-size: 14px; color: #64748b; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { padding: 12px 15px; text-align: left; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
            th { background-color: #f8fafc; font-weight: bold; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
            .active { background-color: #dcfce7; color: #15803d; }
            .draft { background-color: #e2e8f0; color: #475569; }
          </style>
        </head>
        <body>
          <h1>LearnoQube - ${currentSubject} Exam Quizzes</h1>
          <p>Quiz Assessment Inventory — Generated on ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>Quiz Assessment Title</th>
                <th>Chapter</th>
                <th>Questions</th>
                <th>Passing Mark</th>
                <th>Duration Limit</th>
                <th>Total Attempts</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredQuizzes.map(qz => `
                <tr>
                  <td><strong>${qz.title}</strong></td>
                  <td>Unit ${qz.chapter || 'N/A'}</td>
                  <td>${qz.questions} Qs</td>
                  <td>${qz.passRate}</td>
                  <td>${qz.limit}</td>
                  <td>${qz.attempts || 0} attempts</td>
                  <td>
                    <span class="badge ${
                      (qz.status || 'Active').toLowerCase() === 'active' ? 'active' : 'draft'
                    }">${qz.status || 'Active'}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  if (!isValid) return null;

  return (
    <AdminLayout
      selectedSubject={currentSubject}
      setSelectedSubject={() => {}}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      <div className="flex flex-col gap-6 pb-12">

        {/* ----------------------------------------------------
        // 1. SUBJECT DASHBOARD HEADER
        // ---------------------------------------------------- */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white p-6 md:p-8 border border-slate-800 shadow-premium"
        >
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-bl from-indigo-500/10 to-purple-500/10 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-[10px] font-black uppercase bg-indigo-500 text-white py-0.5 px-2.5 rounded-md shadow-sm tracking-wider">
                Subject Dashboard
              </span>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight font-sans text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200 uppercase">
                {currentSubject} Syllabus
              </h1>
              <p className="text-xs md:text-sm text-slate-400 font-semibold leading-relaxed">
                {subjectOverview.overview}
              </p>
            </div>
            
            <div className="flex items-center gap-4 shrink-0 text-center">
              <div className="px-4 py-2 bg-indigo-950/30 rounded-2xl border border-indigo-900/30">
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Active Subscribed</span>
                <span className="text-lg font-black text-indigo-400">{subjectOverview.subscribed} Premium</span>
              </div>
            </div>
          </div>
        </motion.div>


        {/* ----------------------------------------------------
        // 2. SUBJECT ANALYTICS CARDS (4-GRID)
        // ---------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200/80 dark:border-indigo-955/20 shadow-saas relative overflow-hidden">
            <span className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Students Subscribed</span>
            <h3 className="text-2xl font-black text-slate-850 dark:text-white mt-1">{subjectOverview.subscribed}</h3>
            <span className="text-[10px] text-emerald-500 font-bold block mt-2">Active premium packages</span>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200/80 dark:border-indigo-955/20 shadow-saas relative overflow-hidden">
            <span className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Students Unsubscribed</span>
            <h3 className="text-2xl font-black text-slate-850 dark:text-white mt-1">{subjectOverview.unsubscribed}</h3>
            <span className="text-[10px] text-slate-400 font-bold block mt-2">Free trial limitations</span>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200/80 dark:border-indigo-955/20 shadow-saas relative overflow-hidden">
            <span className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Quiz Pass Rate</span>
            <h3 className="text-2xl font-black text-slate-850 dark:text-white mt-1">{subjectOverview.passRate}%</h3>
            <span className="text-[10px] text-indigo-500 font-bold block mt-2">Grade threshold 50%+</span>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200/80 dark:border-indigo-955/20 shadow-saas relative overflow-hidden">
            <span className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Quiz Failed Rate</span>
            <h3 className="text-2xl font-black text-slate-850 dark:text-white mt-1">{subjectOverview.failRate}%</h3>
            <span className="text-[10px] text-rose-500 font-bold block mt-2">Critical review required</span>
          </div>

        </div>

        {/* ----------------------------------------------------
        // 2B. QUICK ACTIONS SECTION
        // ---------------------------------------------------- */}
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest pl-1">Syllabus Quick Actions</span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                 {/* Quick Action 1: Upload Video */}
            <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200/80 dark:border-indigo-950/20 shadow-saas hover:shadow-lg transition-all duration-300 p-4 rounded-2xl flex flex-col justify-between hover:-translate-y-0.5 group">
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-650 text-white flex items-center justify-center shadow-md">
                  <Play className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-2 group-hover:text-indigo-500 transition-colors duration-205">Upload Video</h4>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal">Register live/recorded classes</p>
              </div>
              <button 
                onClick={() => navigate(`/admin/subject/${subjectName.toLowerCase()}/videos/upload`)}
                className="w-full mt-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-[9px] font-black tracking-wider rounded-xl transition-all duration-200"
              >
                Upload Video
              </button>
            </div>

            {/* Quick Action 2: Upload Materials */}
            <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200/80 dark:border-indigo-950/20 shadow-saas hover:shadow-lg transition-all duration-300 p-4 rounded-2xl flex flex-col justify-between hover:-translate-y-0.5 group">
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-650 text-white flex items-center justify-center shadow-md">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-2 group-hover:text-purple-500 transition-colors duration-205">Upload Materials</h4>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal">Add PDFs, guides, assignments</p>
              </div>
              <button 
                onClick={() => navigate(`/admin/subject/${subjectName.toLowerCase()}/materials/upload`)}
                className="w-full mt-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white text-[9px] font-black tracking-wider rounded-xl transition-all duration-200"
              >
                Upload Materials
              </button>
            </div>

            {/* Quick Action 3: Create Quiz */}
            <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200/80 dark:border-indigo-950/20 shadow-saas hover:shadow-lg transition-all duration-300 p-4 rounded-2xl flex flex-col justify-between hover:-translate-y-0.5 group">
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-655 text-white flex items-center justify-center shadow-md">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-2 group-hover:text-emerald-500 transition-colors duration-205">Create Quiz</h4>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal">Build custom MCQ syllabus exam</p>
              </div>
              <button 
                onClick={() => navigate(`/admin/subject/${subjectName.toLowerCase()}/quizzes/create`)}
                className="w-full mt-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-650 hover:from-emerald-650 hover:to-green-700 text-white text-[9px] font-black tracking-wider rounded-xl transition-all duration-200"
              >
                Create Quiz
              </button>
            </div>

            {/* Quick Action 5: Manage Users */}
            <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200/80 dark:border-indigo-950/20 shadow-saas hover:shadow-lg transition-all duration-300 p-4 rounded-2xl flex flex-col justify-between hover:-translate-y-0.5 group">
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-650 text-white flex items-center justify-center shadow-md">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-2 group-hover:text-indigo-550 transition-colors duration-205">Manage Users</h4>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal">Verify subscription cohort logs</p>
              </div>
              <button 
                onClick={() => setActiveTab('inventory')}
                className="w-full mt-3 py-1.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white text-[9px] font-black tracking-wider rounded-xl transition-all duration-200"
              >
                Manage Users
              </button>
            </div>  </div>

          </div>


        {/* ----------------------------------------------------
        // 3. TABS NAVIGATOR
        // ---------------------------------------------------- */}
        <div className="flex border-b border-slate-200 dark:border-indigo-950/20 gap-2 overflow-x-auto shrink-0 select-none no-scrollbar">
          {[
            { id: 'inventory', label: 'Manage Users', icon: GraduationCap },
            { id: 'videos', label: 'Video Lectures', icon: Play },
            { id: 'quizzes', label: 'Exam Quizzes', icon: ClipboardList },
            { id: 'materials', label: 'PDF Materials', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-3.5 px-4 font-black text-xs tracking-wider flex items-center gap-2 transition-colors duration-200 ${
                  isActive 
                    ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' 
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 dark:bg-indigo-450 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>


        {/* ----------------------------------------------------
        // 4. TAB CONTENTS
        // ---------------------------------------------------- */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: COHORT SUBSCRIPTION INVENTORY TABLE (MATCHES DASHBOARD STYLE) */}
          {activeTab === 'inventory' && (
            <motion.div 
              key="inventory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-3xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-indigo-950/25 shadow-saas overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-indigo-950/25 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{currentSubject} Students</span>
                    <h3 className="text-base font-black text-slate-850 dark:text-white tracking-tight font-sans">
                      Manage Users Inventory
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={downloadExcel}
                      className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 hover:bg-indigo-100 transition-all border border-indigo-100 dark:border-indigo-900/30 shrink-0"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      Excel
                    </button>
                    <button 
                      onClick={downloadPDF}
                      className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[10px] font-black bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all border border-slate-200 dark:border-slate-800 shrink-0"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      PDF
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Plan Type</span>
                    <CustomSelect 
                      value={planFilter}
                      onChange={(val) => { setPlanFilter(val); setCurrentPage(1); }}
                      options={[
                        { value: 'All', label: 'All Plans' },
                        { value: 'Premium', label: 'Premium Plan' },
                        { value: 'Free Trial', label: 'Free Trial' }
                      ]}
                      className="!py-2.5 !px-4 text-xs font-bold bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-205 dark:border-slate-850"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Status</span>
                    <CustomSelect 
                      value={statusFilter}
                      onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                      options={[
                        { value: 'All', label: 'All Statuses' },
                        { value: 'Active', label: 'Active' },
                        { value: 'Expired', label: 'Expired' },
                        { value: 'Free Trial', label: 'Free Trial' }
                      ]}
                      className="!py-2.5 !px-4 text-xs font-bold bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-205 dark:border-slate-850"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Cohort Search</span>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-450 pointer-events-none" />
                      <input 
                        type="text"
                        placeholder="Search student..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-9 pr-4 py-2.5 text-xs font-bold rounded-xl border border-slate-205 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse text-left text-xs font-medium font-sans">
                  <thead className="sticky top-0 z-10 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md">
                    <tr className="border-b border-slate-100 dark:border-indigo-950/20 text-slate-500 uppercase tracking-widest select-none">
                      <th onClick={() => handleSort('name')} className="py-4 px-6 font-extrabold cursor-pointer hover:text-slate-850 dark:hover:text-white transition-colors duration-150 group">
                        <div className="flex items-center gap-1.5">
                          Student Name
                          <ArrowUpDown className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity duration-150" />
                        </div>
                      </th>
                      <th className="py-4 px-6 font-extrabold">Email Address</th>
                      <th className="py-4 px-6 font-extrabold">Subscription Status</th>
                      <th className="py-4 px-6 font-extrabold">Plan Type</th>
                      <th className="py-4 px-6 font-extrabold text-center">Quiz Attempts</th>
                      <th className="py-4 px-6 font-extrabold text-center">Performance</th>
                      <th onClick={() => handleSort('expiryDate')} className="py-4 px-6 font-extrabold cursor-pointer hover:text-slate-850 dark:hover:text-white transition-colors duration-150 group">
                        <div className="flex items-center gap-1.5">
                          Expiry Date
                          <ArrowUpDown className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity duration-150" />
                        </div>
                      </th>
                      <th className="py-4 px-6 font-extrabold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-650 dark:text-slate-350 bg-white dark:bg-[#0f172a]/95">
                    {paginatedStudents.length > 0 ? (
                      paginatedStudents.map(student => (
                        <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-all duration-150">
                          <td className="py-3.5 px-6 font-bold text-slate-850 dark:text-slate-200">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950/40 flex items-center justify-center font-bold text-xs text-indigo-650 dark:text-indigo-400 shadow-sm shrink-0">
                                {student.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                              </div>
                              <span>{student.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-6 text-slate-550 dark:text-slate-400 font-medium">{student.email}</td>
                          <td className="py-3.5 px-6">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-center w-20
                              ${student.status === 'Active' 
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30' 
                                : student.status === 'Free Trial'
                                ? 'bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-450 border border-amber-100 dark:border-amber-900/30'
                                : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30'
                              }`}
                            >
                              {student.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 font-semibold">
                            <span className={`inline-flex items-center gap-1 ${student.plan === 'Premium Plan' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                              {student.plan === 'Premium Plan' && <Crown className="w-3.5 h-3.5 shrink-0 text-amber-500" />}
                              {student.plan}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-center font-bold font-mono">{student.attempts} attempts</td>
                          <td className="py-3.5 px-6 text-center font-bold font-mono text-indigo-500">{student.performance}</td>
                          <td className="py-3.5 px-6 text-slate-550 dark:text-slate-455 font-mono">{student.expiryDate || 'N/A'}</td>
                          <td className="py-3.5 px-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => handleEditClick(student)} className="p-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-slate-500 hover:text-indigo-600 transition-colors duration-150">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteStudent(student.id, student.name)} className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-500 hover:text-rose-650 transition-colors duration-150">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="py-12 text-center text-slate-400 dark:text-slate-500 font-semibold bg-slate-50/10">
                          <span>No cohort records match current filters.</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between text-xs font-bold text-slate-550 select-none">
                <span>
                  Showing {filteredStudents.length > 0 ? indexOfFirstRow + 1 : 0} to {Math.min(indexOfLastRow, filteredStudents.length)} of {filteredStudents.length} entries
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="p-1.5 rounded-lg border border-[#e2e8f0] dark:border-slate-850 bg-white dark:bg-slate-900 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1 font-sans">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded-lg text-xs font-black
                          ${currentPage === page
                            ? 'bg-indigo-650 text-white shadow-sm'
                            : 'border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-350'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="p-1.5 rounded-lg border border-[#e2e8f0] dark:border-slate-855 bg-white dark:bg-slate-900 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: SUBJECT VIDEO LECTURES */}
          {activeTab === 'videos' && (
            <motion.div 
              key="videos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between pl-1">
                  <span className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest">Active Video Lectures Grid</span>
                  <span className="block text-[10px] font-bold text-slate-400">{videos.length} Lectures Available</span>
                </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((vid) => {
                    const ytId = getYoutubeId(vid.url);
                    const coverUrl = ytId 
                      ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                      : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=640";
                    return (
                      <div key={vid.id} className="bg-white dark:bg-[#0f172a]/95 rounded-2xl border border-slate-200 dark:border-indigo-950/20 shadow-saas overflow-hidden flex flex-col justify-between group hover:shadow-lg transition-all duration-300">
                        <div 
                          onClick={() => handlePlayVideo(vid)}
                          className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden cursor-pointer"
                        >
                          <img 
                            src={coverUrl} 
                            alt={vid.title} 
                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent z-10" />
                          <div className="w-10 h-10 rounded-full bg-indigo-650/90 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 border border-indigo-500/20 scale-90 group-hover:scale-100 transition-all duration-300 z-20">
                            <Play className="w-4 h-4 fill-white ml-0.5 stroke-[1.5]" />
                          </div>
                          <span className="absolute bottom-3 right-3 text-[9px] font-black bg-slate-950/90 text-white px-2 py-0.5 rounded-md z-20">{vid.duration}</span>
                        </div>
                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-black uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/30">{vid.type}</span>
                              <span className="text-[8px] font-black uppercase text-purple-650 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded border border-purple-100 dark:border-purple-900/30">Unit {vid.chapter || '1'}</span>
                            </div>
                            <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 leading-snug group-hover:text-indigo-550 dark:group-hover:text-indigo-400 transition-colors duration-150">{vid.title}</h4>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed line-clamp-2">
                              {vid.description || 'No lecture syllabus details populated.'}
                            </p>
                          </div>
                          <button 
                            onClick={() => handlePlayVideo(vid)}
                            className="w-full mt-3 py-2 bg-slate-900 dark:bg-slate-950 hover:bg-slate-800 text-white text-[9px] font-black tracking-wider rounded-xl transition-all duration-205 border border-transparent dark:border-indigo-950/20"
                          >
                            Watch Lecture
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. PREMIUM LECTURES MANAGEMENT TABLE */}
              <div className="rounded-3xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-indigo-950/25 shadow-saas overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-indigo-950/25 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{currentSubject} Database</span>
                      <h3 className="text-base font-black text-slate-850 dark:text-white tracking-tight font-sans">
                        Lectures Inventory Database
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={downloadVideosExcel}
                        className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[10px] font-black bg-indigo-55/40 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 hover:bg-indigo-100/50 transition-all border border-indigo-100 dark:border-indigo-900/30 shrink-0"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        Excel
                      </button>
                      <button 
                        onClick={downloadVideosPDF}
                        className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[10px] font-black bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all border border-slate-200 dark:border-slate-880 shrink-0"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        PDF
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Type</span>
                      <CustomSelect 
                        value={videoTypeFilter}
                        onChange={(val) => { setVideoTypeFilter(val); setVideoPage(1); }}
                        options={[
                          { value: 'All', label: 'All Types' },
                          { value: 'Recorded', label: 'Recorded' },
                          { value: 'Live', label: 'Live Stream' }
                        ]}
                        className="!py-2.5 !px-4 text-xs font-bold bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-205 dark:border-slate-850"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Visibility</span>
                      <CustomSelect 
                        value={videoVisFilter}
                        onChange={(val) => { setVideoVisFilter(val); setVideoPage(1); }}
                        options={[
                          { value: 'All', label: 'All Visibilities' },
                          { value: 'Premium Only', label: 'Premium Only' },
                          { value: 'Public', label: 'Public (Free)' }
                        ]}
                        className="!py-2.5 !px-4 text-xs font-bold bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-205 dark:border-slate-850"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Search lectures</span>
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-450 pointer-events-none" />
                        <input 
                          type="text"
                          placeholder="Search lecture..."
                          value={videoSearch}
                          onChange={(e) => { setVideoSearch(e.target.value); setVideoPage(1); }}
                          className="w-full pl-9 pr-4 py-2.5 text-xs font-bold rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full border-collapse text-left text-xs font-medium font-sans">
                    <thead className="sticky top-0 z-10 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md">
                      <tr className="border-b border-slate-100 dark:border-indigo-950/20 text-slate-500 uppercase tracking-widest select-none">
                        <th className="py-4 px-6 font-extrabold">Lecture Title & Unit</th>
                        <th className="py-4 px-6 font-extrabold">Type</th>
                        <th className="py-4 px-6 font-extrabold">Duration</th>
                        <th className="py-4 px-6 font-extrabold">Visibility</th>
                        <th className="py-4 px-6 font-extrabold">URL Address</th>
                        <th className="py-4 px-6 font-extrabold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-655 dark:text-slate-355 bg-white dark:bg-[#0f172a]/95">
                      {paginatedVideos.length > 0 ? (
                        paginatedVideos.map(vid => (
                          <tr key={vid.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-all duration-150">
                            <td className="py-3.5 px-6 font-bold text-slate-850 dark:text-slate-200">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-slate-900 border border-blue-100 dark:border-indigo-950/40 flex items-center justify-center font-bold text-xs text-blue-650 dark:text-blue-400 shadow-sm shrink-0">
                                  <Play className="w-3.5 h-3.5 text-blue-650 dark:text-blue-400" />
                                </div>
                                <div>
                                  <span>{vid.title}</span>
                                  <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase mt-0.5">Chapter {vid.chapter || '1'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-6 text-slate-550 dark:text-slate-400 font-semibold">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-center w-20
                                ${vid.type === 'Live' 
                                  ? 'bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-450 border border-amber-100 dark:border-amber-900/30' 
                                  : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-455 border border-indigo-100 dark:border-indigo-900/30'
                                }`}
                              >
                                {vid.type}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 font-mono font-bold text-slate-600 dark:text-slate-400">{vid.duration}</td>
                            <td className="py-3.5 px-6 font-semibold">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-center w-24
                                ${(vid.visibility || 'Premium Only') === 'Public' 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30' 
                                  : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-655 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30'
                                }`}
                              >
                                {vid.visibility || 'Premium Only'}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 text-slate-550 dark:text-slate-455 font-mono truncate max-w-[150px]">{vid.url}</td>
                            <td className="py-3.5 px-6 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => alert(`Simulating play: ${vid.url}`)}
                                  className="p-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-slate-500 hover:text-indigo-650 transition-colors duration-150"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteVideo(vid.id)}
                                  className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-500 hover:text-rose-650 transition-colors duration-150"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="py-12 text-center text-slate-400 dark:text-slate-500 font-semibold bg-slate-50/10">
                            <span>No lectures found matching current filters.</span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between text-xs font-bold text-slate-550 select-none">
                  <span>
                    Showing {filteredVideos.length > 0 ? (videoPage - 1) * 5 + 1 : 0} to {Math.min(videoPage * 5, filteredVideos.length)} of {filteredVideos.length} entries
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={videoPage === 1}
                      onClick={() => setVideoPage(prev => Math.max(1, prev - 1))}
                      className="p-1.5 rounded-lg border border-[#e2e8f0] dark:border-slate-850 bg-white dark:bg-slate-900 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1 font-sans">
                      {Array.from({ length: totalVideoPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setVideoPage(page)}
                          className={`w-7 h-7 rounded-lg text-xs font-black
                            ${videoPage === page
                              ? 'bg-indigo-650 text-white shadow-sm'
                              : 'border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-350'
                            }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      disabled={videoPage === totalVideoPages}
                      onClick={() => setVideoPage(prev => Math.min(totalVideoPages, prev + 1))}
                      className="p-1.5 rounded-lg border border-[#e2e8f0] dark:border-slate-855 bg-white dark:bg-slate-900 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: SUBJECT EXAM QUIZZES */}
          {activeTab === 'quizzes' && (
            <motion.div 
              key="quizzes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="rounded-3xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-indigo-950/25 shadow-saas overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-indigo-950/25 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{currentSubject} Database</span>
                      <h3 className="text-base font-black text-slate-850 dark:text-white tracking-tight font-sans">
                        Quiz Assessments Database
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={downloadQuizzesExcel}
                        className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[10px] font-black bg-indigo-55/40 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 hover:bg-indigo-100/50 transition-all border border-indigo-100 dark:border-indigo-900/30 shrink-0"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        Excel
                      </button>
                      <button 
                        onClick={downloadQuizzesPDF}
                        className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[10px] font-black bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all border border-slate-200 dark:border-slate-800 shrink-0"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        PDF
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Status Filter</span>
                      <CustomSelect 
                        value={quizStatusFilter}
                        onChange={(val) => { setQuizStatusFilter(val); setQuizPage(1); }}
                        options={[
                          { value: 'All', label: 'All Statuses' },
                          { value: 'Active', label: 'Active Published' },
                          { value: 'Draft', label: 'Drafting' }
                        ]}
                        className="!py-2.5 !px-4 text-xs font-bold bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-205 dark:border-slate-850"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Search assessments</span>
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-450 pointer-events-none" />
                        <input 
                          type="text"
                          placeholder="Search quiz..."
                          value={quizSearch}
                          onChange={(e) => { setQuizSearch(e.target.value); setQuizPage(1); }}
                          className="w-full pl-9 pr-4 py-2.5 text-xs font-bold rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full border-collapse text-left text-xs font-medium font-sans">
                    <thead className="sticky top-0 z-10 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md">
                      <tr className="border-b border-slate-100 dark:border-indigo-950/20 text-slate-500 uppercase tracking-widest select-none">
                        <th className="py-4 px-6 font-extrabold">Assessment Title</th>
                        <th className="py-4 px-6 font-extrabold">Questions Count</th>
                        <th className="py-4 px-6 font-extrabold">Duration Limit</th>
                        <th className="py-4 px-6 font-extrabold">Student Attempts</th>
                        <th className="py-4 px-6 font-extrabold">Average Pass Rate</th>
                        <th className="py-4 px-6 font-extrabold">Status</th>
                        <th className="py-4 px-6 font-extrabold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-655 dark:text-slate-355 bg-white dark:bg-[#0f172a]/95">
                      {paginatedQuizzes.length > 0 ? (
                        paginatedQuizzes.map(qz => (
                          <tr key={qz.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-all duration-150">
                            <td className="py-3.5 px-6 font-bold text-slate-850 dark:text-slate-200">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-slate-900 border border-emerald-100 dark:border-indigo-950/40 flex items-center justify-center font-bold text-xs text-emerald-650 dark:text-emerald-400 shadow-sm shrink-0">
                                  <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
                                </div>
                                <div>
                                  <span 
                                    className="cursor-pointer hover:text-indigo-600 hover:underline transition-colors duration-150"
                                    onClick={() => handleViewQuizQuestions(qz.id)}
                                    title="Click to view quiz questions"
                                  >
                                    {qz.title}
                                  </span>
                                  <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase mt-0.5">Unit {qz.chapter || '1'} • {qz.difficulty || 'Medium'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-6 text-slate-550 dark:text-slate-405 font-bold font-mono">{qz.questions} Qs</td>
                            <td className="py-3.5 px-6 font-mono font-semibold">{qz.limit}</td>
                            <td className="py-3.5 px-6 font-mono font-semibold">{qz.attempts || 0} attempts</td>
                            <td className="py-3.5 px-6 text-emerald-555 font-mono font-bold">{qz.passRate || '80%'}</td>
                            <td className="py-3.5 px-6">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-center w-20
                                ${(qz.status || 'Active').toLowerCase() === 'active' 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30' 
                                  : 'bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800'
                                }`}
                              >
                                {qz.status || 'Active'}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => openAttemptsModal(qz)}
                                  className="p-1.5 rounded-md hover:bg-[#e0e7ff] dark:hover:bg-indigo-950/30 text-slate-500 hover:text-indigo-650 transition-colors duration-150"
                                  title="View Student Performance"
                                >
                                  <Activity className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteQuiz(qz.id)}
                                  className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-500 hover:text-rose-650 transition-colors duration-150"
                                  title="Delete Quiz"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-400 dark:text-slate-500 font-semibold bg-slate-50/10">
                            <span>No exam quizzes found matching current filters.</span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between text-xs font-bold text-slate-550 select-none">
                  <span>
                    Showing {filteredQuizzes.length > 0 ? (quizPage - 1) * 5 + 1 : 0} to {Math.min(quizPage * 5, filteredQuizzes.length)} of {filteredQuizzes.length} entries
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={quizPage === 1}
                      onClick={() => setQuizPage(prev => Math.max(1, prev - 1))}
                      className="p-1.5 rounded-lg border border-[#e2e8f0] dark:border-slate-850 bg-white dark:bg-slate-900 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1 font-sans">
                      {Array.from({ length: totalQuizPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setQuizPage(page)}
                          className={`w-7 h-7 rounded-lg text-xs font-black
                            ${quizPage === page
                              ? 'bg-indigo-650 text-white shadow-sm'
                              : 'border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-350'
                            }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      disabled={quizPage === totalQuizPages}
                      onClick={() => setQuizPage(prev => Math.min(totalQuizPages, prev + 1))}
                      className="p-1.5 rounded-lg border border-[#e2e8f0] dark:border-slate-855 bg-white dark:bg-slate-900 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: SUBJECT STUDY MATERIALS */}
          {activeTab === 'materials' && (
            <motion.div 
              key="materials"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="rounded-3xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-indigo-950/25 shadow-saas overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-indigo-950/25 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{currentSubject} Database</span>
                      <h3 className="text-base font-black text-slate-850 dark:text-white tracking-tight font-sans">
                        Study Materials Database
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={downloadMaterialsExcel}
                        className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[10px] font-black bg-indigo-55/40 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 hover:bg-indigo-100/50 transition-all border border-indigo-100 dark:border-indigo-900/30 shrink-0"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        Excel
                      </button>
                      <button 
                        onClick={downloadMaterialsPDF}
                        className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[10px] font-black bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all border border-slate-200 dark:border-slate-880 shrink-0"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        PDF
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Type</span>
                      <CustomSelect 
                        value={materialTypeFilter}
                        onChange={(val) => { setMaterialTypeFilter(val); setMaterialPage(1); }}
                        options={[
                          { value: 'All', label: 'All Types' },
                          { value: 'PDF', label: 'PDF Documents' },
                          { value: 'Notes', label: 'Notes Study Pack' },
                          { value: 'Assignment', label: 'Assignments' },
                          { value: 'Worksheet', label: 'Worksheets' }
                        ]}
                        className="!py-2.5 !px-4 text-xs font-bold bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-205 dark:border-slate-855"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Visibility</span>
                      <CustomSelect 
                        value={materialVisFilter}
                        onChange={(val) => { setMaterialVisFilter(val); setMaterialPage(1); }}
                        options={[
                          { value: 'All', label: 'All Visibilities' },
                          { value: 'Premium Only', label: 'Premium Only' },
                          { value: 'Public', label: 'Public (Free)' }
                        ]}
                        className="!py-2.5 !px-4 text-xs font-bold bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-205 dark:border-slate-850"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Search materials</span>
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-450 pointer-events-none" />
                        <input 
                          type="text"
                          placeholder="Search material..."
                          value={materialSearch}
                          onChange={(e) => { setMaterialSearch(e.target.value); setMaterialPage(1); }}
                          className="w-full pl-9 pr-4 py-2.5 text-xs font-bold rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full border-collapse text-left text-xs font-medium font-sans">
                    <thead className="sticky top-0 z-10 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md">
                      <tr className="border-b border-slate-100 dark:border-indigo-950/20 text-slate-500 uppercase tracking-widest select-none">
                        <th className="py-4 px-6 font-extrabold">Material Title & Chapter</th>
                        <th className="py-4 px-6 font-extrabold">Type</th>
                        <th className="py-4 px-6 font-extrabold">Visibility</th>
                        <th className="py-4 px-6 font-extrabold">File Size</th>
                        <th className="py-4 px-6 font-extrabold">Downloads Count</th>
                        <th className="py-4 px-6 font-extrabold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-655 dark:text-slate-355 bg-white dark:bg-[#0f172a]/95">
                      {paginatedMaterials.length > 0 ? (
                        paginatedMaterials.map(mat => (
                          <tr key={mat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-all duration-150">
                            <td className="py-3.5 px-6 font-bold text-slate-850 dark:text-slate-200">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-slate-900 border border-rose-100 dark:border-indigo-950/40 flex items-center justify-center font-bold text-xs text-rose-550 dark:text-rose-455 shadow-sm shrink-0">
                                  <FileText className="w-3.5 h-3.5 text-rose-550" />
                                </div>
                                <div>
                                  <span>{mat.title}</span>
                                  <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase mt-0.5">Chapter {mat.chapter || '1'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-6 text-slate-550 dark:text-slate-400 font-semibold">{mat.type || 'PDF'}</td>
                            <td className="py-3.5 px-6 font-semibold">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-center w-24
                                ${(mat.visibility || 'Premium Only') === 'Public' 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30' 
                                  : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30'
                                }`}
                              >
                                {mat.visibility || 'Premium Only'}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 font-mono font-bold text-slate-600 dark:text-slate-400">{mat.size || '1.8 MB'}</td>
                            <td className="py-3.5 px-6 font-mono font-semibold text-slate-600 dark:text-slate-400">{mat.downloads || 0} downloads</td>
                            <td className="py-3.5 px-6 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => alert('Simulating file download...')}
                                  className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-550 hover:text-rose-650 transition-colors duration-150"
                                >
                                  <FileDown className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteMaterial(mat.id)}
                                  className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-550 hover:text-rose-655 transition-colors duration-150"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="py-12 text-center text-slate-400 dark:text-slate-500 font-semibold bg-slate-50/10">
                            <span>No materials found matching current filters.</span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between text-xs font-bold text-slate-550 select-none">
                  <span>
                    Showing {filteredMaterials.length > 0 ? (materialPage - 1) * 5 + 1 : 0} to {Math.min(materialPage * 5, filteredMaterials.length)} of {filteredMaterials.length} entries
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={materialPage === 1}
                      onClick={() => setMaterialPage(prev => Math.max(1, prev - 1))}
                      className="p-1.5 rounded-lg border border-[#e2e8f0] dark:border-slate-850 bg-white dark:bg-slate-900 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1 font-sans">
                      {Array.from({ length: totalMaterialPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setMaterialPage(page)}
                          className={`w-7 h-7 rounded-lg text-xs font-black
                            ${materialPage === page
                              ? 'bg-indigo-650 text-white shadow-sm'
                              : 'border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-350'
                            }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      disabled={materialPage === totalMaterialPages}
                      onClick={() => setMaterialPage(prev => Math.min(totalMaterialPages, prev + 1))}
                      className="p-1.5 rounded-lg border border-[#e2e8f0] dark:border-slate-855 bg-white dark:bg-slate-900 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* ----------------------------------------------------
      // DIALOG COMPONENT: PREMIUM EDIT STUDENT POPUP MODAL (SAME AS MAIN)
      // ---------------------------------------------------- */}
      <AnimatePresence>
        {editingStudent && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-900 shadow-2xl max-w-md w-full p-6 relative overflow-hidden text-slate-800 dark:text-slate-200"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" />
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-900">
                <div>
                  <h3 className="font-black text-slate-850 dark:text-slate-100 text-sm tracking-wide font-sans">Modify Student Account</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Edit credentials for: {editingStudent.name}</p>
                </div>
                <button 
                  onClick={() => setEditingStudent(null)}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveStudent} className="space-y-4 py-4 text-xs font-bold">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Full Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Email Address</label>
                  <input 
                    type="email" 
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Plan Type</label>
                    <CustomSelect 
                      value={editPlan}
                      onChange={setEditPlan}
                      options={[
                        { value: 'Premium Plan', label: 'Premium Plan' },
                        { value: 'Free Trial', label: 'Free Trial' }
                      ]}
                      className="!py-2.5 bg-slate-50 dark:bg-slate-900 border-slate-205 dark:border-slate-850"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Status</label>
                    <CustomSelect 
                      value={editStatus}
                      onChange={setEditStatus}
                      options={[
                        { value: 'Active', label: 'Active' },
                        { value: 'Expired', label: 'Expired' },
                        { value: 'Free Trial', label: 'Free Trial' }
                      ]}
                      className="!py-2.5 bg-slate-50 dark:bg-slate-900 border-slate-205 dark:border-slate-850"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-900 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-555 hover:bg-slate-50 dark:hover:bg-slate-900 text-[11px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-5 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 transition-colors duration-150 text-[11px]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------
      // DIALOG COMPONENT: ADD VIDEO LECTURE MODAL
      // ---------------------------------------------------- */}
      <AnimatePresence>
        {isAddVideoOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-900 shadow-2xl max-w-2xl w-full p-6 relative overflow-hidden text-slate-800 dark:text-slate-200 my-8"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" />
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-900">
                <div>
                  <h3 className="font-black text-slate-850 dark:text-slate-100 text-sm tracking-wide font-sans">Upload Video Lecture</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Syllabus category: {currentSubject}</p>
                </div>
                <button 
                  onClick={() => setIsAddVideoOpen(false)}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddVideoSubmit} className="space-y-4 py-4 text-xs font-bold">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Field 1: Video Title */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Video Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Grammar Fundamentals"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                    />
                  </div>

                  {/* Field 2: Subject (Auto-filled, Read-only) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Subject (Auto-Filled)</label>
                    <input 
                      type="text" 
                      value={currentSubject}
                      disabled
                      className="w-full p-3 rounded-xl border border-slate-250 dark:border-slate-850/60 bg-slate-100 dark:bg-slate-900/50 text-slate-550 dark:text-slate-400 cursor-not-allowed opacity-80"
                    />
                  </div>
                               {/* Field 3: Video Type (dropdown) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Video Type</label>
                    <CustomSelect 
                      value={videoType}
                      onChange={setVideoType}
                      options={[
                        { value: 'Recorded', label: 'Recorded' },
                        { value: 'Live', label: 'Live Stream' }
                      ]}
                      className="!py-2.5 bg-slate-50 dark:bg-slate-900 border-slate-205 dark:border-slate-850"
                    />
                  </div>

                  {/* Field 4: Video URL */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-455 uppercase tracking-wider block">YouTube Video Link</label>
                    <input 
                      type="url" 
                      placeholder="e.g. https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                    />
                  </div>

                  {/* Field 7: Duration */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Duration</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 45 mins"
                      value={videoDuration}
                      onChange={(e) => setVideoDuration(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-550 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                    />
                  </div>

                  {/* Field 8: Chapter / Unit */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Chapter/Unit Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 1"
                      value={videoChapter}
                      onChange={(e) => setVideoChapter(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                    />
                  </div>

                  {/* Field 9: Visibility */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Visibility Status</label>
                    <CustomSelect 
                      value={videoVisibility}
                      onChange={setVideoVisibility}
                      options={[
                        { value: 'Premium Only', label: 'Premium Only' },
                        { value: 'Public', label: 'Public (Free)' }
                      ]}
                      className="!py-2.5 bg-slate-50 dark:bg-slate-900 border-slate-205 dark:border-slate-855"
                    />
                  </div>

                </div>

                {/* Field 6: Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Video Description</label>
                  <textarea 
                    rows="2"
                    placeholder="Enter short lecture syllabus overview or topics covered..."
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-900 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddVideoOpen(false)}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-555 hover:bg-slate-50 dark:hover:bg-slate-900 text-[11px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/10 transition-colors duration-150 text-[11px]"
                  >
                    Upload Video
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------
      // DIALOG COMPONENT: ADD STUDY MATERIAL MODAL
      // ---------------------------------------------------- */}
      <AnimatePresence>
        {isAddMaterialOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-900 shadow-2xl max-w-xl w-full p-6 relative overflow-hidden text-slate-800 dark:text-slate-200"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" />
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-900">
                <div>
                  <h3 className="font-black text-slate-850 dark:text-slate-100 text-sm tracking-wide font-sans">Upload Study Material</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Syllabus category: {currentSubject}</p>
                </div>
                <button 
                  onClick={() => setIsAddMaterialOpen(false)}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddMaterialSubmit} className="space-y-4 py-4 text-xs font-bold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Field 1: Material Title */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Material Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Classical Poetry Notes"
                      value={materialTitle}
                      onChange={(e) => setMaterialTitle(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                    />
                  </div>

                  {/* Field 2: Subject */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Subject (Auto-Filled)</label>
                    <input 
                      type="text" 
                      value={currentSubject}
                      disabled
                      className="w-full p-3 rounded-xl border border-slate-250 bg-slate-100 dark:bg-slate-900/50 text-slate-555 dark:text-slate-400 cursor-not-allowed opacity-80"
                    />
                  </div>
                               {/* Field 3: Material Type dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Material Type</label>
                    <CustomSelect 
                      value={materialType}
                      onChange={setMaterialType}
                      options={[
                        { value: 'PDF', label: 'PDF Document' },
                        { value: 'Notes', label: 'Notes Study Pack' },
                        { value: 'Assignment', label: 'Assignment Homework' },
                        { value: 'Worksheet', label: 'Practice Worksheet' }
                      ]}
                      className="!py-2.5 bg-slate-50 dark:bg-slate-900 border-slate-205 dark:border-slate-850"
                    />
                  </div>

                  {/* Field 6: Chapter Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Chapter/Unit Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 3"
                      value={materialChapter}
                      onChange={(e) => setMaterialChapter(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                    />
                  </div>

                  {/* Field 7: Visibility */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Visibility Status</label>
                    <CustomSelect 
                      value={materialVisibility}
                      onChange={setMaterialVisibility}
                      options={[
                        { value: 'Premium Only', label: 'Premium Only' },
                        { value: 'Public', label: 'Public (Free)' }
                      ]}
                      className="!py-2.5 bg-slate-50 dark:bg-slate-900 border-slate-205 dark:border-slate-850"
                    />
                  </div>

                  {/* Field 4: File Upload drag state */}
                  <div className="space-y-1.5 flex flex-col justify-between">
                    <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Upload File</label>
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setDragMaterialActive(true); }}
                      onDragLeave={() => setDragMaterialActive(false)}
                      onDrop={(e) => { e.preventDefault(); setDragMaterialActive(false); if (e.dataTransfer.files[0]) setMaterialFile(e.dataTransfer.files[0]); }}
                      onClick={() => alert('Simulating browse. Material file selected.')}
                      className={`border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[50px]
                        ${dragMaterialActive ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_12px_rgba(99,102,241,0.2)]' : materialFile ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50'}`}
                    >
                      <Upload className={`w-4 h-4 text-slate-400 dark:text-slate-500 ${materialFile ? 'text-emerald-500' : ''}`} />
                      <span className="text-[9px] text-slate-500 mt-1">
                        {materialFile ? `Selected: ${materialFile.name}` : 'Drag & drop file or browse'}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Field 5: Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Material Description</label>
                  <textarea 
                    rows="2"
                    placeholder="Enter short description of study resources, references, or instructions..."
                    value={materialDescription}
                    onChange={(e) => setMaterialDescription(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-900 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddMaterialOpen(false)}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-555 hover:bg-slate-50 dark:hover:bg-slate-900 text-[11px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/10 transition-colors duration-150 text-[11px]"
                  >
                    Upload Material
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------
      // DIALOG COMPONENT: PREMIUM DELETE CONFIRMATION MODAL
      // ---------------------------------------------------- */}
      <AnimatePresence>
        {isDeleteOpen && studentToDelete && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-900 shadow-2xl max-w-sm w-full p-6 relative overflow-hidden text-slate-805 dark:text-slate-200"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 to-red-600" />
              
              <div className="flex flex-col items-center text-center space-y-4 py-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-550 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center shadow-sm">
                  <AlertTriangle className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="font-black text-slate-850 dark:text-slate-100 text-sm tracking-wide font-sans">Delete Student Confirmation</h3>
                  <p className="text-xs text-slate-500 mt-2 font-semibold leading-relaxed">
                    Are you sure you want to remove student <strong className="text-slate-800 dark:text-white">"{studentToDelete.name}"</strong> from the {currentSubject} subscription cohort? This action is permanent and cannot be undone.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-900 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => { setIsDeleteOpen(false); setStudentToDelete(null); }}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-555 hover:bg-slate-50 dark:hover:bg-slate-900 text-[11px] font-bold"
                >
                  Cancel, Keep
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-red-650 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-rose-600/10 transition-colors duration-150 text-[11px] font-bold"
                >
                  Yes, Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------
      // DIALOG COMPONENT: VIEW STUDENT QUIZ MARKS & ATTEMPTS MODAL
      // ---------------------------------------------------- */}
      <AnimatePresence>
        {showAttemptsModal && modalQuiz && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-955 rounded-3xl border border-slate-200 dark:border-slate-900 shadow-2xl max-w-4xl w-full p-6 relative overflow-hidden text-slate-800 dark:text-slate-200 my-8 flex flex-col max-h-[85vh]"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" />
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-900 shrink-0">
                <div>
                  <h3 className="font-black text-slate-850 dark:text-slate-100 text-sm tracking-wide font-sans">
                    Student Performance Overview
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                    Assessment: {modalQuiz.title} ({modalQuiz.questions} Qs)
                  </p>
                </div>
                <button 
                  onClick={() => { setShowAttemptsModal(false); setModalQuiz(null); setModalAttempts([]); }}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 text-xs font-semibold">
                {loadingAttempts ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-3">
                    <div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                    <span className="text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider text-[10px]">Loading student results...</span>
                  </div>
                ) : modalAttempts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center shadow-sm">
                      <ClipboardList className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <div>
                      <h4 className="text-slate-700 dark:text-slate-300 font-bold text-xs">No Attempts Recorded</h4>
                      <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-1 max-w-xs font-semibold">
                        No students have attempted this quiz assessment yet. Attempt statistics will appear here automatically.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto w-full rounded-2xl border border-slate-100 dark:border-slate-900">
                    <table className="w-full border-collapse text-left text-xs font-sans">
                      <thead>
                        <tr className="bg-slate-50/70 dark:bg-slate-900/50 text-slate-500 uppercase tracking-widest text-[9px] font-black border-b border-slate-100 dark:border-slate-900 select-none">
                          <th className="py-3 px-4">Student</th>
                          <th className="py-3 px-4">Submitted At</th>
                          <th className="py-3 px-4 text-center">Score</th>
                          <th className="py-3 px-4 text-center">Percentage</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-655 dark:text-slate-355">
                        {modalAttempts.map((attempt) => {
                          const studentName = attempt.users?.full_name || 'Anonymous Student';
                          const studentEmail = attempt.users?.email || 'N/A';
                          const isPassed = attempt.is_passed;
                          const formattedDate = attempt.submitted_at 
                            ? new Date(attempt.submitted_at).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'N/A';
                          
                          return (
                            <tr key={attempt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all">
                              <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                                <div>
                                  <span 
                                    className="block text-xs cursor-pointer hover:text-indigo-650 hover:underline transition-colors"
                                    onClick={() => handleViewStudentResponse(attempt)}
                                    title="Click to view student response"
                                  >
                                    {studentName}
                                  </span>
                                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-medium normal-case">{studentEmail}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                                {formattedDate}
                              </td>
                              <td className="py-3.5 px-4 text-center font-bold font-mono">
                                {attempt.marks_obtained} / {attempt.total_marks}
                              </td>
                              <td className="py-3.5 px-4 text-center font-bold font-mono">
                                <span className={isPassed ? 'text-emerald-600 dark:text-emerald-450' : 'text-rose-600 dark:text-rose-450'}>
                                  {Math.round(attempt.percentage)}%
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-center w-16
                                  ${isPassed 
                                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30' 
                                    : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30'
                                  }`}
                                >
                                  {isPassed ? 'Passed' : 'Failed'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <button
                                  type="button"
                                  disabled={loadingResponseDetail}
                                  onClick={() => handleViewStudentResponse(attempt)}
                                  className="py-1 rounded-lg text-[10px] font-black uppercase border border-indigo-205 hover:bg-indigo-50 dark:border-indigo-900/30 dark:hover:bg-indigo-950/20 text-indigo-650 hover:text-indigo-700 dark:text-indigo-400 transition-all mr-1.5 cursor-pointer disabled:opacity-50"
                                  style={{ width: '82px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  Response
                                </button>
                                <button
                                  type="button"
                                  disabled={resettingAttemptId === attempt.id}
                                  onClick={() => handleResetAttempt(attempt.id)}
                                  className="py-1 rounded-lg text-[10px] font-black uppercase border border-rose-200 hover:bg-rose-50 dark:border-rose-900/30 dark:hover:bg-rose-950/20 text-rose-600 hover:text-rose-700 dark:text-rose-400 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                                  style={{ width: '82px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  {resettingAttemptId === attempt.id ? '⏳...' : 'Reset'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-900 flex justify-end shrink-0 select-none">
                <button
                  type="button"
                  onClick={() => { setShowAttemptsModal(false); setModalQuiz(null); setModalAttempts([]); }}
                  className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-555 hover:bg-slate-50 dark:hover:bg-slate-900 text-[11px] font-bold transition-all"
                >
                  Close Performance Panel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------
      // DIALOG COMPONENT: VIEW QUIZ QUESTIONS MODAL
      // ---------------------------------------------------- */}
      <AnimatePresence>
        {(viewingQuizQuestions || loadingQuestions) && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-900 shadow-2xl max-w-4xl w-full p-6 relative overflow-hidden text-slate-800 dark:text-slate-200 my-8 flex flex-col max-h-[85vh]"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" />
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-900 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-slate-900 border border-emerald-100 dark:border-indigo-950/40 flex items-center justify-center font-bold text-xs text-emerald-650 dark:text-emerald-400 shadow-sm shrink-0">
                    <ClipboardList className="w-5 h-5 text-emerald-650 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-850 dark:text-slate-100 text-sm tracking-wide font-sans">
                      {loadingQuestions ? 'Loading Quiz Details...' : viewingQuizQuestions?.title}
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                      {loadingQuestions ? 'Please wait...' : `Subject: ${viewingQuizQuestions?.subject || 'N/A'} • ${viewingQuizQuestions?.time_limit_minutes || 30} mins`}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => { setViewingQuizQuestions(null); }}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 text-xs font-semibold">
                {loadingQuestions ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-3">
                    <div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                    <span className="text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider text-[10px]">Loading questions...</span>
                  </div>
                ) : !viewingQuizQuestions || !viewingQuizQuestions.questions || viewingQuizQuestions.questions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span className="text-slate-400 dark:text-slate-500">No questions found in this quiz.</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {viewingQuizQuestions.description && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 text-slate-600 dark:text-slate-350 font-medium">
                        <strong className="text-slate-800 dark:text-slate-100 block mb-1">Description / Instructions:</strong>
                        {viewingQuizQuestions.description}
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      {viewingQuizQuestions.questions.map((q, idx) => (
                        <div key={q.id || idx} className="p-5 rounded-2xl border border-slate-150 dark:border-slate-850/60 bg-slate-50/50 dark:bg-slate-900/20 hover:border-indigo-500/30 transition-all">
                          <div className="flex items-start justify-between gap-4">
                            <span className="inline-block px-2.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 border border-indigo-150 dark:border-indigo-900/30 text-[9px] font-black uppercase tracking-wider">
                              Question {idx + 1}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                              {q.marks || 1} Marks • {q.question_type === 'multiple_choice' ? 'MCQ' : q.question_type === 'true_false' ? 'True/False' : 'Short Answer'}
                            </span>
                          </div>

                          <h4 className="text-slate-850 dark:text-slate-100 font-extrabold text-xs leading-snug mt-3 mb-4 select-text">
                            {q.question_text}
                          </h4>

                          {/* Render Options if MCQ */}
                          {q.question_type === 'multiple_choice' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1">
                              {(q.quiz_options || q.options || []).map((opt, oIdx) => {
                                const isCorrect = opt.is_correct;
                                return (
                                  <div 
                                    key={opt.id || oIdx} 
                                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold select-text transition-all
                                      ${isCorrect 
                                        ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-350 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400' 
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300'
                                      }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0
                                        ${isCorrect 
                                          ? 'bg-emerald-500 text-white' 
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                        }`}
                                      >
                                        {String.fromCharCode(65 + oIdx)}
                                      </span>
                                      <span>{opt.option_text}</span>
                                    </div>
                                    {isCorrect && (
                                      <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-450 uppercase tracking-wider shrink-0 bg-emerald-100/50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-md">
                                        Correct
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Render for True/False and Short Answer */}
                          {q.question_type !== 'multiple_choice' && (
                            <div className="mt-3 p-3 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-250 dark:border-emerald-900/40 rounded-xl flex items-center justify-between">
                              <span className="text-[10px] text-emerald-755 dark:text-emerald-455 font-bold uppercase tracking-wider">Correct Answer:</span>
                              <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-xs">{q.correct_answer}</strong>
                            </div>
                          )}

                          {q.explanation && (
                            <div className="mt-3 text-[10px] text-slate-450 dark:text-slate-500 font-semibold italic pl-1 leading-relaxed">
                              <strong>Explanation:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-900 flex justify-end shrink-0 select-none">
                <button
                  type="button"
                  onClick={() => { setViewingQuizQuestions(null); }}
                  className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-555 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-700 dark:hover:text-slate-100 text-[11px] font-bold transition-all cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------
      // DIALOG COMPONENT: VIEW STUDENT QUIZ RESPONSE MODAL
      // ---------------------------------------------------- */}
      <AnimatePresence>
        {(showResponseModal && selectedAttemptForResponse && viewingQuizForResponse) && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-900 shadow-2xl max-w-4xl w-full p-6 relative overflow-hidden text-slate-805 dark:text-slate-200 my-8 flex flex-col max-h-[85vh]"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-indigo-500 animate-pulse" />
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-900 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-slate-900 border border-indigo-105 dark:border-indigo-950/40 flex items-center justify-center font-bold text-xs text-indigo-650 dark:text-indigo-400 shadow-sm shrink-0">
                    <ClipboardList className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-850 dark:text-slate-100 text-sm tracking-wide font-sans">
                      Student Response: {selectedAttemptForResponse.users?.full_name || 'Anonymous Student'}
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 font-sans">
                      Quiz: {viewingQuizForResponse.title} • Score: {selectedAttemptForResponse.marks_obtained} / {selectedAttemptForResponse.total_marks} ({Math.round(selectedAttemptForResponse.percentage)}%)
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => { setShowResponseModal(false); setSelectedAttemptForResponse(null); setViewingQuizForResponse(null); }}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 text-xs font-semibold">
                <div className="space-y-6">
                  {/* Attempt Summary Stats Card */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-600 dark:text-slate-300 font-bold select-none">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Student Email</span>
                      <span className="text-xs text-slate-800 dark:text-slate-100 block mt-0.5 truncate">{selectedAttemptForResponse.users?.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Submitted At</span>
                      <span className="text-xs text-slate-800 dark:text-slate-100 block mt-0.5 font-mono">
                        {new Date(selectedAttemptForResponse.submitted_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Marks Obtained</span>
                      <span className="text-xs text-slate-800 dark:text-slate-100 block mt-0.5 font-mono">{selectedAttemptForResponse.marks_obtained} / {selectedAttemptForResponse.total_marks} Marks</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Result Status</span>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-center mt-0.5
                        ${selectedAttemptForResponse.is_passed 
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30' 
                          : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30'
                        }`}
                      >
                        {selectedAttemptForResponse.is_passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {viewingQuizForResponse.questions.map((q, idx) => {
                      // Find student response for this question
                      const response = modalResponses.find(r => r.quiz_attempt_id === selectedAttemptForResponse.id && r.question_id === q.id);
                      
                      const isGradedCorrect = response ? response.is_correct : false;
                      const marksAwarded = response ? response.marks_obtained : 0;
                      
                      // For Multiple Choice, identify selected options
                      let selectedOptionIds = [];
                      if (q.question_type === 'multiple_choice' && response) {
                        if (response.selected_option_id) {
                          selectedOptionIds.push(response.selected_option_id);
                        } else if (response.text_response) {
                          // Try to parse array from text_response (JSON list)
                          try {
                            const parsed = JSON.parse(response.text_response);
                            if (Array.isArray(parsed)) {
                              selectedOptionIds = parsed;
                            }
                          } catch (e) {
                            // Non-array text response
                          }
                        }
                      }

                      return (
                        <div 
                          key={q.id || idx} 
                          className={`p-5 rounded-2xl border transition-all
                            ${response 
                              ? isGradedCorrect 
                                ? 'border-emerald-150 dark:border-emerald-950/40 bg-emerald-50/5 dark:bg-emerald-950/5' 
                                : 'border-rose-150 dark:border-rose-955/40 bg-rose-50/5 dark:bg-rose-950/5'
                              : 'border-slate-150 dark:border-slate-850/60 bg-slate-50/50 dark:bg-slate-900/20'
                            }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <span className="inline-block px-2.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-655 dark:text-indigo-400 border border-indigo-150 dark:border-indigo-900/30 text-[9px] font-black uppercase tracking-wider font-sans">
                              Question {idx + 1}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                Type: {q.question_type === 'multiple_choice' ? 'MCQ' : q.question_type === 'true_false' ? 'True/False' : 'Short Answer'}
                              </span>
                              <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider
                                ${response
                                  ? isGradedCorrect
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-455 border border-rose-500/20'
                                  : 'bg-slate-500/10 text-slate-500'
                                }`}
                              >
                                {response ? `${marksAwarded} / ${q.marks || 1} Marks` : `Unanswered (0 / ${q.marks || 1})`}
                              </span>
                            </div>
                          </div>

                          <h4 className="text-slate-850 dark:text-slate-100 font-extrabold text-xs leading-snug mt-3 mb-4 select-text">
                            {q.question_text}
                          </h4>

                          {/* Render Options if MCQ */}
                          {q.question_type === 'multiple_choice' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1">
                              {(q.quiz_options || q.options || []).map((opt, oIdx) => {
                                const isCorrectOption = opt.is_correct;
                                const isSelectedOption = selectedOptionIds.includes(opt.id);
                                
                                return (
                                  <div 
                                    key={opt.id || oIdx} 
                                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold select-text transition-all
                                      ${isCorrectOption 
                                        ? 'bg-emerald-50/40 dark:bg-emerald-955/10 border-emerald-350 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400' 
                                        : isSelectedOption
                                          ? 'bg-rose-50/40 dark:bg-rose-955/10 border-rose-350 dark:border-rose-900/40 text-rose-700 dark:text-rose-450'
                                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300'
                                      }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0
                                        ${isCorrectOption 
                                          ? 'bg-emerald-500 text-white' 
                                          : isSelectedOption
                                            ? 'bg-rose-500 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                        }`}
                                      >
                                        {String.fromCharCode(65 + oIdx)}
                                      </span>
                                      <span>{opt.option_text}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Render for True/False and Short Answer */}
                          {q.question_type !== 'multiple_choice' && (
                            <div className="space-y-2 mt-3">
                              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl flex items-center justify-between text-xs">
                                <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">Student's Selection:</span>
                                <strong className={`font-mono text-xs ${isGradedCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-455'}`}>
                                  {response && response.text_response ? response.text_response : 'N/A (No Answer)'}
                                </strong>
                              </div>
                              <div className="p-3 bg-emerald-50/40 dark:bg-emerald-955/10 border border-emerald-250 dark:border-emerald-900/40 rounded-xl flex items-center justify-between text-xs">
                                <span className="text-[10px] text-emerald-755 dark:text-emerald-455 font-bold uppercase tracking-wider">Correct Answer:</span>
                                <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-xs">{q.correct_answer}</strong>
                              </div>
                            </div>
                          )}

                          {q.explanation && (
                            <div className="mt-3 text-[10px] text-slate-450 dark:text-slate-550 font-semibold italic pl-1 leading-relaxed select-text">
                              <strong>Explanation:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-900 flex justify-end shrink-0 select-none">
                <button
                  type="button"
                  onClick={() => { setShowResponseModal(false); setSelectedAttemptForResponse(null); setViewingQuizForResponse(null); }}
                  className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-555 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-700 dark:hover:text-slate-100 text-[11px] font-bold transition-all cursor-pointer"
                >
                  Close Response Panel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------
      // DIALOG COMPONENT: PREMIUM VIDEO PLAYER OVERLAY MODAL
      // ---------------------------------------------------- */}
      <AnimatePresence>
        {showPlayerModal && activeVideoToPlay && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-205 dark:border-indigo-950/20 shadow-2xl max-w-4xl w-full p-5 relative overflow-hidden text-slate-800 dark:text-slate-200 my-8"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-900 shrink-0">
                <div>
                  <h3 className="font-black text-slate-850 dark:text-slate-100 text-sm tracking-wide font-sans">
                    LMS Lecture Player
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                    Course Topic: {activeVideoToPlay.title}
                  </p>
                </div>
                <button 
                  onClick={() => { setShowPlayerModal(false); setActiveVideoToPlay(null); }}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Video Player Box */}
              <div className="mt-4 aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-indigo-950/25 shadow-inner relative">
                {getYoutubeId(activeVideoToPlay.url) ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${getYoutubeId(activeVideoToPlay.url)}?autoplay=1&rel=0`}
                    title={activeVideoToPlay.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                    <Video className="w-12 h-12 stroke-[1.5] mb-2 text-indigo-500" />
                    <span className="text-xs font-bold">Playback URL Unsupported</span>
                    <p className="text-[10px] max-w-xs text-slate-500 mt-1">
                      This lecture does not contain a standard valid YouTube link. Live stream link: {activeVideoToPlay.url}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2 select-text font-semibold">
                <span className="inline-block px-2.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-150 dark:border-indigo-900/30 text-[9px] font-black uppercase">
                  {activeVideoToPlay.type} Lecture • {activeVideoToPlay.duration}
                </span>
                <h4 className="text-slate-800 dark:text-white text-sm font-black leading-tight font-sans">
                  {activeVideoToPlay.title}
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed font-semibold">
                  {activeVideoToPlay.description || 'No additional syllabus details populated for this lecture slot.'}
                </p>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 dark:border-slate-900 flex justify-end select-none">
                <button
                  type="button"
                  onClick={() => { setShowPlayerModal(false); setActiveVideoToPlay(null); }}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-555 hover:bg-slate-50 dark:hover:bg-slate-900 text-[11px] font-bold transition-all"
                >
                  Close Player
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminSubjectPage;
