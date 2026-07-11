import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getMediaUrl, formatViews } from '../components/VideoCard';
import {
  ShieldAlert,
  Users,
  Video,
  AlertTriangle,
  UserX,
  UserCheck,
  CheckCircle,
  Eye,
  XCircle,
  Search,
  Check,
  Trash2,
  Activity,
  Cpu,
  Database,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

// Import Recharts components
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

import useDocumentTitle from '../hooks/useDocumentTitle';

const AdminPanel = () => {
  useDocumentTitle('System Admin Control Center');
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin]);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Pagination & filter states
  const [userQuery, setUserQuery] = useState('');
  const [activeSubPanel, setActiveSubPanel] = useState('stats'); // stats, users, reports
  const [reportFilter, setReportFilter] = useState('pending'); // pending, resolved, dismissed

  // 1. Fetch Stats
  useEffect(() => {
    if (!isAdmin) return;

    let active = true;
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const res = await api.get('/admin/stats');
        if (active) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching admin stats:', err.message);
      } finally {
        if (active) {
          setStatsLoading(false);
        }
      }
    };

    fetchStats();
    return () => {
      active = false;
    };
  }, [isAdmin, activeSubPanel]);

  // 2. Fetch Users (debounced search)
  useEffect(() => {
    if (!isAdmin || activeSubPanel !== 'users') return;

    let active = true;
    const timer = setTimeout(async () => {
      setUsersLoading(true);
      try {
        const res = await api.get(`/admin/users?query=${encodeURIComponent(userQuery)}`);
        if (active) {
          setUsers(res.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching admin users:', err.message);
      } finally {
        if (active) {
          setUsersLoading(false);
        }
      }
    }, userQuery ? 300 : 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isAdmin, activeSubPanel, userQuery]);

  // 3. Fetch Reports
  useEffect(() => {
    if (!isAdmin || activeSubPanel !== 'reports') return;

    let active = true;
    const fetchReports = async () => {
      setReportsLoading(true);
      try {
        const res = await api.get(`/admin/reports?status=${reportFilter}`);
        if (active) {
          setReports(res.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching admin reports:', err.message);
      } finally {
        if (active) {
          setReportsLoading(false);
        }
      }
    };

    fetchReports();
    return () => {
      active = false;
    };
  }, [isAdmin, activeSubPanel, reportFilter]);

  // Toggle Ban Status
  const handleToggleBan = async (userId) => {
    if (userId.toString() === user._id.toString()) {
      showToast('You cannot ban yourself!', 'error');
      return;
    }

    try {
      const res = await api.patch(`/admin/users/${userId}/ban`);
      const { isBanned } = res.data.data;
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isBanned } : u))
      );
      showToast(`User channel ${isBanned ? 'banned' : 'unbanned'} successfully.`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Ban toggle failed.', 'error');
    }
  };

  // Update Report Status
  const handleUpdateReportStatus = async (reportId, nextStatus) => {
    try {
      await api.patch(`/admin/reports/${reportId}/status`, { status: nextStatus });
      setReports((prev) => prev.filter((r) => r._id !== reportId));
      showToast(`Report status changed to ${nextStatus}.`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status.', 'error');
    }
  };

  // Delete reported content
  const handleDeleteReportedContent = async (report) => {
    const targetType = report.type === 'user' ? 'channel' : report.type;
    if (!window.confirm(`Delete/Ban reported ${targetType} permanently?`)) return;

    try {
      if (report.type === 'video') {
        await api.delete(`/videos/${report.targetId}`);
      } else if (report.type === 'comment') {
        if (report.targetDetail?.parentType === 'communityPost') {
          await api.delete(`/community/comments/${report.targetId}`);
        } else {
          await api.delete(`/comments/${report.targetId}`);
        }
      } else if (report.type === 'user') {
        if (!report.targetDetail?.isBanned) {
          await api.patch(`/admin/users/${report.targetId}/ban`);
        }
      }
      
      await api.patch(`/admin/reports/${report._id}/status`, { status: 'resolved' });
      setReports((prev) => prev.filter((r) => r._id !== report._id));
      showToast('Reported content deleted and ticket resolved.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete reported item.', 'error');
    }
  };

  const handleDeleteCommentOnly = async (report) => {
    if (!window.confirm("Are you sure you want to delete this comment and resolve the ticket?")) return;
    try {
      if (report.targetDetail?.parentType === 'communityPost') {
        await api.delete(`/community/comments/${report.targetId}`);
      } else {
        await api.delete(`/comments/${report.targetId}`);
      }
      await api.patch(`/admin/reports/${report._id}/status`, { status: 'resolved' });
      setReports((prev) => prev.filter((r) => r._id !== report._id));
      showToast('Reported comment deleted and ticket resolved.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete comment.', 'error');
    }
  };

  const handleDeleteCommentAndParent = async (report) => {
    const parentLabel = report.targetDetail?.parentType === 'communityPost' ? 'community post' : 'video';
    if (!window.confirm(`Delete comment AND the parent ${parentLabel}?`)) return;
    try {
      if (report.targetDetail?.parentType === 'communityPost') {
        await api.delete(`/community/${report.targetDetail.parentId}`);
      } else if (report.targetDetail?.parentId) {
        await api.delete(`/videos/${report.targetDetail.parentId}`);
      }
      try {
        if (report.targetDetail?.parentType === 'communityPost') {
          await api.delete(`/community/comments/${report.targetId}`);
        } else {
          await api.delete(`/comments/${report.targetId}`);
        }
      } catch (commentErr) {
        console.log("Comment already deleted via cascade:", commentErr);
      }
      await api.patch(`/admin/reports/${report._id}/status`, { status: 'resolved' });
      setReports((prev) => prev.filter((r) => r._id !== report._id));
      showToast(`Reported comment and parent ${parentLabel} deleted. Ticket resolved.`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete content.', 'error');
    }
  };

  const handleBanCommenterAndResolve = async (report) => {
    const ownerName = report.targetDetail?.owner?.fullName || 'the commenter';
    if (!window.confirm(`Delete the comment AND ban ${ownerName}?`)) return;
    try {
      if (report.targetDetail?.owner?._id) {
        await api.patch(`/admin/users/${report.targetDetail.owner._id}/ban`);
      }
      if (report.targetDetail?.parentType === 'communityPost') {
        await api.delete(`/community/comments/${report.targetId}`);
      } else {
        await api.delete(`/comments/${report.targetId}`);
      }
      await api.patch(`/admin/reports/${report._id}/status`, { status: 'resolved' });
      setReports((prev) => prev.filter((r) => r._id !== report._id));
      showToast(`Comment deleted and commenter's channel banned. Ticket resolved.`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to ban channel.', 'error');
    }
  };

  // Recharts custom colors list
  const COLORS = ['#7C3AED', '#3B82F6', '#EC4899', '#EF4444'];

  const rechartData = stats ? [
    { name: 'Channels', count: stats.users?.total || 0 },
    { name: 'Banned', count: stats.users?.banned || 0 },
    { name: 'Published', count: stats.videos?.published || 0 },
    { name: 'Pending Flag', count: stats.reports?.pending || 0 }
  ] : [];

  if (statsLoading && !stats) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-6xl mx-auto min-h-screen">
        <div className="h-6 w-1/4 rounded skeleton-loading animate-pulse" />
        <div className="h-32 rounded-3xl skeleton-loading mt-6 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-6xl mx-auto min-h-screen select-none relative">
      
      {/* Header Title */}
      <div className="border-b border-white/5 pb-5">
        <h1 className="text-xl md:text-2xl font-black text-brand-primary tracking-wider uppercase flex items-center gap-2">
          <ShieldAlert size={24} className="text-brand-pink" />
          Admin Moderation Suite
        </h1>
        <p className="text-xs text-brand-muted font-semibold mt-0.5">
          Platform-wide administration. Moderation queue audit trails, channel ban logs, and system stats.
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-4 border-b border-white/5">
        {[
          { id: 'stats', name: 'Dashboard' },
          { id: 'users', name: 'User Directory' },
          { id: 'reports', name: 'Flagged Tickets' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubPanel(tab.id)}
            className={`pb-3 text-xs font-black transition-all border-b-2 uppercase tracking-widest ${
              activeSubPanel === tab.id
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-brand-muted hover:text-white'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* SUB PANELS */}

      {activeSubPanel === 'stats' && stats && (
        <div className="flex flex-col gap-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl premium-glass flex flex-col gap-2">
              <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Active Channels</span>
              <span className="font-extrabold text-2xl text-white mt-1">{stats.users?.total}</span>
              <span className="text-[10px] font-bold text-brand-danger">{stats.users?.banned} Suspended profiles</span>
            </div>
            
            <div className="p-5 rounded-2xl premium-glass flex flex-col gap-2">
              <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Active Videos</span>
              <span className="font-extrabold text-2xl text-white mt-1">{stats.videos?.total}</span>
              <span className="text-[10px] font-bold text-brand-success">{stats.videos?.published} Public files</span>
            </div>

            <div className="p-5 rounded-2xl premium-glass flex flex-col gap-2">
              <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Report Tickets</span>
              <span className="font-extrabold text-2xl text-white mt-1">{stats.reports?.total}</span>
              <span className="text-[10px] font-bold text-brand-pink">{stats.reports?.pending} Pending action</span>
            </div>

            <div className="p-5 rounded-2xl premium-glass flex flex-col gap-2">
              <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Global Views</span>
              <span className="font-extrabold text-2xl text-white mt-1">{formatViews(stats.videos?.totalViews).replace('views', '')}</span>
              <span className="text-[10px] font-bold text-brand-blue">{stats.comments?.total} Comments</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System statistics BarChart */}
            <div className="premium-glass p-5 rounded-3xl lg:col-span-2 flex flex-col gap-4">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                <Activity size={16} className="text-brand-primary" /> Platform Database Metrics
              </h3>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rechartData}>
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#09090b', borderColor: '#ffffff10', borderRadius: '12px' }} labelStyle={{ fontWeight: 'bold' }} />
                    <Bar dataKey="count" fill="#7C3AED" radius={[10, 10, 0, 0]}>
                      {rechartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Server diagnostics gauges */}
            <div className="premium-glass p-5 rounded-3xl flex flex-col gap-4">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                <Cpu size={16} className="text-brand-pink" /> System Diagnostics
              </h3>
              <div className="flex flex-col gap-4 font-semibold text-xs text-white">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="text-brand-muted">CPU Core Load</span>
                    <span>14%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-primary rounded-full" style={{ width: '14%' }} />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Memory RAM Heap</span>
                    <span>42%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-pink rounded-full" style={{ width: '42%' }} />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="text-brand-muted">DB Connection Latency</span>
                    <span>4ms</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-blue rounded-full" style={{ width: '8%' }} />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 border-t border-white/5 pt-4 mt-2">
                  <div className="flex justify-between">
                    <span className="text-brand-muted uppercase text-[9px] tracking-wider font-black">Monetization estimated</span>
                    <span className="text-brand-success font-black flex items-center gap-0.5"><DollarSign size={12} />1,425.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubPanel === 'users' && (
        <div className="flex flex-col gap-4">
          {/* User Search Input */}
          <div className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="Search user profile directory..."
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary font-semibold"
            />
            <Search size={14} className="absolute left-3.5 top-3.5 text-brand-muted" />
          </div>

          {/* User List Table */}
          <div className="premium-glass rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/5 bg-white/5 font-black text-xs text-white tracking-widest uppercase">
              User Directories
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-brand-muted uppercase font-black tracking-widest">
                    <th className="p-4">Avatar / Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Admin Access</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white font-semibold">
                  {usersLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="p-4 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full skeleton-loading shrink-0" />
                          <div className="flex flex-col gap-1 w-24">
                            <div className="h-3 rounded skeleton-loading" />
                            <div className="h-2 rounded skeleton-loading w-16" />
                          </div>
                        </td>
                        <td className="p-4"><div className="h-3 rounded skeleton-loading w-32" /></td>
                        <td className="p-4 text-center"><div className="h-3 rounded skeleton-loading w-12 mx-auto" /></td>
                        <td className="p-4 text-center"><div className="h-3 rounded skeleton-loading w-8 mx-auto" /></td>
                        <td className="p-4 text-center"><div className="h-6 rounded-lg skeleton-loading w-20 mx-auto" /></td>
                      </tr>
                    ))
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-brand-muted font-bold">No users matching search filters found.</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={getMediaUrl(u.avatar)}
                            alt={u.fullName}
                            className="h-8 w-8 rounded-xl object-cover shadow border border-white/10"
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{u.fullName}</span>
                            <span className="text-[10px] text-brand-muted">@{u.username}</span>
                          </div>
                        </td>
                        <td className="p-4 text-brand-muted">{u.email}</td>
                        <td className="p-4 text-center font-bold">
                          {u.isBanned ? (
                            <span className="text-brand-danger">BANNED</span>
                          ) : (
                            <span className="text-brand-success">ACTIVE</span>
                          )}
                        </td>
                        <td className="p-4 text-center font-bold text-brand-muted">
                          {u.role === 'admin' ? 'YES' : 'NO'}
                        </td>
                        <td className="p-4 text-center">
                          {u._id.toString() !== user._id.toString() ? (
                            <button
                              onClick={() => handleToggleBan(u._id)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider transition-all cursor-pointer ${
                                u.isBanned
                                  ? 'bg-brand-success/10 text-brand-success hover:bg-brand-success/20'
                                  : 'bg-brand-danger/10 text-brand-danger hover:bg-brand-danger/20'
                              }`}
                            >
                              {u.isBanned ? (
                                <span className="flex items-center gap-1"><UserCheck size={12} /> UNBAN</span>
                              ) : (
                                <span className="flex items-center gap-1"><UserX size={12} /> BAN CHANNEL</span>
                              )}
                            </button>
                          ) : (
                            <span className="text-brand-muted">Self</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubPanel === 'reports' && (
        <div className="flex flex-col gap-4 animate-slide-in">
          {/* Filter Status Selector */}
          <div className="flex gap-2 text-[10px] font-black tracking-widest uppercase select-none">
            {['pending', 'resolved', 'dismissed'].map((status) => (
              <button
                key={status}
                onClick={() => setReportFilter(status)}
                className={`px-4.5 py-2 rounded-xl border transition-all cursor-pointer ${
                  reportFilter === status
                    ? 'bg-brand-primary text-white border-brand-primary shadow shadow-brand-primary-glow'
                    : 'bg-white/5 text-brand-muted border-white/5 hover:bg-white/10 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Ticket Listing */}
          <div className="flex flex-col gap-4">
            {reportsLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-3xl premium-glass flex flex-col gap-3 animate-pulse"
                >
                  <div className="h-4 rounded skeleton-loading w-1/3" />
                  <div className="h-10 rounded-2xl skeleton-loading w-full" />
                </div>
              ))
            ) : reports.length === 0 ? (
              <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-white/5 font-bold text-brand-muted text-sm">
                No report tickets in this category queue.
              </div>
            ) : (
              reports.map((report) => (
                <div
                  key={report._id}
                  className="p-5 rounded-3xl premium-glass flex flex-col gap-3.5 hover:border-brand-primary/20 transition-all duration-300"
                >
                  {/* Top Bar Details */}
                  <div className="flex justify-between items-start text-xs border-b border-white/5 pb-2.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-brand-muted font-black tracking-widest text-[9px] uppercase">REPORTER</span>
                      <span className="font-bold text-white">
                        {report.reporter?.fullName} (@{report.reporter?.username})
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 uppercase">
                      <span className="text-brand-muted font-black tracking-widest text-[9px] uppercase">TYPE</span>
                      <span className="px-2.5 py-0.5 rounded bg-brand-primary/20 text-brand-primary font-black text-[9px] border border-brand-primary/10">
                        {report.type}
                      </span>
                    </div>
                  </div>

                  {/* Body Content Details */}
                  <div className="text-sm font-semibold text-white">
                    <span className="text-[9px] text-brand-pink font-black block uppercase tracking-widest mb-1.5">Reason for Flag</span>
                    <p className="p-3.5 rounded-2xl bg-black/45 border border-white/5 italic text-brand-muted">
                      "{report.reason}"
                    </p>
                  </div>

                  {/* Targeted content preview details */}
                  {report.targetDetail && (
                    <div className="text-xs bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                      <span className="font-black text-[9px] text-brand-primary uppercase block tracking-widest mb-2">Target Preview</span>
                      {report.type === 'video' && (
                        <div className="flex gap-3 items-center">
                          <img src={getMediaUrl(report.targetDetail.thumbnail)} className="h-10 w-16 object-cover rounded-xl" />
                          <div className="flex flex-col">
                            <Link to={`/watch/${report.targetId}`} className="font-bold hover:text-brand-primary transition-colors line-clamp-1">{report.targetDetail.title}</Link>
                            <span className="text-[10px] text-brand-muted font-bold mt-0.5">Owner: @{report.targetDetail.owner?.username}</span>
                          </div>
                        </div>
                      )}
                      {report.type === 'comment' && (
                        <div className="flex flex-col gap-2">
                          <p className="font-semibold text-white">"{report.targetDetail.content}"</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[10px] text-brand-muted font-bold">
                            <span>Commenter: <strong className="text-white">@{report.targetDetail.owner?.username || 'deleted'}</strong></span>
                            {report.targetDetail.parentType && (
                              <span>
                                On {report.targetDetail.parentType === 'communityPost' ? 'Post' : 'Video'}:{' '}
                                <strong className="text-white">
                                  {report.targetDetail.parentTitle || 'Unavailable'}
                                </strong>
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {report.type === 'user' && (
                        <div className="flex items-center gap-3">
                          <img src={getMediaUrl(report.targetDetail.avatar)} className="h-8 w-8 rounded-lg object-cover" />
                          <div className="flex flex-col">
                            <Link to={`/c/${report.targetDetail.username}`} className="font-bold hover:text-brand-primary">{report.targetDetail.fullName}</Link>
                            <span className="text-[10px] text-brand-muted font-bold">@{report.targetDetail.username} ({report.targetDetail.email})</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  {report.status === 'pending' && (
                    <div className="flex flex-wrap gap-2 justify-end mt-1 text-xs select-none">
                      <button
                        onClick={() => handleUpdateReportStatus(report._id, 'dismissed')}
                        className="flex items-center gap-1.5 px-4 py-2 border border-white/5 hover:bg-white/10 rounded-xl text-brand-muted hover:text-white font-bold transition-all cursor-pointer"
                      >
                        <XCircle size={14} /> Dismiss Report
                      </button>
                      
                      {report.targetDetail && report.type === 'comment' && (
                        <>
                          <button
                            onClick={() => handleDeleteCommentOnly(report)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-brand-pink/20 hover:bg-brand-pink text-white rounded-xl font-bold transition-all shadow cursor-pointer border border-brand-pink/15"
                          >
                            <Trash2 size={14} /> Delete Comment
                          </button>
                          {report.targetDetail.parentId && (
                            <button
                              onClick={() => handleDeleteCommentAndParent(report)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-orange-600/20 hover:bg-orange-600 text-white rounded-xl font-bold transition-all shadow cursor-pointer border border-orange-500/15"
                            >
                              <Video size={14} /> Delete Comment + Parent
                            </button>
                          )}
                          {report.targetDetail.owner && (
                            <button
                              onClick={() => handleBanCommenterAndResolve(report)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-brand-danger/20 hover:bg-brand-danger text-white rounded-xl font-bold transition-all shadow cursor-pointer border border-brand-danger/15"
                            >
                              <UserX size={14} /> Delete Comment + Ban Channel
                            </button>
                          )}
                        </>
                      )}

                      {report.targetDetail && report.type !== 'comment' && (
                        <button
                          onClick={() => handleDeleteReportedContent(report)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-brand-danger/20 hover:bg-brand-danger text-white rounded-xl font-bold transition-all shadow cursor-pointer border border-brand-danger/15"
                        >
                          <UserX size={14} /> Delete & Resolve
                        </button>
                      )}
                      
                      {!report.targetDetail && (
                        <button
                          onClick={() => handleUpdateReportStatus(report._id, 'resolved')}
                          className="flex items-center gap-1.5 px-4 py-2 bg-brand-success/20 hover:bg-brand-success text-white rounded-xl font-bold transition-all shadow cursor-pointer border border-brand-success/15"
                        >
                          <Check size={14} /> Mark Resolved
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
