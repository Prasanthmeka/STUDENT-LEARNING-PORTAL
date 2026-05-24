import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { videoAPI } from '../services/api';
import '../styles/VideoPlayer.css';

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await videoAPI.getVideo(id);
        setVideo(response.data);
      } catch (err) {
        setError('Failed to load video');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading video...</div>;
  }

  if (error || !video) {
    return (
      <div className="video-error">
        <h2>{error || 'Video not found'}</h2>
        <button onClick={() => navigate('/student/dashboard')} className="btn-back">
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    // Handle different YouTube URL formats
    let videoId = null;
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1];
    } else if (url.match(/^[a-zA-Z0-9_-]{11}$/)) {
      // Assume it's already a video ID
      videoId = url;
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const embedUrl = getYouTubeEmbedUrl(video.youtube_url);

  return (
    <div className="video-player-container">
      <header className="player-header">
        <button onClick={() => navigate('/student/videos')} className="btn-back">
          ← Back to Videos
        </button>
        <h1>{video.title}</h1>
      </header>

      <div className="player-wrapper">
        {video.video_type === 'recorded' && embedUrl ? (
          <iframe
            className="video-iframe"
            src={embedUrl}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : video.video_type === 'live' ? (
          <div className="live-video-placeholder">
            <p>🔴 LIVE STREAM</p>
            <p>{video.live_stream_url || 'Live stream URL not configured'}</p>
          </div>
        ) : (
          <div className="video-error-placeholder">
            <p>Unable to load video</p>
          </div>
        )}
      </div>

      <div className="video-details">
        <div className="details-section">
          <h2>Video Details</h2>
          <div className="detail-item">
            <label>Title:</label>
            <p>{video.title}</p>
          </div>
          {video.description && (
            <div className="detail-item">
              <label>Description:</label>
              <p>{video.description}</p>
            </div>
          )}
          <div className="detail-item">
            <label>Type:</label>
            <p className={`type-badge ${video.video_type}`}>
              {video.video_type === 'recorded' ? '🎥 Recorded' : '🔴 Live Stream'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
