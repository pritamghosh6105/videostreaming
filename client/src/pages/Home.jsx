import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import VideoCard, { getMediaUrl, formatRelativeTime, formatViews } from '../components/VideoCard';
import { VideoGridSkeleton } from '../components/Skeletons';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Trash2, 
  CheckCircle,
  Play,
  Info,
  Volume2,
  VolumeX,
  Flame,
  Sparkles,
  Compass,
  ArrowRight,
  Monitor,
  ChevronRight
} from 'lucide-react';

import useDocumentTitle from '../hooks/useDocumentTitle';

const Home = () => {
  useDocumentTitle('Cinematic Streams');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [videos, setVideos] = useState([]);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Community Posts
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // Hero section trailer mute toggle
  const [isMuted, setIsMuted] = useState(true);

  // Banner videos playlist selection
  const [bannerVideos, setBannerVideos] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Community Comments
  const [openComments, setOpenComments] = useState({});
  const [commentsMap, setCommentsMap] = useState({});
  const [commentsLoadingMap, setCommentsLoadingMap] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err.message);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Videos & Trending Feed
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await api.get('/videos/feed/trending?limit=6');
        setTrendingVideos(res.data.data || []);
      } catch (err) {
        console.error('Error fetching trending feed:', err.message);
      }
    };
    fetchTrending();
  }, []);

  // Select a random video for the featured banner once videos or trending videos are loaded
  useEffect(() => {
    const allAvailable = [];
    const seen = new Set();
    
    [...trendingVideos, ...videos].forEach(vid => {
      if (vid && vid._id && !seen.has(vid._id)) {
        seen.add(vid._id);
        allAvailable.push(vid);
      }
    });

    if (allAvailable.length > 0 && bannerVideos.length === 0) {
      setBannerVideos(allAvailable);
      const randomIndex = Math.floor(Math.random() * allAvailable.length);
      setCurrentBannerIndex(randomIndex);
    }
  }, [trendingVideos, videos, bannerVideos]);

  const handleNextBanner = () => {
    if (bannerVideos.length === 0) return;
    setCurrentBannerIndex((prevIndex) => 
      prevIndex === bannerVideos.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Fetch Videos
  const fetchVideos = async (reset = false) => {
    const nextPage = reset ? 1 : page;
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let url = `/videos?page=${nextPage}&limit=8`;
      if (activeCategory !== 'all') {
        url += `&category=${activeCategory}`;
      }

      const res = await api.get(url);
      const list = res.data.data || [];
      const pagination = res.data.pagination;

      if (reset) {
        setVideos(list);
      } else {
        setVideos((prev) => [...prev, ...list]);
      }

      setHasMore(nextPage < pagination.pages);
      setPage(nextPage + 1);
    } catch (err) {
      console.error('Error fetching videos:', err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Fetch Community Feed
  const fetchCommunityFeed = async () => {
    setPostsLoading(true);
    try {
      const res = await api.get('/community/feed');
      setPosts(res.data.data || []);
    } catch (err) {
      console.error('Error fetching community feed:', err.message);
    } finally {
      setPostsLoading(false);
    }
  };

  // Vote on Poll Option
  const handleVote = async (postId, optionIndex) => {
    if (!isAuthenticated) {
      alert('Please log in to vote');
      return;
    }

    const originalPosts = [...posts];

    setPosts(prev => prev.map(p => {
      if (p._id !== postId) return p;

      const userId = user._id;
      const updatedPollOptions = p.pollOptions.map((opt, idx) => {
        let newVotes = [...(opt.votes || [])];
        const alreadyVoted = newVotes.some(id => id.toString() === userId.toString());

        if (idx === optionIndex) {
          if (alreadyVoted) {
            newVotes = newVotes.filter(id => id.toString() !== userId.toString());
          } else {
            newVotes.push(userId);
          }
        } else {
          if (alreadyVoted) {
            newVotes = newVotes.filter(id => id.toString() !== userId.toString());
          }
        }

        return { ...opt, votes: newVotes };
      });

      return { ...p, pollOptions: updatedPollOptions };
    }));

    try {
      const res = await api.post(`/community/${postId}/vote`, { optionIndex });
      setPosts(prev => prev.map(p => p._id === postId ? res.data.data : p));
    } catch (err) {
      console.error('Voting failed:', err);
      setPosts(originalPosts);
    }
  };

  // Like/Dislike Post
  const handlePostReaction = async (postId, reactionType) => {
    if (!isAuthenticated) {
      alert('Please log in to react to posts');
      return;
    }

    const originalPosts = [...posts];

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

      return { ...p, likes: newLikes, dislikes: newDislikes };
    }));

    try {
      const res = await api.post(`/community/${postId}/like`, { type: reactionType });
      setPosts(prev => prev.map(p => p._id === postId ? res.data.data : p));
    } catch (err) {
      console.error('Reaction toggle failed:', err);
      setPosts(originalPosts);
    }
  };

  // Fetch Comments for Post
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
      // Update comments count locally
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p));
    } catch (err) {
      console.error(err);
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
      // Update comments count locally
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, commentsCount: Math.max(0, (p.commentsCount || 1) - 1) } : p));
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Community Post
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to permanently delete this post?')) return;
    try {
      await api.delete(`/community/${postId}`);
      setPosts(prev => prev.filter(p => p._id !== postId));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setPage(1);
    setVideos([]);
    setHasMore(true);
    fetchVideos(true);
    setBannerVideos([]); // Reset banner videos list on category change
    if (activeCategory === 'all') {
      fetchCommunityFeed();
    }
  }, [activeCategory]);

  const featuredVideo = bannerVideos[currentBannerIndex] || null;

  return (
    <div className="flex flex-col w-full min-h-screen bg-brand-bg relative pb-16">
      
      {/* 1. Cinematic Hero Banner (Only shown in "All" view) */}
      {activeCategory === 'all' && featuredVideo && (
        <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden select-none bg-black">
          {/* Muted Autoplay Video Preview background */}
          <div className="absolute inset-0 w-full h-full">
            <video
              key={featuredVideo._id}
              src={getMediaUrl(featuredVideo.videoFile)}
              autoPlay
              muted={isMuted}
              loop
              playsInline
              className="w-full h-full object-cover opacity-65 md:opacity-75 transition-opacity duration-700"
            />
            {/* Soft Netflix/Apple TV style Gradient Masks */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-black/30 z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-bg/85 via-transparent to-transparent z-10 hidden md:block" />
          </div>

          {/* Right Arrow Button */}
          {bannerVideos.length > 1 && (
            <button
              onClick={handleNextBanner}
              className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 text-white/40 hover:text-white/90 transition-all duration-300 hover:scale-125 active:scale-90 cursor-pointer"
              title="Next Video"
            >
              <ChevronRight size={44} className="w-10 h-10 md:w-12 md:h-12" />
            </button>
          )}

          {/* Floating Details Overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-20 pl-8 pr-6 md:pl-16 md:pr-12 pb-10 md:pb-16 max-w-4xl flex flex-col gap-3 md:gap-4 justify-end h-full">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-[9px] font-black tracking-widest bg-brand-pink text-white rounded shadow-md uppercase">
                {featuredVideo.category?.name || 'Featured'}
              </span>
              <span className="px-2.5 py-1 text-[9px] font-black tracking-widest bg-brand-primary text-white rounded shadow-md uppercase flex items-center gap-0.5">
                <Sparkles size={10} /> Spotlight
              </span>
            </div>

            <h1 className="text-3xl md:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] line-clamp-2">
              {featuredVideo.title}
            </h1>

            <p className="text-xs md:text-sm text-brand-muted line-clamp-3 leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-medium max-w-2xl">
              {featuredVideo.description}
            </p>

            <div className="flex items-center gap-3 mt-2 md:mt-4">
              <Link
                to={`/watch/${featuredVideo._id}`}
                className="flex items-center gap-2 px-6 md:px-8 py-3 bg-gradient-to-r from-brand-primary to-brand-pink hover:scale-105 active:scale-95 text-white font-bold text-xs md:text-sm rounded-xl shadow-lg shadow-brand-primary-glow smooth-transition"
              >
                <Play size={16} fill="white" />
                <span>Watch Now</span>
              </Link>
              
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-3 bg-white/10 hover:bg-white/20 hover:scale-105 rounded-xl border border-white/10 text-white backdrop-blur-md smooth-transition cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Main content grid wrapper */}
      <div className="flex flex-col gap-10 px-4 md:px-12 w-full max-w-[1600px] mx-auto mt-6">

        {/* 2. Premium Category Pills Bar */}
        <div className="flex gap-2.5 overflow-x-auto pb-2.5 scrollbar-none select-none sticky top-16 bg-brand-bg/80 backdrop-blur-md z-10 py-2">
          <button
            onClick={() => setActiveCategory('all')}
            aria-pressed={activeCategory === 'all'}
            className={`px-5 py-2 rounded-xl text-xs font-black tracking-wider uppercase whitespace-nowrap transition-all duration-300 border ${
              activeCategory === 'all'
                ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary-glow active'
                : 'bg-brand-card hover:bg-black/5 dark:hover:bg-white/10 border-brand-border text-brand-muted hover:text-brand-text'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => setActiveCategory(category.slug)}
              aria-pressed={activeCategory === category.slug}
              className={`px-5 py-2 rounded-xl text-xs font-black tracking-wider uppercase whitespace-nowrap transition-all duration-300 border ${
                activeCategory === category.slug
                  ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary-glow active'
                  : 'bg-brand-card hover:bg-black/5 dark:hover:bg-white/10 border-brand-border text-brand-muted hover:text-brand-text'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* 3. Trending Carousel Slider (Only shown in "All" view) */}
        {activeCategory === 'all' && trendingVideos.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-brand-text flex items-center gap-2">
                  <Sparkles className="text-brand-pink animate-pulse" size={20} />
                  Trending Now
                </h2>
                <p className="text-[11px] font-semibold text-brand-muted mt-0.5">Most watched streams this week</p>
              </div>
            </div>
            
            {/* Scrollable Container */}
            <div className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth scrollbar-thin">
              {trendingVideos.map((video) => (
                <div key={video._id} className="w-72 shrink-0 snap-start">
                  <VideoCard video={video} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Community spotlight cards panel */}
        {activeCategory === 'all' && (
          <section className="flex flex-col gap-4 p-6 md:p-8 premium-glass rounded-3xl relative overflow-hidden">
            {/* Glowing spotlight background glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3 border-b border-brand-border pb-4">
              <div className="p-2.5 bg-brand-primary/10 rounded-2xl border border-brand-primary/20">
                <MessageSquare className="text-brand-primary shrink-0" size={20} />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-black tracking-tight text-brand-text">
                  Community Corner
                </h3>
                <p className="text-xs text-brand-muted font-semibold mt-0.5">
                  Engage in interactive voting, discussion feed and creator updates
                </p>
              </div>
            </div>

            {postsLoading && posts.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
                <div className="h-48 rounded-3xl skeleton-loading animate-pulse" />
                <div className="h-48 rounded-3xl skeleton-loading animate-pulse" />
                <div className="h-48 rounded-3xl skeleton-loading animate-pulse" />
              </div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
                {posts.slice(0, 3).map((post) => {
                  const totalVotes = post.pollOptions?.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0) || 0;
                  const hasVoted = post.pollOptions?.some(opt => opt.votes?.some(id => id.toString() === user?._id?.toString()));
                  const isPostOwner = user && (post.owner?._id === user._id || post.owner === user._id);
                  const showPollResults = hasVoted || isPostOwner || user?.role === 'admin';

                  const userLiked = post.likes?.some(id => id.toString() === user?._id?.toString());
                  const userDisliked = post.dislikes?.some(id => id.toString() === user?._id?.toString());

                  return (
                    <div
                      key={post._id}
                      className="p-5 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl flex flex-col justify-between gap-4 transition-all duration-300"
                    >
                      <div className="flex flex-col gap-3">
                        {/* Header Details */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Link to={`/c/${post.owner?.username}`}>
                              <img
                                src={getMediaUrl(post.owner?.avatar)}
                                alt={post.owner?.fullName}
                                className="h-9 w-9 rounded-xl object-cover border border-white/10 hover:border-brand-primary transition-colors"
                              />
                            </Link>
                            <div className="flex flex-col">
                              <Link to={`/c/${post.owner?.username}`} className="font-extrabold text-xs text-brand-text hover:text-brand-primary transition-colors line-clamp-1">
                                {post.owner?.fullName}
                              </Link>
                              <span className="text-[9px] text-brand-muted font-bold leading-tight mt-0.5">
                                @{post.owner?.username} • {formatRelativeTime(post.createdAt)}
                              </span>
                            </div>
                          </div>

                          {(isPostOwner || user?.role === 'admin') && (
                            <button
                              onClick={() => handleDeletePost(post._id)}
                              className="p-1.5 rounded-lg hover:bg-brand-danger/10 text-brand-danger transition-colors cursor-pointer"
                              title="Delete Post"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>

                        {/* Content text */}
                        <p className="text-xs text-brand-text leading-relaxed font-semibold whitespace-pre-wrap">
                          {post.content}
                        </p>

                        {/* Image display */}
                        {post.type === 'image' && post.attachment && (
                          <div className="rounded-xl overflow-hidden border border-white/5 bg-black/40 max-h-[160px] flex items-center justify-center relative">
                            <img
                              src={getMediaUrl(post.attachment)}
                              alt="Spotlight attachment"
                              className="w-full h-full object-cover max-h-[160px]"
                              loading="lazy"
                            />
                          </div>
                        )}

                        {/* Poll voting option */}
                        {post.type === 'poll' && post.pollOptions && (
                          <div className="flex flex-col gap-2 mt-1 select-none">
                            {showPollResults ? (
                              <div className="flex flex-col gap-1.5">
                                {post.pollOptions.map((opt, idx) => {
                                  const optVotes = opt.votes?.length || 0;
                                  const percent = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
                                  const isUserChoice = opt.votes?.some(id => id.toString() === user?._id?.toString());

                                  return (
                                    <div
                                      key={opt._id}
                                      onClick={() => handleVote(post._id, idx)}
                                      className={`relative p-2.5 border rounded-xl flex items-center justify-between overflow-hidden cursor-pointer transition-all text-[11px] font-bold ${
                                        isUserChoice
                                          ? 'border-brand-primary/45 bg-brand-primary/[0.04]'
                                          : 'border-white/5 hover:bg-white/5'
                                      }`}
                                    >
                                      <div
                                        style={{ width: `${percent}%` }}
                                        className={`absolute left-0 top-0 bottom-0 transition-all duration-700 opacity-15 pointer-events-none ${
                                          isUserChoice ? 'bg-brand-primary' : 'bg-brand-text'
                                        }`}
                                      />
                                      <div className="flex items-center gap-1.5 z-10 text-brand-text">
                                        {isUserChoice && <CheckCircle size={12} className="text-brand-primary shrink-0" />}
                                        <span>{opt.optionText}</span>
                                      </div>
                                      <span className="text-brand-muted z-10 shrink-0 font-extrabold">{percent}%</span>
                                    </div>
                                  );
                                })}
                                <span className="text-[9px] text-brand-muted font-bold mt-1 uppercase tracking-wider">
                                  {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-1.5">
                                {post.pollOptions.map((opt, idx) => (
                                  <button
                                    key={opt._id}
                                    onClick={() => handleVote(post._id, idx)}
                                    className="w-full text-left px-3.5 py-2.5 text-[11px] border border-brand-border hover:border-brand-primary/30 rounded-xl font-bold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-brand-text transition-all shadow-sm"
                                  >
                                    {opt.optionText}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Vote & Comment Reactions */}
                      <div className="flex items-center gap-2 border-t border-brand-border pt-3 text-[11px] font-bold text-brand-text mt-1">
                        <button
                          onClick={() => handlePostReaction(post._id, 'like')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                            userLiked ? 'text-brand-primary bg-brand-primary/10' : 'text-brand-muted'
                          }`}
                        >
                          <ThumbsUp size={12} fill={userLiked ? 'currentColor' : 'none'} />
                          <span>{post.likes?.length || 0}</span>
                        </button>
                        <button
                          onClick={() => handlePostReaction(post._id, 'dislike')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                            userDisliked ? 'text-brand-pink bg-brand-pink/10' : 'text-brand-muted'
                          }`}
                        >
                          <ThumbsDown size={12} fill={userDisliked ? 'currentColor' : 'none'} />
                          <span>{post.dislikes?.length || 0}</span>
                        </button>
                        <button
                          onClick={() => toggleComments(post._id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                            openComments[post._id] ? 'text-brand-primary bg-brand-primary/10' : 'text-brand-muted'
                          }`}
                        >
                          <MessageSquare size={12} />
                          <span>
                            Comments ({commentsMap[post._id] !== undefined ? commentsMap[post._id].length : (post.commentsCount || 0)})
                          </span>
                        </button>
                      </div>

                      {/* Dynamic Comment Section */}
                      {openComments[post._id] && (
                        <div className="border-t border-white/5 pt-3 flex flex-col gap-3">
                          {isAuthenticated ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const draft = commentDrafts[post._id] || '';
                                if (!draft.trim()) return;
                                handleAddComment(post._id, draft);
                                setCommentDrafts(prev => ({ ...prev, [post._id]: '' }));
                              }}
                              className="flex gap-2"
                            >
                              <input
                                type="text"
                                placeholder="Write a comment..."
                                value={commentDrafts[post._id] || ''}
                                onChange={(e) => setCommentDrafts(prev => ({ ...prev, [post._id]: e.target.value }))}
                                className="flex-grow px-3 py-1.5 text-[11px] border border-brand-border bg-black/5 dark:bg-black/45 text-brand-text rounded-xl focus:outline-none focus:border-brand-primary font-semibold"
                              />
                              <button
                                type="submit"
                                className="px-3 py-1.5 bg-brand-primary text-white text-[11px] font-black rounded-xl cursor-pointer hover:bg-brand-primary/90 transition-colors"
                              >
                                Send
                              </button>
                            </form>
                          ) : (
                            <p className="text-[10px] text-brand-muted font-bold">Log in to comment.</p>
                          )}

                          <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                            {(commentsMap[post._id] || []).map((comment) => {
                              const isCommentOwner = user && (comment.owner?._id === user._id || comment.owner === user._id);
                              const canDelete = isCommentOwner || isPostOwner || user?.role === 'admin';

                              return (
                                <div key={comment._id} className="flex gap-2 items-start bg-white/[0.02] p-2 rounded-xl border border-white/5">
                                  <img
                                    src={getMediaUrl(comment.owner?.avatar)}
                                    alt={comment.owner?.fullName}
                                    className="h-6 w-6 rounded-lg object-cover"
                                  />
                                  <div className="flex flex-col flex-grow min-w-0">
                                    <div className="flex items-center justify-between">
                                      <span className="font-extrabold text-[10px] text-brand-text truncate">
                                        {comment.owner?.fullName}
                                      </span>
                                      {canDelete && (
                                        <button
                                          onClick={() => handleDeleteComment(post._id, comment._id)}
                                          className="text-brand-danger hover:underline text-[9px] cursor-pointer"
                                        >
                                          Delete
                                        </button>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-brand-muted mt-0.5 font-semibold">
                                      {comment.content}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </section>
        )}

        {/* 5. Recommended Grid list */}
        <section className="flex flex-col gap-5">
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-brand-text">
              {activeCategory === 'all' ? 'Recommended For You' : `Curated Releases: ${categories.find(c => c.slug === activeCategory)?.name}`}
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">Based on popular trends and upload fresh records</p>
          </div>

          {loading ? (
            <VideoGridSkeleton count={8} />
          ) : videos.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-white/5">
              <p className="text-sm font-bold text-brand-muted">No media entries found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          )}

          {/* Load More Trigger */}
          {hasMore && !loading && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => fetchVideos()}
                disabled={loadingMore}
                className="px-8 py-3 bg-gradient-to-r from-brand-primary to-brand-pink hover:scale-105 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-primary-glow cursor-pointer transition-all disabled:opacity-50"
              >
                {loadingMore ? 'Retrieving records...' : 'Explore More content'}
              </button>
            </div>
          )}
        </section>

      </div>

      {/* 6. Cinematic Premium Footer */}
      <footer className="mt-20 border-t border-brand-border bg-brand-card backdrop-blur-md py-12 px-4 md:px-12">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 select-none">
          <div className="flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-pink text-white flex items-center justify-center">
                <Play size={12} fill="white" className="ml-0.5" />
              </div>
              <span className="font-black text-base tracking-wider uppercase text-brand-text">
                View<span className="bg-gradient-to-r from-brand-primary to-brand-pink bg-clip-text text-transparent">Flow</span>
              </span>
            </Link>
            <p className="text-[11px] text-brand-muted leading-relaxed font-semibold">
              The next-generation video streaming experience. Engineered for beautiful visuals, seamless latency, and creator expression.
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest border-l-2 border-brand-primary pl-2">Platform</h4>
            <Link to="/" className="text-[11px] text-brand-muted hover:text-brand-text transition-colors font-semibold">Home Hub</Link>
            <Link to="/feed/trending" className="text-[11px] text-brand-muted hover:text-brand-text transition-colors font-semibold">Trending Feeds</Link>
            <Link to="/channels" className="text-[11px] text-brand-muted hover:text-brand-text transition-colors font-semibold">Browse Partner channels</Link>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest border-l-2 border-brand-pink pl-2">Legal</h4>
            <span className="text-[11px] text-brand-muted hover:text-brand-text transition-colors font-semibold cursor-pointer">Terms & Conditions</span>
            <span className="text-[11px] text-brand-muted hover:text-brand-text transition-colors font-semibold cursor-pointer">Privacy Charter</span>
            <span className="text-[11px] text-brand-muted hover:text-brand-text transition-colors font-semibold cursor-pointer">Cookie Settings</span>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest border-l-2 border-brand-blue pl-2">Developer info</h4>
            <p className="text-[11px] text-brand-muted leading-relaxed font-semibold">
              Powered by Google Gemini 2.5 Flash, React.js, Express, and MongoDB. 
            </p>
            <span className="text-[10px] text-brand-primary font-bold">© 2026 ViewFlow. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
