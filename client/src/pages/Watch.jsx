import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import CommentSection from '../components/CommentSection';
import PlaylistModal from '../components/PlaylistModal';
import VideoCard, { getMediaUrl, formatViews, formatRelativeTime } from '../components/VideoCard';
import { WatchPageSkeleton } from '../components/Skeletons';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  FolderHeart, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  Sparkles,
  CheckCircle,
  Eye,
  Calendar
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Watch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedVideos, setRelatedVideos] = useState([]);
  
  // Interaction states
  const [reaction, setReaction] = useState(null); // 'like', 'dislike', or null
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribers, setSubscribers] = useState(0);
  const [subLoading, setSubLoading] = useState(false);

  // UI state
  const [descExpanded, setDescExpanded] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  // Fetch video details
  const fetchVideoDetails = async () => {
    if (!video) {
      setLoading(true);
    }
    try {
      // Fetch details and related recommendations in parallel
      const [res, relatedRes] = await Promise.all([
        api.get(`/videos/${id}`),
        api.get(`/videos/${id}/related`)
      ]);

      const data = res.data.data;
      setVideo(data);
      setLikes(data.likesCount || 0);
      setDislikes(data.dislikesCount || 0);
      setReaction(data.userReaction);
      setIsSubscribed(data.isSubscribed);
      setSubscribers(data.owner?.subscribersCount || 0);
      setRelatedVideos(relatedRes.data.data || []);
    } catch (err) {
      console.error('Error loading video Watch details:', err.message);
      showToast('Failed to load video.', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchVideoDetails();
  }, [id]);

  // Handle Like/Dislike click (Optimistic UI update)
  const handleReaction = async (type) => {
    if (!isAuthenticated) {
      showToast('Please log in to react to this video', 'error');
      return;
    }

    const prevReaction = reaction;
    const prevLikes = likes;
    const prevDislikes = dislikes;

    let targetReaction = null;
    let nextLikes = likes;
    let nextDislikes = dislikes;

    if (type === 'like') {
      if (reaction === 'like') {
        targetReaction = null;
        nextLikes = Math.max(0, likes - 1);
      } else {
        targetReaction = 'like';
        nextLikes = likes + 1;
        if (reaction === 'dislike') {
          nextDislikes = Math.max(0, dislikes - 1);
        }
      }
    } else {
      if (reaction === 'dislike') {
        targetReaction = null;
        nextDislikes = Math.max(0, dislikes - 1);
      } else {
        targetReaction = 'dislike';
        nextDislikes = dislikes + 1;
        if (reaction === 'like') {
          nextLikes = Math.max(0, likes - 1);
        }
      }
    }

    setReaction(targetReaction);
    setLikes(nextLikes);
    setDislikes(nextDislikes);

    try {
      const urlType = type === 'like' ? 'v' : 'd';
      const res = await api.post(`/likes/toggle/${urlType}/${id}`);
      const { liked, disliked } = res.data.data;

      let finalReaction = null;
      if (liked) finalReaction = 'like';
      else if (disliked) finalReaction = 'dislike';
      
      setReaction(finalReaction);
    } catch (err) {
      console.error('Reaction toggle failed:', err.message);
      setReaction(prevReaction);
      setLikes(prevLikes);
      setDislikes(prevDislikes);
    }
  };

  // Handle Subscription toggle
  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      showToast('Please log in to subscribe to this channel', 'error');
      return;
    }
    if (video.owner?._id === user._id) {
      showToast('You cannot subscribe to your own channel', 'error');
      return;
    }

    setSubLoading(true);
    try {
      const res = await api.post(`/subscriptions/toggle/${video.owner?._id}`);
      const { subscribed } = res.data.data;
      setIsSubscribed(subscribed);
      setSubscribers(prev => (subscribed ? prev + 1 : Math.max(0, prev - 1)));
      showToast(subscribed ? 'Subscribed successfully!' : 'Unsubscribed', 'success');
    } catch (err) {
      console.error('Subscription toggle error:', err.message);
    } finally {
      setSubLoading(false);
    }
  };

  // Share link handler
  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl)
      .then(() => showToast('Video link copied to clipboard!', 'success'))
      .catch(() => showToast('Failed to copy link.', 'error'));
  };

  // Report video handler
  const handleReportVideo = async () => {
    if (!isAuthenticated) {
      showToast('Please log in to report content', 'error');
      return;
    }
    const reason = prompt('Please enter the reason for reporting this video:');
    if (!reason) return;

    try {
      await api.post('/admin/reports', {
        type: 'video',
        targetId: video._id,
        reason,
      });
      showToast('Thank you for reporting. Platform moderation will review this.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Report submission failed.', 'error');
    }
  };

  const playNextVideo = () => {
    console.log("playNextVideo called. relatedVideos count:", relatedVideos.length);
    if (relatedVideos.length > 0) {
      const randomIndex = Math.floor(Math.random() * relatedVideos.length);
      const nextVideo = relatedVideos[randomIndex];
      console.log("Navigating to next random video:", nextVideo.title, nextVideo._id);
      navigate(`/watch/${nextVideo._id}`);
    } else {
      console.log("No related videos to play next.");
    }
  };

  if (loading) return <WatchPageSkeleton />;
  if (!video) return <div className="text-center py-20 text-brand-muted font-bold">Video entry not found.</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-4 md:p-8 max-w-[1700px] mx-auto w-full min-h-screen relative">
      
      {/* Left side viewport layout */}
      <div className="flex-grow lg:w-[68%] flex flex-col gap-6">
        
        {/* Custom video player */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-black">
          <VideoPlayer
            src={getMediaUrl(video.videoFile)}
            thumbnail={getMediaUrl(video.thumbnail)}
            videoId={video._id}
            onEnded={playNextVideo}
          />
        </div>

        {/* Video Title */}
        <h1 className="text-xl md:text-2xl font-black text-brand-text leading-snug tracking-tight">
          {video.title}
        </h1>

        {/* Creator Channel Panel & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/5 pb-6">
          {/* Creator Profile Detail */}
          <div className="flex items-center gap-3">
            <Link to={`/c/${video.owner?.username}`}>
              <img
                src={getMediaUrl(video.owner?.avatar)}
                alt={video.owner?.fullName}
                className="h-12 w-12 rounded-2xl object-cover shadow-lg border border-white/10 hover:border-brand-primary transition-colors duration-300"
              />
            </Link>
            <div className="flex flex-col">
              <Link to={`/c/${video.owner?.username}`} className="font-extrabold text-sm text-brand-text hover:text-brand-primary transition-colors flex items-center gap-1">
                <span>{video.owner?.fullName}</span>
                <CheckCircle size={14} className="text-brand-pink" fill="currentColor" />
              </Link>
              <span className="text-xs text-brand-muted font-bold mt-0.5">
                {subscribers === 1 ? '1 subscriber' : formatViews(subscribers).replace('views', 'subscribers')}
              </span>
            </div>

            {(!user || user._id !== video.owner?._id) && (
              <button
                onClick={handleSubscribe}
                disabled={subLoading}
                className={`ml-4 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                  isSubscribed
                    ? 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                    : 'bg-brand-primary text-white shadow-md shadow-brand-primary-glow hover:scale-105 active:scale-95'
                }`}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
          </div>

          {/* Social Action Control Pills */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-bold text-brand-text">
            {/* Likes/Dislikes reaction capsule */}
            <div className="flex items-center bg-black/5 dark:bg-white/5 border border-brand-border rounded-xl overflow-hidden shadow-md">
              <button
                onClick={() => handleReaction('like')}
                className={`flex items-center gap-1.5 px-4.5 py-2.5 hover:bg-black/5 dark:hover:bg-white/10 border-r border-brand-border transition-colors cursor-pointer ${
                  reaction === 'like' ? 'text-brand-primary bg-brand-primary/10' : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                <ThumbsUp size={14} fill={reaction === 'like' ? 'currentColor' : 'none'} />
                <span>{likes}</span>
              </button>
              <button
                onClick={() => handleReaction('dislike')}
                className={`flex items-center gap-1.5 px-4.5 py-2.5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer ${
                  reaction === 'dislike' ? 'text-brand-pink bg-brand-pink/10' : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                <ThumbsDown size={14} fill={reaction === 'dislike' ? 'currentColor' : 'none'} />
                <span>{dislikes}</span>
              </button>
            </div>

            {/* Save to Playlist */}
            {isAuthenticated && (
              <button
                onClick={() => setIsPlaylistModalOpen(true)}
                className="flex items-center gap-1.5 px-4.5 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-brand-border rounded-xl transition-colors cursor-pointer text-brand-muted hover:text-brand-text"
              >
                <FolderHeart size={14} />
                <span>Save</span>
              </button>
            )}

            {/* Share action */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-brand-border rounded-xl transition-colors cursor-pointer text-brand-muted hover:text-brand-text"
            >
              <Share2 size={14} />
              <span>Share</span>
            </button>

            {/* Flag Report Action */}
            {isAuthenticated && (
              <button
                onClick={handleReportVideo}
                className="flex items-center gap-1.5 px-4.5 py-2.5 bg-brand-danger/10 hover:bg-brand-danger/20 border border-brand-danger/10 text-brand-danger rounded-xl transition-colors cursor-pointer"
              >
                <ShieldAlert size={14} />
                <span>Report</span>
              </button>
            )}
          </div>
        </div>

        {/* Video Description Accordion Frame */}
        <div className="p-5 rounded-3xl premium-glass flex flex-col gap-3 shadow-md text-sm">
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-brand-text">
            <span className="flex items-center gap-1.5 text-brand-muted">
              <Eye size={14} className="text-brand-primary" /> {formatViews(video.views)}
            </span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1.5 text-brand-muted">
              <Calendar size={14} className="text-brand-pink" /> {formatRelativeTime(video.createdAt)}
            </span>
            {video.category && (
              <>
                <span className="text-white/20">•</span>
                <span className="px-3 py-0.5 rounded-full bg-white/5 border border-white/5 text-[9px] uppercase tracking-wider text-brand-pink font-extrabold">
                  {video.category?.name}
                </span>
              </>
            )}
          </div>

          <p className={`text-brand-muted font-medium whitespace-pre-wrap leading-relaxed transition-all duration-300 ${
            descExpanded ? 'h-auto' : 'line-clamp-3'
          }`}>
            {video.description}
          </p>

          {descExpanded && video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-white/5">
              {video.tags.map((tag, idx) => (
                <span 
                  key={idx} 
                  onClick={() => navigate(`/search?q=${tag}`)}
                  className="text-xs font-bold text-brand-primary cursor-pointer hover:text-brand-pink transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={() => setDescExpanded(!descExpanded)}
            className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-brand-text hover:text-brand-primary mt-2 select-none cursor-pointer smooth-transition"
          >
            {descExpanded ? (
              <>Show less <ChevronUp size={14} /></>
            ) : (
              <>Show more <ChevronDown size={14} /></>
            )}
          </button>
        </div>

        {/* Dynamic Nested Comments Section */}
        <div className="mt-4">
          <CommentSection videoId={video._id} />
        </div>
      </div>

      {/* Right side recommended playlist bar */}
      <div className="lg:w-[32%] shrink-0 flex flex-col gap-5">
        <h3 className="font-extrabold text-xs text-brand-text tracking-widest uppercase px-1 border-l-2 border-brand-primary pl-3">
          Related Videos
        </h3>
        
        <div className="flex flex-col gap-4">
          {relatedVideos.length === 0 ? (
            <p className="text-xs text-brand-muted px-1 font-semibold">No recommendations found.</p>
          ) : (
            relatedVideos.map((item) => (
              <VideoCard key={item._id} video={item} horizontal={true} />
            ))
          )}
        </div>
      </div>

      {/* Dynamic modals */}
      <PlaylistModal
        videoId={video._id}
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
      />
    </div>
  );
};

export default Watch;
