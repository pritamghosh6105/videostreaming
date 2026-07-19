import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';
import { VideoGridSkeleton } from '../components/Skeletons';
import { useNavigate, Link } from 'react-router-dom';
import { Tv, Users } from 'lucide-react';

import useDocumentTitle from '../hooks/useDocumentTitle';

const Subscriptions = () => {
  useDocumentTitle('Subscriptions');
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const [videos, setVideos] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    if (!authLoading && isAuthenticated) {
      const loadFeed = async () => {
        try {
          const channelRes = await api.get('/users/subscriptions');
          const list = channelRes.data.data || [];
          if (ignore) return;
          setChannels(list);

          if (list.length === 0) {
            setVideos([]);
            setLoading(false);
            return;
          }

          const videoPromises = list.map((ch) =>
            api.get(`/videos?userId=${ch._id}&limit=6`).catch(() => ({ data: { data: [] } }))
          );
          
          const results = await Promise.all(videoPromises);
          
          if (!ignore) {
            const merged = results
              .flatMap((r) => r.data?.data || [])
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setVideos(merged);
          }
        } catch (err) {
          if (!ignore) {
            console.error('Error fetching subscriptions feed:', err.message);
          }
        } finally {
          if (!ignore) {
            setLoading(false);
          }
        }
      };
      loadFeed();
    }
    return () => {
      ignore = true;
    };
  }, [isAuthenticated, authLoading]);

  if (authLoading || loading) return <VideoGridSkeleton count={8} />;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 w-full max-w-[1600px] mx-auto min-h-screen select-none">
      {/* Title Header */}
      <div className="border-b border-light-border dark:border-dark-border pb-4">
        <h1 className="text-xl md:text-2xl font-black text-light-text dark:text-dark-text tracking-wide uppercase flex items-center gap-2">
          <Tv size={24} className="text-youtube-red" /> Subscription Feed
        </h1>
        <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
          Chronological video feed of creators you subscribed to.
        </p>
      </div>

      {channels.length === 0 ? (
        <div className="text-center py-20 text-light-muted dark:text-dark-muted max-w-sm mx-auto flex flex-col items-center gap-3">
          <Users size={48} className="text-light-muted dark:text-dark-muted/50" />
          <p className="font-semibold text-lg">You haven't subscribed to any channels yet.</p>
          <p className="text-xs">Explore recommended videos on the home feed and click subscribe on channels you like!</p>
          <Link to="/" className="px-5 py-2 bg-youtube-red text-white text-xs font-bold rounded-full shadow mt-2">
            Explore Videos
          </Link>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 text-light-muted">
          <p className="font-semibold text-base">Subscribed creators haven't uploaded any videos yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
