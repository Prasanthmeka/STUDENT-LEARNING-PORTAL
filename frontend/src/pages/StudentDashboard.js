import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { aiAPI } from '../services/api';
import '../styles/StudentDashboard.css';
import '../styles/AIMascot.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [recs, setRecs] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await aiAPI.getRecommendations();
        setRecs(response.data);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoadingRecs(false);
      }
    };
    fetchRecommendations();
  }, []);

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

      {/* Personalized AI Recommendations Section */}
      <section className="ai-recs-section" style={{ padding: '0 20px', marginTop: '24px' }}>
        <div className="ai-recs-widget">
          <div className="ai-recs-header">
            <img src="/assets/mascot.png" alt="Mascot" className="ai-recs-mascot" />
            <h2 className="ai-recs-title">Personalized AI Learning Recommendations</h2>
          </div>
          
          {loadingRecs ? (
            <div className="ai-recs-loading">
              <div className="ai-recs-loading-spinner"></div>
              <p>Analyzing your quiz attempts and course materials...</p>
            </div>
          ) : recs ? (
            <div className="ai-recs-body">
              <div className="ai-recs-weakness-list">
                <div className="ai-recs-weakness-item">
                  {recs.weakSubjects && recs.weakSubjects.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', marginRight: '10px' }}>
                        Focus Areas:
                      </span>
                      {recs.weakSubjects.map(subj => (
                        <span key={subj} className="ai-recs-subject-badge">{subj}</span>
                      ))}
                    </div>
                  )}
                  
                  <p className="ai-recs-analysis">{recs.reasoning}</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                    {recs.recommendedQuizzes && recs.recommendedQuizzes.length > 0 && (
                      <div className="ai-recs-suggestions">
                        <span className="ai-recs-suggestion-title">Recommended Quizzes</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                          {recs.recommendedQuizzes.map(quiz => (
                            <a key={quiz.id} href={`/student/quiz/${quiz.id}`} className="ai-recs-link">
                              ✏️ {quiz.title} ({quiz.subject})
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {recs.recommendedMaterials && recs.recommendedMaterials.length > 0 && (
                      <div className="ai-recs-suggestions">
                        <span className="ai-recs-suggestion-title">Recommended Materials</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                          {recs.recommendedMaterials.map(mat => (
                            <a key={mat.id} href="/student/materials" className="ai-recs-link">
                              📚 {mat.title} ({mat.subject})
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>
              No recommendations found yet. Complete quizzes to get personalized recommendations!
            </p>
          )}
        </div>
      </section>

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
