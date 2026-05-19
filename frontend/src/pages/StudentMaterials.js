import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { materialAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SubjectFilter from '../components/SubjectFilter';
import '../styles/StudentMaterials.css';

const StudentMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [materialContent, setMaterialContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await materialAPI.getMaterials();
      setMaterials(response.data || []);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMaterial = async (material) => {
    setSelectedMaterial(material);
    setContentLoading(true);

    // For text-based files, fetch the content
    if (material.file_type === 'txt') {
      try {
        const response = await fetch(material.github_url);
        const text = await response.text();
        setMaterialContent(text);
      } catch (error) {
        console.error('Failed to load material content:', error);
        setMaterialContent('Failed to load content: ' + error.message);
      }
    }

    setContentLoading(false);
  };

  const closeMaterialModal = () => {
    setSelectedMaterial(null);
    setMaterialContent(null);
  };

  const filteredMaterials = materials.filter(m => {
    const typeMatch = filter === 'all' || m.file_type === filter;
    const subjectMatch = selectedSubject === 'All' || m.subject === selectedSubject;
    return typeMatch && subjectMatch;
  });

  if (loading) {
    return <div className="loading">Loading materials...</div>;
  }

  return (
    <div className="student-materials">
      <header className="dashboard-header">
        <div className="header-top">
          <button onClick={() => navigate('/student/dashboard')} className="btn-back">← Back</button>
          <div>
            <h1>Study Materials</h1>
            <p>Welcome, {user?.full_name}</p>
          </div>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <a href="/student/videos">Videos</a>
        <a href="/student/materials" className="active">Materials</a>
        <a href="/student/quizzes">Quizzes</a>
        <a href="/student/leaderboard">Leaderboard</a>
      </nav>

      <section className="materials-section">
        <div className="materials-header">
          <h2>Available Study Materials</h2>
          <SubjectFilter selectedSubject={selectedSubject} onSubjectChange={setSelectedSubject} />
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({materials.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'pdf' ? 'active' : ''}`}
              onClick={() => setFilter('pdf')}
            >
              PDF ({materials.filter(m => m.file_type === 'pdf').length})
            </button>
            <button 
              className={`filter-btn ${filter === 'doc' ? 'active' : ''}`}
              onClick={() => setFilter('doc')}
            >
              Documents ({materials.filter(m => m.file_type === 'doc').length})
            </button>
            <button 
              className={`filter-btn ${filter === 'txt' ? 'active' : ''}`}
              onClick={() => setFilter('txt')}
            >
              Text ({materials.filter(m => m.file_type === 'txt').length})
            </button>
          </div>
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="no-materials">
            <p>📚 No {filter !== 'all' ? filter.toUpperCase() : ''} materials available yet</p>
          </div>
        ) : (
          <div className="materials-grid">
            {filteredMaterials.map((material) => (
              <div key={material.id} className="material-card">
                <div className="material-icon">
                  {material.file_type === 'pdf' && '📄'}
                  {material.file_type === 'doc' && '📝'}
                  {material.file_type === 'txt' && '📋'}
                  {material.file_type === 'ppt' && '🎠'}
                  {material.file_type === 'other' && '📦'}
                </div>
                <div className="material-info">
                  <h3>{material.title}</h3>
                  {material.description && (
                    <p className="material-description">{material.description}</p>
                  )}
                  <div className="material-meta">
                    <span className="file-type">{material.file_type?.toUpperCase()}</span>
                    <span className="file-name">{material.file_name}</span>
                  </div>
                </div>
                <div className="material-actions">
                  {material.file_type === 'txt' ? (
                    <button
                      onClick={() => handleViewMaterial(material)}
                      className="btn-view"
                    >
                      👁️ View
                    </button>
                  ) : (
                    <a
                      href={material.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-download"
                      download
                    >
                      📥 Download
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Material Viewer Modal - Only for Text Files */}
      {selectedMaterial && selectedMaterial.file_type === 'txt' && (
        <div className="material-modal" onClick={closeMaterialModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedMaterial.title}</h2>
              <button onClick={closeMaterialModal} className="btn-close">✕</button>
            </div>
            <div className="modal-body">
              {contentLoading ? (
                <div className="loading">Loading material...</div>
              ) : (
                <pre className="text-viewer">{materialContent}</pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentMaterials;
