import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI } from '../services/api';
import '../styles/AdminVideos.css';

const AdminVideos = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_type: 'recorded',
    youtube_url: '',
    subject: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  // Auto-clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchVideos = async () => {
    try {
      // Fetch all videos (admin view - including unpublished)
      const response = await fetch(`${process.env.REACT_APP_API_URL}/videos/admin`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setVideos(data);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await videoAPI.createVideo(formData);
      setMessage('Video uploaded successfully!');
      setFormData({
        title: '',
        description: '',
        video_type: 'recorded',
        youtube_url: '',
        subject: ''
      });
      setShowForm(false);
      fetchVideos();
    } catch (error) {
      setMessage('Failed to upload video: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (videoId, currentStatus) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/videos/${videoId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_published: !currentStatus
        })
      });

      if (response.ok) {
        setMessage(currentStatus ? 'Video unpublished!' : 'Video published!');
        fetchVideos();
      } else {
        setMessage('Failed to update video');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setMessage('Video deleted successfully!');
        fetchVideos();
      } else {
        setMessage('Failed to delete video');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-videos">
      <header className="page-header">
        <button onClick={() => navigate('/admin/dashboard')} className="btn-back">← Back</button>
        <h1>Manage Videos</h1>
        <p>Upload recorded videos or setup live streaming</p>
      </header>

      <div className="container">
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Video'}
        </button>

        {message && (
          <div className={`message ${message.includes('success') || message.includes('published') || message.includes('deleted') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="video-form">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Video title"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                placeholder="Video description"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Video Type</label>
              <select
                name="video_type"
                value={formData.video_type}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="recorded">Recorded</option>
                <option value="live">Live Stream</option>
              </select>
            </div>

            <div className="form-group">
              <label>Subject *</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Select Subject</option>
                <option value="Telugu">Telugu</option>
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
                <option value="Maths">Maths</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="Social">Social Studies</option>
              </select>
            </div>

            <div className="form-group">
              <label>YouTube URL *</label>
              <input
                type="url"
                name="youtube_url"
                value={formData.youtube_url}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            {message && (
              <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Uploading...' : 'Upload Video'}
            </button>
          </form>
        )}

        <section className="videos-section">
          <h2>Your Videos ({videos.length})</h2>
          {videos.length === 0 ? (
            <p className="no-videos">No videos uploaded yet</p>
          ) : (
            <div className="videos-list">
              {videos.map((video) => (
                <div key={video.id} className="video-item">
                  <div className="video-info">
                    <h3>{video.title}</h3>
                    <p>{video.description}</p>
                    <div className="video-meta">
                      <span className={`type ${video.video_type}`}>
                        {video.video_type === 'recorded' ? '🎥 Recorded' : '🔴 Live'}
                      </span>
                      <span className={`status ${video.is_published ? 'published' : 'draft'}`}>
                        {video.is_published ? '✓ Published' : '⏳ Draft'}
                      </span>
                    </div>
                  </div>
                  <div className="video-actions">
                    <button
                      onClick={() => handlePublish(video.id, video.is_published)}
                      disabled={loading}
                      className={`btn-action ${video.is_published ? 'btn-unpublish' : 'btn-publish'}`}
                    >
                      {video.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      disabled={loading}
                      className="btn-action btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminVideos;
