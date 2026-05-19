import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaderboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Leaderboard.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await leaderboardAPI.getLeaderboard();
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading leaderboard...</div>;

  return (
    <div className="leaderboard-page">
      <header className="dashboard-header">
        <div className="header-top">
          <button onClick={() => navigate('/student/dashboard')} className="btn-back">← Back</button>
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
        <a href="/student/leaderboard" className="active">Leaderboard</a>
      </nav>

      <section className="leaderboard-section">
        <h2>Student Leaderboard</h2>
        
        {leaderboard.length === 0 ? (
          <p className="no-content">No quiz attempts yet</p>
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student Name</th>
                <th>Email</th>
                <th>Quizzes Completed</th>
                <th>Total Marks</th>
                <th>Average Percentage</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((student, idx) => (
                <tr key={student.student_id}>
                  <td className={idx < 3 ? `rank-${idx + 1}` : ''}>{idx + 1}</td>
                  <td>{student.full_name}</td>
                  <td>{student.email}</td>
                  <td>{student.quizzesCompleted}</td>
                  <td>{student.totalMarks}</td>
                  <td>{student.averagePercentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default Leaderboard;
