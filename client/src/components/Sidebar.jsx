import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Home,
  Flame,
  History,
  ThumbsUp,
  FolderOpen,
  Users,
  LayoutDashboard,
  Shield,
  Menu,
  Tv
} from 'lucide-react';
import { getMediaUrl } from './VideoCard';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  // Fetch sidebar data
  useEffect(() => {
    const fetchSidebarData = async () => {
      if (isAuthenticated && user) {
        try {
          const subRes = await api.get('/users/subscriptions');
          setSubscribedChannels(subRes.data.data || []);

          const playlistRes = await api.get(`/playlists/user/${user._id}`);
          setPlaylists(playlistRes.data.data || []);
        } catch (err) {
          console.error('Error fetching sidebar user data:', err.message);
        }
      }
    };

    fetchSidebarData();
  }, [isAuthenticated, user]);

  const mainLinks = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Channels', icon: Users, path: '/channels' },
    { name: 'Trending', icon: Flame, path: '/feed/trending' },
    { name: 'Subscriptions', icon: Tv, path: '/subscriptions', authRequired: true },
  ];

  const libraryLinks = [
    { name: 'Watch History', icon: History, path: '/history/watch', authRequired: true },
    { name: 'Liked Videos', icon: ThumbsUp, path: '/liked-videos', authRequired: true },
  ];

  const isActive = (path) => location.pathname === path;

  const sidebarContent = (
    <div className="h-full flex flex-col gap-6 py-6 px-4 overflow-y-auto select-none premium-glass text-brand-text scrollbar-thin rounded-r-3xl">
      {/* Top Header for mobile drawer */}
      <div className="flex items-center gap-3 lg:hidden pl-2 border-b border-brand-border pb-4">
        <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-brand-primary/10 transition-colors cursor-pointer text-brand-text">
          <Menu size={20} />
        </button>
        <span className="font-extrabold text-lg bg-gradient-to-r from-brand-primary to-brand-pink bg-clip-text text-transparent tracking-tight">
          ViewFlow
        </span>
      </div>

      {/* Main navigation links */}
      <div className="flex flex-col gap-1">
        {mainLinks.map((link) => {
          if (link.authRequired && !isAuthenticated) return null;
          const Icon = link.icon;
          const active = isActive(link.path);
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative group overflow-hidden ${
                active 
                  ? 'bg-gradient-to-r from-brand-primary/20 to-brand-pink/10 text-brand-text border-l-4 border-brand-primary' 
                  : 'text-brand-muted hover:text-brand-text hover:bg-brand-primary/10'
              }`}
            >
              <Icon size={18} className={`smooth-transition group-hover:scale-110 ${active ? 'text-brand-primary drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]' : ''}`} />
              <span>{link.name}</span>
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
            </Link>
          );
        })}
      </div>

      {/* Library links */}
      {isAuthenticated && (
        <div className="flex flex-col gap-1 border-t border-brand-border pt-4">
          <h4 className="text-[10px] font-extrabold text-brand-primary px-4 mb-2 uppercase tracking-widest">
            Library
          </h4>
          {libraryLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative group overflow-hidden ${
                  active 
                    ? 'bg-gradient-to-r from-brand-primary/20 to-brand-pink/10 text-brand-text border-l-4 border-brand-primary' 
                    : 'text-brand-muted hover:text-brand-text hover:bg-brand-primary/10'
                }`}
              >
                <Icon size={18} className={`smooth-transition group-hover:scale-110 ${active ? 'text-brand-primary drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]' : ''}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Playlists links */}
      {isAuthenticated && playlists.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-brand-border pt-4">
          <h4 className="text-[10px] font-extrabold text-brand-primary px-4 mb-2 uppercase tracking-widest">
            Playlists
          </h4>
          {playlists.slice(0, 5).map((playlist) => {
            const active = isActive(`/playlist/${playlist._id}`);
            return (
              <Link
                key={playlist._id}
                to={`/playlist/${playlist._id}`}
                className={`flex items-center gap-4 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative group truncate ${
                  active 
                    ? 'bg-gradient-to-r from-brand-primary/20 to-brand-pink/10 text-brand-text border-l-4 border-brand-primary' 
                    : 'text-brand-muted hover:text-brand-text hover:bg-brand-primary/10'
                }`}
              >
                <FolderOpen size={18} className={`smooth-transition group-hover:scale-110 ${active ? 'text-brand-primary drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]' : ''}`} />
                <span className="truncate">{playlist.name}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Subscriptions list */}
      {isAuthenticated && subscribedChannels.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-brand-border pt-4">
          <h4 className="text-[10px] font-extrabold text-brand-primary px-4 mb-2 uppercase tracking-widest">
            Subscriptions
          </h4>
          {subscribedChannels.slice(0, 6).map((channel) => (
            <Link
              key={channel._id}
              to={`/c/${channel.username}`}
              className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-brand-primary/10 group"
            >
              <img
                src={getMediaUrl(channel.avatar)}
                alt={channel.fullName}
                className="h-6 w-6 rounded-full object-cover shadow-md group-hover:scale-110 smooth-transition ring-1 ring-white/10 group-hover:ring-brand-primary"
              />
              <span className="truncate font-semibold text-xs text-brand-muted group-hover:text-brand-text transition-colors">{channel.fullName}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Creator Studio & Admin workspace */}
      {isAuthenticated && (
        <div className="flex flex-col gap-1 border-t border-brand-border pt-4 mt-auto">
          <Link
            to="/dashboard"
            className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group ${
              isActive('/dashboard') ? 'bg-gradient-to-r from-brand-primary/20 to-brand-pink/10 text-brand-text border-l-4 border-brand-primary' : 'text-brand-muted hover:text-brand-text hover:bg-brand-primary/10'
            }`}
          >
            <LayoutDashboard size={18} className={`smooth-transition group-hover:scale-110 ${isActive('/dashboard') ? 'text-brand-primary' : ''}`} />
            <span>Creator Studio</span>
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                isActive('/admin') ? 'bg-gradient-to-r from-brand-primary/20 to-brand-pink/10 text-brand-text border-l-4 border-brand-primary' : 'text-brand-muted hover:text-brand-text hover:bg-brand-primary/10'
              }`}
            >
              <Shield size={18} className={`smooth-transition group-hover:scale-110 ${isActive('/admin') ? 'text-brand-primary' : ''}`} />
              <span>Admin Panel</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside className={`hidden lg:block shrink-0 h-[calc(100vh-64px)] fixed top-16 left-0 select-none z-20 transition-all duration-300 overflow-hidden ${
        isOpen ? 'w-64 opacity-100 p-3' : 'w-20 opacity-100 p-3'
      }`}>
        {isOpen ? (
          sidebarContent
        ) : (
          <div className="h-full flex flex-col gap-6 py-6 items-center overflow-y-auto premium-glass text-brand-text scrollbar-none rounded-2xl">
            {mainLinks.map((link) => {
              if (link.authRequired && !isAuthenticated) return null;
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  title={link.name}
                  className={`p-3 rounded-xl transition-all duration-300 relative group ${
                    active ? 'bg-brand-primary/20 text-brand-primary border-b-2 border-brand-primary' : 'text-brand-muted hover:text-brand-text hover:bg-brand-primary/10'
                  }`}
                >
                  <Icon size={20} className="group-hover:scale-110 smooth-transition" />
                </Link>
              );
            })}
            
            {isAuthenticated && (
              <>
                <div className="w-8 h-px bg-brand-border" />
                {libraryLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      title={link.name}
                      className={`p-3 rounded-xl transition-all duration-300 relative group ${
                        active ? 'bg-brand-primary/20 text-brand-primary' : 'text-brand-muted hover:text-brand-text hover:bg-brand-primary/10'
                      }`}
                    >
                      <Icon size={20} className="group-hover:scale-110 smooth-transition" />
                    </Link>
                  );
                })}
              </>
            )}

            <div className="mt-auto flex flex-col gap-4">
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  title="Creator Studio"
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    isActive('/dashboard') ? 'bg-brand-primary/20 text-brand-primary' : 'text-brand-muted hover:text-brand-text hover:bg-brand-primary/10'
                  }`}
                >
                  <LayoutDashboard size={20} />
                </Link>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Slideout drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300"
          />
          <aside className="relative flex flex-col w-64 max-w-xs h-full z-50 animate-slide-in">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
