import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';
import { VideoGridSkeleton } from '../components/Skeletons';
import { useNavigate } from 'react-router-dom';
import { History, Trash2 } from 'lucide-react';

import useDocumentTitle from '../hooks/useDocumentTitle';

const WatchHistory = () => {
  useDocumentTitle('Watch History');
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading]);

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/videos/history/watch');
      setVideos(res.data.data || []);
    } catch (err) {
      console.error('Error fetching watch history:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchWatchHistory();
    }
  }, [isAuthenticated, authLoading]);

  const handleClearHistory = async () => {
    if (!window.confirm('Clear your entire watch history? This cannot be undone.')) return;

    try {
      await api.delete('/videos/history/watch');
      setVideos([]);
      alert('Watch history cleared successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clear watch history');
    }
  };

  const handleDeleteVideo = async (videoId) => {
    try {
      await api.delete(`/videos/history/watch/${videoId}`);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove video from history');
    }
  };

  if (authLoading || loading) return <VideoGridSkeleton count={4} />;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 w-full max-w-4xl mx-auto min-h-screen select-none">
      {/* Header Panel */}
      <div className="flex justify-between items-center border-b border-light-border dark:border-dark-border pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-light-text dark:text-dark-text tracking-wide uppercase flex items-center gap-2">
            <History size={24} className="text-youtube-red" /> Watch History
          </h1>
          <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
            Keep track of videos you recently watched on ViewFlow.
          </p>
        </div>

        {videos.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-4 py-2 bg-youtube-red/10 text-youtube-red hover:bg-youtube-red/20 text-xs font-bold rounded-xl transition-all"
          >
            <Trash2 size={14} /> Clear History
          </button>
        )}
      </div>

      {/* Videos List */}
      {videos.length === 0 ? (
        <div className="text-center py-20 text-light-muted dark:text-dark-muted">
          <History size={48} className="mx-auto text-light-muted dark:text-dark-muted/40 mb-3" />
          <p className="font-semibold text-lg">Your watch history is empty.</p>
          <p className="text-xs mt-0.5">Videos you watch will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {videos.map((video) => (
            <div key={video._id} className="relative group/history flex items-center gap-2 w-full">
              <div className="flex-1 min-w-0">
                <VideoCard video={video} horizontal={true} />
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDeleteVideo(video._id);
                }}
                className="p-2 hover:bg-youtube-red/10 text-brand-muted hover:text-youtube-red rounded-full transition-all cursor-pointer mr-2 shrink-0 md:opacity-0 group-hover/history:opacity-100 focus:opacity-100"
                title="Remove from watch history"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchHistory;
