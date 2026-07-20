import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, Flame, Heart, Share2, MoreVertical, Plus } from 'lucide-react';

// Utility to resolve local uploaded file URLs
export const getMediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '') 
    : 'http://localhost:5000';
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${base}${cleanUrl}`;
};

// Utility to format duration
export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Utility to format views
export const formatViews = (views) => {
  if (views === undefined || isNaN(views)) return '0 views';
  if (views >= 1e6) {
    return `${(views / 1e6).toFixed(1).replace(/\.0$/, '')}M views`;
  }
  if (views >= 1e3) {
    return `${(views / 1e3).toFixed(1).replace(/\.0$/, '')}K views`;
  }
  return `${views} ${views === 1 ? 'view' : 'views'}`;
};

// Utility to calculate relative time
export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInMonths = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 30));

  if (diffInMins < 1) return 'Just now';
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 30) return `${diffInDays}d ago`;
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  return `${Math.floor(diffInDays / 365)}y ago`;
};

const VideoCard = ({ video, horizontal = false }) => {
  if (!video) return null;

  const resolvedThumbnail = getMediaUrl(video.thumbnail);
  const resolvedAvatar = getMediaUrl(video.owner?.avatar);
  const resolvedVideo = getMediaUrl(video.videoFile);

  const [isHovered, setIsHovered] = useState(false);
  const hoverTimer = useRef(null);

  // Mouse hover events for video pre-play
  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => {
      setIsHovered(true);
    }, 600); // 600ms delay to prevent accidental playback triggers
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setIsHovered(false);
  };

  let categoryName = 'Video';
  if (video.category) {
    if (typeof video.category === 'object' && video.category.name) {
      categoryName = video.category.name;
    } else if (typeof video.category === 'string' && !/^[0-9a-fA-F]{24}$/.test(video.category)) {
      categoryName = video.category;
    }
  }
  const isHD = video.duration > 120; // Mock HD/4K badge based on video duration

  if (horizontal) {
    return (
      <Link
        to={`/watch/${video._id}`}
        className="flex gap-4 group cursor-pointer transition-all duration-300 p-2 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 overflow-hidden w-full"
      >
        {/* Left Aspect Thumbnail */}
        <div 
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative aspect-video w-40 sm:w-52 shrink-0 rounded-xl overflow-hidden bg-white/5 border border-white/5"
        >
          {isHovered ? (
            <video
              src={resolvedVideo}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover scale-105 z-10 transition-transform duration-300"
            />
          ) : (
            <img
              src={resolvedThumbnail}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 smooth-transition"
              loading="lazy"
            />
          )}
          


        </div>

        {/* Right Info Section */}
        <div className="flex flex-col gap-1 w-full justify-start overflow-hidden py-1">
          <h4 className="text-sm font-bold text-brand-text leading-snug line-clamp-2 group-hover:text-brand-primary transition-colors">
            {video.title}
          </h4>
          <span className="text-xs text-brand-muted hover:text-brand-text line-clamp-1 font-semibold transition-colors mt-0.5">
            {video.owner?.fullName || 'Deleted Channel'}
          </span>
          
          <div className="flex items-center gap-2 text-[10px] font-bold text-brand-muted mt-1">
            <span className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] border border-white/5 text-brand-pink uppercase">{categoryName}</span>
            <span>•</span>
            <span>{formatViews(video.views)}</span>
            <span>•</span>
            <span>{formatRelativeTime(video.createdAt)}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="flex flex-col gap-3 premium-glass rounded-3xl overflow-hidden p-3 hover:scale-[1.03] transition-all duration-300 hover:border-brand-primary/40 hover:shadow-[0_8px_32px_rgba(124,58,237,0.15)] group relative"
    >
      <Link to={`/watch/${video._id}`} className="relative block">
        {/* Video Thumbnail block */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-white/5 border border-white/5">
          {isHovered ? (
            <video
              src={resolvedVideo}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover scale-105 z-10 transition-transform duration-300"
            />
          ) : (
            <img
              src={resolvedThumbnail}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 smooth-transition"
              loading="lazy"
            />
          )}


          {video.views > 1000 && (
            <div className="absolute top-2 left-2 flex gap-1 z-20">
              <span className="text-[9px] font-black text-white bg-brand-pink/80 px-2 py-0.5 rounded-md shadow-sm flex items-center gap-0.5">
                <Flame size={10} /> HOT
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Details Row */}
      <div className="flex gap-3 px-1 pb-1">
        {/* Creator Channel Avatar */}
        <Link to={`/c/${video.owner?.username}`} className="shrink-0">
          <img
            src={resolvedAvatar}
            alt={video.owner?.fullName}
            className="h-10 w-10 rounded-2xl object-cover shadow-md border border-white/10 hover:border-brand-primary transition-colors duration-300"
            loading="lazy"
          />
        </Link>

        {/* Text information */}
        <div className="flex flex-col gap-0.5 overflow-hidden w-full">
          <Link to={`/watch/${video._id}`}>
            <h3 className="text-sm font-bold text-brand-text leading-snug line-clamp-2 group-hover:text-brand-primary transition-colors">
              {video.title}
            </h3>
          </Link>
          <div className="flex items-center justify-between mt-1">
            <Link
              to={`/c/${video.owner?.username}`}
              className="text-xs text-brand-muted hover:text-brand-text line-clamp-1 font-semibold transition-colors"
            >
              {video.owner?.fullName || 'Deleted Channel'}
            </Link>
            <span className="text-[9px] font-extrabold text-brand-pink px-2 py-0.5 rounded bg-white/5 border border-white/5 uppercase">
              {categoryName}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-muted mt-1.5">
            <span>{formatViews(video.views)}</span>
            <span>•</span>
            <span>{formatRelativeTime(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
