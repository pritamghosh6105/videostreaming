import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Video, Eye, ArrowRight, Play, Trash2, Ban } from 'lucide-react';
import api from '../services/api';
import { getMediaUrl, formatViews, formatRelativeTime, formatDuration } from '../components/VideoCard';
import { useAuth } from '../context/AuthContext';

import useDocumentTitle from '../hooks/useDocumentTitle';

const Channels = () => {
  useDocumentTitle('Creator Channels');
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keysPressed, setKeysPressed] = useState({ ctrl: false, shift: false });
  
  const { user, isAdmin } = useAuth();

  const fetchChannels = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/users/channels');
      setChannels(res.data.data || []);
    } catch (err) {
      console.error('Error fetching registered channels:', err);
      setError('Failed to load channels directory. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  // Event listeners for holding Ctrl + Shift
  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeysPressed({
        ctrl: e.ctrlKey || e.metaKey,
        shift: e.shiftKey,
      });
    };

    const handleKeyUp = (e) => {
      setKeysPressed({
        ctrl: e.ctrlKey || e.metaKey,
        shift: e.shiftKey,
      });
    };

    const handleBlur = () => {
      setKeysPressed({ ctrl: false, shift: false });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  const isDeleteMode = keysPressed.ctrl && keysPressed.shift;

  // Moderation Handler: Ban Channel
  const handleBanChannel = async (e, channel) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAdmin) {
      alert('Action Denied: Only administrators can ban/delete creator channels.');
      return;
    }

    const confirmBan = window.confirm(`[ADMIN MODERATION]\n\nAre you sure you want to BAN the channel "${channel.fullName}" (@${channel.username})?\n\nThis will hide the channel and unpublish all of their videos.`);
    if (confirmBan) {
      try {
        await api.patch(`/admin/users/${channel._id}/ban`);
        alert(`Channel @${channel.username} has been banned.`);
        fetchChannels();
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Failed to ban channel.');
      }
    }
  };

  // Moderation Handler: Delete Video (Channel Content)
  const handleDeleteVideo = async (e, video) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAdmin) {
      alert('Action Denied: Only administrators can delete video content from the directory.');
      return;
    }

    const confirmDelete = window.confirm(`[ADMIN MODERATION]\n\nAre you sure you want to permanently DELETE the video:\n"${video.title}"?\n\nThis action is irreversible and will delete all views, comments, and likes associated with it.`);
    if (confirmDelete) {
      try {
        await api.delete(`/videos/${video._id}`);
        alert(`Video "${video.title}" has been deleted.`);
        fetchChannels();
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Failed to delete video.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 p-4 md:p-6 w-full max-w-[1600px] mx-auto min-h-screen select-none">
        {/* Header Skeleton */}
        <div className="border-b border-light-border dark:border-dark-border pb-4 animate-pulse">
          <div className="h-7 w-64 bg-light-hover dark:bg-dark-hover rounded-lg mb-2"></div>
          <div className="h-4 w-96 bg-light-hover dark:bg-dark-hover rounded-md"></div>
        </div>

        {/* Channels List Skeleton */}
        <div className="flex flex-col gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl overflow-hidden shadow-sm p-5 animate-pulse">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
                <div className="h-20 w-20 rounded-full bg-light-hover dark:bg-dark-hover shrink-0"></div>
                <div className="flex-grow flex flex-col gap-2 w-full">
                  <div className="h-5 w-48 bg-light-hover dark:bg-dark-hover rounded-md mx-auto md:mx-0"></div>
                  <div className="h-4 w-32 bg-light-hover dark:bg-dark-hover rounded-md mx-auto md:mx-0"></div>
                  <div className="h-4 w-full max-w-lg bg-light-hover dark:bg-dark-hover rounded-md mt-2 mx-auto md:mx-0"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 w-full max-w-[1600px] mx-auto min-h-screen select-none animate-fade-in">
      {/* Title Header */}
      <div className="border-b border-light-border dark:border-dark-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-light-text dark:text-dark-text tracking-wide uppercase flex items-center gap-2">
            <Users size={24} className="text-youtube-red" /> Creator Directory
          </h1>
          <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
            Discover registered creators, explore their channel stats, and watch their latest uploads.
            {isAdmin && <span className="block sm:inline sm:ml-2 text-youtube-red font-bold animate-pulse">💡 Hold Ctrl + Shift to toggle Moderator Deletion Mode</span>}
          </p>
        </div>
        <div className="bg-youtube-red/10 text-youtube-red font-bold text-xs px-3.5 py-1.5 rounded-full self-start sm:self-auto border border-youtube-red/20 shadow-sm">
          {channels.length} {channels.length === 1 ? 'Channel' : 'Channels'} Registered
        </div>
      </div>

      {isDeleteMode && isAdmin && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 text-xs text-red-500 font-bold flex items-center gap-2.5 animate-pulse shadow-sm">
          <Ban size={16} /> MODERATOR MODE ACTIVE: Click the red "Ban Channel" button to ban a creator, or click a video thumbnail to delete the video.
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-youtube-red">
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchChannels}
            className="mt-4 px-6 py-2 bg-youtube-red text-white text-xs font-bold rounded-full shadow hover:bg-youtube-darkRed transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {channels.length === 0 && !error ? (
        <div className="text-center py-20 text-light-muted dark:text-dark-muted max-w-sm mx-auto flex flex-col items-center gap-3">
          <Users size={48} className="text-light-muted dark:text-dark-muted/50" />
          <p className="font-semibold text-lg">No creators found.</p>
          <p className="text-xs">There are no registered user channels currently on the platform.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {channels.map((channel) => {
            const hasLatestVideos = channel.latestVideos && channel.latestVideos.length > 0;
            
            return (
              <div
                key={channel._id}
                className={`bg-white dark:bg-dark-card border rounded-2xl overflow-hidden shadow-sm transition-all p-5 flex flex-col gap-6 ${
                  isDeleteMode && isAdmin 
                    ? 'border-red-500/40 bg-red-500/[0.01]' 
                    : 'border-light-border dark:border-dark-border hover:shadow-md hover:border-light-border/80 dark:hover:border-dark-border/80'
                }`}
              >
                {/* Channel Summary (Header Section of the Card) */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
                  {/* Avatar */}
                  <Link 
                    to={`/c/${channel.username}`} 
                    onClick={(e) => isDeleteMode ? handleBanChannel(e, channel) : null}
                    className="shrink-0 group relative"
                  >
                    <div className={`absolute inset-0 rounded-full border-2 transition-all duration-300 scale-105 ${
                      isDeleteMode && isAdmin 
                        ? 'border-red-500 bg-red-500/20 flex items-center justify-center cursor-pointer' 
                        : 'border-transparent group-hover:border-youtube-red'
                    }`}>
                      {isDeleteMode && isAdmin && <Ban size={20} className="text-red-500 font-bold animate-pulse" />}
                    </div>
                    <img
                      src={getMediaUrl(channel.avatar)}
                      alt={channel.fullName}
                      className="h-20 w-20 rounded-full object-cover shadow-md border border-light-border dark:border-dark-border"
                    />
                  </Link>

                  {/* Text Details & Stats */}
                  <div className="flex-grow flex flex-col text-center md:text-left gap-1.5 overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
                      <Link to={`/c/${channel.username}`} className="font-extrabold text-lg text-light-text dark:text-dark-text hover:text-youtube-red transition-colors line-clamp-1">
                        {channel.fullName}
                      </Link>
                      <span className="text-xs font-semibold text-light-muted dark:text-dark-muted bg-light-hover dark:bg-dark-hover px-2.5 py-0.5 rounded-full w-fit mx-auto md:mx-0">
                        @{channel.username}
                      </span>
                    </div>

                    {/* Subscriber & Video stats */}
                    <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-bold text-light-muted dark:text-dark-muted mt-1 select-none">
                      <span className="flex items-center gap-1.5">
                        <Users size={14} className="text-youtube-red" />
                        {channel.subscribersCount === 1 ? '1 subscriber' : formatViews(channel.subscribersCount).replace('views', 'subscribers')}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Video size={14} className="text-youtube-red" />
                        {channel.videosCount} {channel.videosCount === 1 ? 'video' : 'videos'}
                      </span>
                    </div>

                    {/* Description Bio */}
                    <p className="text-xs text-light-text/80 dark:text-dark-text/80 line-clamp-2 md:max-w-3xl mt-1.5 leading-relaxed">
                      {channel.bio || 'This creator hasn\'t set a channel bio description yet.'}
                    </p>
                  </div>

                  {/* Actions Column */}
                  <div className="shrink-0 flex self-center md:self-start">
                    {isDeleteMode && isAdmin ? (
                      <button
                        onClick={(e) => handleBanChannel(e, channel)}
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full shadow hover:shadow-lg transition-all flex items-center gap-1.5 animate-bounce"
                      >
                        Ban Channel <Ban size={14} />
                      </button>
                    ) : (
                      <Link
                        to={`/c/${channel.username}`}
                        className="px-5 py-2.5 bg-youtube-red hover:bg-youtube-darkRed text-white text-xs font-bold rounded-full shadow hover:shadow-lg transition-all flex items-center gap-1.5"
                      >
                        View Channel <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Content Preview (Recent Videos horizontal strip) */}
                <div className="border-t border-light-border dark:border-dark-border pt-4">
                  <h3 className="text-xs font-extrabold text-light-muted dark:text-dark-muted uppercase tracking-wider mb-3 px-1 select-none">
                    Latest Content Preview
                  </h3>
                  
                  {hasLatestVideos ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {channel.latestVideos.map((video) => {
                        const resolvedThumb = getMediaUrl(video.thumbnail);
                        return (
                          <Link
                            key={video._id}
                            to={`/watch/${video._id}`}
                            onClick={(e) => isDeleteMode ? handleDeleteVideo(e, video) : null}
                            className={`flex gap-3 p-2 rounded-xl border group transition-all ${
                              isDeleteMode && isAdmin 
                                ? 'bg-red-500/5 border-red-500/35 hover:bg-red-500/10 hover:border-red-500/50' 
                                : 'bg-light-bg/50 dark:bg-dark-bg/30 border-light-border/40 dark:border-dark-border/20 hover:border-light-border hover:bg-light-hover dark:hover:bg-dark-hover'
                            }`}
                          >
                            {/* Small Video Thumbnail */}
                            <div className="relative aspect-video w-24 shrink-0 rounded-lg overflow-hidden bg-black/5 dark:bg-white/5 shadow-sm">
                              {isDeleteMode && isAdmin && (
                                <div className="absolute inset-0 bg-red-600/40 flex items-center justify-center z-10 cursor-pointer">
                                  <Trash2 size={16} className="text-white drop-shadow-md animate-pulse" />
                                </div>
                              )}
                              <img
                                src={resolvedThumb}
                                alt={video.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                loading="lazy"
                              />

                            </div>

                            {/* Info */}
                            <div className="flex flex-col gap-0.5 justify-center overflow-hidden">
                              <h4 className={`text-xs font-bold leading-snug line-clamp-2 transition-colors ${
                                isDeleteMode && isAdmin 
                                  ? 'text-red-500/90 group-hover:text-red-600' 
                                  : 'text-light-text dark:text-dark-text group-hover:text-youtube-red'
                              }`}>
                                {video.title}
                              </h4>
                              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-light-muted dark:text-dark-muted font-medium mt-0.5">
                                <span className="flex items-center gap-0.5"><Eye size={10} /> {formatViews(video.views).replace(' views', '')}</span>
                                <span>•</span>
                                <span>{formatRelativeTime(video.createdAt)}</span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 py-4 px-2 text-xs text-light-muted dark:text-dark-muted italic">
                      <Play size={14} className="text-light-muted/50 dark:text-dark-muted/40" />
                      This channel hasn't uploaded any videos yet.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Channels;
