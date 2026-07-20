import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import VideoCard, { getMediaUrl, formatViews, formatRelativeTime } from '../components/VideoCard';
import { VideoGridSkeleton } from '../components/Skeletons';
import { 
  Tv, 
  FolderOpen, 
  UserCheck, 
  ShieldAlert, 
  Award, 
  Camera, 
  Edit, 
  X, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Trash2, 
  Plus, 
  Image as ImageIcon, 
  BarChart2, 
  CheckCircle,
  FileText
} from 'lucide-react';

import useDocumentTitle from '../hooks/useDocumentTitle';

const Channel = () => {
  const { username } = useParams();
  const { user, isAuthenticated, updateProfile, updateAvatar, updateBanner } = useAuth();

  const [channel, setChannel] = useState(null);
  useDocumentTitle(channel ? `${channel.fullName} (@${channel.username})` : 'Channel Profile');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos'); // videos, playlists, community, about
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  
  // Subscription states
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [subLoading, setSubLoading] = useState(false);

  // Edit profile states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Community Posts states
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  
  // Create Post form states
  const [postType, setPostType] = useState('text'); // text, image, poll
  const [postContent, setPostContent] = useState('');
  const [postImageFile, setPostImageFile] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState('');
  const [pollChoices, setPollChoices] = useState(['', '']);
  const [publishingPost, setPublishingPost] = useState(false);

  // Community Comments states
  const [openComments, setOpenComments] = useState({});
  const [commentsMap, setCommentsMap] = useState({});
  const [commentsLoadingMap, setCommentsLoadingMap] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});



  // Checks if the logged in user is the owner of this channel
  const isOwner = user && user.username && username && user.username.toLowerCase() === username.toLowerCase();

  const fetchChannelPosts = async () => {
    setPostsLoading(true);
    try {
      const res = await api.get(`/community/c/${username}`);
      setPosts(res.data.data || []);
    } catch (err) {
      console.error('Error fetching community posts:', err.message);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchChannelData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users/c/${username}`);
      const ch = res.data.data;
      setChannel(ch);
      setSubscribersCount(ch.subscribersCount || 0);
      setIsSubscribed(ch.isSubscribed);

      // Fetch channel videos
      const videoRes = await api.get(`/videos?userId=${ch._id}`);
      setVideos(videoRes.data.data || []);

      // Fetch channel playlists
      const playlistRes = await api.get(`/playlists/user/${ch._id}`);
      setPlaylists(playlistRes.data.data || []);

      // Fetch channel posts
      const postsRes = await api.get(`/community/c/${username}`);
      setPosts(postsRes.data.data || []);
    } catch (err) {
      console.error('Error fetching channel details:', err.message);
      alert('Failed to load channel profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannelData();
  }, [username]);

  const handleSubscribeToggle = async () => {
    if (!isAuthenticated) {
      alert('Please log in to subscribe to this channel');
      return;
    }
    if (isOwner) return;

    setSubLoading(true);
    try {
      const res = await api.post(`/subscriptions/toggle/${channel._id}`);
      const { subscribed } = res.data.data;
      setIsSubscribed(subscribed);
      setSubscribersCount((prev) => (subscribed ? prev + 1 : Math.max(0, prev - 1)));
    } catch (err) {
      console.error('Subscription toggle error:', err.message);
    } finally {
      setSubLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show immediate local preview
    const previewUrl = URL.createObjectURL(file);
    setChannel(prev => ({ ...prev, avatar: previewUrl }));

    try {
      const res = await updateAvatar(file);
      if (res.success) {
        setChannel(prev => ({ ...prev, avatar: res.url }));
        alert('Avatar logo updated successfully!');
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload avatar image.');
    }
  };

  const handleBannerChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show immediate local preview
    const previewUrl = URL.createObjectURL(file);
    setChannel(prev => ({ ...prev, banner: previewUrl }));

    try {
      const res = await updateBanner(file);
      if (res.success) {
        setChannel(prev => ({ ...prev, banner: res.url }));
        alert('Banner image updated successfully!');
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload banner image.');
    }
  };

  const openEditModal = () => {
    if (!channel) return;
    setEditName(channel.fullName || '');
    setEditBio(channel.bio || '');
    setIsEditModalOpen(true);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const res = await updateProfile({ fullName: editName, bio: editBio });
      if (res.success) {
        setChannel(prev => ({
          ...prev,
          fullName: editName,
          bio: editBio
        }));
        setIsEditModalOpen(false);
        alert('Channel profile updated successfully!');
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update profile settings.');
    } finally {
      setEditLoading(false);
    }
  };

  // Image Selection with local preview
  const handlePostImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPostImageFile(file);
    setPostImagePreview(URL.createObjectURL(file));
  };

  // Handle Poll options changes
  const handlePollChoiceChange = (index, value) => {
    const newChoices = [...pollChoices];
    newChoices[index] = value;
    setPollChoices(newChoices);
  };

  const handleAddPollChoice = () => {
    if (pollChoices.length >= 4) return;
    setPollChoices([...pollChoices, '']);
  };

  const handleRemovePollChoice = (index) => {
    if (pollChoices.length <= 2) return;
    setPollChoices(pollChoices.filter((_, idx) => idx !== index));
  };

  // Submit Community Post
  const handlePublishPost = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) {
      alert('Please add some text content to your post');
      return;
    }

    setPublishingPost(true);
    try {
      const formData = new FormData();
      formData.append('type', postType);
      formData.append('content', postContent);

      if (postType === 'image' && postImageFile) {
        formData.append('image', postImageFile);
      }

      if (postType === 'poll') {
        const activeChoices = pollChoices.filter(c => c.trim());
        if (activeChoices.length < 2) {
          alert('Please enter at least 2 options for the poll');
          setPublishingPost(false);
          return;
        }
        formData.append('pollOptions', JSON.stringify(activeChoices));
      }

      const res = await api.post('/community/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Update posts state locally
      setPosts(prev => [res.data.data, ...prev]);

      // Clear form
      setPostContent('');
      setPostImageFile(null);
      setPostImagePreview('');
      setPollChoices(['', '']);
      setPostType('text');
      alert('Post published successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish community post');
    } finally {
      setPublishingPost(false);
    }
  };

  // Vote on Poll Option (Optimistic UI)
  const handleVote = async (postId, optionIndex) => {
    if (!isAuthenticated) {
      alert('Please log in to vote');
      return;
    }

    const originalPosts = [...posts];

    // Optimistic Update
    setPosts(prev => prev.map(p => {
      if (p._id !== postId) return p;

      const userId = user._id;
      const updatedPollOptions = p.pollOptions.map((opt, idx) => {
        let newVotes = [...(opt.votes || [])];
        const alreadyVoted = newVotes.some(id => id.toString() === userId.toString());

        if (idx === optionIndex) {
          if (alreadyVoted) {
            // Toggle off (remove vote)
            newVotes = newVotes.filter(id => id.toString() !== userId.toString());
          } else {
            // Add vote to the new option
            newVotes.push(userId);
          }
        } else {
          // Remove from previous choice if it was selected
          if (alreadyVoted) {
            newVotes = newVotes.filter(id => id.toString() !== userId.toString());
          }
        }

        return {
          ...opt,
          votes: newVotes
        };
      });

      return {
        ...p,
        pollOptions: updatedPollOptions
      };
    }));

    try {
      const res = await api.post(`/community/${postId}/vote`, { optionIndex });
      setPosts(prev => prev.map(p => p._id === postId ? res.data.data : p));
    } catch (err) {
      console.error('Voting failed:', err);
      setPosts(originalPosts);
      alert(err.response?.data?.message || 'Voting failed.');
    }
  };

  // Like/Dislike Post (Optimistic UI)
  const handlePostReaction = async (postId, reactionType) => {
    if (!isAuthenticated) {
      alert('Please log in to react to posts');
      return;
    }

    const originalPosts = [...posts];

    // Optimistic Update
    setPosts(prev => prev.map(p => {
      if (p._id !== postId) return p;

      const userId = user._id;
      let newLikes = [...(p.likes || [])];
      let newDislikes = [...(p.dislikes || [])];

      const hasLiked = newLikes.some(id => id.toString() === userId.toString());
      const hasDisliked = newDislikes.some(id => id.toString() === userId.toString());

      if (reactionType === 'like') {
        if (hasLiked) {
          newLikes = newLikes.filter(id => id.toString() !== userId.toString());
        } else {
          newLikes.push(userId);
          newDislikes = newDislikes.filter(id => id.toString() !== userId.toString());
        }
      } else {
        if (hasDisliked) {
          newDislikes = newDislikes.filter(id => id.toString() !== userId.toString());
        } else {
          newLikes = newLikes.filter(id => id.toString() !== userId.toString());
          newDislikes.push(userId);
        }
      }

      return {
        ...p,
        likes: newLikes,
        dislikes: newDislikes
      };
    }));

    try {
      const res = await api.post(`/community/${postId}/like`, { type: reactionType });
      setPosts(prev => prev.map(p => p._id === postId ? res.data.data : p));
    } catch (err) {
      console.error('Reaction toggle failed:', err);
      setPosts(originalPosts);
      alert(err.response?.data?.message || 'Failed to toggle reaction.');
    }
  };

  // Fetch Comments for a Community Post
  const fetchPostComments = async (postId) => {
    setCommentsLoadingMap(prev => ({ ...prev, [postId]: true }));
    try {
      const res = await api.get(`/community/${postId}/comments`);
      setCommentsMap(prev => ({ ...prev, [postId]: res.data.data }));
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setCommentsLoadingMap(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Toggle Comment section visibility
  const toggleComments = (postId) => {
    setOpenComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
    if (!openComments[postId]) {
      fetchPostComments(postId);
    }
  };

  // Add Comment to Post
  const handleAddComment = async (postId, content) => {
    if (!content.trim()) return;
    try {
      const res = await api.post(`/community/${postId}/comments`, { content });
      setCommentsMap(prev => ({
        ...prev,
        [postId]: [res.data.data, ...(prev[postId] || [])]
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add comment');
    }
  };

  // Delete Comment from Post
  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.delete(`/community/comments/${commentId}`);
      setCommentsMap(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(c => c._id !== commentId)
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete comment');
    }
  };


  // Delete Community Post
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to permanently delete this post?')) return;
    try {
      await api.delete(`/community/${postId}`);
      setPosts(prev => prev.filter(p => p._id !== postId));
      alert('Post deleted.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full min-h-screen">
        <div className="h-44 w-full skeleton-loading shrink-0" />
        <div className="max-w-5xl mx-auto w-full px-6 flex gap-4 items-center">
          <div className="h-20 w-20 rounded-full skeleton-loading shrink-0" />
          <div className="flex flex-col gap-2 w-full">
            <div className="h-6 w-1/4 rounded skeleton-loading" />
            <div className="h-4 w-1/3 rounded skeleton-loading" />
          </div>
        </div>
        <div className="max-w-5xl mx-auto w-full px-6 mt-4">
          <VideoGridSkeleton count={4} />
        </div>
      </div>
    );
  }

  const totalViews = videos.reduce((acc, curr) => acc + (curr.views || 0), 0);

  if (!channel) {
    return <div className="text-center py-20 text-light-muted">Channel not found.</div>;
  }

  return (
    <div className="flex flex-col gap-2 w-full min-h-screen relative">
      {/* Banner */}
      <div className="w-full h-36 md:h-52 overflow-hidden bg-black/5 dark:bg-white/5 border-b border-light-border dark:border-dark-border relative group">
        <img
          src={getMediaUrl(channel.banner)}
          alt="Channel Banner"
          className="w-full h-full object-cover"
        />
        {isOwner && (
          <label className="absolute bottom-3 right-3 px-3 py-2 bg-black/65 hover:bg-black/85 text-white text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 backdrop-blur-md border border-white/20 rounded-xl shadow-lg group-hover:scale-105 active:scale-95 z-10" title="Change Channel Banner">
            <Camera size={16} className="text-white shrink-0" />
            <span className="hidden sm:inline">Change Banner</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerChange}
            />
          </label>
        )}
      </div>

      {/* Header Profile Section */}
      <div className="max-w-5xl mx-auto w-full px-4 md:px-6 pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none">
        <div className="flex items-center gap-4">
          {/* Avatar / Logo */}
          <div className="relative group shrink-0">
            <img
              src={getMediaUrl(channel.avatar)}
              alt={channel.fullName}
              className="h-20 w-20 md:h-24 md:w-24 rounded-full object-cover shadow-xl border-2 border-brand-border"
            />
            {isOwner && (
              <>
                <label className="absolute inset-0 bg-black/45 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity border border-white/20 shadow-inner z-10" title="Change Profile Photo">
                  <Camera size={22} className="text-white drop-shadow" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
                <label className="absolute bottom-0 right-0 p-2 bg-brand-primary/90 hover:bg-brand-primary text-white rounded-full cursor-pointer shadow-lg border-2 border-brand-bg hover:scale-110 active:scale-95 transition-transform flex items-center justify-center z-10" title="Change Profile Photo">
                  <Camera size={14} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </>
            )}
          </div>

          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl md:text-2xl font-black text-light-text dark:text-dark-text flex items-center gap-2">
              <span>{channel.fullName}</span>
              {subscribersCount >= 10 && <Award size={18} className="text-youtube-red" />}
            </h1>
            <span className="text-sm font-semibold text-light-muted dark:text-dark-muted">
              @{channel.username}
            </span>
            <div className="flex items-center gap-2 text-xs font-semibold text-light-muted dark:text-dark-muted mt-1">
              <span>{subscribersCount === 1 ? '1 subscriber' : formatViews(subscribersCount).replace('views', 'subscribers')}</span>
              <span>•</span>
              <span>{videos.length} {videos.length === 1 ? 'video' : 'videos'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isOwner ? (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={openEditModal}
              className="px-5 py-2 bg-youtube-red hover:bg-youtube-darkRed text-white text-xs font-extrabold rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <Edit size={14} /> Edit Profile
            </button>
            <Link
              to="/dashboard"
              className="px-6 py-2 bg-light-hover dark:bg-dark-hover hover:bg-light-border dark:hover:bg-dark-border border border-light-border dark:border-dark-border rounded-full text-xs font-bold text-light-text dark:text-dark-text shadow transition-colors"
            >
              Manage Content
            </Link>
          </div>
        ) : (
          <button
            onClick={handleSubscribeToggle}
            disabled={subLoading}
            className={`px-6 py-2.5 rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all ${
              isSubscribed
                ? 'bg-light-hover text-light-text dark:bg-dark-hover dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border'
                : 'bg-youtube-red hover:bg-youtube-darkRed text-white animate-pulse'
            }`}
          >
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        )}
      </div>

      {/* Tabs list navigation */}
      <div className="max-w-5xl mx-auto w-full px-4 md:px-6 mt-6 border-b border-light-border dark:border-dark-border select-none">
        <div className="flex gap-6 text-sm font-bold text-light-muted dark:text-dark-muted">
          {[
            { id: 'videos', name: 'Videos', icon: Tv },
            { id: 'playlists', name: 'Playlists', icon: FolderOpen },
            { id: 'community', name: 'Community', icon: MessageSquare },
            { id: 'about', name: 'About', icon: UserCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 flex items-center gap-1.5 border-b-2 transition-all ${
                  active
                    ? 'border-youtube-red text-youtube-red font-extrabold'
                    : 'border-transparent hover:text-light-text dark:hover:text-dark-text'
                }`}
              >
                <Icon size={16} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="max-w-5xl mx-auto w-full px-4 md:px-6 py-6">
        {activeTab === 'videos' && (
          <div>
            {videos.length === 0 ? (
              <p className="text-center text-sm text-light-muted dark:text-dark-muted py-10">This channel has no uploaded videos.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <VideoCard key={video._id} video={video} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'playlists' && (
          <div>
            {playlists.length === 0 ? (
              <p className="text-center text-sm text-light-muted dark:text-dark-muted py-10">This channel has no public playlists.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {playlists.map((playlist) => (
                  <Link
                    key={playlist._id}
                    to={`/playlist/${playlist._id}`}
                    className="flex flex-col gap-2 p-3 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="aspect-video w-full rounded-xl bg-light-hover dark:bg-dark-hover flex items-center justify-center relative overflow-hidden border border-light-border dark:border-dark-border">
                      <FolderOpen size={44} className="text-light-muted dark:text-dark-muted group-hover:scale-110 transition-transform" />
                      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-black/45 backdrop-blur-sm flex flex-col items-center justify-center text-white text-xs font-bold">
                        <span>{playlist.videos?.length || 0}</span>
                        <span>VIDEOS</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5 px-1 mt-1">
                      <h4 className="font-bold text-sm text-light-text dark:text-dark-text truncate leading-snug group-hover:text-youtube-red transition-colors">
                        {playlist.name}
                      </h4>
                      {playlist.description && (
                        <p className="text-xs text-light-muted dark:text-dark-muted truncate mt-0.5">
                          {playlist.description}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'community' && (
          <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            {/* Publish Form (Owner Only) */}
            {isOwner && (
              <form onSubmit={handlePublishPost} className="p-5 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl shadow-sm flex flex-col gap-4">
                {/* Form type Selector Header */}
                <div className="flex gap-2 border-b border-light-border dark:border-dark-border pb-3 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => { setPostType('text'); setPostImageFile(null); setPostImagePreview(''); }}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                      postType === 'text'
                        ? 'bg-youtube-red text-white'
                        : 'bg-light-hover hover:bg-light-border dark:bg-dark-hover dark:hover:bg-dark-border text-light-text dark:text-dark-text'
                    }`}
                  >
                    <FileText size={14} /> Text Post
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPostType('image'); }}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                      postType === 'image'
                        ? 'bg-youtube-red text-white'
                        : 'bg-light-hover hover:bg-light-border dark:bg-dark-hover dark:hover:bg-dark-border text-light-text dark:text-dark-text'
                    }`}
                  >
                    <ImageIcon size={14} /> Photo Post
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPostType('poll'); setPostImageFile(null); setPostImagePreview(''); }}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                      postType === 'poll'
                        ? 'bg-youtube-red text-white'
                        : 'bg-light-hover hover:bg-light-border dark:bg-dark-hover dark:hover:bg-dark-border text-light-text dark:text-dark-text'
                    }`}
                  >
                    <BarChart2 size={14} /> Create Poll
                  </button>
                </div>

                {/* Textarea description input */}
                <div>
                  <textarea
                    rows="3"
                    required
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder={
                      postType === 'poll'
                        ? "What would you like to ask your community?"
                        : postType === 'image'
                        ? "Add a caption for your photo..."
                        : "Share an update with your subscribers..."
                    }
                    className="w-full text-sm p-3 border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text rounded-xl focus:outline-none focus:ring-2 focus:ring-youtube-red resize-none"
                  />
                </div>

                {/* IMAGE POST FORM TYPE FIELDS */}
                {postType === 'image' && (
                  <div className="flex flex-col gap-3">
                    <label className="block text-xs font-bold text-light-muted dark:text-dark-muted uppercase tracking-wide">Upload Photo Attachment</label>
                    <div className="flex items-center gap-4">
                      <label className="px-4 py-2 bg-light-hover dark:bg-dark-hover border border-light-border dark:border-dark-border rounded-xl text-xs font-semibold cursor-pointer hover:bg-light-border dark:hover:bg-dark-border flex items-center gap-1.5">
                        <Camera size={14} /> Choose Image File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePostImageSelect}
                          className="hidden"
                        />
                      </label>
                      {postImageFile && (
                        <span className="text-xs text-light-muted dark:text-dark-muted truncate max-w-[200px]">
                          {postImageFile.name}
                        </span>
                      )}
                    </div>
                    {postImagePreview && (
                      <div className="relative mt-2 max-w-[300px] border border-light-border dark:border-dark-border rounded-xl overflow-hidden shadow-sm aspect-video">
                        <img src={postImagePreview} className="w-full h-full object-cover" alt="Preview" />
                        <button
                          type="button"
                          onClick={() => { setPostImageFile(null); setPostImagePreview(''); }}
                          className="absolute top-2.5 right-2.5 p-1 bg-black/60 hover:bg-black/85 text-white rounded-full transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* POLL POST FORM TYPE FIELDS */}
                {postType === 'poll' && (
                  <div className="flex flex-col gap-2.5">
                    <label className="block text-xs font-bold text-light-muted dark:text-dark-muted uppercase tracking-wide">Poll Options (2-4 options)</label>
                    <div className="flex flex-col gap-2">
                      {pollChoices.map((choice, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            required
                            placeholder={`Option ${index + 1}`}
                            value={choice}
                            onChange={(e) => handlePollChoiceChange(index, e.target.value)}
                            className="flex-grow px-3 py-2 text-sm rounded-lg border border-light-border bg-light-bg text-light-text dark:border-dark-border dark:bg-dark-bg dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-youtube-red"
                          />
                          {pollChoices.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePollChoice(index)}
                              className="p-2 text-youtube-lightRed hover:text-youtube-red hover:bg-light-hover dark:hover:bg-dark-hover rounded-full transition-colors"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {pollChoices.length < 4 && (
                      <button
                        type="button"
                        onClick={handleAddPollChoice}
                        className="self-start flex items-center gap-1 text-xs text-youtube-red font-bold hover:underline select-none mt-1"
                      >
                        <Plus size={14} /> Add Option choice
                      </button>
                    )}
                  </div>
                )}

                {/* Publish submit button */}
                <button
                  type="submit"
                  disabled={publishingPost || !postContent.trim()}
                  className="self-end px-6 py-2.5 bg-youtube-red hover:bg-youtube-darkRed text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {publishingPost ? 'Publishing...' : 'Publish Post'}
                </button>
              </form>
            )}

            {/* Posts queue list */}
            {postsLoading && posts.length === 0 ? (
              <div className="flex flex-col gap-4 py-10">
                <div className="h-28 rounded-2xl skeleton-loading" />
                <div className="h-28 rounded-2xl skeleton-loading" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 text-light-muted dark:text-dark-muted flex flex-col items-center gap-2 max-w-sm mx-auto">
                <MessageSquare size={36} className="text-light-muted/50" />
                <p className="font-bold text-sm">No community posts yet.</p>
                <p className="text-xs">There are no updates, polls, or images shared on this channel page.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {posts.map((post) => {
                  const totalVotes = post.pollOptions?.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0) || 0;
                  const hasVoted = post.pollOptions?.some(opt => opt.votes?.some(id => id.toString() === user?._id?.toString()));
                  const showPollResults = hasVoted || isOwner || user?.role === 'admin';

                  const userLiked = post.likes?.some(id => id.toString() === user?._id?.toString());
                  const userDisliked = post.dislikes?.some(id => id.toString() === user?._id?.toString());

                  return (
                    <div key={post._id} className="p-5 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl shadow-sm flex flex-col gap-4 animate-fade-in relative">
                      {/* Post Header (Avatar, Name, Date, Delete button) */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={getMediaUrl(post.owner?.avatar)}
                            alt={post.owner?.fullName}
                            className="h-9 w-9 rounded-full object-cover border border-light-border dark:border-dark-border shadow-sm"
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-light-text dark:text-dark-text">{post.owner?.fullName}</span>
                            <span className="text-[10px] text-light-muted dark:text-dark-muted font-bold">
                              @{post.owner?.username} • {formatRelativeTime(post.createdAt)}
                            </span>
                          </div>
                        </div>

                        {(isOwner || user?.role === 'admin') && (
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="p-1.5 rounded-full hover:bg-light-hover dark:hover:bg-dark-hover text-youtube-lightRed hover:text-youtube-red transition-all"
                            title="Delete Post"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      {/* Post Content Text */}
                      <p className="text-sm text-light-text dark:text-dark-text leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </p>

                      {/* PHOTO ATTACHMENT DISPLAY */}
                      {post.type === 'image' && post.attachment && (
                        <div className="rounded-xl overflow-hidden border border-light-border dark:border-dark-border bg-black/5 dark:bg-white/5 max-h-[380px] flex items-center justify-center">
                          <img
                            src={getMediaUrl(post.attachment)}
                            alt="Community Upload"
                            className="w-full h-full object-cover max-h-[380px]"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {/* POLL OPTIONS VOTING INTERFACE */}
                      {post.type === 'poll' && post.pollOptions && (
                        <div className="flex flex-col gap-2 mt-1 select-none">
                          {showPollResults ? (
                            /* Render Poll Results Percentages */
                            <div className="flex flex-col gap-2">
                              {post.pollOptions.map((opt, idx) => {
                                const optVotes = opt.votes?.length || 0;
                                const percent = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
                                const isUserChoice = opt.votes?.some(id => id.toString() === user?._id?.toString());

                                return (
                                  <div
                                    key={opt._id}
                                    onClick={() => handleVote(post._id, idx)}
                                    className={`relative p-3.5 border rounded-xl flex items-center justify-between cursor-pointer overflow-hidden transition-all text-xs font-bold ${
                                      isUserChoice
                                        ? 'border-youtube-red/35 bg-youtube-red/[0.02]'
                                        : 'border-light-border dark:border-dark-border hover:bg-light-hover/40 dark:hover:bg-dark-hover/40'
                                    }`}
                                  >
                                    {/* Filled background progress bar indicator */}
                                    <div
                                      style={{ width: `${percent}%` }}
                                      className={`absolute left-0 top-0 bottom-0 transition-all duration-500 opacity-10 pointer-events-none ${
                                        isUserChoice ? 'bg-youtube-red' : 'bg-light-muted dark:bg-dark-muted'
                                      }`}
                                    />
                                    
                                    <div className="flex items-center gap-2 z-10">
                                      {isUserChoice && <CheckCircle size={14} className="text-youtube-red shrink-0" />}
                                      <span className="text-light-text dark:text-dark-text">{opt.optionText}</span>
                                    </div>
                                    <span className="text-light-muted dark:text-dark-muted z-10 shrink-0 font-extrabold">{percent}%</span>
                                  </div>
                                );
                              })}
                              <div className="text-[10px] text-light-muted dark:text-dark-muted font-extrabold uppercase mt-1 px-1">
                                {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} • Click option again to retract vote
                              </div>
                            </div>
                          ) : (
                            /* Render Interactive Voting Buttons */
                            <div className="flex flex-col gap-2">
                              {post.pollOptions.map((opt, idx) => (
                                <button
                                  key={opt._id}
                                  onClick={() => handleVote(post._id, idx)}
                                  className="w-full text-left px-4 py-3 text-xs border border-light-border dark:border-dark-border rounded-xl font-bold hover:bg-light-hover dark:hover:bg-dark-hover text-light-text dark:text-dark-text transition-all hover:border-youtube-red/30 shadow-sm"
                                >
                                  {opt.optionText}
                                </button>
                              ))}
                              <div className="text-[10px] text-light-muted dark:text-dark-muted font-extrabold uppercase mt-1 px-1">
                                {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Footer Actions (Like, Dislike, Comments) */}
                      <div className="flex items-center gap-1.5 border-t border-light-border/40 dark:border-dark-border/20 pt-3 text-xs font-bold text-light-text dark:text-dark-text">
                        <button
                          type="button"
                          onClick={() => handlePostReaction(post._id, 'like')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-light-hover dark:hover:bg-dark-hover transition-colors ${
                            userLiked ? 'text-youtube-red bg-youtube-red/10' : ''
                          }`}
                        >
                          <ThumbsUp size={14} fill={userLiked ? 'currentColor' : 'none'} />
                          <span>{post.likes?.length || 0}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePostReaction(post._id, 'dislike')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-light-hover dark:hover:bg-dark-hover transition-colors ${
                            userDisliked ? 'text-yellow-500 bg-yellow-500/10' : ''
                          }`}
                        >
                          <ThumbsDown size={14} fill={userDisliked ? 'currentColor' : 'none'} />
                          <span>{post.dislikes?.length || 0}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleComments(post._id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-light-hover dark:hover:bg-dark-hover transition-colors ${
                            openComments[post._id] ? 'text-youtube-red bg-youtube-red/10' : ''
                          }`}
                        >
                          <MessageSquare size={14} />
                          <span>
                            Comments ({commentsMap[post._id] !== undefined ? commentsMap[post._id].length : (post.commentsCount || 0)})
                          </span>
                        </button>
                      </div>

                      {/* Comments Drawer / Box */}
                      {openComments[post._id] && (
                        <div className="border-t border-light-border/40 dark:border-dark-border/20 pt-4 flex flex-col gap-4">
                          {/* Write Comment Form */}
                          {isAuthenticated ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const draft = commentDrafts[post._id] || '';
                                if (!draft.trim()) return;
                                handleAddComment(post._id, draft);
                                setCommentDrafts(prev => ({ ...prev, [post._id]: '' }));
                              }}
                              className="flex gap-2.5"
                            >
                              <input
                                type="text"
                                required
                                placeholder="Add a comment..."
                                value={commentDrafts[post._id] || ''}
                                onChange={(e) => setCommentDrafts(prev => ({ ...prev, [post._id]: e.target.value }))}
                                className="flex-grow px-3.5 py-2 text-xs border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text rounded-xl focus:outline-none focus:ring-2 focus:ring-youtube-red font-semibold"
                              />
                              <button
                                type="submit"
                                disabled={!(commentDrafts[post._id] || '').trim()}
                                className="px-4 py-2 bg-youtube-red hover:bg-youtube-darkRed text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
                              >
                                Comment
                              </button>
                            </form>
                          ) : (
                            <p className="text-xs text-light-muted dark:text-dark-muted font-bold">
                              Please log in to add a comment.
                            </p>
                          )}

                          {/* Comments List */}
                          {commentsLoadingMap[post._id] ? (
                            <div className="flex flex-col gap-2.5">
                              <div className="h-10 rounded-xl skeleton-loading animate-pulse" />
                              <div className="h-10 rounded-xl skeleton-loading animate-pulse" />
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                              {(commentsMap[post._id] || []).length === 0 ? (
                                <p className="text-xs text-light-muted dark:text-dark-muted font-bold text-center py-2">
                                  No comments yet. Be the first to reply!
                                </p>
                              ) : (
                                (commentsMap[post._id] || []).map((comment) => {
                                  const isCommentOwner = user && (comment.owner?._id === user._id || comment.owner === user._id);
                                  const isPostOwner = user && (post.owner?._id === user._id || post.owner === user._id);
                                  const canDelete = isCommentOwner || isPostOwner || user?.role === 'admin';

                                  return (
                                    <div
                                      key={comment._id}
                                      className="flex gap-2.5 items-start bg-light-hover/30 dark:bg-dark-hover/20 p-2.5 rounded-xl border border-light-border/50 dark:border-dark-border/10 transition-colors"
                                    >
                                      <img
                                        src={getMediaUrl(comment.owner?.avatar)}
                                        alt={comment.owner?.fullName}
                                        className="h-7 w-7 rounded-full object-cover border border-light-border dark:border-dark-border shadow-sm shrink-0"
                                      />
                                      <div className="flex flex-col flex-grow min-w-0">
                                        <div className="flex items-center justify-between">
                                          <span className="font-extrabold text-xs text-light-text dark:text-dark-text truncate">
                                            {comment.owner?.fullName}{' '}
                                            <span className="font-normal text-[10px] text-light-muted dark:text-dark-muted">
                                              @{comment.owner?.username} • {formatRelativeTime(comment.createdAt)}
                                            </span>
                                          </span>
                                          {canDelete && (
                                            <button
                                              onClick={() => handleDeleteComment(post._id, comment._id)}
                                              className="p-1 text-youtube-lightRed hover:text-youtube-red hover:bg-light-hover dark:hover:bg-dark-hover rounded-full transition-colors shrink-0"
                                              title="Delete Comment"
                                            >
                                              <Trash2 size={12} />
                                            </button>
                                          )}
                                        </div>
                                        <p className="text-xs text-light-text dark:text-dark-text mt-0.5 whitespace-pre-wrap font-medium">
                                          {comment.content}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                  );
                })}
              </div>
            )}
          </div>
        )}


        {activeTab === 'about' && (
          <div className="p-6 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-3xl shadow-sm text-sm">
            <h3 className="font-extrabold text-base mb-3 text-light-text dark:text-dark-text uppercase tracking-wide">
              Description
            </h3>
            <p className="text-light-text dark:text-dark-text leading-relaxed whitespace-pre-wrap">
              {channel.bio || 'No bio description provided for this channel.'}
            </p>

            <div className="mt-8 pt-6 border-t border-light-border dark:border-dark-border grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-light-muted dark:text-dark-muted font-bold uppercase tracking-wider">
              <div>
                Joined:{' '}
                <span className="text-light-text dark:text-dark-text">
                  {new Date(channel.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                Role Status:{' '}
                <span className="text-youtube-red">
                  {channel.role === 'admin' ? 'Administrator' : 'Verified Partner'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal overlay */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all dark:bg-dark-card border border-light-border dark:border-dark-border">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-light-border dark:border-dark-border">
              <h3 className="font-bold text-lg text-light-text dark:text-dark-text">Edit Channel Settings</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-full text-light-muted dark:text-dark-muted hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-light-muted dark:text-dark-muted mb-1 uppercase tracking-wide">Avatar logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="w-full text-xs text-brand-muted file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 file:cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-light-muted dark:text-dark-muted mb-1 uppercase tracking-wide">Banner image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="w-full text-xs text-brand-muted file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 file:cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-light-muted dark:text-dark-muted mb-1 uppercase tracking-wide">Channel Display Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-light-border bg-light-bg text-light-text dark:border-dark-border dark:bg-dark-bg dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-youtube-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-light-muted dark:text-dark-muted mb-1 uppercase tracking-wide">About / Bio Description</label>
                <textarea
                  rows="4"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-light-border bg-light-bg text-light-text dark:border-dark-border dark:bg-dark-bg dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-youtube-red resize-none"
                  placeholder="Tell your viewers about your channel..."
                />
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-light-text dark:text-dark-text hover:bg-light-hover dark:hover:bg-dark-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 bg-youtube-red hover:bg-youtube-darkRed text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Channel;
