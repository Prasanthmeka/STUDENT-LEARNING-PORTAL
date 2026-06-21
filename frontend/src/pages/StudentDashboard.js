import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  AlertCircle
} from 'lucide-react';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Data Fetching States
  const [dashboardData, setDashboardData] = useState(null);
  const [coursesData, setCoursesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
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
    <StudentLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
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

          {/* Subscribed Subjects check alert */}
          {(JSON.parse(localStorage.getItem('subscribedSubjects') || '[]')).length === 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/50 p-4.5 rounded-3xl text-xs shadow-md">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="font-extrabold text-amber-800 dark:text-amber-400 leading-normal">
                  Your student portal is inactive. Please configure and subscribe to subjects on the subscription checkout page to view your courses, video lessons, and study materials.
                </span>
              </div>
              <button 
                onClick={() => navigate('/student/subscription')}
                className="py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-smooth text-[10px] shrink-0 shadow-sm"
              >
                Configure Curriculum
              </button>
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

          {/* Bottom Section (Top Quizzes Table) */}
          <TopQuizzes 
            quizzes={dashboardData?.topQuizzes || []}
            loading={loading}
          />

          {/* Active Courses grid (Illustrations + progress bars) */}
          <CoursesGrid 
            courses={coursesData}
            loading={loading}
            searchQuery={searchQuery}
          />

          {/* Bottom Settings & Subscription placeholders for Anchor scrolling alignment */}
          <div id="subscription-section" className="scroll-mt-24 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-saas flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="text-[10px] font-extrabold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">LearnoQube Premium</span>
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

      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
