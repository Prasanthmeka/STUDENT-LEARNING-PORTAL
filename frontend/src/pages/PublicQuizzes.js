import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';
import '../styles/LandingPage.css';

const renderSubjectIcon = (subjectName) => {
  switch (subjectName.toLowerCase()) {
    case 'telugu':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="telCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <filter id="telShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#4f46e5" floodOpacity="0.25"/>
            </filter>
          </defs>
          <circle cx="50" cy="50" r="44" fill="url(#telCircleGrad)" filter="url(#telShadow)"/>
          <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5"/>
          <text x="50" y="50" fontFamily="'Outfit', 'Noto Sans Telugu', sans-serif" fontSize="38" fontWeight="900" fill="#ffffff" textAnchor="middle" dominantBaseline="central">అ</text>
        </svg>
      );
    case 'hindi':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="hinCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <filter id="hinShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#4f46e5" floodOpacity="0.25"/>
            </filter>
          </defs>
          <circle cx="50" cy="50" r="44" fill="url(#hinCircleGrad)" filter="url(#hinShadow)"/>
          <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5"/>
          <text x="50" y="50" fontFamily="'Outfit', 'Noto Sans Devanagari', sans-serif" fontSize="38" fontWeight="900" fill="#ffffff" textAnchor="middle" dominantBaseline="central">अ</text>
        </svg>
      );
    case 'english':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="engCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <filter id="engShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#1e3a8a" floodOpacity="0.25"/>
            </filter>
          </defs>
          <circle cx="50" cy="50" r="44" fill="url(#engCircleGrad)" filter="url(#engShadow)"/>
          <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5"/>
          <text x="50" y="50" fontFamily="'Outfit', 'DM Sans', 'Jost', sans-serif" fontSize="42" fontWeight="800" fill="#ffffff" textAnchor="middle" dominantBaseline="central">A</text>
        </svg>
      );
    case 'mathematics':
    case 'maths':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="matCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <filter id="matShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#4f46e5" floodOpacity="0.25"/>
            </filter>
          </defs>
          <circle cx="50" cy="50" r="44" fill="url(#matCircleGrad)" filter="url(#matShadow)"/>
          <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5"/>
          <text x="50" y="52" fontFamily="'Outfit', sans-serif" fontSize="38" fontWeight="900" fill="#ffffff" textAnchor="middle" dominantBaseline="central">π</text>
        </svg>
      );
    case 'physics':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="phyCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
            <filter id="phyShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0891b2" floodOpacity="0.25"/>
            </filter>
          </defs>
          <circle cx="50" cy="50" r="44" fill="url(#phyCircleGrad)" filter="url(#phyShadow)"/>
          <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5"/>
          <ellipse cx="50" cy="50" rx="26" ry="8" fill="none" stroke="#ffffff" strokeWidth="2.5" transform="rotate(30, 50, 50)"/>
          <ellipse cx="50" cy="50" rx="26" ry="8" fill="none" stroke="#ffffff" strokeWidth="2.5" transform="rotate(-30, 50, 50)"/>
          <ellipse cx="50" cy="50" rx="26" ry="8" fill="none" stroke="#ffffff" strokeWidth="2.5" transform="rotate(90, 50, 50)"/>
          <circle cx="50" cy="50" r="6" fill="#ffffff"/>
        </svg>
      );
    case 'chemistry':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="chCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="chShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#10b981" floodOpacity="0.25"/>
            </filter>
          </defs>
          <circle cx="50" cy="50" r="44" fill="url(#chCircleGrad)" filter="url(#chShadow)"/>
          <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5"/>
          <path d="M40,28 H60 M45,28 V45 L32,68 C30,73 35,78 41,78 H59 C65,78 70,73 68,68 L55,45 V28" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'biology':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="bioCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>
            <filter id="bioShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#be123c" floodOpacity="0.25"/>
            </filter>
          </defs>
          <circle cx="50" cy="50" r="44" fill="url(#bioCircleGrad)" filter="url(#bioShadow)"/>
          <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5"/>
          <ellipse cx="50" cy="50" rx="18" ry="18" fill="none" stroke="#ffffff" strokeWidth="4"/>
        </svg>
      );
    case 'social studies':
    case 'social':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="socCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <filter id="socShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#d97706" floodOpacity="0.25"/>
            </filter>
          </defs>
          <circle cx="50" cy="50" r="44" fill="url(#socCircleGrad)" filter="url(#socShadow)"/>
          <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5"/>
          <circle cx="50" cy="50" r="24" fill="none" stroke="#ffffff" strokeWidth="3.5"/>
          <line x1="26" y1="50" x2="74" y2="50" stroke="#ffffff" strokeWidth="2"/>
        </svg>
      );
    default:
      return null;
  }
};

