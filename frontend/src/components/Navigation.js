import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navigation.css';

function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">📚</span>
          SLP
        </Link>

        <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          {!isAuthenticated ? (
            <>
              <Link 
                to="/" 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/services" 
                className={`nav-link ${location.pathname === '/services' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>

              <Link 
                to="/register" 
                className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
              <Link 
                to="/login" 
                className={`nav-link nav-login ${location.pathname === '/login' && location.search !== '?action=quiz' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            </>
          ) : (
            <>
              <Link 
                to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} 
                className={`nav-link ${location.pathname.includes('dashboard') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              {user?.role === 'student' && (
                <>
                  <Link 
                    to="/student/videos" 
                    className={`nav-link ${location.pathname.includes('/student/videos') ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Videos
                  </Link>
                  <Link 
                    to="/student/quizzes" 
                    className={`nav-link ${location.pathname.includes('/student/quizzes') ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Take a Quiz
                  </Link>
                  <Link 
                    to="/student/materials" 
                    className={`nav-link ${location.pathname.includes('/student/materials') ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Materials
                  </Link>
                  <Link 
                    to="/student/leaderboard" 
                    className={`nav-link ${location.pathname.includes('/student/leaderboard') ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Leaderboard
                  </Link>
                </>
              )}
              <button 
                className="nav-link nav-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>

        <button 
          className="hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}

export default Navigation;
