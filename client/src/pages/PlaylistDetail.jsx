import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import VideoCard, { getMediaUrl } from '../components/VideoCard';
import { VideoGridSkeleton } from '../components/Skeletons';
import { FolderHeart, Trash2, X, Lock, Globe, Play } from 'lucide-react';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPlaylistDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/playlists/${id}`);
      setPlaylist(res.data.data);
    } catch (err) {
      console.error('Playlist load error:', err.message);
      alert(err.response?.data?.message || 'Failed to load playlist details.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylistDetails();
  }, [id]);

  const isOwner = user && playlist && playlist.owner?._id === user._id;

  // Delete entire playlist
  const handleDeletePlaylist = async () => {
    if (!window.confirm('Are you sure you want to delete this playlist? This cannot be undone.')) return;

    try {
      await api.delete(`/playlists/${id}`);
      alert('Playlist deleted successfully.');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete playlist');
    }
  };

  // Remove video from playlist
  const handleRemoveVideo = async (videoId) => {
    try {
      await api.patch(`/playlists/${id}/remove/${videoId}`);
      setPlaylist(prev => ({
        ...prev,
        videos: prev.videos.filter(v => v._id !== videoId),
      }));
      alert('Video removed from playlist.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove video');
    }
  };

  if (loading) return <VideoGridSkeleton count={4} />;
  if (!playlist) return <div className="text-center py-20 text-light-muted">Playlist not found.</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full min-h-screen select-none">
      
      {/* Left panel: Playlist cover card */}
      <div className="lg:w-[35%] shrink-0">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-youtube-red/20 via-youtube-red/5 to-transparent border border-light-border dark:border-dark-border shadow-sm flex flex-col gap-4 sticky top-24">
          <div className="aspect-video w-full rounded-2xl bg-youtube-red/10 border border-light-border dark:border-dark-border flex items-center justify-center relative overflow-hidden shadow">
            <FolderHeart size={64} className="text-youtube-red animate-pulse" />
            <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-black/40 flex flex-col items-center justify-center text-white text-xs font-bold">
              <span>{playlist.videos?.length || 0}</span>
              <span>vids</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-black text-light-text dark:text-dark-text leading-snug truncate">
              {playlist.name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-light-muted dark:text-dark-muted font-bold mt-1">
              <span>By @{playlist.owner?.username}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5 lowercase text-[10px]">
                {playlist.isPrivate ? <Lock size={12} /> : <Globe size={12} />} {playlist.isPrivate ? 'private' : 'public'}
              </span>
            </div>
            {playlist.description && (
              <p className="text-xs text-light-muted dark:text-dark-muted leading-relaxed mt-2 whitespace-pre-wrap italic">
                "{playlist.description}"
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 w-full mt-2">
            {playlist.videos?.length > 0 && (
              <Link
                to={`/watch/${playlist.videos[0]._id}`}
                className="flex-grow flex items-center justify-center gap-1.5 py-2.5 bg-youtube-red hover:bg-youtube-darkRed text-white text-xs font-extrabold rounded-xl shadow transition-colors"
              >
                <Play size={14} fill="currentColor" /> Play All
              </Link>
            )}

            {isOwner && (
              <button
                onClick={handleDeletePlaylist}
                className="px-4 py-2.5 bg-youtube-red/15 text-youtube-red hover:bg-youtube-red/25 text-xs font-bold rounded-xl transition-all"
                title="Delete Playlist"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right panel: Playlist videos list */}
      <div className="flex-grow lg:w-[65%] flex flex-col gap-4">
        <h3 className="font-extrabold text-sm text-light-text dark:text-dark-text tracking-wide uppercase px-1">
          Playlist Contents
        </h3>

        <div className="flex flex-col gap-3">
          {playlist.videos?.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-light-border dark:border-dark-border rounded-3xl text-light-muted">
              Playlist is empty. Add videos from their streaming page.
            </div>
          ) : (
            playlist.videos.map((video, idx) => (
              <div key={video._id} className="relative group">
                <VideoCard video={video} horizontal={true} />
                
                {/* Remove button */}
                {isOwner && (
                  <button
                    onClick={() => handleRemoveVideo(video._id)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-youtube-red text-white opacity-0 group-hover:opacity-100 transition-opacity shadow hover:scale-105"
                    title="Remove from playlist"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default PlaylistDetail;
