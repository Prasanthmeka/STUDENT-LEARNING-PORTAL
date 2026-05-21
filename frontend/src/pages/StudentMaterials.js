import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { materialAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SubjectFilter from '../components/SubjectFilter';
import '../styles/StudentMaterials.css';
import { Document, Page, pdfjs } from 'react-pdf';

// Point pdfjs worker to CDN (bundlers may require different setup)
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const StudentMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [materialContent, setMaterialContent] = useState(null);
  const [viewerUrl, setViewerUrl] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
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
    setMaterialContent(null);
    setViewerUrl(null);
    setContentLoading(true);

    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const proxyUrl = `${API_BASE}/materials/render?url=${encodeURIComponent(material.github_url)}`;

    try {
      // Probe the proxied resource to decide how to present it
      const headResp = await fetch(proxyUrl, { method: 'HEAD' });
      const contentType = (headResp.headers.get('content-type') || '').toLowerCase();

      if (contentType.startsWith('text/') || contentType.includes('json')) {
        const response = await fetch(proxyUrl);
        const text = await response.text();
        setMaterialContent(text);
        setViewerUrl(null);
        setDownloadUrl(null);
      } else if (contentType.includes('pdf')) {
        // fetch PDF bytes and render with react-pdf
        try {
          const resp = await fetch(proxyUrl);
          const arrayBuffer = await resp.arrayBuffer();
          const uint8 = new Uint8Array(arrayBuffer);
          setPdfData(uint8);
          setNumPages(null);
          setPageNumber(1);
          setViewerUrl(null);
          setDownloadUrl(null);
          setMaterialContent(null);
        } catch (e) {
          console.error('Failed to fetch PDF bytes:', e);
          setDownloadUrl(proxyUrl);
        }
      } else {
        // Unsupported to render in-browser reliably; offer download via proxy
        setViewerUrl(null);
        setMaterialContent(null);
        setDownloadUrl(proxyUrl);
      }
    } catch (error) {
      console.error('Failed to load material content:', error);
      setMaterialContent('Failed to load content: ' + error.message);
      setViewerUrl(null);
      setDownloadUrl(null);
    }

    setContentLoading(false);
  };

  const closeMaterialModal = () => {
    setSelectedMaterial(null);
    setMaterialContent(null);
    setPdfData(null);
    setNumPages(null);
    setPageNumber(1);
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
                  {(() => {
                    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
                    const proxyUrl = `${API_BASE}/materials/render?url=${encodeURIComponent(material.github_url)}`;
                    return (
                      <a
                        href={proxyUrl}
                        className="btn-download"
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        📥 Download
                      </a>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Material Viewer Modal - Only for Text Files */}
      {selectedMaterial && (
        <div className="material-modal" onClick={closeMaterialModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedMaterial.title}</h2>
              <button onClick={closeMaterialModal} className="btn-close">✕</button>
            </div>
            <div className="modal-body">
              {contentLoading ? (
                <div className="loading">Loading material...</div>
              ) : selectedMaterial.file_type === 'txt' || materialContent ? (
                <pre className="text-viewer">{materialContent}</pre>
              ) : pdfData ? (
                <div className="pdf-viewer">
                  <div className="pdf-controls">
                    <button onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1}>Prev</button>
                    <span>Page {pageNumber}{numPages ? ` / ${numPages}` : ''}</span>
                    <button onClick={() => setPageNumber(p => Math.min(numPages || p + 1, p + 1))} disabled={numPages ? pageNumber >= numPages : false}>Next</button>
                    {downloadUrl ? (
                      <a href={downloadUrl} className="btn-download" target="_blank" rel="noopener noreferrer">📥 Download</a>
                    ) : null}
                  </div>
                  <Document
                    file={{ data: pdfData }}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    loading={<div className="loading">Loading PDF...</div>}
                  >
                    <Page pageNumber={pageNumber} width={800} />
                  </Document>
                </div>
              ) : viewerUrl ? (
                <iframe
                  title={selectedMaterial.title}
                  src={viewerUrl}
                  style={{ width: '100%', height: '80vh', border: 'none' }}
                />
              ) : downloadUrl ? (
                <div className="download-fallback">
                  <p>Preview unavailable. You can download the file instead:</p>
                  <a href={downloadUrl} className="btn-download" target="_blank" rel="noopener noreferrer">📥 Download</a>
                </div>
              ) : (
                <div className="loading">Viewer unavailable for this file</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentMaterials;
