import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/ServicesPage.css';
import '../styles/LandingPage.css'; // Reuse landing page animations

function ServicesPage() {
  const subjects = [
    {
      id: 1,
      name: 'Telugu',
      icon: '📖',
      description: 'Learn Telugu language, literature, and grammar',
      color: '#FF6B6B'
    },
    {
      id: 2,
      name: 'Hindi',
      icon: '🗣️',
      description: 'Master Hindi language skills and literature',
      color: '#4ECDC4'
    },
    {
      id: 3,
      name: 'English',
      icon: '🇬🇧',
      description: 'Improve English communication and literature',
      color: '#45B7D1'
    },
    {
      id: 4,
      name: 'Maths',
      icon: '🔢',
      description: 'Master mathematical concepts and problem solving',
      color: '#FFA07A'
    },
    {
      id: 5,
      name: 'Physics',
      icon: '⚛️',
      description: 'Understand fundamental physics principles',
      color: '#98D8C8'
    },
    {
      id: 6,
      name: 'Chemistry',
      icon: '🧪',
      description: 'Explore chemistry and molecular structures',
      color: '#F7DC6F'
    },
    {
      id: 7,
      name: 'Biology',
      icon: '🧬',
      description: 'Study living organisms and biological processes',
      color: '#BB8FCE'
    },
    {
      id: 8,
      name: 'Social Studies',
      icon: '🌍',
      description: 'Learn history, geography, and social science',
      color: '#85C1E2'
    }
  ];

  return (
    <div className="landing-container">
      <div className="animated-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
        <div className="blob blob-5"></div>
      </div>

      <div className="services-container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="services-header">
        <h1>Our Subjects</h1>
        <p>Choose your subject and start learning today</p>
      </div>

      <div className="services-grid">
        {subjects.map((subject) => (
          <div 
            key={subject.id} 
            className="service-card"
            style={{ borderTopColor: subject.color }}
          >
            <div className="service-icon" style={{ color: subject.color }}>
              {subject.icon}
            </div>
            <h3>{subject.name}</h3>
            <p>{subject.description}</p>
            <div className="service-actions">
              <Link 
                to="/login" 
                className="service-btn"
                style={{ backgroundColor: subject.color }}
              >
                Explore Videos
              </Link>
              <Link 
                to="/login" 
                className="service-btn-outline"
              >
                View Materials
              </Link>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

export default ServicesPage;
