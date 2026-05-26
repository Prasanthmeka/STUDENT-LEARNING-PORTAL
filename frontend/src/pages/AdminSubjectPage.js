import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, videoAPI, quizAPI, materialAPI } from '../services/api';
import AdminLayout from '../layouts/AdminLayout';
import { 
  GraduationCap, 
  Crown, 
  TrendingUp, 
  AlertTriangle, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Sparkles,
  BookOpenCheck,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  FileSpreadsheet,
  FileText,
  Play,
  ClipboardList,
  FileDown,
  Activity,
  PlusCircle,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';

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

  // Generate deterministic student dataset for this specific subject
  useEffect(() => {
    if (!isValid) {
      navigate('/admin/dashboard');
      return;
    }

    setLoading(true);

    // Dynamic generated mock students cohort
    const baseNames = [
      'Prasanth Meka', 'Karthik Raja', 'Sneha Reddy', 'Arjun Verma', 'Pooja Sharma',
      'Rahul Nair', 'Divya Teja', 'Srinivas Rao', 'Meera Krishnan', 'Vikram Singh',
      'Hari Prasad', 'Anjali Rao', 'Vijay Kumar', 'Jyothi Naidu', 'Deepak Sen'
    ];

    const generatedStudents = baseNames.map((name, index) => {
      const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const isSubscribed = (charSum + index) % 3 !== 0;
      const status = isSubscribed ? 'Active' : (index % 4 === 0 ? 'Expired' : 'Free Trial');
      const plan = isSubscribed ? 'Premium Plan' : 'Free Trial';
      
      let attemptsCount = (charSum % 4) + 1;
      if (status === 'Expired') attemptsCount = 0;
      
      const score = attemptsCount > 0 ? `${(charSum % 30) + 65}%` : 'N/A';
      const expiry = isSubscribed ? '12/24/2026' : null;

      return {
        id: String(index + 1),
        name,
        email: `${name.toLowerCase().replace(/ /g, '.')}@gmail.com`,
        status,
        plan,
        attempts: attemptsCount,
        performance: score,
        expiryDate: expiry
      };
    });

    setStudents(generatedStudents);

    // Mock subject content lists
    setVideos([
      { id: 'v1', title: `Introduction to ${currentSubject} - Lecture 1`, duration: '45 mins', type: 'Recorded', url: 'https://youtube.com/watch?v=mock', visibility: 'Premium Only', chapter: '1', description: 'Overview of syllabus' },
      { id: 'v2', title: `${currentSubject} Core Guidelines - Lecture 2`, duration: '50 mins', type: 'Recorded', url: 'https://youtube.com/watch?v=mock2', visibility: 'Premium Only', chapter: '2', description: 'Core principles' },
      { id: 'v3', title: `Live Revision for ${currentSubject} Exams`, duration: '1h 15m', type: 'Live', url: 'https://zoom.us/mock', visibility: 'Public', chapter: '3', description: 'Revision session' }
    ]);

    setQuizzes([
      { id: 'q1', title: `${currentSubject} General Assessment 1`, questions: 15, passRate: '84%', limit: '20 mins', attempts: 120, failedRate: '16%', status: 'Active', chapter: '1', difficulty: 'Medium' },
      { id: 'q2', title: `${currentSubject} Revision Quiz 2`, questions: 20, passRate: '79%', limit: '30 mins', attempts: 95, failedRate: '21%', status: 'Active', chapter: '2', difficulty: 'Hard' }
    ]);

    setMaterials([
      { id: 'm1', title: `${currentSubject} Advanced Reference Notebook.pdf`, size: '4.2 MB', link: '#', type: 'PDF', visibility: 'Premium Only', chapter: '1', downloads: 140 },
      { id: 'm2', title: `${currentSubject} Vocabulary Core Guidelines.pdf`, size: '2.8 MB', link: '#', type: 'PDF', visibility: 'Public', chapter: '2', downloads: 98 }
    ]);

    setLoading(false);
  }, [currentSubject, isValid, navigate]);

  // Subject overall summaries
  const subjectOverview = defaultDummyData[currentSubject] || {
    overview: 'Educational syllabus materials and exams.',
    subscribed: 45,
    unsubscribed: 20,
    passRate: 75,
    failRate: 25
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
  const handleAddVideoSubmit = (e) => {
    e.preventDefault();
    if (!videoTitle.trim() || !videoUrl.trim() || !videoChapter.trim()) {
      alert('Please fill in Title, URL/GitHub Link, and Chapter fields.');
      return;
    }
    const newVideo = {
      id: `v${Date.now()}`,
      title: `${videoTitle} - Unit ${videoChapter}`,
      duration: videoDuration || '45 mins',
      type: videoType,
      url: videoUrl,
      visibility: videoVisibility,
      chapter: videoChapter,
      description: videoDescription
    };
    setVideos(prev => [newVideo, ...prev]);
    setIsAddVideoOpen(false);
    
    // Reset Form Fields
    setVideoTitle('');
    setVideoUrl('');
    setVideoDescription('');
    setVideoDuration('45 mins');
    setVideoChapter('');
    setThumbnailFile(null);
  };

  const handleAddMaterialSubmit = (e) => {
    e.preventDefault();
    if (!materialTitle.trim() || !materialChapter.trim()) {
      alert('Please fill in Title and Chapter fields.');
      return;
    }
    const newMaterial = {
      id: `m${Date.now()}`,
      title: `${materialTitle} - Unit ${materialChapter}.${materialType.toLowerCase() === 'notes' ? 'pdf' : 'zip'}`,
      size: materialFile ? `${(materialFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.8 MB',
      link: '#',
      type: materialType,
      visibility: materialVisibility,
      chapter: materialChapter,
      description: materialDescription,
      downloads: 0
    };
    setMaterials(prev => [newMaterial, ...prev]);
    setIsAddMaterialOpen(false);

    // Reset Form Fields
    setMaterialTitle('');
    setMaterialDescription('');
    setMaterialChapter('');
    setMaterialFile(null);
  };

  const triggerDeleteConfirm = (id, name) => {
    setStudentToDelete({ id, name });
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (studentToDelete) {
      setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
      setIsDeleteOpen(false);
      setStudentToDelete(null);
    }
  };

  // Delete trigger
  const handleDeleteStudent = (id, name) => {
    triggerDeleteConfirm(id, name);
  };

  // Quiz Creator submit and question builder helpers
  const handleAddQuizSubmit = (e) => {
    e.preventDefault();
    if (!quizTitle.trim() || !quizChapter.trim()) {
      alert('Please fill in Title and Chapter fields.');
      return;
    }
    
    // Construct new quiz record
    const newQuiz = {
      id: `q${Date.now()}`,
      title: `${quizTitle} - ${quizChapter}`,
      questions: questionsList.length,
      passRate: '80%',
      limit: quizDuration || '20 mins',
      attempts: 0,
      failedRate: '20%',
      status: 'Active'
    };

    setQuizzes(prev => [...prev, newQuiz]);
    
    // Reset Quiz Fields
    setQuizTitle('');
    setQuizChapter('');
    setQuizDifficulty('Medium');
    setQuizDuration('20 mins');
    setQuizType('MCQ');
    setQuestionsList([
      { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', marks: 5, explanation: '' }
    ]);
    alert('Quiz created successfully and published!');
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
    link.setAttribute('download', `EduMasterPro_${currentSubject}_StudentList.csv`);
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
          <h1>EduMasterPro - ${currentSubject} Workspace</h1>
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
    link.setAttribute('download', `EduMasterPro_${currentSubject}_VideoLectures.csv`);
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
          <h1>EduMasterPro - ${currentSubject} Video Lectures</h1>
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
    link.setAttribute('download', `EduMasterPro_${currentSubject}_StudyMaterials.csv`);
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
          <h1>EduMasterPro - ${currentSubject} Study Materials</h1>
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
    link.setAttribute('download', `EduMasterPro_${currentSubject}_QuizzesList.csv`);
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
          <h1>EduMasterPro - ${currentSubject} Exam Quizzes</h1>
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

  // Recharts analytics graphs data constructs
  const analyticsGraphData = [
    { name: 'Week 1', avgGrade: 72, attemptsCount: 22 },
    { name: 'Week 2', avgGrade: 78, attemptsCount: 30 },
    { name: 'Week 3', avgGrade: 84, attemptsCount: 45 },
    { name: 'Week 4', avgGrade: 81, attemptsCount: 38 }
  ];

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
                onClick={() => setIsAddVideoOpen(true)}
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
                onClick={() => setIsAddMaterialOpen(true)}
                className="w-full mt-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white text-[9px] font-black tracking-wider rounded-xl transition-all duration-200"
              >
                Upload Materials
              </button>
            </div>

            {/* Quick Action 3: Create Quiz */}
            <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200/80 dark:border-indigo-950/20 shadow-saas hover:shadow-lg transition-all duration-300 p-4 rounded-2xl flex flex-col justify-between hover:-translate-y-0.5 group">
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-650 text-white flex items-center justify-center shadow-md">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-2 group-hover:text-emerald-500 transition-colors duration-205">Create Quiz</h4>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal">Build custom MCQ syllabus exam</p>
              </div>
              <button 
                onClick={() => { setActiveTab('quizzes'); alert('Opening inline Quiz Builder form below. Scroll down!'); }}
                className="w-full mt-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-650 hover:from-emerald-650 hover:to-green-700 text-white text-[9px] font-black tracking-wider rounded-xl transition-all duration-200"
              >
                Create Quiz
              </button>
            </div>

            {/* Quick Action 4: View Analytics */}
            <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200/80 dark:border-indigo-950/20 shadow-saas hover:shadow-lg transition-all duration-300 p-4 rounded-2xl flex flex-col justify-between hover:-translate-y-0.5 group">
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-650 text-white flex items-center justify-center shadow-md">
                  <Activity className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-2 group-hover:text-amber-500 transition-colors duration-205">View Analytics</h4>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal">Syllabus performance charts</p>
              </div>
              <button 
                onClick={() => setActiveTab('analytics')}
                className="w-full mt-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-[9px] font-black tracking-wider rounded-xl transition-all duration-200"
              >
                View Analytics
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
            </div>

          </div>
        </div>


        {/* ----------------------------------------------------
        // 3. TABS NAVIGATOR
        // ---------------------------------------------------- */}
        <div className="flex border-b border-slate-200 dark:border-indigo-950/20 gap-2 overflow-x-auto shrink-0 select-none no-scrollbar">
          {[
            { id: 'inventory', label: 'Subscription Inventory', icon: GraduationCap },
            { id: 'videos', label: 'Video Lectures', icon: Play },
            { id: 'quizzes', label: 'Exam Quizzes', icon: ClipboardList },
            { id: 'materials', label: 'PDF Materials', icon: FileText },
            { id: 'analytics', label: 'Performance Analytics', icon: Activity },
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
                      Subscription Cohort List
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
                    <select 
                      value={planFilter}
                      onChange={(e) => { setPlanFilter(e.target.value); setCurrentPage(1); }}
                      className="w-full pl-4 pr-8 py-2.5 text-xs font-bold rounded-xl border border-slate-205 dark:border-slate-850 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-550/10 cursor-pointer custom-select"
                    >
                      <option value="All">All Plans</option>
                      <option value="Premium">Premium Plan</option>
                      <option value="Free Trial">Free Trial</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Status</span>
                    <select 
                      value={statusFilter}
                      onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                      className="w-full pl-4 pr-8 py-2.5 text-xs font-bold rounded-xl border border-slate-205 dark:border-slate-850 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-550/10 cursor-pointer custom-select"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Expired">Expired</option>
                      <option value="Free Trial">Free Trial</option>
                    </select>
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
              {/* 1. GORGEOUS INLINE UPLOAD FORM CARD */}
              <div className="bg-white dark:bg-[#0f172a]/95 rounded-3xl border border-slate-205 dark:border-indigo-950/20 shadow-saas overflow-hidden p-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-indigo-950/20 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white tracking-tight">Inline Video Lecture Upload</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5">Syllabus category: {currentSubject}</p>
                  </div>
                </div>

                <form onSubmit={handleAddVideoSubmit} className="space-y-4 text-xs font-bold">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Video Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Grammar Fundamentals"
                          value={videoTitle}
                          onChange={(e) => setVideoTitle(e.target.value)}
                          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Video Type</label>
                        <select 
                          value={videoType}
                          onChange={(e) => setVideoType(e.target.value)}
                          className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 text-slate-850 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer animate-none"
                        >
                          <option value="Recorded">Recorded Lecture</option>
                          <option value="Live">Live Stream</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Video URL / GitHub Link</label>
                        <input 
                          type="url" 
                          placeholder="e.g. https://youtube.com/watch?v=..."
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Duration</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 45 mins"
                            value={videoDuration}
                            onChange={(e) => setVideoDuration(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Chapter/Unit</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 1"
                            value={videoChapter}
                            onChange={(e) => setVideoChapter(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Visibility Status</label>
                        <select 
                          value={videoVisibility}
                          onChange={(e) => setVideoVisibility(e.target.value)}
                          className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 text-slate-850 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer animate-none"
                        >
                          <option value="Premium Only">Premium Only</option>
                          <option value="Public">Public (Free)</option>
                        </select>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Thumbnail Image</label>
                        <div 
                          onDragOver={(e) => { e.preventDefault(); setDragVideoActive(true); }}
                          onDragLeave={() => setDragVideoActive(false)}
                          onDrop={(e) => { e.preventDefault(); setDragVideoActive(false); if (e.dataTransfer.files[0]) setThumbnailFile(e.dataTransfer.files[0]); }}
                          onClick={() => alert('Simulating thumbnail file selection.')}
                          className={`border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-205 min-h-[48px]
                            ${dragVideoActive ? 'border-indigo-500 bg-indigo-500/10' : thumbnailFile ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-slate-50/50'}`}
                        >
                          <Upload className={`w-3.5 h-3.5 text-slate-400 ${thumbnailFile ? 'text-emerald-500' : ''}`} />
                          <span className="text-[8px] text-slate-500 mt-1 truncate max-w-[150px]">
                            {thumbnailFile ? thumbnailFile.name : 'Drop thumbnail image here'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Video Description</label>
                    <textarea 
                      rows="2"
                      placeholder="Enter short lecture syllabus overview or topics covered..."
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md text-[11px]"
                    >
                      Publish Video Lecture
                    </button>
                  </div>
                </form>
              </div>

              {/* 2. PREMIUM ACTIVE GRID (RESPONSIVE CARDS) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pl-1">
                  <span className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest">Active Video Lectures Grid</span>
                  <span className="block text-[10px] font-bold text-slate-400">{videos.length} Lectures Available</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((vid) => (
                    <div key={vid.id} className="bg-white dark:bg-[#0f172a]/95 rounded-2xl border border-slate-200 dark:border-indigo-950/20 shadow-saas overflow-hidden flex flex-col justify-between group hover:shadow-lg transition-all duration-300">
                      <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent z-10" />
                        <Play className="w-10 h-10 text-white opacity-80 group-hover:scale-110 transition-transform duration-300 z-20 stroke-[1.5]" />
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
                          onClick={() => alert(`Simulating play link: ${vid.url}`)}
                          className="w-full mt-3 py-2 bg-slate-900 dark:bg-slate-950 hover:bg-slate-800 text-white text-[9px] font-black tracking-wider rounded-xl transition-all duration-205 border border-transparent dark:border-indigo-950/20"
                        >
                          Watch Lecture
                        </button>
                      </div>
                    </div>
                  ))}
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
                      <select 
                        value={videoTypeFilter}
                        onChange={(e) => { setVideoTypeFilter(e.target.value); setVideoPage(1); }}
                        className="w-full pl-4 pr-8 py-2.5 text-xs font-bold rounded-xl border border-slate-205 dark:border-slate-850 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer animate-none"
                      >
                        <option value="All">All Types</option>
                        <option value="Recorded">Recorded</option>
                        <option value="Live">Live Stream</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Visibility</span>
                      <select 
                        value={videoVisFilter}
                        onChange={(e) => { setVideoVisFilter(e.target.value); setVideoPage(1); }}
                        className="w-full pl-4 pr-8 py-2.5 text-xs font-bold rounded-xl border border-slate-205 dark:border-slate-850 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer animate-none"
                      >
                        <option value="All">All Visibilities</option>
                        <option value="Premium Only">Premium Only</option>
                        <option value="Public">Public (Free)</option>
                      </select>
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
                                  onClick={() => setVideos(prev => prev.filter(v => v.id !== vid.id))}
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
              {/* 1. QUIZ CREATOR FORM & DYNAMIC QUESTION BUILDER */}
              <div className="bg-white dark:bg-[#0f172a]/95 rounded-3xl border border-slate-205 dark:border-indigo-950/20 shadow-saas overflow-hidden p-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-indigo-950/20 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-650 text-white flex items-center justify-center shadow-md">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white tracking-tight">Syllabus Exam Creator</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5">Syllabus category: {currentSubject}</p>
                  </div>
                </div>

                <form onSubmit={handleAddQuizSubmit} className="space-y-6 text-xs font-bold">
                  {/* Row 1: Basic Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Quiz Assessment Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Chapter 3 Poetry Quiz"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Chapter/Unit</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 3"
                        value={quizChapter}
                        onChange={(e) => setQuizChapter(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Difficulty</label>
                      <select 
                        value={quizDifficulty}
                        onChange={(e) => setQuizDifficulty(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 text-slate-850 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer animate-none"
                      >
                        <option value="Easy">Easy Level</option>
                        <option value="Medium">Medium Level</option>
                        <option value="Hard">Hard Level</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Duration Limit</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 20 mins"
                        value={quizDuration}
                        onChange={(e) => setQuizDuration(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Passing Threshold (%)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 50"
                        value={quizPassingMarks}
                        onChange={(e) => setQuizPassingMarks(parseInt(e.target.value) || 50)}
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Assessment Type</label>
                      <select 
                        value={quizType}
                        onChange={(e) => setQuizType(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 text-slate-850 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer animate-none"
                      >
                        <option value="MCQ">Multiple Choice Only (MCQ)</option>
                        <option value="Descriptive">Descriptive Writing</option>
                        <option value="Mixed">Mixed MCQ & Descriptive</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-450 uppercase tracking-wider block">Subject Category (Auto-filled)</label>
                      <input 
                        type="text" 
                        value={currentSubject}
                        disabled
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-105 dark:bg-slate-900/40 text-slate-500 cursor-not-allowed opacity-80"
                      />
                    </div>
                  </div>

                  {/* DYNAMIC QUESTION BUILDER */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-indigo-950/20">
                    <div className="flex items-center justify-between">
                      <span className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest pl-1">Dynamic Questions Builder List</span>
                      <button
                        type="button"
                        onClick={handleAddQuestionRow}
                        className="flex items-center gap-1 py-1 px-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 hover:bg-indigo-100/50 rounded-lg border border-indigo-100 dark:border-indigo-900/30 text-[10px]"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Add Question
                      </button>
                    </div>

                    {questionsList.map((question, index) => (
                      <div 
                        key={index} 
                        className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-indigo-950/20 relative space-y-4 shadow-sm"
                      >
                        {/* Header Row for Question Number and Remove */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-indigo-950/25">
                          <span className="text-[10px] font-black uppercase text-indigo-500">Question #{index + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestionRow(index)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors duration-150"
                            title="Remove Question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Question Text */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-slate-450 uppercase tracking-wider block">Question Text</label>
                          <input 
                            type="text" 
                            placeholder="e.g. What is the definition of grammar in standard Telugu?"
                            value={question.questionText}
                            onChange={(e) => handleQuestionFieldChange(index, 'questionText', e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        {/* Options MCQ A, B, C, D */}
                        {quizType !== 'Descriptive' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[9px] text-slate-450 uppercase tracking-wider block">Option A</label>
                              <input 
                                type="text" 
                                placeholder="Choice Option A"
                                value={question.optionA}
                                onChange={(e) => handleQuestionFieldChange(index, 'optionA', e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] text-slate-450 uppercase tracking-wider block">Option B</label>
                              <input 
                                type="text" 
                                placeholder="Choice Option B"
                                value={question.optionB}
                                onChange={(e) => handleQuestionFieldChange(index, 'optionB', e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] text-slate-450 uppercase tracking-wider block">Option C</label>
                              <input 
                                type="text" 
                                placeholder="Choice Option C"
                                value={question.optionC}
                                onChange={(e) => handleQuestionFieldChange(index, 'optionC', e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] text-slate-450 uppercase tracking-wider block">Option D</label>
                              <input 
                                type="text" 
                                placeholder="Choice Option D"
                                value={question.optionD}
                                onChange={(e) => handleQuestionFieldChange(index, 'optionD', e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        )}

                        {/* Correct Answer and Marks */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {quizType !== 'Descriptive' && (
                            <div className="space-y-1.5">
                              <label className="text-[9px] text-slate-450 uppercase tracking-wider block">Correct Option</label>
                              <select 
                                value={question.correctAnswer}
                                onChange={(e) => handleQuestionFieldChange(index, 'correctAnswer', e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer animate-none"
                              >
                                <option value="A">Option A</option>
                                <option value="B">Option B</option>
                                <option value="C">Option C</option>
                                <option value="D">Option D</option>
                              </select>
                            </div>
                          )}

                          <div className="space-y-1.5">
                            <label className="text-[9px] text-slate-450 uppercase tracking-wider block">Marks Awarded</label>
                            <input 
                              type="number" 
                              placeholder="5"
                              value={question.marks}
                              onChange={(e) => handleQuestionFieldChange(index, 'marks', parseInt(e.target.value) || 5)}
                              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        {/* Explanation */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-slate-450 uppercase tracking-wider block">Answer Explanation / Rationale</label>
                          <textarea 
                            rows="2"
                            placeholder="Provide feedback context displayed to students on quiz completion..."
                            value={question.explanation}
                            onChange={(e) => handleQuestionFieldChange(index, 'explanation', e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-650 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md text-[11px]"
                    >
                      Publish Exam Assessment
                    </button>
                  </div>
                </form>
              </div>

              {/* 2. EXAM ASSESSMENT DATABASE TABLE */}
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
                      <select 
                        value={quizStatusFilter}
                        onChange={(e) => { setQuizStatusFilter(e.target.value); setQuizPage(1); }}
                        className="w-full pl-4 pr-8 py-2.5 text-xs font-bold rounded-xl border border-slate-205 dark:border-slate-850 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer animate-none"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active Published</option>
                        <option value="Draft">Drafting</option>
                      </select>
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
                                  <span>{qz.title}</span>
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
                                  onClick={() => alert(`Simulating exam stats overview for: ${qz.title}`)}
                                  className="p-1.5 rounded-md hover:bg-[#e0e7ff] dark:hover:bg-indigo-950/30 text-slate-500 hover:text-indigo-650 transition-colors duration-150"
                                >
                                  <Activity className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => setQuizzes(prev => prev.filter(q => q.id !== qz.id))}
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

          {/* TAB 4: SUBJECT PDF STUDY MATERIALS */}
          {activeTab === 'materials' && (
            <motion.div 
              key="materials"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* 1. GORGEOUS INLINE UPLOAD FORM CARD */}
              <div className="bg-white dark:bg-[#0f172a]/95 rounded-3xl border border-slate-205 dark:border-indigo-950/20 shadow-saas overflow-hidden p-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-indigo-950/20 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-650 text-white flex items-center justify-center shadow-md">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white tracking-tight">Inline Study Material Upload</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5">Syllabus category: {currentSubject}</p>
                  </div>
                </div>

                <form onSubmit={handleAddMaterialSubmit} className="space-y-4 text-xs font-bold">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Material Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Classical Poetry Notes"
                          value={materialTitle}
                          onChange={(e) => setMaterialTitle(e.target.value)}
                          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Material Type</label>
                        <select 
                          value={materialType}
                          onChange={(e) => setMaterialType(e.target.value)}
                          className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 text-slate-855 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer animate-none"
                        >
                          <option value="PDF">PDF Document</option>
                          <option value="Notes">Notes Study Pack</option>
                          <option value="Assignment">Assignment Homework</option>
                          <option value="Worksheet">Practice Worksheet</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Chapter/Unit</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 3"
                            value={materialChapter}
                            onChange={(e) => setMaterialChapter(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Visibility Status</label>
                          <select 
                            value={materialVisibility}
                            onChange={(e) => setMaterialVisibility(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 text-slate-855 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer animate-none"
                          >
                            <option value="Premium Only">Premium Only</option>
                            <option value="Public">Public (Free)</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Subject Category (Auto-filled)</label>
                        <input 
                          type="text" 
                          value={currentSubject}
                          disabled
                          className="w-full p-3 rounded-xl border border-slate-200 bg-slate-105 dark:bg-slate-900/40 text-slate-500 cursor-not-allowed opacity-80"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 flex flex-col justify-between">
                      <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                        <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Upload File</label>
                        <div 
                          onDragOver={(e) => { e.preventDefault(); setDragMaterialActive(true); }}
                          onDragLeave={() => setDragMaterialActive(false)}
                          onDrop={(e) => { e.preventDefault(); setDragMaterialActive(false); if (e.dataTransfer.files[0]) setMaterialFile(e.dataTransfer.files[0]); }}
                          onClick={() => alert('Simulating PDF or zip file upload.')}
                          className={`border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-205 flex-1 min-h-[96px]
                            ${dragMaterialActive ? 'border-purple-500 bg-purple-500/10' : materialFile ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-200 dark:border-slate-880 hover:border-purple-500/50 hover:bg-slate-50/50'}`}
                        >
                          <Upload className={`w-4 h-4 text-slate-400 ${materialFile ? 'text-emerald-500' : ''}`} />
                          <span className="text-[8px] text-slate-500 mt-1 truncate max-w-[150px]">
                            {materialFile ? materialFile.name : 'Drag & drop file or browse'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Material Description</label>
                    <textarea 
                      rows="2"
                      placeholder="Enter short description of study resources, references, or instructions..."
                      value={materialDescription}
                      onChange={(e) => setMaterialDescription(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-purple-650 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-md text-[11px]"
                    >
                      Publish Study Material
                    </button>
                  </div>
                </form>
              </div>

              {/* 2. MATERIALS INVENTORY TABLE */}
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
                      <select 
                        value={materialTypeFilter}
                        onChange={(e) => { setMaterialTypeFilter(e.target.value); setMaterialPage(1); }}
                        className="w-full pl-4 pr-8 py-2.5 text-xs font-bold rounded-xl border border-slate-205 dark:border-slate-855 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer animate-none"
                      >
                        <option value="All">All Types</option>
                        <option value="PDF">PDF Documents</option>
                        <option value="Notes">Notes packs</option>
                        <option value="Assignment">Assignments</option>
                        <option value="Worksheet">Worksheets</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Visibility</span>
                      <select 
                        value={materialVisFilter}
                        onChange={(e) => { setMaterialVisFilter(e.target.value); setMaterialPage(1); }}
                        className="w-full pl-4 pr-8 py-2.5 text-xs font-bold rounded-xl border border-slate-205 dark:border-slate-850 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer animate-none"
                      >
                        <option value="All">All Visibilities</option>
                        <option value="Premium Only">Premium Only</option>
                        <option value="Public">Public (Free)</option>
                      </select>
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
                                  onClick={() => setMaterials(prev => prev.filter(m => m.id !== mat.id))}
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

          {/* TAB 5: SUBJECT PERFORMANCE GRAPHICS */}
          {activeTab === 'analytics' && (() => {
            // Local Mock Datasets for Analytics
            const passFailData = [
              { quiz: 'Assessment 1', attempted: 120, passed: 101, failed: 19 },
              { quiz: 'Assessment 2', attempted: 95, passed: 75, failed: 20 },
              { quiz: 'Assessment 3', attempted: 140, passed: 110, failed: 30 }
            ];

            const gradeCurveData = [
              { chapter: 'Unit 1', avgScore: 74, topScore: 98 },
              { chapter: 'Unit 2', avgScore: 82, topScore: 100 },
              { chapter: 'Unit 3', avgScore: 78, topScore: 95 },
              { chapter: 'Unit 4', avgScore: 88, topScore: 100 }
            ];

            const growthData = [
              { month: 'Jan', premium: 12, trial: 25 },
              { month: 'Feb', premium: 18, trial: 22 },
              { month: 'Mar', premium: 28, trial: 15 },
              { month: 'Apr', premium: 36, trial: 10 }
            ];

            const completionData = [
              { chapter: 'Unit 1', completionRate: 95 },
              { chapter: 'Unit 2', completionRate: 88 },
              { chapter: 'Unit 3', completionRate: 72 },
              { chapter: 'Unit 4', completionRate: 40 }
            ];

            return (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* 1. EXISTING WEEKLY ATTEMPTS AREA CHART */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a]/95 border border-slate-205 dark:border-indigo-950/20 shadow-saas space-y-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Syllabus Performance metrics</span>
                    <h3 className="text-base font-black text-slate-805 dark:text-white tracking-tight font-sans">Syllabus Attempts Analytics</h3>
                    <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">Historical quiz averages and overall student engagement curves weekly.</p>
                  </div>

                  <div className="h-72 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={analyticsGraphData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.indigo} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={COLORS.indigo} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: '700' }} 
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: '700' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            fontSize: '11px',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="avgGrade" 
                          name="Average Grade %" 
                          stroke={COLORS.indigo} 
                          fillOpacity={1} 
                          fill="url(#colorGrade)" 
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. RESPONSIVE GRID (4 ADDITIONAL GRAPHICS) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Chart A: Quiz Pass/Fail Bar Chart */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-indigo-950/20 shadow-saas space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">A. Grade Threshold Ratio</span>
                      <h4 className="text-xs font-black text-slate-808 dark:text-white font-sans">Quiz Pass vs Fail Ratio</h4>
                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Comparative metrics outlining attempted vs passed counts per assessment.</p>
                    </div>
                    <div className="h-56 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={passFailData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800/40" />
                          <XAxis dataKey="quiz" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: '700' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: '700' }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', fontSize: '11px', color: 'white' }} />
                          <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', paddingTop: '10px' }} />
                          <Bar dataKey="attempted" name="Total Attempts" fill={COLORS.indigo} radius={[4, 4, 0, 0]} barSize={12} />
                          <Bar dataKey="passed" name="Passed" fill={COLORS.emerald} radius={[4, 4, 0, 0]} barSize={12} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart B: Student Performance Curve Line Chart */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a]/95 border border-slate-202 dark:border-indigo-950/20 shadow-saas space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">B. Assessment Curves</span>
                      <h4 className="text-xs font-black text-slate-808 dark:text-white font-sans">Syllabus Class Grade Trajectory</h4>
                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Smooth grade trajectory visualizing class average vs top scorers per unit.</p>
                    </div>
                    <div className="h-56 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={gradeCurveData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800/40" />
                          <XAxis dataKey="chapter" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: '700' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: '700' }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', fontSize: '11px', color: 'white' }} />
                          <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', paddingTop: '10px' }} />
                          <Line type="monotone" dataKey="avgScore" name="Class Average" stroke={COLORS.indigo} strokeWidth={2.5} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="topScore" name="Top Scorer" stroke={COLORS.purple} strokeWidth={2.5} strokeDasharray="5 5" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart C: Subscription Growth Area Chart */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-indigo-950/20 shadow-saas space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">C. Conversion Funnel</span>
                      <h4 className="text-xs font-black text-slate-808 dark:text-white font-sans">Premium Subscription Additions</h4>
                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Platform conversions showing premium plan upgrades monthly.</p>
                    </div>
                    <div className="h-56 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={growthData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                          <defs>
                            <linearGradient id="colorPremium" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.indigo} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={COLORS.indigo} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800/40" />
                          <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: '700' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: '700' }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', fontSize: '11px', color: 'white' }} />
                          <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', paddingTop: '10px' }} />
                          <Area type="monotone" dataKey="premium" name="Premium Upgrades" stroke={COLORS.indigo} fillOpacity={1} fill="url(#colorPremium)" strokeWidth={2} />
                          <Area type="monotone" dataKey="trial" name="Free trials active" stroke={COLORS.slateLight} fill="none" strokeWidth={1.5} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart D: Chapter Completion Ratio Horizontal Bar Chart */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-indigo-950/20 shadow-saas space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">D. Syllabus Progress Funnel</span>
                      <h4 className="text-xs font-black text-slate-808 dark:text-white font-sans">Chapter Completion Ratios</h4>
                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Horizontal visual benchmarks detailing completion status per chapter.</p>
                    </div>
                    <div className="h-56 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={completionData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" className="dark:stroke-slate-800/40" />
                          <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 9 }} domain={[0, 100]} axisLine={false} tickLine={false} />
                          <YAxis dataKey="chapter" type="category" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: '700' }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', fontSize: '11px', color: 'white' }} />
                          <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', paddingTop: '10px' }} />
                          <Bar dataKey="completionRate" name="Completion Rate (%)" fill={COLORS.purple} radius={[0, 4, 4, 0]} barSize={10} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              </motion.div>
            );
          })()}

        </AnimatePresence>

      </div>

      {/* ----------------------------------------------------
      // DIALOG COMPONENT: PREMIUM EDIT STUDENT POPUP MODAL (SAME AS MAIN)
      // ---------------------------------------------------- */}
      <AnimatePresence>
        {editingStudent && (
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Plan Type</label>
                    <select 
                      value={editPlan}
                      onChange={(e) => setEditPlan(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Premium Plan">Premium Plan</option>
                      <option value="Free Trial">Free Trial</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Status</label>
                    <select 
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Expired">Expired</option>
                      <option value="Free Trial">Free Trial</option>
                    </select>
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
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
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
                    <select 
                      value={videoType}
                      onChange={(e) => setVideoType(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 text-slate-850 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer custom-select"
                    >
                      <option value="Recorded">Recorded</option>
                      <option value="Live">Live Stream</option>
                    </select>
                  </div>

                  {/* Field 4: Video URL */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Video URL / GitHub Link</label>
                    <input 
                      type="url" 
                      placeholder="e.g. https://youtube.com/watch?v=..."
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
                    <select 
                      value={videoVisibility}
                      onChange={(e) => setVideoVisibility(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-855 bg-slate-50 dark:bg-slate-900 text-slate-850 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer custom-select"
                    >
                      <option value="Premium Only">Premium Only</option>
                      <option value="Public">Public (Free)</option>
                    </select>
                  </div>
                  
                  {/* Field 5: Thumbnail Upload (Drag & Drop box) */}
                  <div className="space-y-1.5 flex flex-col justify-between">
                    <label className="text-[10px] text-slate-455 uppercase tracking-wider block">Thumbnail Image</label>
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setDragVideoActive(true); }}
                      onDragLeave={() => setDragVideoActive(false)}
                      onDrop={(e) => { e.preventDefault(); setDragVideoActive(false); if (e.dataTransfer.files[0]) setThumbnailFile(e.dataTransfer.files[0]); }}
                      onClick={() => alert('Simulating browse. Thumbnail file selected.')}
                      className={`border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[50px]
                        ${dragVideoActive ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_12px_rgba(99,102,241,0.2)]' : thumbnailFile ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50'}`}
                    >
                      <Upload className={`w-4 h-4 text-slate-400 dark:text-slate-500 ${thumbnailFile ? 'text-emerald-500' : ''}`} />
                      <span className="text-[9px] text-slate-500 mt-1">
                        {thumbnailFile ? `Selected: ${thumbnailFile.name}` : 'Drag & drop image or browse'}
                      </span>
                    </div>
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
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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
                    <select 
                      value={materialType}
                      onChange={(e) => setMaterialType(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 text-slate-850 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer custom-select"
                    >
                      <option value="PDF">PDF Document</option>
                      <option value="Notes">Notes Study Pack</option>
                      <option value="Assignment">Assignment Homework</option>
                      <option value="Worksheet">Practice Worksheet</option>
                    </select>
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
                    <select 
                      value={materialVisibility}
                      onChange={(e) => setMaterialVisibility(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 text-slate-850 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer custom-select"
                    >
                      <option value="Premium Only">Premium Only</option>
                      <option value="Public">Public (Free)</option>
                    </select>
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
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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
    </AdminLayout>
  );
};

export default AdminSubjectPage;