const getSubjectColorHex = (subject) => {
  const colors = {
    'telugu': '#6366f1',
    'hindi': '#ea580c',
    'english': '#2563eb',
    'maths': '#4f46e5',
    'physics': '#06b6d4',
    'chemistry': '#059669',
    'biology': '#ec4899',
    'social': '#f59e0b',
    'social studies': '#f59e0b'
  };
  return colors[subject?.toLowerCase()?.trim()] || '#8b5cf6';
};

const PublicQuizzes = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await quizAPI.getQuizzes();
        const competitive = (response.data || []).filter(q => q.is_published && q.is_competitive);
        setQuizzes(competitive);
      } catch (err) {
        console.error('Failed to fetch competitive quizzes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  return (
    <div className="landing-container">
      {/* Banner using Eduleb's section-top style */}
      <section className="section-top">
        <div className="container">
          <div className="row">
            <div className="col-lg-10 offset-lg-1 col-12 text-center">
              <div className="section-top-title">
                <h1 style={{ color: '#ffffff', fontSize: '48px', fontWeight: '800', fontFamily: '"Jost", sans-serif' }}>
                  Competitive Quizzes
                </h1>
                <p style={{ color: '#ebecff', fontSize: '18px', marginTop: '15px', fontWeight: '500', lineHeight: '28px', maxWidth: '650px', margin: '15px auto 0' }}>
                  Challenge yourself with our online competitive mock exams. Pick a quiz and test your concepts now!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Quizzes List grid */}
      <section className="quizzes-section" style={{ background: '#f8f9fc' }}>
        <div className="container">
          {loading ? (
            <div className="quizzes-grid">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="skeleton-card" />
              ))}
            </div>
          ) : quizzes.length === 0 ? (
            <div className="quizzes-empty-state">
              <div className="empty-icon-box">
                <i className="fa-regular fa-folder-open"></i>
              </div>
              <h4>No Competitive Quizzes Posted</h4>
              <p>Check back soon! Our team is curating premium competitive assessments for your courses.</p>
            </div>
          ) : (
            <div className="quizzes-grid">
              {quizzes.map((quiz) => (
                <div className="quiz-card-landing" key={quiz.id} style={{ borderBottom: `4px solid ${getSubjectColorHex(quiz.subject)}` }}>
                  <div className="quiz-card-top">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '22px' }}>
                      {renderSubjectIcon(quiz.subject)}
                    </div>
                    <h3>{quiz.title}</h3>
                    <p className="quiz-card-desc">{quiz.description || "A comprehensive test to evaluate conceptual knowledge and understanding."}</p>
                    <div className="quiz-metadata">
                      <span className="meta-item">
                        <i className="fa-solid fa-circle-question"></i> {quiz.total_questions || 5} Qs
                      </span>
                      <span className="meta-item">
                        <i className="fa-solid fa-clock"></i> {quiz.time_limit_minutes || 15} Mins
                      </span>
                    </div>
                  </div>
                  <div className="quiz-card-bottom">
                    <button 
                      onClick={() => navigate('/login?type=quiz')} 
                      className="start-quiz-btn"
                      style={{ color: getSubjectColorHex(quiz.subject), borderColor: `${getSubjectColorHex(quiz.subject)}33` }}
                    >
                      Start Quiz
                      <i className="fa-solid fa-arrow-right start-arrow"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PublicQuizzes;
