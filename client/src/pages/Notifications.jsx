import React, { useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { getMediaUrl } from '../components/VideoCard';
import { Bell, CheckSquare, Trash2, Clock, Play, UserPlus, ThumbsUp, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useToast } from '../context/ToastContext';

const Notifications = () => {
  useDocumentTitle('Notifications Hub');
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
  const { showToast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAll = async () => {
    await markAllAsRead();
    showToast('All notifications marked as read.', 'success');
  };

  const getNotifMeta = (type) => {
    switch (type) {
      case 'subscribe':
        return { text: 'subscribed to your channel', Icon: UserPlus, color: 'text-blue-500 bg-blue-500/10' };
      case 'like':
        return { text: 'liked your video', Icon: ThumbsUp, color: 'text-emerald-500 bg-emerald-500/10' };
      case 'comment':
        return { text: 'commented on your video', Icon: MessageSquare, color: 'text-pink-500 bg-pink-500/10' };
      case 'video_upload':
        return { text: 'uploaded a new video', Icon: Play, color: 'text-indigo-500 bg-indigo-500/10' };
      default:
        return { text: 'sent an update', Icon: Bell, color: 'text-neutral-500 bg-neutral-500/10' };
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-4xl mx-auto min-h-screen bg-brand-bg relative pb-20 select-none">
      {/* Background glow sparks */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-pink/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-light-border dark:border-dark-border pb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary relative">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-youtube-red text-white text-[9px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-brand-bg shadow">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-light-text dark:text-dark-text tracking-wide uppercase">
              Notifications
            </h2>
            <p className="text-xs text-light-muted dark:text-dark-muted font-bold mt-0.5">
              Stay updated with subscriptions, comments, and likes
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-brand-primary/10 border border-brand-primary/20 hover:bg-brand-primary/20 text-brand-primary text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            <CheckSquare size={14} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* List content */}
      <div className="flex flex-col gap-3 relative z-10">
        {notifications.length === 0 ? (
          <div className="text-center py-24 rounded-3xl premium-glass border border-light-border/40 dark:border-dark-border/40 p-8 flex flex-col items-center gap-4">
            <Bell size={48} className="text-brand-muted opacity-50 animate-float" />
            <h3 className="font-extrabold text-sm text-light-text dark:text-dark-text uppercase tracking-widest">No new updates</h3>
            <p className="text-xs text-light-muted dark:text-dark-muted font-bold max-w-sm mx-auto leading-relaxed">
              When viewers subscribe to your channel, comment on your videos, or like your posts, they will show up here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {notifications.map((notif) => {
              const meta = getNotifMeta(notif.type);
              const Icon = meta.Icon;
              const isUnread = !notif.isRead;

              return (
                <div
                  key={notif._id}
                  onClick={() => {
                    if (notif.video) {
                      navigate(`/watch/${notif.video._id || notif.video}`);
                    }
                    if (isUnread) {
                      markAsRead(notif._id);
                    }
                  }}
                  className={`p-4.5 rounded-2xl border transition-all duration-300 flex items-start gap-4 cursor-pointer hover:shadow-md ${
                    isUnread
                      ? 'bg-brand-primary/[0.04] dark:bg-brand-primary/[0.08] border-brand-primary/30'
                      : 'bg-white dark:bg-dark-card border-light-border dark:border-dark-border/50 opacity-85 hover:opacity-100'
                  }`}
                >
                  {/* Sender Avatar */}
                  <img
                    src={getMediaUrl(notif.sender?.avatar)}
                    alt={notif.sender?.fullName}
                    className="h-10 w-10 rounded-full object-cover shrink-0 border border-light-border dark:border-dark-border shadow-sm"
                  />

                  {/* Message Detail */}
                  <div className="flex-grow min-w-0">
                    <p className="text-xs text-light-text dark:text-dark-text leading-snug font-semibold">
                      <span className="font-black text-brand-primary hover:underline">
                        {notif.sender?.fullName || 'Someone'}
                      </span>{' '}
                      {meta.text}
                      {notif.video?.title && (
                        <span className="font-bold text-youtube-red dark:text-youtube-lightRed block mt-0.5 leading-snug">
                          "{notif.video.title}"
                        </span>
                      )}
                    </p>
                    <span className="text-[10px] text-light-muted dark:text-dark-muted font-bold flex items-center gap-1 mt-1.5">
                      <Clock size={11} />
                      {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Actions Column */}
                  <div className="shrink-0 flex flex-col items-end gap-2.5 h-full self-center">
                    <div className={`p-2 rounded-xl flex items-center justify-center ${meta.color}`}>
                      <Icon size={14} />
                    </div>
                    {isUnread && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif._id);
                          showToast('Notification marked as read.', 'success');
                        }}
                        className="text-[10px] font-black text-brand-primary hover:underline uppercase tracking-wider cursor-pointer"
                        title="Mark as read"
                      >
                        Read
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
