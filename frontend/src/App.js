import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import ServicesPage from './pages/ServicesPage';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentVideos from './pages/StudentVideos';
import StudentMaterials from './pages/StudentMaterials';
import Leaderboard from './pages/Leaderboard';
import QuizzesPage from './pages/QuizzesPage';
import QuizPage from './pages/QuizPage';
import VideoPlayer from './pages/VideoPlayer';
import Settings from './pages/Settings';
import Subscription from './pages/Subscription';
import AdminMaterials from './pages/AdminMaterials';
import AdminQuizzes from './pages/AdminQuizzes';
import AdminVideos from './pages/AdminVideos';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminUsers from './pages/AdminUsers';
import AdminSubjectPage from './pages/AdminSubjectPage';
import UserSettings from './pages/UserSettings';
import VideoUpload from './pages/VideoUpload';
import MaterialUpload from './pages/MaterialUpload';
import QuizCreate from './pages/QuizCreate';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import './App.css';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const ProtectedRoute = ({ component: Component, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} />;
  }

  return Component;
};

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <div className="loading">Loading...</div>;

  const isDashboardRoute = location.pathname.startsWith('/student/') || location.pathname.startsWith('/admin/');

  return (
    <div className="app-layout">
      <ScrollToTop />
      {!isDashboardRoute && <Navigation />}
      <main className={isDashboardRoute ? "" : "main-content"}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={isAuthenticated ? <Navigate to={`/${user?.role}/dashboard`} /> : <LandingPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to={`/${user?.role}/dashboard`} /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to={`/${user?.role}/dashboard`} /> : <Register />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute component={<AdminDashboard />} requiredRole="admin" />} />
          <Route path="/admin/materials" element={<ProtectedRoute component={<AdminMaterials />} requiredRole="admin" />} />
          <Route path="/admin/quizzes" element={<ProtectedRoute component={<AdminQuizzes />} requiredRole="admin" />} />
          <Route path="/admin/videos" element={<ProtectedRoute component={<AdminVideos />} requiredRole="admin" />} />
          <Route path="/admin/analytics" element={<ProtectedRoute component={<AdminAnalytics />} requiredRole="admin" />} />
          <Route path="/admin/users" element={<ProtectedRoute component={<AdminUsers />} requiredRole="admin" />} />
          <Route path="/admin/subject/:subjectName" element={<ProtectedRoute component={<AdminSubjectPage />} requiredRole="admin" />} />
          <Route path="/admin/subject/:subjectName/videos/upload" element={<ProtectedRoute component={<VideoUpload />} requiredRole="admin" />} />
          <Route path="/admin/subject/:subjectName/materials/upload" element={<ProtectedRoute component={<MaterialUpload />} requiredRole="admin" />} />
          <Route path="/admin/subject/:subjectName/quizzes/create" element={<ProtectedRoute component={<QuizCreate />} requiredRole="admin" />} />
          <Route path="/admin/settings" element={<ProtectedRoute component={<UserSettings />} requiredRole="admin" />} />
          
          {/* Student Routes */}
          <Route path="/student/dashboard" element={<ProtectedRoute component={<StudentDashboard />} requiredRole="student" />} />
          <Route path="/student/videos" element={<ProtectedRoute component={<StudentVideos />} requiredRole="student" />} />
          <Route path="/student/videos/:id" element={<ProtectedRoute component={<VideoPlayer />} requiredRole="student" />} />
          <Route path="/student/materials" element={<ProtectedRoute component={<StudentMaterials />} requiredRole="student" />} />
          <Route path="/student/quizzes" element={<ProtectedRoute component={<QuizzesPage />} requiredRole="student" />} />
          <Route path="/student/quiz/:id" element={<ProtectedRoute component={<QuizPage />} requiredRole="student" />} />
          <Route path="/student/leaderboard" element={<ProtectedRoute component={<Leaderboard />} requiredRole="student" />} />
          <Route path="/student/settings" element={<ProtectedRoute component={<Settings />} requiredRole="student" />} />
          <Route path="/student/subscription" element={<ProtectedRoute component={<Subscription />} requiredRole="student" />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!isDashboardRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
