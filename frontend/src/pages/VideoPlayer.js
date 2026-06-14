import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { videoAPI } from '../services/api';
import StudentLayout from '../layouts/StudentLayout';
import PageHeader from '../components/layout/PageHeader';
import GoBackButton from '../components/layout/GoBackButton';
import { 
  HelpCircle, 
  Edit3
} from 'lucide-react';

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Component States
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
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

  // Extract YouTube ID from URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    let videoId = null;
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1];
    } else if (url.match(/^[a-zA-Z0-9_-]{11}$/)) {
      videoId = url;
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : null;
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="h-[500px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-saas skeleton-pulse" />
      </StudentLayout>
    );
  }

  if (error || !video) {
    return (
      <StudentLayout>
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-saas max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 flex items-center justify-center text-rose-500 mx-auto mb-4">
            <HelpCircle className="w-8 h-8 stroke-1.5" />
          </div>
          <h4 className="font-extrabold text-slate-800 dark:text-white text-lg leading-tight">Video Not Found</h4>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            The lecture you are looking for might have been unpublished or removed by the instructor.
          </p>
          <button 
            onClick={() => navigate('/student/videos')}
            className="mt-6 py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs tracking-wide transition-smooth shadow-md shadow-indigo-600/10"
          >
            Back to Video Hub
          </button>
        </div>
      </StudentLayout>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(video.youtube_url);

  return (
    <StudentLayout>
      <GoBackButton to="/student/videos" replace={true} />

      {/* Header Panel */}
      <PageHeader 
        title={video.title}
        subtitle={`Subject Course Module: ${video.subject}`}
        parentLabel="Videos"
        parentPath="/student/videos"
        showBackButton={false}
      />

      {/* Dual Column Streaming & Interactive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Player Screen (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Video Player Box */}
          <div className="bg-slate-950 rounded-3xl border border-slate-900 shadow-premium shadow-indigo-950/15 overflow-hidden aspect-video relative flex items-center justify-center">
            {video.video_type === 'recorded' && embedUrl ? (
              <iframe
                className="w-full h-full border-none"
                src={embedUrl}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : video.video_type === 'live' ? (
              <div className="text-center p-8 text-white space-y-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest bg-rose-500 text-white py-1.5 px-3.5 rounded-full shadow-md animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  Live Streaming Active
                </span>
                <h3 className="text-xl font-bold font-sans">Connecting to live lecture room...</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Live stream room url: <a href={video.live_stream_url} target="_blank" rel="noreferrer" className="text-indigo-400 underline truncate block mt-1">{video.live_stream_url || 'Zoom Link'}</a>
                </p>
              </div>
            ) : (
              <div className="text-center text-slate-400 p-8">
                <p className="font-bold">Stream error: Unable to load video file.</p>
              </div>
            )}
          </div>

          {/* Details block */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-saas">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <h3 className="font-black text-slate-800 dark:text-white text-lg tracking-tight font-sans">Lecture Description</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-extrabold uppercase tracking-wide bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-indigo-500 dark:text-indigo-400 px-2 py-0.5 rounded">
                    {video.subject}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Uploaded: {new Date(video.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <button 
                onClick={() => navigate('/student/quizzes')}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold text-xs tracking-wide shadow-md shadow-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/20 transition-smooth"
              >
                Take Related Quiz
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed pt-4 font-sans whitespace-pre-line">
              {video.description || "In this lesson, we cover complete theoretical details, historical implications, equations, and solutions related to the current chapter. Please review the recommended materials in the resources tab."}
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-saas overflow-hidden flex flex-col h-[480px]">
            {/* Header Title */}
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 p-4 shrink-0">
              <Edit3 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span className="font-extrabold text-slate-800 dark:text-white text-sm font-sans">Lecture Notes</span>
            </div>

            {/* Content area */}
            <div className="flex-grow p-5 overflow-y-auto">
              <div className="h-full flex flex-col justify-between space-y-4">
                <div className="flex-grow flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Take class notes</span>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Write your quick notes here... They will remain active for your current lecture session!"
                    className="w-full flex-grow p-3 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-smooth resize-none h-[280px]"
                  />
                </div>
                <button
                  onClick={() => alert('Notes saved locally to session!')}
                  className="w-full py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white font-bold text-xs tracking-wide transition-smooth shadow-sm"
                >
                  Save Session Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default VideoPlayer;
