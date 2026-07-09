import React, { useState, useEffect } from 'react';
import api from '../services/api';
import VideoCard from '../components/VideoCard';
import { VideoGridSkeleton } from '../components/Skeletons';
import { Flame } from 'lucide-react';

const Trending = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrendingVideos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/videos/feed/trending');
      setVideos(res.data.data || []);
    } catch (err) {
      console.error('Error fetching trending videos:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingVideos();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-6 w-full max-w-[1600px] mx-auto min-h-screen">
        <div className="border-b border-light-border dark:border-dark-border pb-4">
          <div className="h-7 w-48 bg-light-hover dark:bg-dark-hover rounded skeleton-loading mb-2" />
          <div className="h-3 w-80 bg-light-hover dark:bg-dark-hover rounded skeleton-loading" />
        </div>
        <VideoGridSkeleton count={8} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 w-full max-w-[1600px] mx-auto min-h-screen select-none animate-fade-in">
      {/* Title Header */}
      <div className="border-b border-light-border dark:border-dark-border pb-4">
        <h1 className="text-xl md:text-2xl font-black text-light-text dark:text-dark-text tracking-wide uppercase flex items-center gap-2">
          <Flame size={24} className="text-youtube-red" /> Trending Feed
        </h1>
        <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
          The most viewed videos across the platform right now.
        </p>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-20 text-light-muted dark:text-dark-muted">
          <p className="font-semibold text-base">No trending videos found on the platform yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Trending;
