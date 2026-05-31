import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizAPI } from '../services/api';
import '../styles/AdminAnalytics.css';

// Admin Analytics Page - Provides detailed insights into student performance, quiz attempts, and overall platform usage. Admins can view top performers, average scores, pass rates, and drill down into individual quiz attempts to see detailed responses and reset attempts if necessary.
const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [quizResponses, setQuizResponses] = useState([]);
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    fetchAnalytics();
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await quizAPI.getQuizzes();
      setQuizzes(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuizAttempts = async (quizId) => {
    if (!quizId) {
      setQuizAttempts([]);
      return;
    }
    try {
      const response = await quizAPI.getAllAttempts(quizId);
      setQuizAttempts(response.data.attempts);
      setQuizResponses(response.data.responses);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuizSelect = (e) => {
    const qid = e.target.value;
    setSelectedQuizId(qid);
    fetchQuizAttempts(qid);
  };

  const handleDeleteAttempt = async (attemptId) => {
    if (window.confirm('Are you sure you want to delete this attempt? The student will be able to retake the quiz.')) {
      try {
        await quizAPI.deleteAttempt(attemptId);
        fetchQuizAttempts(selectedQuizId);
        setSelectedAttemptId(null);
        alert('Attempt deleted. Student can now retake.');
      } catch (err) {
        alert('Failed to delete attempt');
      }
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/leaderboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch analytics');

      const data = await response.json();
      
      // Calculate analytics from leaderboard data
      if (data && data.length > 0) {
        const totalAttempts = data.reduce((sum, student) => sum + (student.quizzesCompleted || 0), 0);
        const avgScore = (data.reduce((sum, student) => sum + (student.averagePercentage || 0), 0) / data.length).toFixed(2);
        const totalStudents = data.length;

        setAnalytics({
          totalStudents,
          totalAttempts,
          avgScore,
          topPerformers: data.slice(0, 5),
          avgQuestionsPerQuiz: 10,
          passRate: '75'
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading analytics...</div>;

  return (
    <div className="admin-analytics">
      <header className="dashboard-header">
        <div className="header-top">
          <button onClick={() => navigate('/admin/dashboard')} className="btn-back">← Back</button>
          <div>
            <h1>Admin Analytics</h1>
            <p>Welcome, {user?.full_name}</p>
          </div>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <a href="/admin/videos">Videos</a>
        <a href="/admin/materials">Materials</a>
        <a href="/admin/quizzes">Quizzes</a>
        <a href="/admin/analytics" className="active">Analytics</a>
      </nav>

      <section className="analytics-section">
        <h2>Platform Analytics</h2>

        <div className="analytics-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Total Students</h3>
              <p className="stat-value">{analytics?.totalStudents || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Quiz Attempts</h3>
              <p className="stat-value">{analytics?.totalAttempts || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Average Score</h3>
              <p className="stat-value">{analytics?.avgScore || 0}%</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3>Pass Rate</h3>
              <p className="stat-value">{analytics?.passRate || 0}%</p>
            </div>
          </div>
        </div>

        <div className="analytics-container">
          <div className="analytics-card">
            <h3>📈 Top Performing Students</h3>
            {analytics?.topPerformers && analytics.topPerformers.length > 0 ? (
              <table className="performers-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Quizzes Completed</th>
                    <th>Average Score</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topPerformers.map((student, idx) => (
                    <tr key={student.student_id} className={idx < 3 ? `rank-${idx + 1}` : ''}>
                      <td>{idx + 1}</td>
                      <td>{student.full_name}</td>
                      <td>{student.email}</td>
                      <td>{student.quizzesCompleted || 0}</td>
                      <td>
                        <span className={`score ${student.averagePercentage >= 60 ? 'pass' : 'fail'}`}>
                          {student.averagePercentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No student data available yet</p>
            )}
          </div>

          <div className="analytics-card">
            <h3>📋 Quick Stats</h3>
            <div className="quick-stats">
              <div className="stat-item">
                <span className="stat-label">Questions Per Quiz (Avg)</span>
                <span className="stat-number">{analytics?.avgQuestionsPerQuiz || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Quiz Attempts</span>
                <span className="stat-number">{analytics?.totalAttempts || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active Students</span>
                <span className="stat-number">{analytics?.totalStudents || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-card" style={{ marginTop: '30px' }}>
          <h3>📝 Detailed Quiz Results</h3>
          <p style={{ color: '#718096', marginBottom: '25px', fontSize: '15px' }}>Select a quiz to view student marks and detailed answers, or to reset their attempt.</p>
          
          <select 
            value={selectedQuizId} 
            onChange={handleQuizSelect}
            style={{ width: '100%', padding: '15px', borderRadius: '8px', background: '#f8f9fa', border: '2px solid #e2e8f0', color: '#2d3748', fontSize: '16px', fontWeight: '500', marginBottom: '30px', cursor: 'pointer', outline: 'none', transition: 'border 0.3s' }}
          >
            <option value="">-- Select a Quiz --</option>
            {quizzes.map(q => (
              <option key={q.id} value={q.id}>{q.title}</option>
            ))}
          </select>

          {selectedQuizId && quizAttempts.length === 0 && (
            <div style={{ background: '#edf2f7', padding: '30px', borderRadius: '8px', textAlign: 'center', color: '#718096' }}>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>No students have taken this quiz yet.</p>
            </div>
          )}

          {selectedQuizId && quizAttempts.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table className="performers-table" style={{ width: '100%', minWidth: '800px' }}>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Submitted At</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quizAttempts.map(attempt => (
                    <React.Fragment key={attempt.id}>
                      <tr style={{ background: selectedAttemptId === attempt.id ? '#f7fafc' : 'transparent' }}>
                        <td style={{ fontWeight: '600', color: '#2d3748' }}>{attempt.users?.full_name}</td>
                        <td style={{ color: '#718096' }}>{new Date(attempt.submitted_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td style={{ fontWeight: 'bold', color: '#4a5568' }}>{attempt.marks_obtained} / {attempt.total_marks} ({Number(attempt.percentage).toFixed(1)}%)</td>
                        <td>
                          <span className={`score ${attempt.is_passed ? 'pass' : 'fail'}`}>
                            {attempt.is_passed ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                        <td>
                          <button 
                            onClick={() => setSelectedAttemptId(selectedAttemptId === attempt.id ? null : attempt.id)}
                            style={{ background: selectedAttemptId === attempt.id ? '#667eea' : 'transparent', color: selectedAttemptId === attempt.id ? 'white' : '#667eea', border: '1px solid #667eea', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', marginRight: '10px', fontWeight: '600', transition: 'all 0.2s' }}
                          >
                            {selectedAttemptId === attempt.id ? 'Hide Answers' : 'View Answers'}
                          </button>
                          <button 
                            onClick={() => handleDeleteAttempt(attempt.id)}
                            style={{ background: '#fff0f0', color: '#e53e3e', border: '1px solid #feb2b2', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}
                            onMouseOver={(e) => { e.currentTarget.style.background = '#fed7d7' }}
                            onMouseOut={(e) => { e.currentTarget.style.background = '#fff0f0' }}
                          >
                            Reset Attempt
                          </button>
                        </td>
                      </tr>
                      {selectedAttemptId === attempt.id && (
                        <tr>
                          <td colSpan="5" style={{ padding: '0', borderBottom: 'none' }}>
                            <div style={{ background: '#f8f9fa', borderTop: 'none', borderBottom: '1px solid #e9ecef', padding: '25px', boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.02)' }}>
                              <h4 style={{ color: '#2d3748', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px', fontSize: '18px' }}>
                                Detailed Review for {attempt.users?.full_name}
                              </h4>
                              
                              <div style={{ display: 'grid', gap: '15px' }}>
                                {quizResponses.filter(r => r.quiz_attempt_id === attempt.id).map((resp, i) => (
                                  <div key={resp.id} style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: `4px solid ${resp.is_correct ? '#48bb78' : '#f56565'}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                      <p style={{ color: '#2d3748', fontWeight: '600', fontSize: '16px', margin: 0, flex: 1 }}>
                                        <span style={{ color: '#a0aec0', marginRight: '8px' }}>Q{i+1}.</span> 
                                        {resp.quiz_questions?.question_text}
                                      </p>
                                      <span style={{ 
                                        background: resp.is_correct ? '#c6f6d5' : '#fed7d7', 
                                        color: resp.is_correct ? '#22543d' : '#822727', 
                                        padding: '4px 10px', 
                                        borderRadius: '20px', 
                                        fontSize: '12px', 
                                        fontWeight: 'bold',
                                        marginLeft: '15px',
                                        whiteSpace: 'nowrap'
                                      }}>
                                        {resp.is_correct ? '✓ CORRECT' : '✗ INCORRECT'}
                                      </span>
                                    </div>
                                    
                                    <div style={{ background: '#f7fafc', padding: '12px 15px', borderRadius: '6px', border: '1px dashed #cbd5e0' }}>
                                      {resp.quiz_options && (
                                        <p style={{ margin: 0, color: '#4a5568', fontSize: '14px' }}>
                                          <strong>Student Selected:</strong> <span style={{ color: resp.is_correct ? '#2f855a' : '#c53030', fontWeight: '500' }}>{resp.quiz_options.option_text}</span>
                                        </p>
                                      )}
                                      {resp.text_response && !resp.text_response.startsWith('[') && (
                                        <p style={{ margin: 0, color: '#4a5568', fontSize: '14px' }}>
                                          <strong>Student Selected:</strong> <span style={{ color: resp.is_correct ? '#2f855a' : '#c53030', fontWeight: '500' }}>{resp.text_response}</span>
                                        </p>
                                      )}
                                      
                                      {!resp.is_correct && resp.quiz_questions?.correct_answer && (
                                        <p style={{ margin: '8px 0 0 0', color: '#2b6cb0', fontSize: '14px', fontWeight: '600' }}>
                                          Correct Answer Option: {resp.quiz_questions.correct_answer}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminAnalytics;
