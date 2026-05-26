import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI } from '../services/api';
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
  CheckCircle,
  RefreshCw,
  Database,
  Pencil,
  Trash2,
  X,
  FileSpreadsheet,
  FileText
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
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Default high-fidelity fallback dummy data
const defaultDummyData = {
  summary: {
    totalStudents: 156,
    activeSubscriptions: 94,
    passRate: 78.4,
    failRate: 21.6
  },
  students: [
    { id: '1', name: 'Prasanth Meka', email: 'prasanthmeka2003@gmail.com', subjects: ['TELUGU', 'MATHS', 'PHYSICS', 'CHEMISTRY'], plan: 'Premium Plan', expiryDate: '12/24/2026', status: 'Active' },
    { id: '2', name: 'Karthik Raja', email: 'karthik.raja@gmail.com', subjects: ['ENGLISH', 'SOCIAL', 'MATHS'], plan: 'Premium Plan', expiryDate: '08/15/2026', status: 'Active' },
    { id: '3', name: 'Sneha Reddy', email: 'sneha.reddy@gmail.com', subjects: ['BIOLOGY', 'CHEMISTRY', 'ENGLISH', 'PHYSICS'], plan: 'Premium Plan', expiryDate: '09/30/2026', status: 'Active' },
    { id: '4', name: 'Arjun Verma', email: 'arjun.verma@yahoo.com', subjects: ['MATHS', 'PHYSICS', 'CHEMISTRY'], plan: 'Premium Plan', expiryDate: '01/10/2027', status: 'Active' },
    { id: '5', name: 'Pooja Sharma', email: 'pooja.sharma@outlook.com', subjects: ['HINDI', 'SOCIAL', 'TELUGU'], plan: 'Free Trial', expiryDate: '06/05/2026', status: 'Free Trial' },
    { id: '6', name: 'Rahul Nair', email: 'rahul.nair@gmail.com', subjects: ['MATHS', 'BIOLOGY', 'PHYSICS'], plan: 'Premium Plan', expiryDate: '05/12/2026', status: 'Expired' },
    { id: '7', name: 'Divya Teja', email: 'divyateja@gmail.com', subjects: ['TELUGU', 'ENGLISH', 'SOCIAL'], plan: 'Free Trial', expiryDate: '05/20/2026', status: 'Expired' },
    { id: '8', name: 'Srinivas Rao', email: 'srinivas.rao@gmail.com', subjects: ['MATHS', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY'], plan: 'Premium Plan', expiryDate: '11/15/2026', status: 'Active' },
    { id: '9', name: 'Meera Krishnan', email: 'meera.krishnan@gmail.com', subjects: ['ENGLISH', 'HINDI', 'BIOLOGY'], plan: 'Premium Plan', expiryDate: '03/18/2027', status: 'Active' },
    { id: '10', name: 'Vikram Singh', email: 'vikram.singh@gmail.com', subjects: ['PHYSICS', 'CHEMISTRY', 'MATHS'], plan: 'Free Trial', expiryDate: '06/12/2026', status: 'Free Trial' }
  ],
  subjectSubscriptionAnalytics: [
    { subject: 'TELUGU', subscribedUsers: 48, nonSubscribedUsers: 24 },
    { subject: 'HINDI', subscribedUsers: 36, nonSubscribedUsers: 30 },
    { subject: 'ENGLISH', subscribedUsers: 64, nonSubscribedUsers: 18 },
    { subject: 'SOCIAL', subscribedUsers: 52, nonSubscribedUsers: 26 },
    { subject: 'PHYSICS', subscribedUsers: 58, nonSubscribedUsers: 14 },
    { subject: 'CHEMISTRY', subscribedUsers: 50, nonSubscribedUsers: 20 },
    { subject: 'BIOLOGY', subscribedUsers: 42, nonSubscribedUsers: 28 },
    { subject: 'MATHS', subscribedUsers: 72, nonSubscribedUsers: 10 }
  ],
  quizAttemptAnalytics: {
    attemptedPercentage: 74.2,
    unattemptedPercentage: 25.8
  }
};

const AdminDashboard = () => {
  // Core filter states (Dashboard table remains static from sidebar subject clicks)
  const [searchQuery, setSearchQuery] = useState('');

  // Table local filters
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Sorting and Pagination states
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Analytics API data loading
  const [data, setData] = useState(defaultDummyData);
  const [loading, setLoading] = useState(true);
  const [isRealBackend, setIsRealBackend] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Edit Modal State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPlan, setEditPlan] = useState('');
  const [editStatus, setEditStatus] = useState('');

  // Fetch from real backend endpoint with graceful mock fallback
  useEffect(() => {
    const fetchAdminDashboardData = async () => {
      setLoading(true);
      try {
        const response = await analyticsAPI.getAdminDashboard();
        if (response.data && response.data.summary) {
          setData(response.data);
          setIsRealBackend(true);
        } else {
          setData(defaultDummyData);
          setIsRealBackend(false);
        }
      } catch (error) {
        console.warn('Backend API offline or failed, using high-fidelity mock data:', error.message);
        setData(defaultDummyData);
        setIsRealBackend(false);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminDashboardData();
  }, [refreshCounter]);

  // Handle manual data refresh
  const triggerRefresh = () => {
    setRefreshCounter(prev => prev + 1);
  };

  // Sorting handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Delete Action Handler
  const handleDeleteStudent = (studentId, studentName) => {
    if (window.confirm(`Are you sure you want to remove student "${studentName}"? This action cannot be undone.`)) {
      setData(prev => ({
        ...prev,
        students: prev.students.filter(s => s.id !== studentId)
      }));
    }
  };

  // Edit Action Trigger
  const handleEditClick = (student) => {
    setEditingStudent(student);
    setEditName(student.name);
    setEditEmail(student.email);
    setEditPlan(student.plan);
    setEditStatus(student.status);
  };

  // Save Student Edits
  const handleSaveStudent = (e) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) {
      alert('Please fill in name and email addresses.');
      return;
    }

    setData(prev => ({
      ...prev,
      students: prev.students.map(s => {
        if (s.id === editingStudent.id) {
          return {
            ...s,
            name: editName,
            email: editEmail,
            plan: editPlan,
            status: editStatus,
            expiryDate: editPlan === 'Premium Plan' ? '12/24/2026' : null
          };
        }
        return s;
      })
    }));

    setEditingStudent(null);
  };

  // Sorting implementation
  const sortedStudents = [...(data?.students || [])].sort((a, b) => {
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

  // Multidimensional filter chain (including in-table subject filter)
  const filteredStudents = sortedStudents.filter(student => {
    // 1. Search Query filter (matches student name or email)
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Subject filter (INSIDE table dropdown)
    const matchesSubject = subjectFilter === 'All' || 
      student.subjects.map(s => s.toUpperCase()).includes(subjectFilter.toUpperCase());

    // 3. Plan filter
    const matchesPlan = planFilter === 'All' || 
      (planFilter === 'Premium' && student.plan === 'Premium Plan') ||
      (planFilter === 'Free Trial' && student.plan === 'Free Trial');

    // 4. Status filter
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'Active' && student.status === 'Active') ||
      (statusFilter === 'Expired' && student.status === 'Expired') ||
      (statusFilter === 'Free Trial' && student.status === 'Free Trial');

    return matchesSearch && matchesSubject && matchesPlan && matchesStatus;
  });

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / rowsPerPage));
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const paginatedStudents = filteredStudents.slice(indexOfFirstRow, indexOfLastRow);

  // Client-side Excel CSV exporter
  const downloadExcel = () => {
    const headers = ['Student Name', 'Email Address', 'Selected Subjects', 'Subscription Plan', 'Expiry Date', 'Status'];
    const rows = filteredStudents.map(student => [
      `"${student.name.replace(/"/g, '""')}"`,
      `"${student.email.replace(/"/g, '""')}"`,
      `"${student.subjects.join(', ')}"`,
      `"${student.plan}"`,
      `"${student.expiryDate || 'N/A'}"`,
      `"${student.status}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `EduMasterPro_Subscribed_Students_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Client-side PDF Exporter via beautiful print window template
  const downloadPDF = () => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <html>
        <head>
          <title>EduMasterPro Student Subscriptions Report</title>
          <style>
            body { font-family: 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #0f172a; }
            h1 { margin-bottom: 5px; font-size: 26px; color: #4f46e5; }
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
          <h1>EduMasterPro Portal</h1>
          <p>Overall Student Subscriptions Report — Generated on ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email Address</th>
                <th>Selected Subjects</th>
                <th>Plan Type</th>
                <th>Expiry Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredStudents.map(student => `
                <tr>
                  <td><strong>${student.name}</strong></td>
                  <td>${student.email}</td>
                  <td>${student.subjects.join(', ')}</td>
                  <td>${student.plan}</td>
                  <td>${student.expiryDate || 'N/A'}</td>
                  <td>
                    <span class="badge ${
                      student.status === 'Active' ? 'active' : student.status === 'Free Trial' ? 'trial' : 'expired'
                    }">${student.status}</span>
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

  // Recharts donut ring distribution
  const donutDataOuter = [
    { name: 'Attempted', value: data?.quizAttemptAnalytics?.attemptedPercentage || 74.2 },
    { name: 'Rest', value: 100 - (data?.quizAttemptAnalytics?.attemptedPercentage || 74.2) }
  ];

  const donutDataInner = [
    { name: 'Unattempted', value: data?.quizAttemptAnalytics?.unattemptedPercentage || 25.8 },
    { name: 'Rest', value: 100 - (data?.quizAttemptAnalytics?.unattemptedPercentage || 25.8) }
  ];

  // Palette colors for charts
  const COLORS = {
    indigo: '#6366f1',
    purple: '#a855f7',
    emerald: '#10b981',
    slateLight: '#f1f5f9',
    slateDark: '#1e293b'
  };

  return (
    <AdminLayout
      selectedSubject={null} // Keep sidebar selections separate from overall dashboard table
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      <div className="flex flex-col gap-6 pb-12">

        {/* ----------------------------------------------------
        // SECTION 1: REDESIGNED WELCOME HERO BANNER (No Notebook button)
        // ---------------------------------------------------- */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white p-6 md:p-8 border border-slate-800 shadow-premium group animate-float-subtle"
        >
          {/* Ambient light abstract backgrounds */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-bl from-indigo-500/10 to-purple-500/10 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase bg-indigo-500 text-white py-0.5 px-2 rounded-md shadow-sm tracking-wider">
                  Admin Control Panel
                </span>
                <span className="text-[10px] font-black uppercase bg-slate-800 text-indigo-400 py-0.5 px-2 rounded-md border border-slate-750 tracking-wider flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" />
                  {isRealBackend ? 'Live DB Mode' : 'High-Fidelity Mock Mode'}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight font-sans text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200">
                Welcome Back, Admin 👋
              </h1>
              <p className="text-xs md:text-sm text-slate-400 font-semibold leading-relaxed">
                Manage students, subscriptions, quiz analytics, and platform performance efficiently. Click on any subject in the sidebar to load dynamic, subject-specific cohort control panels.
              </p>
            </div>

            {/* Quick Actions Panel */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button 
                onClick={triggerRefresh}
                className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black bg-slate-900 border border-slate-850 hover:bg-slate-800 hover:text-white transition-all duration-200 text-slate-300 ${loading ? 'animate-spin' : ''}`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Data
              </button>
            </div>
          </div>
        </motion.div>


        {/* ----------------------------------------------------
        // SECTION 2: GRID OF 4 PREMIUM ANALYTICS CARDS
        // ---------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* CARD 1: STUDENTS ENROLLED */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200/80 dark:border-indigo-950/20 shadow-saas hover:shadow-lg transition-all duration-250 relative overflow-hidden group hover:-translate-y-0.5"
          >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-gradient-to-bl from-blue-500/5 to-indigo-500/5 opacity-50 pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Students Enrolled</span>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white font-sans tracking-tight">
                  {loading ? '...' : data?.summary?.totalStudents}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[10px] text-slate-455 font-bold">
              <span className="text-emerald-500 font-black">⚡ Active</span>
              <span>across standard categories</span>
            </div>
          </motion.div>

          {/* CARD 2: ACTIVE SUBSCRIPTIONS */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200/80 dark:border-indigo-950/20 shadow-saas hover:shadow-lg transition-all duration-250 relative overflow-hidden group hover:-translate-y-0.5"
          >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-gradient-to-bl from-emerald-500/5 to-green-500/5 opacity-50 pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Subscriptions</span>
                <h3 className="text-2xl font-black text-slate-850 dark:text-white font-sans tracking-tight">
                  {loading ? '...' : data?.summary?.activeSubscriptions}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Crown className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[10px] text-slate-455 font-bold">
              <span className="text-emerald-500 font-black">
                {loading ? '...' : ((data?.summary?.activeSubscriptions / (data?.summary?.totalStudents || 1)) * 100).toFixed(1)}%
              </span>
              <span>conversion rate ratio</span>
            </div>
          </motion.div>

          {/* CARD 3: QUIZ PASS RATE */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200/80 dark:border-indigo-950/20 shadow-saas hover:shadow-lg transition-all duration-250 relative overflow-hidden group group hover:-translate-y-0.5"
          >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-gradient-to-bl from-indigo-500/5 to-purple-500/5 opacity-50 pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Quiz Pass Rate</span>
                <h3 className="text-2xl font-black text-slate-850 dark:text-white font-sans tracking-tight">
                  {loading ? '...' : `${data?.summary?.passRate}%`}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[10px] text-slate-455 font-bold">
              <span className="text-indigo-500 font-black">✓ Pass target</span>
              <span>above 50% benchmarks</span>
            </div>
          </motion.div>

          {/* CARD 4: QUIZ FAILED RATE */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200/80 dark:border-indigo-950/20 shadow-saas hover:shadow-lg transition-all duration-250 relative overflow-hidden group hover:-translate-y-0.5"
          >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-gradient-to-bl from-rose-500/5 to-orange-500/5 opacity-50 pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Quiz Failed Rate</span>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white font-sans tracking-tight">
                  {loading ? '...' : `${data?.summary?.failRate}%`}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[10px] text-slate-455 font-bold">
              <span className="text-rose-500 font-black">⚠️ Critical</span>
              <span>requires notebook guidance</span>
            </div>
          </motion.div>

        </div>


        {/* ----------------------------------------------------
        // SECTION 3: RECHARTS GRAPH VISUALIZATIONS (2 COLUMN)
        // ---------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT GRAPH: SUBJECT SUBSCRIPTION ANALYTICS */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="p-6 rounded-3xl bg-white dark:bg-[#0f172a]/90 border border-slate-200/80 dark:border-indigo-950/20 shadow-saas space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Curriculum Metrics</span>
              <h3 className="text-base font-black text-slate-800 dark:text-white tracking-tight font-sans">
                Subject Subscription Analytics
              </h3>
              <p className="text-[11px] text-slate-450 font-semibold leading-relaxed">
                Comparison of premium subscribed users vs non-subscribed trial users per active subject.
              </p>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.subjectSubscriptionAnalytics || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  barGap={4}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis 
                    dataKey="subject" 
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
                    cursor={{ fill: 'rgba(99,102,241,0.03)' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="right"
                    wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingBottom: '15px' }}
                    iconType="circle"
                    iconSize={7}
                  />
                  <Bar 
                    dataKey="subscribedUsers" 
                    name="Subscribed" 
                    fill={COLORS.indigo} 
                    radius={[4, 4, 0, 0]} 
                    animationDuration={1200}
                  />
                  <Bar 
                    dataKey="nonSubscribedUsers" 
                    name="Non-Subscribed" 
                    fill="#94a3b8" 
                    radius={[4, 4, 0, 0]} 
                    animationDuration={1200}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* RIGHT GRAPH: QUIZ ATTEMPT ANALYTICS (DUAL PIE/DONUT) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="p-6 rounded-3xl bg-white dark:bg-[#0f172a]/90 border border-slate-200/80 dark:border-indigo-950/20 shadow-saas space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Platform Engagement</span>
              <h3 className="text-base font-black text-slate-800 dark:text-white tracking-tight font-sans">
                Quiz Attempt Analytics
              </h3>
              <p className="text-[11px] text-slate-455 font-semibold leading-relaxed">
                Dual-ring donut distribution showing attempted quizzes ratios (Outer Ring) vs unattempted quizzes (Inner Ring).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-4 h-72">
              <div className="h-56 w-56 shrink-0 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    {/* Outer Ring: Attempted Percentage */}
                    <Pie
                      data={donutDataOuter}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={2}
                      dataKey="value"
                      animationDuration={1500}
                    >
                      <Cell fill={COLORS.indigo} />
                      <Cell fill="#f1f5f9" className="dark:fill-slate-850" />
                    </Pie>
                    
                    {/* Inner Ring: Unattempted Percentage */}
                    <Pie
                      data={donutDataInner}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                      animationDuration={1500}
                    >
                      <Cell fill={COLORS.purple} />
                      <Cell fill="#f1f5f9" className="dark:fill-slate-850" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center labels overlays */}
                <div className="absolute text-center flex flex-col items-center">
                  <span className="text-xs font-black tracking-tighter text-indigo-500 leading-none">
                    {data?.quizAttemptAnalytics?.attemptedPercentage || 74.2}%
                  </span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                    Attempted
                  </span>
                </div>
              </div>

              {/* Legends explanation detail */}
              <div className="space-y-4 text-xs font-bold leading-normal font-sans">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 shadow-sm shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Outer Ring (Attempted)</span>
                    <span className="block text-slate-800 dark:text-white mt-1">
                      {data?.quizAttemptAnalytics?.attemptedPercentage || 74.2}% Attempted Coverage
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-purple-500 shadow-sm shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Inner Ring (Unattempted)</span>
                    <span className="block text-slate-800 dark:text-white mt-1">
                      {data?.quizAttemptAnalytics?.unattemptedPercentage || 25.8}% Unattempted Ratio
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>


        {/* ----------------------------------------------------
        // SECTION 4: REDESIGNED INVENTORY-STYLE DATA TABLE (STATIC OVERALL)
        // ---------------------------------------------------- */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-3xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-indigo-950/25 shadow-saas overflow-hidden"
        >
          {/* Header Controls Panel */}
          <div className="p-6 border-b border-slate-100 dark:border-indigo-950/25 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Global Student Inventory</span>
                <h3 className="text-base font-black text-slate-800 dark:text-white tracking-tight font-sans">
                  Students Under Subscription
                </h3>
              </div>

              {/* Small, premium actions positioned top-right */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={downloadExcel}
                  title="Export Excel (CSV)"
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 hover:bg-indigo-100 hover:text-indigo-700 transition-all duration-200 border border-indigo-100 dark:border-indigo-900/30 shrink-0"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Excel
                </button>
                <button 
                  onClick={downloadPDF}
                  title="Export PDF Document"
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[10px] font-black bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 hover:text-slate-900 transition-all duration-200 border border-slate-200 dark:border-slate-800 shrink-0"
                >
                  <FileText className="w-3.5 h-3.5" />
                  PDF
                </button>
              </div>
            </div>

            {/* Premium, custom-styled dropdown selectors & filters inside section */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              
              {/* Subject filter dropdown inside table */}
              <div className="space-y-1.5">
                <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Filter Subject</span>
                <div className="relative">
                  <select 
                    value={subjectFilter}
                    onChange={(e) => { setSubjectFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-4 pr-8 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-850 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-755 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-550/10 cursor-pointer transition-all duration-300 hover:shadow-sm dark:hover:shadow-indigo-950/20 custom-select"
                  >
                    <option value="All">All Subjects</option>
                    <option value="TELUGU">TELUGU</option>
                    <option value="HINDI">HINDI</option>
                    <option value="ENGLISH">ENGLISH</option>
                    <option value="SOCIAL">SOCIAL</option>
                    <option value="PHYSICS">PHYSICS</option>
                    <option value="CHEMISTRY">CHEMISTRY</option>
                    <option value="BIOLOGY">BIOLOGY</option>
                    <option value="MATHS">MATHS</option>
                  </select>
                </div>
              </div>

              {/* Plan dropdown select filter */}
              <div className="space-y-1.5">
                <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Plan Type</span>
                <div className="relative">
                  <select 
                    value={planFilter}
                    onChange={(e) => { setPlanFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-4 pr-8 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-850 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-755 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-550/10 cursor-pointer transition-all duration-300 hover:shadow-sm dark:hover:shadow-indigo-950/20 custom-select"
                  >
                    <option value="All">All Plans</option>
                    <option value="Premium">Premium Plan</option>
                    <option value="Free Trial">Free Trial</option>
                  </select>
                </div>
              </div>

              {/* Status dropdown select filter */}
              <div className="space-y-1.5">
                <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Subscription Status</span>
                <div className="relative">
                  <select 
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-4 pr-8 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-850 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-755 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-550/10 cursor-pointer transition-all duration-300 hover:shadow-sm dark:hover:shadow-indigo-950/20 custom-select"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Free Trial">Free Trial</option>
                  </select>
                </div>
              </div>

              {/* Search text input */}
              <div className="space-y-1.5">
                <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Filter Search</span>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-450 pointer-events-none" />
                  <input 
                    type="text"
                    placeholder="Search name, emails..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-9 pr-4 py-2.5 text-xs font-bold rounded-xl border border-slate-205 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900 text-slate-750 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors duration-150"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Clean overall student table layout */}
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse text-left text-xs font-medium font-sans">
              <thead className="sticky top-0 z-10 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md">
                <tr className="border-b border-slate-100 dark:border-indigo-950/20 text-slate-500 uppercase tracking-widest select-none">
                  <th 
                    onClick={() => handleSort('name')}
                    className="py-4 px-6 font-extrabold cursor-pointer hover:text-slate-850 dark:hover:text-white transition-colors duration-150 group"
                  >
                    <div className="flex items-center gap-1.5">
                      Student Name
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity duration-150" />
                    </div>
                  </th>
                  <th className="py-4 px-6 font-extrabold">Email Address</th>
                  <th className="py-4 px-6 font-extrabold">Subjects Selected</th>
                  <th className="py-4 px-6 font-extrabold">Subscription Plan</th>
                  <th 
                    onClick={() => handleSort('expiryDate')}
                    className="py-4 px-6 font-extrabold cursor-pointer hover:text-slate-850 dark:hover:text-white transition-colors duration-150 group"
                  >
                    <div className="flex items-center gap-1.5">
                      Expiry Date
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity duration-150" />
                    </div>
                  </th>
                  <th className="py-4 px-6 font-extrabold">Status</th>
                  <th className="py-4 px-6 font-extrabold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-650 dark:text-slate-350 bg-white dark:bg-[#0f172a]/95">
                {paginatedStudents.length > 0 ? (
                  paginatedStudents.map((student) => (
                    <tr 
                      key={student.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-all duration-150"
                    >
                      {/* Name with initials bubble */}
                      <td className="py-3.5 px-6 font-bold text-slate-850 dark:text-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950/40 flex items-center justify-center font-bold text-xs text-indigo-650 dark:text-indigo-400 shadow-sm shrink-0">
                            {student.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                          </div>
                          <span>{student.name}</span>
                        </div>
                      </td>
                      
                      {/* Email address */}
                      <td className="py-3.5 px-6 text-slate-500 dark:text-slate-400 font-medium">{student.email}</td>
                      
                      {/* Subscribed Subjects list */}
                      <td className="py-3.5 px-6">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {student.subjects.map((sub) => (
                            <span 
                              key={sub} 
                              className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-slate-500 dark:text-slate-400"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Subscription Plan type */}
                      <td className="py-3.5 px-6 font-semibold">
                        <span className={`inline-flex items-center gap-1 ${student.plan === 'Premium Plan' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                          {student.plan === 'Premium Plan' && <Crown className="w-3.5 h-3.5 shrink-0 text-amber-500" />}
                          {student.plan}
                        </span>
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3.5 px-6 text-slate-500 dark:text-slate-455 font-mono">{student.expiryDate || 'N/A'}</td>

                      {/* Status badge pill */}
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

                      {/* Action Column with icons */}
                      <td className="py-3.5 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEditClick(student)}
                            title="Edit Record"
                            className="p-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-slate-500 hover:text-indigo-600 transition-colors duration-150"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteStudent(student.id, student.name)}
                            title="Delete Record"
                            className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-500 hover:text-rose-650 transition-colors duration-150"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400 dark:text-slate-500 font-semibold bg-slate-50/10">
                      <span>No student records match the active filters.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Interactive Pagination controls footer */}
          <div className="p-4 bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between text-xs font-bold text-slate-550 select-none">
            <span>
              Showing {filteredStudents.length > 0 ? indexOfFirstRow + 1 : 0} to {Math.min(indexOfLastRow, filteredStudents.length)} of {filteredStudents.length} entries
            </span>
            
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 transition-colors duration-150"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1 font-sans">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-black transition-all duration-150
                      ${currentPage === page
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-350'
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 transition-colors duration-150"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </motion.div>

      </div>

      {/* ----------------------------------------------------
      // DIALOG COMPONENT: PREMIUM EDIT STUDENT POPUP MODAL
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
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
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
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
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
                    className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 text-[11px]"
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
    </AdminLayout>
  );
};

export default AdminDashboard;
