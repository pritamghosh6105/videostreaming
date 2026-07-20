import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import VideoCard, { getMediaUrl, formatViews } from '../components/VideoCard';
import { VideoGridSkeleton } from '../components/Skeletons';
import { Filter, SlidersHorizontal, Search as SearchIcon, X } from 'lucide-react';

import useDocumentTitle from '../hooks/useDocumentTitle';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  useDocumentTitle(query ? `Search: "${query}"` : 'Search');

  const [localQuery, setLocalQuery] = useState(query);
  const [videos, setVideos] = useState([]);
  const [channels, setChannels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync local query with searchParams
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const handlePageSearch = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchParams({ q: localQuery.trim() });
    } else {
      setSearchParams({});
    }
  };

  // Filters & Sorting states
  const [activeCategory, setActiveCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt'); // createdAt, views, likes
  const [sortType] = useState('desc');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Fetch categories
  useEffect(() => {
    let ignore = false;
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (!ignore) {
          setCategories(res.data.data || []);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Error fetching categories:', err.message);
        }
      }
    };
    fetchCategories();
    return () => {
      ignore = true;
    };
  }, []);

  // Fetch results
  useEffect(() => {
    let ignore = false;
    const fetchResults = async () => {
      try {
        let searchUrl = `/search?query=${encodeURIComponent(query)}&sortBy=${sortBy}&sortType=${sortType}`;
        if (activeCategory) {
          searchUrl += `&category=${activeCategory}`;
        }
        const res = await api.get(searchUrl);
        if (!ignore) {
          const data = res.data.data || {};
          setVideos(data.videos || []);
          setChannels(data.channels || []);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Search results fetch error:', err.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchResults();
    return () => {
      ignore = true;
    };
  }, [query, sortBy, sortType, activeCategory]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 w-full max-w-5xl mx-auto min-h-screen">
      {/* Page Search Input Box (Visible everywhere, especially on mobile) */}
      <form onSubmit={handlePageSearch} className="relative w-full">
        <div className="relative flex items-center">
          <SearchIcon size={18} className="absolute left-4 text-light-muted dark:text-dark-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Type a query to search movies, creators, tags..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="w-full pl-11 pr-24 py-3 text-sm md:text-base rounded-2xl bg-light-hover/60 dark:bg-dark-hover/60 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text placeholder-light-muted dark:placeholder-dark-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-sm font-medium"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            {localQuery && (
              <button
                type="button"
                onClick={() => {
                  setLocalQuery('');
                  setSearchParams({});
                }}
                className="p-1.5 text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors cursor-pointer"
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-brand-primary to-brand-pink text-white text-xs font-bold rounded-xl shadow-md shadow-brand-primary-glow hover:opacity-90 transition-opacity cursor-pointer"
            >
              Search
            </button>
          </div>
        </div>
      </form>

      {/* Search Header */}
      <div className="flex items-center justify-between border-b border-light-border dark:border-dark-border pb-4">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-light-text dark:text-dark-text">
            Search Results
          </h2>
          <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
            {query ? `Showing matches for "${query}"` : 'Type a query in the search bar above'}
          </p>
        </div>

        {/* Filter Drawer Toggle */}
        <button
          onClick={() => setShowFilterDrawer(!showFilterDrawer)}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl border transition-all duration-300 shadow-sm select-none cursor-pointer ${
            showFilterDrawer
              ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary-glow scale-[1.02]'
              : 'bg-light-hover dark:bg-dark-hover border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border'
          }`}
        >
          <SlidersHorizontal size={14} />
          <span>Filters</span>
        </button>
      </div>

      {/* Filter Drawer Panel */}
      {showFilterDrawer && (
        <div className="p-4 rounded-2xl bg-light-hover dark:bg-dark-hover border border-light-border dark:border-dark-border grid grid-cols-1 md:grid-cols-3 gap-6 shadow-sm select-none animate-slide-in">
          {/* Sorting */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-extrabold text-light-muted dark:text-dark-muted uppercase tracking-wider">
              Sort By
            </span>
            <div className="flex flex-col gap-1">
              {[
                { name: 'Upload Date', value: 'createdAt' },
                { name: 'View Count', value: 'views' },
                { name: 'Likes (Popularity)', value: 'likes' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`text-left text-xs py-1.5 px-3 rounded-lg font-semibold transition-colors cursor-pointer ${
                    sortBy === opt.value
                      ? 'bg-youtube-red text-white'
                      : 'hover:bg-light-border dark:hover:bg-dark-border text-light-text dark:text-dark-text'
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Filter */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <span className="text-xs font-extrabold text-light-muted dark:text-dark-muted uppercase tracking-wider">
              Filter by Category
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveCategory('')}
                className={`text-xs py-1.5 px-3 rounded-lg font-semibold border transition-colors cursor-pointer ${
                  activeCategory === ''
                    ? 'bg-youtube-red border-youtube-red text-white'
                    : 'bg-light-bg dark:bg-dark-bg border-light-border dark:border-dark-border hover:bg-light-border dark:hover:bg-dark-border text-light-text dark:text-dark-text'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setActiveCategory(cat._id)}
                  className={`text-xs py-1.5 px-3 rounded-lg font-semibold border transition-colors cursor-pointer ${
                    activeCategory === cat._id
                      ? 'bg-youtube-red border-youtube-red text-white'
                      : 'bg-light-bg dark:bg-dark-bg border-light-border dark:border-dark-border hover:bg-light-border dark:hover:bg-dark-border text-light-text dark:text-dark-text'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="flex flex-col gap-4">
          <div className="w-full aspect-video rounded-xl skeleton-loading md:hidden" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border rounded-xl border-light-border dark:border-dark-border bg-white dark:bg-dark-card skeleton-loading h-40" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Matching Channels section */}
          {channels.length > 0 && (
            <div className="flex flex-col gap-3 pb-6 border-b border-light-border dark:border-dark-border">
              <h3 className="text-xs font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider">
                Channels
              </h3>
              {channels.map((channel) => (
                <Link
                  key={channel._id}
                  to={`/c/${channel.username}`}
                  className="flex items-center gap-4 p-3 rounded-2xl bg-white dark:bg-dark-card border border-light-border dark:border-dark-border hover:shadow-md transition-shadow"
                >
                  <img
                    src={getMediaUrl(channel.avatar)}
                    alt={channel.fullName}
                    className="h-16 w-16 rounded-full object-cover shadow border border-light-border dark:border-dark-border shrink-0"
                  />
                  <div className="flex-grow flex flex-col justify-center">
                    <span className="font-bold text-base text-light-text dark:text-dark-text leading-snug">
                      {channel.fullName}
                    </span>
                    <span className="text-xs text-light-muted dark:text-dark-muted">
                      @{channel.username}
                    </span>
                    {channel.bio && (
                      <p className="text-xs text-light-muted dark:text-dark-muted line-clamp-1 mt-1 pr-10">
                        {channel.bio}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Videos Results List */}
          <div className="flex flex-col gap-3">
            {videos.length === 0 ? (
              <div className="text-center py-20 text-light-muted dark:text-dark-muted">
                <p className="font-semibold text-lg">No videos found.</p>
                <p className="text-xs mt-1">Try check spelling or change filters.</p>
              </div>
            ) : (
              videos.map((video) => (
                <VideoCard key={video._id} video={video} horizontal={true} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
