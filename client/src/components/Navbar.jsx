import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Menu,
  Search,
  Upload,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  LayoutDashboard,
  Shield,
  Play,
  ThumbsUp,
  MessageSquare,
  UserPlus,
  Mic,
  Settings,
  Sparkles,
  Compass
} from 'lucide-react';
import { getMediaUrl } from './VideoCard';

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Auto-suggest states
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const megaMenuRef = useRef(null);

  // Monitor scroll positioning to update transparency
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync search input with URL search params
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Fetch search suggestions (debounce 300ms)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await api.get(`/videos?query=${encodeURIComponent(searchQuery)}&limit=5`);
        setSuggestions(res.data.data || []);
      } catch (err) {
        console.error('Error fetching search suggestions:', err.message);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Click outside handlers to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
        setShowMegaMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Voice Search Handler
  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice Search is not supported in your browser.', 'error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    showToast('Listening for search query...', 'info');
    recognition.start();

    recognition.onresult = (event) => {
      const voiceResult = event.results[0][0].transcript;
      setSearchQuery(voiceResult);
      showToast(`Searching for: "${voiceResult}"`, 'success');
      navigate(`/search?q=${encodeURIComponent(voiceResult.trim())}`);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      showToast('Could not understand. Please try again.', 'error');
    };
  };

  const renderNotifItem = (notif) => {
    const senderName = notif.sender?.fullName || 'Someone';
    let text = '';
    let Icon = Bell;
    let iconColor = 'text-brand-primary';

    switch (notif.type) {
      case 'subscribe':
        text = 'subscribed to your channel!';
        Icon = UserPlus;
        iconColor = 'text-brand-blue';
        break;
      case 'like':
        text = `liked your video: "${notif.video?.title || ''}"`;
        Icon = ThumbsUp;
        iconColor = 'text-brand-success';
        break;
      case 'comment':
        text = `commented on your video: "${notif.video?.title || ''}"`;
        Icon = MessageSquare;
        iconColor = 'text-brand-pink';
        break;
      case 'video_upload':
        text = `uploaded a new video: "${notif.video?.title || ''}"`;
        Icon = Play;
        iconColor = 'text-brand-primary';
        break;
      default:
        text = 'sent you an update.';
    }

    return (
      <div
        key={notif._id}
        onClick={() => {
          if (notif.video) {
            navigate(`/watch/${notif.video._id}`);
          }
          if (!notif.isRead) {
            markAsRead(notif._id);
          }
          setShowNotifMenu(false);
        }}
        className={`flex items-start gap-3 p-4 text-xs transition-colors hover:bg-brand-primary/10 cursor-pointer border-b border-brand-border ${
          !notif.isRead ? 'bg-brand-primary/10 font-semibold' : ''
        }`}
      >
        <img
          src={getMediaUrl(notif.sender?.avatar)}
          alt={senderName}
          className="h-9 w-9 rounded-full object-cover shrink-0 border border-brand-border"
        />
        <div className="flex-grow flex flex-col gap-0.5">
          <p className="text-brand-text leading-snug">
            <span className="font-bold">{senderName}</span> {text}
          </p>
          <span className="text-[10px] text-brand-muted">
            {new Date(notif.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="shrink-0 flex items-center h-full">
          <Icon size={14} className={iconColor} />
        </div>
      </div>
    );
  };

  return (
    <header className={`h-16 px-2 sm:px-4 lg:px-8 fixed top-0 left-0 right-0 z-30 flex items-center justify-between transition-all duration-300 border-b ${
      scrolled 
        ? 'premium-glass border-brand-border' 
        : 'bg-transparent border-transparent'
    } select-none`}>
      
      {/* Left: Hamburger + Logo */}
      <div className="flex items-center gap-1 sm:gap-4">
        <button
          onClick={toggleSidebar}
          className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl hover:bg-brand-primary/10 text-brand-text transition-colors cursor-pointer"
        >
          <Menu className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        </button>
        
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-pink text-white flex items-center justify-center shadow-lg shadow-brand-primary-glow shrink-0">
            <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5 ml-0.5" fill="white" />
          </div>
          <span className="font-black text-xs min-[360px]:text-sm sm:text-xl tracking-wider uppercase text-brand-text leading-none">
            View<span className="bg-gradient-to-r from-brand-primary to-brand-pink bg-clip-text text-transparent">Flow</span>
          </span>
        </Link>

        {/* Mega Menu Toggle */}
        <div ref={megaMenuRef} className="relative hidden md:block">
          <button
            onClick={() => setShowMegaMenu(!showMegaMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-muted hover:text-brand-text rounded-lg hover:bg-brand-primary/5 transition-colors cursor-pointer"
          >
            <Compass size={14} />
            <span>Discover</span>
          </button>

          {showMegaMenu && (
            <div className="absolute top-full left-0 mt-3 w-80 premium-glass rounded-2xl p-4 shadow-2xl z-50 animate-fade-in">
              <h3 className="text-xs font-bold text-brand-primary mb-3 uppercase tracking-wider">Explore ViewFlow</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link to="/" onClick={() => setShowMegaMenu(false)} className="p-2.5 rounded-xl hover:bg-brand-primary/5 flex flex-col gap-1 transition-colors">
                  <span className="font-bold text-brand-text">Featured Videos</span>
                  <span className="text-[10px] text-brand-muted">Watch the top curated clips.</span>
                </Link>
                <Link to="/feed/trending" onClick={() => setShowMegaMenu(false)} className="p-2.5 rounded-xl hover:bg-brand-primary/5 flex flex-col gap-1 transition-colors">
                  <span className="font-bold text-brand-text">Trending</span>
                  <span className="text-[10px] text-brand-muted">What's viral today.</span>
                </Link>
                <Link to="/channels" onClick={() => setShowMegaMenu(false)} className="p-2.5 rounded-xl hover:bg-brand-primary/5 flex flex-col gap-1 transition-colors">
                  <span className="font-bold text-brand-text">Creators</span>
                  <span className="text-[10px] text-brand-muted">Browse partner channels.</span>
                </Link>
                <div onClick={() => { navigate('/search?category=gaming'); setShowMegaMenu(false); }} className="p-2.5 rounded-xl hover:bg-brand-primary/5 flex flex-col gap-1 transition-colors cursor-pointer">
                  <span className="font-bold text-brand-text">Gaming</span>
                  <span className="text-[10px] text-brand-muted">Live streams & let's plays.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Search Box */}
      <form ref={searchRef} onSubmit={handleSearchSubmit} className="hidden sm:flex items-center flex-grow max-w-lg mx-6 relative group">
        <div className="w-full flex items-center relative">
          <input
            type="text"
            placeholder="Search movies, creator, tags..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="w-full pl-5 pr-20 py-2.5 text-sm rounded-full bg-brand-card/50 border border-brand-border text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all duration-300"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            {/* Voice Search Icon */}
            <button
              type="button"
              onClick={startVoiceSearch}
              title="Voice Search"
              className="p-1.5 rounded-full hover:bg-brand-primary/10 text-brand-muted hover:text-brand-text transition-colors cursor-pointer"
            >
              <Mic size={16} />
            </button>
            
            <button
              type="submit"
              className="p-1.5 rounded-full bg-brand-primary text-white hover:bg-brand-primary/85 transition-colors cursor-pointer shadow-md shadow-brand-primary-glow"
            >
              <Search size={14} />
            </button>
          </div>
        </div>

        {/* Suggestions List */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl premium-glass overflow-hidden flex flex-col z-50 text-xs font-semibold">
            {suggestions.map((s) => (
              <button
                key={s._id}
                type="button"
                onClick={() => {
                  setSearchQuery(s.title);
                  setShowSuggestions(false);
                  navigate(`/search?q=${encodeURIComponent(s.title)}`);
                }}
                className="w-full text-left px-5 py-3 hover:bg-brand-primary/5 flex items-center gap-2 text-brand-text border-b border-brand-border transition-colors cursor-pointer"
              >
                <Search size={12} className="text-brand-muted shrink-0" />
                <span className="truncate">{s.title}</span>
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Right Actions */}
      <div className="flex items-center gap-1 sm:gap-3">
        {/* Mobile Search Icon */}
        <button
          onClick={() => navigate('/search')}
          className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center sm:hidden rounded-xl hover:bg-brand-primary/10 text-brand-text transition-colors cursor-pointer"
        >
          <Search className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        </button>
 
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl hover:bg-brand-primary/10 text-brand-text transition-colors cursor-pointer"
          title="Toggle Mode"
        >
          {isDark ? <Sun className="h-4.5 w-4.5 sm:h-5 sm:w-5" /> : <Moon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />}
        </button>
 
        {isAuthenticated ? (
          <>
            {/* Upload Video */}
            <Link
              to="/upload"
              className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl hover:bg-brand-primary/10 text-brand-text transition-colors cursor-pointer hidden md:flex"
              title="Upload Movie"
            >
              <Upload className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </Link>
 
            {/* Notifications Dropdown */}
            <div ref={notifRef} className="relative flex items-center justify-center">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl hover:bg-brand-primary/10 text-brand-text transition-colors relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 h-3.5 w-3.5 bg-brand-pink text-white text-[8px] font-black rounded-full flex items-center justify-center animate-pulse shadow-md shadow-brand-pink/50">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 top-full mt-3 w-80 rounded-2xl premium-glass overflow-hidden flex flex-col z-50 animate-fade-in">
                  <div className="flex items-center justify-between p-4 border-b border-brand-border bg-brand-card/25">
                    <span className="font-bold text-sm text-brand-text flex items-center gap-1.5">
                      <Sparkles size={14} className="text-brand-pink" />
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-brand-primary hover:underline font-semibold cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto flex flex-col scrollbar-thin">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-brand-muted py-8 font-semibold">
                        No new updates.
                      </p>
                    ) : (
                      notifications.map((notif) => renderNotifItem(notif))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div ref={profileRef} className="relative flex items-center justify-center">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl overflow-hidden border border-brand-border cursor-pointer shadow-lg hover:border-brand-primary/50 transition-colors flex items-center justify-center"
              >
                <img
                  src={getMediaUrl(user.avatar)}
                  alt={user.fullName}
                  className="h-full w-full object-cover"
                />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-3 w-60 rounded-2xl premium-glass overflow-hidden py-1 flex flex-col z-50 animate-fade-in">
                  <div className="p-4 border-b border-brand-border flex flex-col bg-brand-card/25">
                    <span className="font-extrabold text-sm text-brand-text truncate">
                      {user.fullName}
                    </span>
                    <span className="text-xs text-brand-muted truncate mt-0.5">
                      @{user.username}
                    </span>
                  </div>

                  <Link
                    to={`/c/${user.username}`}
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold hover:bg-brand-primary/10 text-brand-text transition-colors"
                  >
                    <User size={16} className="text-brand-muted" />
                    <span>My Studio Channel</span>
                  </Link>

                  <Link
                    to="/dashboard"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold hover:bg-brand-primary/10 text-brand-text transition-colors"
                  >
                    <LayoutDashboard size={16} className="text-brand-muted" />
                    <span>Creator Dashboard</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-semibold hover:bg-brand-primary/10 text-brand-primary border-t border-brand-border transition-colors"
                    >
                      <Shield size={16} />
                      <span className="font-bold">System Admin</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-brand-danger hover:bg-brand-primary/10 border-t border-brand-border transition-colors text-left cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-brand-primary to-brand-pink hover:from-brand-primary hover:to-brand-pink/90 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-primary-glow hover:scale-105 transition-all"
          >
            <User size={14} />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
