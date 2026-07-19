import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Trash2, Edit2, MessageSquare, CornerDownRight, Check, X, ShieldAlert } from 'lucide-react';
import { CommentSkeleton } from './Skeletons';
import { getMediaUrl } from './VideoCard';

const CommentSection = ({ videoId }) => {
  const { user, isAdmin } = useAuth();

  const getOwnerId = (owner) => {
    if (!owner) return '';
    return typeof owner === 'object' ? owner._id : owner;
  };

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Active editors / reply states
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [replyCommentId, setReplyCommentId] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  // Loaded replies container by commentId
  const [loadedReplies, setLoadedReplies] = useState({}); // { [commentId]: repliesArray }
  const [showRepliesFor, setShowRepliesFor] = useState({}); // { [commentId]: boolean }

  const fetchComments = async (reset = false) => {
    const nextPage = reset ? 1 : page;
    if (reset) {
      setLoading(true);
    }
    try {
      const res = await api.get(`/comments/${videoId}?page=${nextPage}&limit=10`);
      const list = res.data.data || [];
      const pagination = res.data.pagination;

      if (reset) {
        setComments(list);
      } else {
        setComments((prev) => [...prev, ...list]);
      }
      
      setHasMore(nextPage < pagination.pages);
      setPage(nextPage + 1);
    } catch (err) {
      console.error('Error fetching comments:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setComments([]);
    setHasMore(true);
    setLoadedReplies({});
    setShowRepliesFor({});
    fetchComments(true);
  }, [videoId]);

  // Submit comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/comments/${videoId}`, { content: newComment });
      setComments((prev) => [res.data.data, ...prev]);
      setNewComment('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit reply
  const handleAddReply = async (parentCommentId) => {
    if (!replyContent.trim() || !user) return;

    try {
      const res = await api.post(`/comments/${videoId}`, {
        content: replyContent,
        parentCommentId,
      });

      // Insert reply into loadedReplies list
      setLoadedReplies((prev) => ({
        ...prev,
        [parentCommentId]: [...(prev[parentCommentId] || []), res.data.data],
      }));

      // Update parent comment's replies count locally
      setComments((prev) =>
        prev.map((c) =>
          c._id === parentCommentId ? { ...c, repliesCount: (c.repliesCount || 0) + 1 } : c
        )
      );

      setReplyContent('');
      setReplyCommentId(null);
      setShowRepliesFor((prev) => ({ ...prev, [parentCommentId]: true }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit reply');
    }
  };

  // Fetch replies
  const handleToggleReplies = async (commentId) => {
    const isShowing = showRepliesFor[commentId];
    
    // Fetch if not already loaded
    if (!isShowing && !loadedReplies[commentId]) {
      try {
        const res = await api.get(`/comments/replies/${commentId}`);
        setLoadedReplies((prev) => ({
          ...prev,
          [commentId]: res.data.data || [],
        }));
      } catch (err) {
        console.error('Error fetching replies:', err.message);
      }
    }

    setShowRepliesFor((prev) => ({
      ...prev,
      [commentId]: !isShowing,
    }));
  };

  // Edit comment
  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      const res = await api.put(`/comments/${commentId}`, { content: editContent });
      
      // Update in main list
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, content: res.data.data.content } : c))
      );

      // Or update in replies
      setLoadedReplies((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          updated[key] = updated[key].map((r) =>
            r._id === commentId ? { ...r, content: res.data.data.content } : r
          );
        });
        return updated;
      });

      setEditingCommentId(null);
      setEditContent('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to edit comment');
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId, parentCommentId = null) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await api.delete(`/comments/${commentId}`);
      
      if (parentCommentId) {
        // Remove from replies
        setLoadedReplies((prev) => ({
          ...prev,
          [parentCommentId]: prev[parentCommentId].filter((r) => r._id !== commentId),
        }));
        // Decrement parent replies count
        setComments((prev) =>
          prev.map((c) =>
            c._id === parentCommentId ? { ...c, repliesCount: Math.max(0, (c.repliesCount || 1) - 1) } : c
          )
        );
      } else {
        // Remove from root comments
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  // Report comment
  const handleReportComment = async (commentId) => {
    const reason = prompt('Reason for reporting this comment:');
    if (!reason) return;

    try {
      await api.post('/admin/reports', {
        type: 'comment',
        targetId: commentId,
        reason,
      });
      alert('Report submitted successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit report');
    }
  };

  return (
    <div className="mt-6 border-t border-light-border dark:border-dark-border pt-6">
      <h3 className="font-semibold text-lg mb-4 text-light-text dark:text-dark-text">
        {comments.length} Comments
      </h3>

      {/* Add comment Form */}
      {user ? (
        <form onSubmit={handleAddComment} className="flex gap-3 mb-6 items-start">
          <img src={getMediaUrl(user.avatar)} alt={user.fullName} className="h-10 w-10 rounded-full object-cover shadow-sm shrink-0" />
          <div className="flex-grow flex flex-col gap-2">
            <textarea
              placeholder="Add a public comment..."
              rows="2"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-light-border bg-light-bg text-light-text dark:border-dark-border dark:bg-dark-bg dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-youtube-red resize-none"
            />
            {newComment.trim() && (
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewComment('')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-light-hover dark:hover:bg-dark-hover text-light-text dark:text-dark-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-youtube-red hover:bg-youtube-darkRed text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  {submitting ? 'Commenting...' : 'Comment'}
                </button>
              </div>
            )}
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-xl bg-light-hover dark:bg-dark-hover text-center text-sm font-semibold text-light-muted dark:text-dark-muted mb-6">
          Please login to leave comments.
        </div>
      )}

      {/* Comments List */}
      {loading && comments.length === 0 ? (
        <div className="flex flex-col gap-4">
          <CommentSkeleton />
          <CommentSkeleton />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {comments.map((comment) => {
            const isCommentOwner = user && getOwnerId(comment.owner) === user._id;
            const canModerate = isCommentOwner || isAdmin;
            
            return (
              <div key={comment._id} className="flex gap-3">
                <img
                  src={getMediaUrl(comment.owner?.avatar)}
                  alt={comment.owner?.fullName}
                  className="h-10 w-10 rounded-full object-cover shrink-0 shadow-sm"
                />

                <div className="flex-grow flex flex-col gap-1">
                  {/* Author / Date info */}
                  <div className="flex items-center gap-2 text-xs text-light-muted dark:text-dark-muted">
                    <span className="font-semibold text-light-text dark:text-dark-text">
                      {comment.owner?.fullName || 'Deleted User'}
                    </span>
                    <span>@{comment.owner?.username}</span>
                    <span>•</span>
                    <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Comment Text / Edit box */}
                  {editingCommentId === comment._id ? (
                    <div className="flex flex-col gap-2 mt-1">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-light-border bg-light-bg text-light-text dark:border-dark-border dark:bg-dark-bg dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-youtube-red"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingCommentId(null)}
                          className="p-1.5 rounded-full hover:bg-light-hover dark:hover:bg-dark-hover text-light-muted dark:text-dark-muted transition-colors"
                        >
                          <X size={16} />
                        </button>
                        <button
                          onClick={() => handleEditComment(comment._id)}
                          className="p-1.5 rounded-full bg-youtube-red text-white hover:bg-youtube-darkRed transition-colors"
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-light-text dark:text-dark-text pr-2 leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}

                  {/* Reaction and Reply links */}
                  <div className="flex items-center gap-4 text-xs font-semibold text-light-muted dark:text-dark-muted mt-1 select-none">
                    {user && (
                      <button
                        onClick={() => {
                          setReplyCommentId(comment._id);
                          setReplyContent('');
                        }}
                        className="flex items-center gap-1 hover:text-light-text dark:hover:text-dark-text transition-colors cursor-pointer"
                      >
                        <MessageSquare size={13} /> Reply
                      </button>
                    )}

                    {canModerate && (
                      <>
                        <button
                          onClick={() => {
                            setEditingCommentId(comment._id);
                            setEditContent(comment.content);
                          }}
                          className="flex items-center gap-1 hover:text-light-text dark:hover:text-dark-text transition-colors cursor-pointer"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="flex items-center gap-1 hover:text-youtube-red transition-colors text-youtube-lightRed cursor-pointer"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </>
                    )}

                    {user && !isCommentOwner && (
                      <button
                        onClick={() => handleReportComment(comment._id)}
                        className="flex items-center gap-1 hover:text-amber-500 transition-colors text-amber-600/80 cursor-pointer"
                      >
                        <ShieldAlert size={13} /> Report
                      </button>
                    )}
                  </div>

                  {/* Submit reply textarea */}
                  {replyCommentId === comment._id && (
                    <div className="flex flex-col gap-2 mt-3 pl-4 border-l-2 border-light-border dark:border-dark-border">
                      <textarea
                        placeholder="Reply to this comment..."
                        rows="2"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-light-border bg-light-bg text-light-text dark:border-dark-border dark:bg-dark-bg dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-youtube-red"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setReplyCommentId(null)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleAddReply(comment._id)}
                          className="px-3 py-1.5 bg-youtube-red hover:bg-youtube-darkRed text-white text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Replies loader / viewer button */}
                  {comment.repliesCount > 0 && (
                    <button
                      onClick={() => handleToggleReplies(comment._id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-youtube-red hover:underline mt-2 text-left cursor-pointer"
                    >
                      <CornerDownRight size={13} />
                      {showRepliesFor[comment._id]
                        ? 'Hide replies'
                        : `View ${comment.repliesCount} ${comment.repliesCount === 1 ? 'reply' : 'replies'}`}
                    </button>
                  )}

                  {/* Nested Replies list */}
                  {showRepliesFor[comment._id] && loadedReplies[comment._id] && (
                    <div className="flex flex-col gap-4 mt-3 pl-4 border-l-2 border-light-border dark:border-dark-border">
                      {loadedReplies[comment._id].map((reply) => {
                        const isReplyOwner = user && getOwnerId(reply.owner) === user._id;
                        const canModerateReply = isReplyOwner || isAdmin;

                        return (
                          <div key={reply._id} className="flex gap-2 py-1">
                            <img
                              src={getMediaUrl(reply.owner?.avatar)}
                              alt={reply.owner?.fullName}
                              className="h-8 w-8 rounded-full object-cover shrink-0 shadow-sm"
                            />
                            <div className="flex-grow flex flex-col gap-0.5">
                              <div className="flex items-center gap-2 text-xs text-light-muted dark:text-dark-muted">
                                <span className="font-semibold text-light-text dark:text-dark-text">
                                  {reply.owner?.fullName || 'Deleted User'}
                                </span>
                                <span>@{reply.owner?.username}</span>
                                <span>•</span>
                                <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                              </div>

                              {editingCommentId === reply._id ? (
                                <div className="flex flex-col gap-2 mt-1">
                                  <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full px-2 py-1 text-sm rounded-lg border border-light-border bg-light-bg text-light-text dark:border-dark-border dark:bg-dark-bg dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-youtube-red"
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={() => setEditingCommentId(null)}
                                      className="p-1 rounded-full hover:bg-light-hover dark:hover:bg-dark-hover"
                                    >
                                      <X size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleEditComment(reply._id)}
                                      className="p-1 rounded-full bg-youtube-red text-white"
                                    >
                                      <Check size={14} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-light-text dark:text-dark-text pr-2 whitespace-pre-wrap">
                                  {reply.content}
                                </p>
                              )}

                              {/* Edit / delete for reply */}
                              <div className="flex items-center gap-3 text-xs font-semibold text-light-muted dark:text-dark-muted mt-0.5 select-none">
                                {canModerateReply && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingCommentId(reply._id);
                                        setEditContent(reply.content);
                                      }}
                                      className="hover:text-light-text dark:hover:text-dark-text transition-colors cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteComment(reply._id, comment._id)}
                                      className="hover:text-youtube-red transition-colors text-youtube-lightRed cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                                {user && !isReplyOwner && (
                                  <button
                                    onClick={() => handleReportComment(reply._id)}
                                    className="hover:text-amber-500 transition-colors text-amber-600/80 cursor-pointer"
                                  >
                                    Report
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Infinite load trigger / pagination button */}
      {hasMore && (
        <button
          onClick={() => fetchComments()}
          className="w-full text-center mt-6 text-sm font-semibold text-light-muted dark:text-dark-muted hover:text-youtube-red transition-colors py-2 rounded-lg bg-light-hover dark:bg-dark-hover"
        >
          Load More Comments
        </button>
      )}
    </div>
  );
};

export default CommentSection;
