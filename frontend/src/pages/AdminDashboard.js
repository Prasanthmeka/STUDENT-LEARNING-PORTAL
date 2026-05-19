import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="header-top">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome, {user?.full_name}</p>
          </div>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <a href="/admin/videos">Videos</a>
        <a href="/admin/materials">Materials</a>
        <a href="/admin/quizzes">Quizzes</a>
        <a href="/admin/analytics">Analytics</a>
        <a href="/admin/users">Users</a>
      </nav>

      <section className="admin-section">
        <h2>Quick Actions</h2>
        <div className="quick-links">
          <div className="quick-link-card">
            <div className="icon">🎥</div>
            <h3>Upload Video</h3>
            <p>Add recorded lectures and live sessions to the platform</p>
            <a href="/admin/videos" className="btn-link">
              Upload Video →
            </a>
          </div>
          <div className="quick-link-card">
            <div className="icon">📚</div>
            <h3>Upload Materials</h3>
            <p>Add PDF, documents, and study resources for students</p>
            <a href="/admin/materials" className="btn-link">
              Upload Materials →
            </a>
          </div>
          <div className="quick-link-card">
            <div className="icon">✏️</div>
            <h3>Create Quiz</h3>
            <p>Create quizzes from documents or manual entry with auto-grading</p>
            <a href="/admin/quizzes" className="btn-link">
              Create Quiz →
            </a>
          </div>
          <div className="quick-link-card">
            <div className="icon">📊</div>
            <h3>View Analytics</h3>
            <p>Monitor student performance and platform statistics</p>
            <a href="/admin/analytics" className="btn-link">
              View Analytics →
            </a>
          </div>
          <div className="quick-link-card">
            <div className="icon">👥</div>
            <h3>Manage Users</h3>
            <p>View all registered users and manage their roles</p>
            <a href="/admin/users" className="btn-link">
              Manage Users →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
