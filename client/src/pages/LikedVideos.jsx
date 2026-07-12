import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';
import { VideoGridSkeleton } from '../components/Skeletons';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp } from 'lucide-react';

import useDocumentTitle from '../hooks/useDocumentTitle';

const LikedVideos = () => {
  useDocumentTitle('Liked Videos');
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading]);

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLikedVideos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/likes/videos');
      setVideos(res.data.data || []);
    } catch (err) {
      console.error('Error fetching liked videos:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchLikedVideos();
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading || loading) return <VideoGridSkeleton count={4} />;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 w-full max-w-4xl mx-auto min-h-screen select-none">
      {/* Title Header */}
      <div className="border-b border-light-border dark:border-dark-border pb-4">
        <h1 className="text-xl md:text-2xl font-black text-light-text dark:text-dark-text tracking-wide uppercase flex items-center gap-2">
          <ThumbsUp size={24} className="text-youtube-red" /> Liked Videos
        </h1>
        <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
          List of videos you gave thumbs up on ViewFlow.
        </p>
      </div>

      {/* Videos List */}
      {videos.length === 0 ? (
        <div className="text-center py-20 text-light-muted dark:text-dark-muted">
          <ThumbsUp size={48} className="mx-auto text-light-muted dark:text-dark-muted/40 mb-3" />
          <p className="font-semibold text-lg">You haven't liked any videos yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} horizontal={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedVideos;
