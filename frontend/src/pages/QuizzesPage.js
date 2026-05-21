import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SubjectFilter from '../components/SubjectFilter';
import FilterModal from '../components/FilterModal';
import '../styles/QuizzesPage.css';

const QuizzesPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await quizAPI.getQuizzes();
      setQuizzes(response.data);
      setFilteredQuizzes(response.data);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByStatus = (status) => {
    applyFilters(status, selectedSubject);
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    applyFilters(selectedFilter, subject);
  };

  const applyFilters = (status, subject) => {
    let filtered = quizzes;

    if (status === 'all') {
      filtered = quizzes;
    } else if (status === 'short') {
      filtered = quizzes.filter(q => q.time_limit_minutes <= 15);
    } else if (status === 'long') {
      filtered = quizzes.filter(q => q.time_limit_minutes > 15);
    }

    if (subject !== 'All') {
      filtered = filtered.filter(q => q.subject === subject);
    }

    setFilteredQuizzes(filtered);
  };

  const shortQuizCount = quizzes.filter(q => q.time_limit_minutes <= 15).length;
  const longQuizCount = quizzes.filter(q => q.time_limit_minutes > 15).length;
  const [showStatusModal, setShowStatusModal] = useState(false);

  if (loading) return <div className="loading">Loading quizzes...</div>;

  return (
    <div className="quizzes-page">
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
        <a href="/student/quizzes" className="active">Quizzes</a>
        <a href="/student/leaderboard">Leaderboard</a>
      </nav>

      <section className="quizzes-section">
        <h2>Available Quizzes</h2>

        <SubjectFilter selectedSubject={selectedSubject} onSubjectChange={handleSubjectChange} />

        <div className="filter-dropdowns">
          <button className="status-select" onClick={() => setShowStatusModal(true)}>
            {selectedFilter === 'all' ? `All Quizzes (${quizzes.length})` : selectedFilter === 'short' ? `⚡ Quick (${shortQuizCount})` : `📖 Comprehensive (${longQuizCount})`}
          </button>

          <FilterModal
            isOpen={showStatusModal}
            title="Filter Quizzes"
            options={[
              { value: 'all', label: `All Quizzes (${quizzes.length})` },
              { value: 'short', label: `⚡ Quick (${shortQuizCount})` },
              { value: 'long', label: `📖 Comprehensive (${longQuizCount})` }
            ]}
            selected={selectedFilter}
            onClose={() => setShowStatusModal(false)}
            onSelect={(val) => {
              setSelectedFilter(val);
              filterByStatus(val);
            }}
          />
        </div>

        {filteredQuizzes.length === 0 ? (
          <p className="no-content">No quizzes available</p>
        ) : (
          <div className="quizzes-grid">
            {filteredQuizzes.map((quiz) => (
              <div key={quiz.id} className="quiz-card">
                <div className="quiz-header">
                  <h3>{quiz.title}</h3>
                  <span className="question-count">{quiz.total_questions} Questions</span>
                </div>
                <p className="quiz-description">{quiz.description}</p>
                <div className="quiz-meta">
                  <span>⏱️ {quiz.time_limit_minutes || 'No'} min</span>
                  <span>✅ Pass: {quiz.passing_score}%</span>
                </div>
                <a href={`/student/quiz/${quiz.id}`} className="btn-start-quiz">
                  Start Quiz →
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default QuizzesPage;
