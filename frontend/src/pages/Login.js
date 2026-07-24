import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/Auth.css';
import '../styles/LandingPage.css';
import LearnoQubeLogo from '../components/LearnoQubeLogo';
import { BookOpen, Trophy } from 'lucide-react';

const Login = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState(searchParams.get('type') === 'quiz' ? 'quiz' : 'courses'); // 'courses' or 'quiz'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'session_expired') {
      setError('You have been logged out because your account was logged in on another device.');
    } else if (errorParam === 'unauthorized') {
      setError('Session expired. Please log in again.');
    }

    const typeParam = searchParams.get('type');
    if (typeParam === 'quiz') {
      setLoginType('quiz');
    } else if (typeParam === 'courses') {
      setLoginType('courses');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({ email, password, loginType });
      if (response.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        if (loginType === 'quiz') {
          navigate('/student/quizzes');
        } else {
          navigate('/student/dashboard');
        }
      }
    } catch (err) {
      setError(err.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-container">
      <div className="animated-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
        <div className="blob blob-5"></div>
      </div>
      <div className="auth-container" style={{ position: 'relative', zIndex: 1 }}>
      <div className="auth-card">
        <div className="flex items-center justify-center gap-2 mb-6 select-none">
          <LearnoQubeLogo className="w-9 h-9 shrink-0" />
          <span className="font-bold text-3xl tracking-wide bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">LearnoQube</span>
        </div>
        <h3>Login</h3>
        {error && <div className="error-message">{error}</div>}
        
        {/* Toggle Selector for Login Type */}
        <div className="flex gap-4 mb-6 select-none">
          <button
            type="button"
            onClick={() => setLoginType('courses')}
            className={`flex-grow flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-bold transition-all duration-305 ${
              loginType === 'courses'
                ? 'bg-indigo-650 border-indigo-650 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-white/50 dark:bg-slate-900/50 border-slate-205 dark:border-slate-855 text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            Courses Login
          </button>
          
          <button
            type="button"
            onClick={() => setLoginType('quiz')}
            className={`flex-grow flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-bold transition-all duration-305 ${
              loginType === 'quiz'
                ? 'bg-indigo-650 border-indigo-650 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-white/50 dark:bg-slate-900/50 border-slate-205 dark:border-slate-855 text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4 shrink-0" />
            Quiz Portal Login
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p>Don't have an account? <a href="/register">Register</a></p>
      </div>
      </div>
    </div>
  );
};

export default Login;
