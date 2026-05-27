import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navigation.css';
import LearnoQubeLogo from './LearnoQubeLogo';

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

  return (
    <div id="navigation" className="navbar-light bg-faded site-navigation">
      <div className="container-fluid">
        <div className="row align-items-center justify-content-between g-0" style={{ display: 'flex', width: '100%' }}>
          
          {/* Logo Column */}
          <div className="col-lg-3 col-6 align-self-center">
            <div className="site-logo">
              <Link to="/" className="site-logo-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                <LearnoQubeLogo className="w-8 h-8 shrink-0" />
                <span className="font-bold text-2xl tracking-wide bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent transition-transform duration-300 hover:scale-[1.02]">
                  LearnoQube
                </span>
              </Link>
            </div>
          </div>

          {/* Desktop Menu - visible on large screens */}
          <div className="col-lg-6 d-none d-lg-flex justify-content-center">
            <nav id="main-menu">
              <ul>
                {!isAuthenticated ? (
                  <>
                    <li>
                      <a href="/#home" className={location.pathname === '/' && !location.hash ? 'active' : ''}>Home</a>
                    </li>
                    <li>
                      <a href="/#courses" className={location.hash === '#courses' ? 'active' : ''}>Courses</a>
                    </li>
                    <li>
                      <a href="/#live-classes" className={location.hash === '#live-classes' ? 'active' : ''}>Live Classes</a>
                    </li>
                    <li>
                      <a href="/#quizzes" className={location.hash === '#quizzes' ? 'active' : ''}>Quizzes</a>
                    </li>
                    <li>
                      <a href="/#materials" className={location.hash === '#materials' ? 'active' : ''}>Study Materials</a>
                    </li>
                    <li>
                      <a href="/#contact" className={location.hash === '#contact' ? 'active' : ''}>Contact</a>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} className={location.pathname.includes('dashboard') ? 'active' : ''}>
                        Dashboard
                      </Link>
                    </li>
                    {user?.role === 'student' && (
                      <>
                        <li>
                          <Link to="/student/videos" className={location.pathname.includes('/student/videos') ? 'active' : ''}>Videos</Link>
                        </li>
                        <li>
                          <Link to="/student/quizzes" className={location.pathname.includes('/student/quizzes') ? 'active' : ''}>Take a Quiz</Link>
                        </li>
                        <li>
                          <Link to="/student/materials" className={location.pathname.includes('/student/materials') ? 'active' : ''}>Materials</Link>
                        </li>
                      </>
                    )}
                  </>
                )}
              </ul>
            </nav>
          </div>

          {/* Desktop Auth Column - visible on large screens */}
          <div className="col-lg-3 col-6 text-end align-self-center d-none d-lg-block">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="header-btn">Login</Link>
                <Link to="/register" className="btn_one">Sign Up</Link>
              </>
            ) : (
              <button onClick={handleLogout} className="btn_one" style={{ border: 'none' }}>
                Logout
              </button>
            )}
          </div>

          {/* Hamburger Icon for Mobile - visible on medium/small screens */}
          <div className="col-6 d-flex d-lg-none justify-content-end align-self-center">
            <button 
              className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu - visible on medium/small screens */}
      <div className={`mobile-menu-drawer d-lg-none ${mobileMenuOpen ? 'open' : ''}`}>
        <ul className="mobile-menu-list">
          {!isAuthenticated ? (
            <>
              <li>
                <a href="/#home" onClick={() => setMobileMenuOpen(false)}>Home</a>
              </li>
              <li>
                <a href="/#courses" onClick={() => setMobileMenuOpen(false)}>Courses</a>
              </li>
              <li>
                <a href="/#live-classes" onClick={() => setMobileMenuOpen(false)}>Live Classes</a>
              </li>
              <li>
                <a href="/#quizzes" onClick={() => setMobileMenuOpen(false)}>Quizzes</a>
              </li>
              <li>
                <a href="/#materials" onClick={() => setMobileMenuOpen(false)}>Study Materials</a>
              </li>
              <li>
                <a href="/#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
              </li>
              <li>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="mobile-signin">Login</Link>
              </li>
              <li>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="mobile-signup">Sign Up</Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
              </li>
              {user?.role === 'student' && (
                <>
                  <li>
                    <Link to="/student/videos" onClick={() => setMobileMenuOpen(false)}>Videos</Link>
                  </li>
                  <li>
                    <Link to="/student/quizzes" onClick={() => setMobileMenuOpen(false)}>Take a Quiz</Link>
                  </li>
                  <li>
                    <Link to="/student/materials" onClick={() => setMobileMenuOpen(false)}>Materials</Link>
                  </li>
                </>
              )}
              <li>
                <button onClick={handleLogout} className="mobile-logout">Logout</button>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Navigation;
