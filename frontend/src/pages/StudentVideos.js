import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SubjectFilter from '../components/SubjectFilter';
import '../styles/StudentVideos.css';

const StudentVideos = () => {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await videoAPI.getVideos();
      setVideos(response.data);
      setFilteredVideos(response.data);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByType = (type) => {
    setSelectedType(type);
    applyFilters(type, selectedSubject);
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    applyFilters(selectedType, subject);
  };

  const applyFilters = (type, subject) => {
    let filtered = videos;

    // Filter by type
    if (type !== 'all') {
      filtered = filtered.filter(v => v.video_type === type);
    }

    // Filter by subject
    if (subject !== 'All') {
      filtered = filtered.filter(v => v.subject === subject);
    }

    setFilteredVideos(filtered);
  };

  const recordedCount = videos.filter(v => v.video_type === 'recorded').length;
  const liveCount = videos.filter(v => v.video_type === 'live').length;

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="student-videos">
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
        <a href="/student/videos" className="active">Videos</a>
        <a href="/student/materials">Materials</a>
        <a href="/student/quizzes">Quizzes</a>
        <a href="/student/leaderboard">Leaderboard</a>
      </nav>

      <section className="videos-section">
        <h2>Available Videos</h2>

        <SubjectFilter selectedSubject={selectedSubject} onSubjectChange={handleSubjectChange} />

        <div className="filter-buttons">
          <button
            className={`filter-btn ${selectedType === 'all' ? 'active' : ''}`}
            onClick={() => filterByType('all')}
          >
            All Videos ({videos.length})
          </button>
          <button
            className={`filter-btn ${selectedType === 'recorded' ? 'active' : ''}`}
            onClick={() => filterByType('recorded')}
          >
            📹 Recorded ({recordedCount})
          </button>
          <button
            className={`filter-btn ${selectedType === 'live' ? 'active' : ''}`}
            onClick={() => filterByType('live')}
          >
            🔴 Live ({liveCount})
          </button>
        </div>

        {filteredVideos.length === 0 ? (
          <p className="no-content">No videos available</p>
        ) : (
          <div className="videos-grid">
            {filteredVideos.map((video) => {
              const videoId = video.youtube_url?.includes('v=') 
                ? video.youtube_url.split('v=')[1].split('&')[0]
                : video.youtube_url?.split('youtu.be/')[1]?.split('?')[0];
              const thumbnailUrl = videoId 
                ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                : null;

              return (
              <div key={video.id} className="video-card">
                <div 
                  className="video-thumbnail"
                  onClick={() => navigate(`/student/videos/${video.id}`)}
                  style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                >
                  {video.video_type === 'recorded' && thumbnailUrl ? (
                    <>
                      <img 
                        src={thumbnailUrl}
                        alt={video.title}
                        style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '48px',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        borderRadius: '50%',
                        width: '64px',
                        height: '64px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        ▶
                      </div>
                    </>
                  ) : (
                    <div className="live-thumbnail">
                      <div className="live-icon">🔴</div>
                      <div>LIVE</div>
                    </div>
                  )}
                </div>
                <div className="video-info">
                  <h3>{video.title}</h3>
                  <p>{video.description}</p>
                  <a href={`/student/videos/${video.id}`} className="btn-view">
                    Watch Video →
                  </a>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentVideos;
