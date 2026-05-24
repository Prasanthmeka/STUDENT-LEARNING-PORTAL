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
import AdminMaterials from './pages/AdminMaterials';
import AdminQuizzes from './pages/AdminQuizzes';
import AdminVideos from './pages/AdminVideos';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminUsers from './pages/AdminUsers';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import AIMascot from './components/AIMascot';
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
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} />;
  }

  return Component;
};

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="app-layout">
      <ScrollToTop />
      <Navigation />
      <main className="main-content">
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
          
          {/* Student Routes */}
          <Route path="/student/dashboard" element={<ProtectedRoute component={<StudentDashboard />} requiredRole="student" />} />
          <Route path="/student/videos" element={<ProtectedRoute component={<StudentVideos />} requiredRole="student" />} />
          <Route path="/student/videos/:id" element={<ProtectedRoute component={<VideoPlayer />} requiredRole="student" />} />
          <Route path="/student/materials" element={<ProtectedRoute component={<StudentMaterials />} requiredRole="student" />} />
          <Route path="/student/quizzes" element={<ProtectedRoute component={<QuizzesPage />} requiredRole="student" />} />
          <Route path="/student/quiz/:id" element={<ProtectedRoute component={<QuizPage />} requiredRole="student" />} />
          <Route path="/student/leaderboard" element={<ProtectedRoute component={<Leaderboard />} requiredRole="student" />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {isAuthenticated && user?.role === 'student' && <AIMascot />}
      <Footer />
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
