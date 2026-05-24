import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseAPI, analyticsAPI } from '../services/api';

// Sub-components
import StudentLayout from '../layouts/StudentLayout';
import WelcomeHero from '../components/dashboard/WelcomeHero';
import AnalyticsCards from '../components/dashboard/AnalyticsCards';
import SubjectAnalyticsChart from '../components/dashboard/SubjectAnalyticsChart';
import PerformanceGraph from '../components/dashboard/PerformanceGraph';
import TopQuizzes from '../components/dashboard/TopQuizzes';
import CoursesGrid from '../components/dashboard/CoursesGrid';

// Icons
import { 
  Play, 
  BookOpen, 
  Trophy, 
  Download, 
  ChevronRight,
  AlertCircle,
  Calendar,
  CheckSquare,
  Square
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Data Fetching States
  const [dashboardData, setDashboardData] = useState(null);
  const [coursesData, setCoursesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Activities Checklist State
  const [activities, setActivities] = useState([
    { id: 1, title: 'Maths - Quadratic Equations Quiz', date: 'May 26', done: false, subject: 'Maths' },
    { id: 2, title: 'Physics - Mechanics Video Lecture', date: 'May 28', done: false, subject: 'Physics' },
    { id: 3, title: 'English - Grammar Practice Exam', date: 'May 29', done: true, subject: 'English' },
    { id: 4, title: 'Biology - Cell Division Reading', date: 'June 01', done: false, subject: 'Biology' },
    { id: 5, title: 'Chemistry - Organic Bonding Review', date: 'June 03', done: false, subject: 'Chemistry' },
  ]);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const toggleActivity = (id) => {
    setActivities(prev => 
      prev.map(act => act.id === id ? { ...act, done: !act.done } : act)
    );
    const actName = activities.find(a => a.id === id)?.title;
    const isNowDone = !activities.find(a => a.id === id)?.done;
    showToast(isNowDone ? `Marked "${actName}" as completed!` : `Reopened "${actName}"`, 'success');
  };

  useEffect(() => {
    const fetchDashboardContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch Analytics & Courses concurrently
        const [analyticsRes, coursesRes] = await Promise.all([
          analyticsAPI.getStudentDashboard(),
          courseAPI.getCourses()
        ]);

        setDashboardData(analyticsRes.data);
        setCoursesData(coursesRes.data);
      } catch (err) {
        console.error('Error fetching dashboard content:', err);
        setError('Unable to load learning data. Please try again later.');
        showToast('Error syncing with database', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardContent();
  }, []);

  // Hash scroll listener
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [location]);

  return (
    <StudentLayout>
      {/* Toast Alert overlay */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border transition-smooth ${
          toast.type === 'error' 
            ? 'bg-rose-50 dark:bg-rose-950 border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-400' 
            : 'bg-emerald-50 dark:bg-emerald-950 border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400'
        }`}>
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-xs font-black tracking-wide">{toast.message}</span>
        </div>
      )}

      <div className="space-y-8">
          
          {error && (
            <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950 border border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-xs font-black shadow-saas">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          {/* Welcome Greeting Hero Component */}
          <WelcomeHero 
            streak={dashboardData?.summary?.streak || 0}
            totalTests={dashboardData?.summary?.totalTests || 0}
            passPercentage={dashboardData?.summary?.passPercentage || 0}
          />

          {/* Quick Action Navigation Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/student/quizzes')}
              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold text-xs tracking-wide shadow-md shadow-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/20 transition-smooth group"
            >
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-smooth" />
                Start New Quiz
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-smooth" />
            </button>

            <button
              onClick={() => navigate('/student/videos')}
              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold text-xs tracking-wide shadow-md shadow-purple-500/10 hover:shadow-lg hover:shadow-purple-500/20 transition-smooth group"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 group-hover:scale-110 transition-smooth" />
                Continue Course
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-smooth" />
            </button>

            <button
              onClick={() => navigate('/student/materials')}
              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-xs tracking-wide shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 transition-smooth group"
            >
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-smooth" />
                Download Materials
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-smooth" />
            </button>

            <button
              onClick={() => navigate('/student/leaderboard')}
              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold text-xs tracking-wide shadow-md shadow-cyan-500/10 hover:shadow-lg hover:shadow-cyan-500/20 transition-smooth group"
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 group-hover:scale-110 transition-smooth" />
                View Leaderboard
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-smooth" />
            </button>
          </div>

          {/* 3 Analytics Cards */}
          <AnalyticsCards 
            totalTests={dashboardData?.summary?.totalTests || 0}
            testsPassed={dashboardData?.summary?.testsPassed || 0}
            failedTests={dashboardData?.summary?.failedTests || 0}
            loading={loading}
          />

          {/* Performance Charts Section (2 Columns) */}
          <div id="analytics-section" className="grid grid-cols-1 lg:grid-cols-2 gap-8 scroll-mt-24">
            {/* Monthly Area Chart */}
            <PerformanceGraph 
              data={dashboardData?.monthlyPerformance || []}
              loading={loading}
            />

            {/* Subject Contributions Pie Donut Chart */}
            <SubjectAnalyticsChart 
              data={dashboardData?.subjectAnalytics || []}
              loading={loading}
            />
          </div>

          {/* Bottom Grid (Top Quizzes Table & Upcoming Activities Checklist) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Top Quizzes (7 Cols) */}
            <div className="lg:col-span-7">
              <TopQuizzes 
                quizzes={dashboardData?.topQuizzes || []}
                loading={loading}
              />
            </div>

            {/* Upcoming Activities Checklist (5 Cols) */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-saas h-[380px] flex flex-col">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center border border-indigo-100 dark:border-indigo-900 text-indigo-500 dark:text-indigo-400">
                      <Calendar className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 dark:text-white text-base tracking-tight font-sans">Upcoming Quizzes & Activities</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Your Schedule</p>
                    </div>
                  </div>
                </div>

                <div className="flex-grow overflow-y-auto py-4 space-y-3 pr-1">
                  {activities.map((act) => (
                    <div 
                      key={act.id}
                      onClick={() => toggleActivity(act.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-smooth cursor-pointer ${
                        act.done 
                          ? 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-850 opacity-60' 
                          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 hover:bg-slate-50/40 dark:hover:bg-slate-850/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button className="text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-smooth">
                          {act.done ? (
                            <CheckSquare className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300 dark:text-slate-700" />
                          )}
                        </button>
                        <span className={`text-xs font-semibold font-sans tracking-wide ${
                          act.done ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'
                        }`}>
                          {act.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 uppercase tracking-wider">
                        {act.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Active Courses grid (Illustrations + progress bars) */}
          <CoursesGrid 
            courses={coursesData}
            loading={loading}
          />

          {/* Bottom Settings & Subscription placeholders for Anchor scrolling alignment */}
          <div id="subscription-section" className="scroll-mt-24 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-saas flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="text-[10px] font-extrabold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">EduMasterPro Premium</span>
              <h3 className="font-black text-slate-800 dark:text-white text-lg tracking-tight font-sans">Upgrade Your Learning Experience</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold max-w-xl">
                Unlock detailed step-by-step master class solutions, interactive live classrooms, unlimited mock exams, and customized downloadable study materials.
              </p>
            </div>
            <button
              onClick={() => navigate('/student/subscription')}
              className="py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs tracking-wide transition-smooth shrink-0 shadow-md shadow-indigo-600/10"
            >
              Get Premium Access
            </button>
          </div>

          <div id="settings-section" className="scroll-mt-24 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-saas space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-slate-800 dark:text-white text-lg tracking-tight font-sans">Dashboard Preferences</h3>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Customize your student workspace views</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-semibold cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-indigo-600 dark:text-indigo-400 border-slate-300 dark:border-slate-700 bg-transparent focus:ring-indigo-500" />
                Enable sound effects
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-semibold cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-indigo-600 dark:text-indigo-400 border-slate-300 dark:border-slate-700 bg-transparent focus:ring-indigo-500" />
                Receive email summary reports
              </label>
            </div>
          </div>

      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
