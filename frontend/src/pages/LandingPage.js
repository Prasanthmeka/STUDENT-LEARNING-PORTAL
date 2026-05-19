import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="landing-container">
      <div className="animated-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
        <div className="blob blob-5"></div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className={`hero-content ${isVisible ? 'visible' : ''}`}>
          <div className="hero-badge">🚀 Welcome to Excellence</div>
          <h1 className="hero-title">Master Your Studies With SLP</h1>
          <p className="hero-subtitle">The Complete Learning Platform for Class 6-10</p>
          <p className="hero-description">
            Unlock your potential with comprehensive courses in Telugu, Hindi, English, Maths, Physics, Chemistry, Biology, and Social Studies. Learn at your pace with interactive content, quizzes, and expert guidance.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              <span>Get Started Free</span>
              <span className="btn-icon">→</span>
            </Link>
            <Link to="/login" className="btn btn-secondary">
              <span>Already a Member?</span>
              <span className="btn-icon">→</span>
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">8+</span>
              <span className="stat-label">Subjects</span>
            </div>
            <div className="stat">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Videos</span>
            </div>
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Quizzes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose Our Platform?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Rich Content</h3>
            <p>Access comprehensive study materials, videos, and resources for all subjects</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Interactive Quizzes</h3>
            <p>Test your knowledge with our auto-graded quizzes and get instant feedback</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Leaderboard</h3>
            <p>Compete with peers and track your progress on our interactive leaderboard</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👨‍🏫</div>
            <h3>Expert Content</h3>
            <p>Learn from carefully curated content created by subject matter experts</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Live Doubt Clarification</h3>
            <p>Participate in live sessions to clear your doubts directly with subject experts</p>
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="subjects-section">
        <h2>Subjects We Cover</h2>
        <div className="subjects-grid">
          <div className="subject-badge">📖 Telugu</div>
          <div className="subject-badge">🗣️ Hindi</div>
          <div className="subject-badge">🇬🇧 English</div>
          <div className="subject-badge">🔢 Maths</div>
          <div className="subject-badge">⚛️ Physics</div>
          <div className="subject-badge">🧪 Chemistry</div>
          <div className="subject-badge">🧬 Biology</div>
          <div className="subject-badge">🌍 Social Studies</div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Start Your Learning Journey Today</h2>
        <p>Join thousands of students who are mastering their subjects on our platform</p>
        <Link to="/register" className="btn btn-primary">Register Now</Link>
      </section>
    </div>
  );
}

export default LandingPage;
