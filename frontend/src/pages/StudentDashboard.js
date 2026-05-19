import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/StudentDashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="student-dashboard">
      <header className="dashboard-header">
        <div className="header-top">
          <div>
            <h1>Welcome, {user?.full_name}</h1>
            <p>Student Learning Platform</p>
          </div>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <a href="/student/videos">Videos</a>
        <a href="/student/materials">Materials</a>
        <a href="/student/quizzes">Quizzes</a>
        <a href="/student/leaderboard">Leaderboard</a>
      </nav>

      <section className="dashboard-overview">
        <h2>Learning Resources</h2>
        <div className="quick-links">
          <div className="quick-link-card">
            <div className="icon">📹</div>
            <h3>Videos</h3>
            <p>Watch recorded lectures and live sessions</p>
            <a href="/student/videos" className="btn-link">Browse Videos →</a>
          </div>
          <div className="quick-link-card">
            <div className="icon">📚</div>
            <h3>Materials</h3>
            <p>Download study materials and resources</p>
            <a href="/student/materials" className="btn-link">Browse Materials →</a>
          </div>
          <div className="quick-link-card">
            <div className="icon">✏️</div>
            <h3>Quizzes</h3>
            <p>Test your knowledge with auto-graded quizzes</p>
            <a href="/student/quizzes" className="btn-link">Take Quizzes →</a>
          </div>
          <div className="quick-link-card">
            <div className="icon">🏆</div>
            <h3>Leaderboard</h3>
            <p>See your rank and compete with peers</p>
            <a href="/student/leaderboard" className="btn-link">View Leaderboard →</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;
