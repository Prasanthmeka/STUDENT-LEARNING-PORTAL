import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { materialAPI, getApiUrl } from '../services/api';
import '../styles/AdminMaterials.css';

const AdminMaterials = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_name: '',
    github_url: '',
    file_type: 'pdf',
    class: '',
    subject: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Auto-clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchMaterials = async () => {
    try {
      // Fetch all materials (admin view - including unpublished)
      const response = await fetch(`${getApiUrl()}/materials/admin`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setMaterials(data);
      }
    } catch (error) {
      console.error('Failed to fetch materials:', error);
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
      await materialAPI.createMaterial(formData);
      setMessage('Material uploaded successfully!');
      setFormData({
        title: '',
        description: '',
        file_name: '',
        github_url: '',
        file_type: 'pdf',
        class: '',
        subject: ''
      });
      setShowForm(false);
      fetchMaterials();
    } catch (error) {
      setMessage('Failed to upload material: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (materialId, currentStatus) => {
    setLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/materials/${materialId}`, {
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
        setMessage(currentStatus ? 'Material unpublished!' : 'Material published!');
        fetchMaterials();
      } else {
        setMessage('Failed to update material');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/materials/${materialId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setMessage('Material deleted successfully!');
        fetchMaterials();
      } else {
        setMessage('Failed to delete material');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-materials">
      <header className="page-header">
        <button onClick={() => navigate('/admin/dashboard')} className="btn-back">← Back</button>
        <h1>Manage Study Materials</h1>
        <p>Upload and manage study materials with GitHub links</p>
      </header>

      <div className="container">
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Material'}
        </button>

        {message && (
          <div className={`message ${message.includes('success') || message.includes('published') || message.includes('deleted') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="material-form">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="e.g., Chapter 1 Notes"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                placeholder="Brief description of the material"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>File Name *</label>
              <input
                type="text"
                name="file_name"
                value={formData.file_name}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="e.g., chapter1.pdf"
              />
            </div>

            <div className="form-group">
              <label>GitHub Raw URL *</label>
              <input
                type="url"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="https://raw.githubusercontent.com/user/repo/main/file.pdf"
              />
              <small>Get this from GitHub: Right-click file → Raw → Copy URL</small>
            </div>

            <div className="form-group">
              <label>Class *</label>
              <select
                name="class"
                value={formData.class}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Select Class</option>
                <option value="Class 6">Class 6</option>
                <option value="Class 7">Class 7</option>
                <option value="Class 8">Class 8</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
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

            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Uploading...' : 'Upload Material'}
            </button>
          </form>
        )}

        <section className="materials-section">
          <h2>Your Materials ({materials.length})</h2>
          {materials.length === 0 ? (
            <p className="no-materials">No materials uploaded yet</p>
          ) : (
            <div className="materials-list">
              {materials.map((material) => (
                <div key={material.id} className="material-item">
                  <div className="material-info">
                    <h3>{material.title}</h3>
                    {material.description && <p>{material.description}</p>}
                    <div className="material-meta">
                      <span className="class-badge" style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', marginRight: '8px' }}>
                        🏫 {material.class || 'All Classes'}
                      </span>
                      <span className="file-name">{material.file_name}</span>
                      <span className={`status ${material.is_published ? 'published' : 'draft'}`}>
                        {material.is_published ? '✓ Published' : '⏳ Draft'}
                      </span>
                    </div>
                  </div>
                  <div className="material-actions">
                    <button
                      onClick={() => handlePublish(material.id, material.is_published)}
                      disabled={loading}
                      className={`btn-action ${material.is_published ? 'btn-unpublish' : 'btn-publish'}`}
                    >
                      {material.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleDelete(material.id)}
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

export default AdminMaterials;
