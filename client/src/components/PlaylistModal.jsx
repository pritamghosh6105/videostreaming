import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, X, Lock, Globe } from 'lucide-react';

const PlaylistModal = ({ videoId, isOpen, onClose }) => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Creation form states
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Fetch user playlists
  const fetchPlaylists = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get(`/playlists/user/${user._id}`);
      setPlaylists(res.data.data || []);
    } catch (err) {
      console.error('Error fetching playlists:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchPlaylists();
      setShowCreate(false);
      setName('');
      setDescription('');
      setIsPrivate(false);
    }
  }, [isOpen, user]);

  // Toggle video in playlist
  const handleTogglePlaylist = async (playlistId, isCurrentlyChecked) => {
    try {
      if (isCurrentlyChecked) {
        // Remove video
        await api.patch(`/playlists/${playlistId}/remove/${videoId}`);
        setPlaylists(prev =>
          prev.map(p =>
            p._id === playlistId
              ? { ...p, videos: p.videos.filter(v => v.toString() !== videoId.toString()) }
              : p
          )
        );
      } else {
        // Add video
        await api.patch(`/playlists/${playlistId}/add/${videoId}`);
        setPlaylists(prev =>
          prev.map(p =>
            p._id === playlistId
              ? { ...p, videos: [...p.videos, videoId] }
              : p
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update playlist');
    }
  };

  // Create new playlist
  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreateLoading(true);
    try {
      const res = await api.post('/playlists', {
        name,
        description,
        isPrivate,
      });

      // Add to local state list
      const newPlaylist = res.data.data;
      
      // Auto add video to newly created playlist
      await api.patch(`/playlists/${newPlaylist._id}/add/${videoId}`);
      newPlaylist.videos.push(videoId);

      setPlaylists(prev => [newPlaylist, ...prev]);
      setShowCreate(false);
      setName('');
      setDescription('');
      setIsPrivate(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create playlist');
    } finally {
      setCreateLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl transition-all dark:bg-dark-card border border-light-border dark:border-dark-border">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-light-border dark:border-dark-border">
          <h3 className="font-semibold text-lg text-light-text dark:text-dark-text">Save to...</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-light-muted dark:text-dark-muted hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Playlists Checklist */}
        {loading ? (
          <div className="flex flex-col gap-2 py-4">
            <div className="h-5 w-3/4 rounded skeleton-loading" />
            <div className="h-5 w-5/6 rounded skeleton-loading" />
            <div className="h-5 w-1/2 rounded skeleton-loading" />
          </div>
        ) : (
          <div className="max-h-56 overflow-y-auto flex flex-col gap-2 mb-4 scrollbar-thin">
            {playlists.length === 0 ? (
              <p className="text-sm text-light-muted dark:text-dark-muted py-2">No playlists created yet.</p>
            ) : (
              playlists.map((playlist) => {
                const isChecked = playlist.videos.includes(videoId);
                return (
                  <label
                    key={playlist._id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePlaylist(playlist._id, isChecked)}
                        className="rounded border-light-border dark:border-dark-border text-youtube-red focus:ring-youtube-red h-4 w-4"
                      />
                      <span className="text-sm font-medium text-light-text dark:text-dark-text">
                        {playlist.name}
                      </span>
                    </div>
                    <div className="text-light-muted dark:text-dark-muted">
                      {playlist.isPrivate ? <Lock size={14} /> : <Globe size={14} />}
                    </div>
                  </label>
                );
              })
            )}
          </div>
        )}

        {/* Actions toggle / Creation Form */}
        {!showCreate ? (
          <button
            onClick={() => setShowCreate(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-light-hover dark:hover:bg-dark-hover transition-colors font-medium text-sm"
          >
            <Plus size={16} /> Create new playlist
          </button>
        ) : (
          <form onSubmit={handleCreatePlaylist} className="flex flex-col gap-3 mt-2 border-t border-light-border dark:border-dark-border pt-4">
            <div>
              <label className="block text-xs font-semibold text-light-muted dark:text-dark-muted mb-1 uppercase tracking-wide">
                Playlist Name
              </label>
              <input
                type="text"
                required
                placeholder="Enter name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-light-border bg-light-bg text-light-text dark:border-dark-border dark:bg-dark-bg dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-youtube-red"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-light-muted dark:text-dark-muted mb-1 uppercase tracking-wide">
                Description
              </label>
              <textarea
                placeholder="Enter description (optional)..."
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-light-border bg-light-bg text-light-text dark:border-dark-border dark:bg-dark-bg dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-youtube-red resize-none"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded border-light-border dark:border-dark-border text-youtube-red focus:ring-youtube-red h-4 w-4"
              />
              <div className="flex items-center gap-1 text-sm text-light-text dark:text-dark-text font-medium select-none">
                <Lock size={14} className="text-light-muted dark:text-dark-muted" /> Private playlist
              </div>
            </label>

            <div className="flex gap-2 justify-end mt-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-light-text dark:text-dark-text hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createLoading || !name.trim()}
                className="px-4 py-2 bg-youtube-red hover:bg-youtube-darkRed text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createLoading ? 'Creating...' : 'Create & Add'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PlaylistModal;
