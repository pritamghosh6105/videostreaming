import User from '../models/User.js';
import Video from '../models/Video.js';
import Comment from '../models/Comment.js';
import CommunityComment from '../models/CommunityComment.js';
import Report from '../models/Report.js';
import Like from '../models/Like.js';
import Notification from '../models/Notification.js';

// @desc    Get dashboard metrics & analytics
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const bannedUsers = await User.countDocuments({ isBanned: true });

    const totalVideos = await Video.countDocuments();
    const publishedVideos = await Video.countDocuments({ isPublished: true });
    const draftVideos = await Video.countDocuments({ isPublished: false });

    const totalComments = await Comment.countDocuments();

    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });

    // Aggregate total views count
    const viewsAgg = await Video.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } },
    ]);
    const totalViews = viewsAgg[0]?.totalViews || 0;

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, banned: bannedUsers },
        videos: { total: totalVideos, published: publishedVideos, drafts: draftVideos, totalViews },
        comments: { total: totalComments },
        reports: { total: totalReports, pending: pendingReports, resolved: resolvedReports },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/v1/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, query } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (query) {
      filter.$or = [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user ban status
// @route   PATCH /api/v1/admin/users/:id/ban
// @access  Private/Admin
export const toggleUserBan = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot ban yourself');
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
      success: true,
      message: `User has been successfully ${user.isBanned ? 'banned' : 'unbanned'}`,
      data: { isBanned: user.isBanned },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports list
// @route   GET /api/v1/admin/reports
// @access  Private/Admin
export const getAllReports = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const reports = await Report.find(filter)
      .populate('reporter', 'fullName username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(filter);

    // Let's dynamically fetch references for reports
    const detailedReports = await Promise.all(
      reports.map(async (report) => {
        let targetDetail = null;
        if (report.type === 'video') {
          targetDetail = await Video.findById(report.targetId)
            .select('title thumbnail owner')
            .populate('owner', 'username fullName');
        } else if (report.type === 'comment') {
          let commentDoc = await Comment.findById(report.targetId)
            .select('content owner video')
            .populate('owner', 'username fullName avatar isBanned')
            .populate('video', 'title');

          if (!commentDoc) {
            commentDoc = await CommunityComment.findById(report.targetId)
              .select('content owner communityPost')
              .populate('owner', 'username fullName avatar isBanned')
              .populate('communityPost', 'content');
          }

          if (commentDoc) {
            targetDetail = commentDoc.toObject();
            if (commentDoc.video) {
              targetDetail.parentType = 'video';
              targetDetail.parentId = commentDoc.video._id;
              targetDetail.parentTitle = commentDoc.video.title;
            } else if (commentDoc.communityPost) {
              targetDetail.parentType = 'communityPost';
              targetDetail.parentId = commentDoc.communityPost._id;
              targetDetail.parentTitle = commentDoc.communityPost.content;
            }
          }
        } else if (report.type === 'user') {
          targetDetail = await User.findById(report.targetId).select('username fullName email avatar isBanned');
        }

        return {
          ...report.toObject(),
          targetDetail,
        };
      })
    );

    res.json({
      success: true,
      data: detailedReports,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update report status (resolve, dismiss)
// @route   PATCH /api/v1/admin/reports/:id/status
// @access  Private/Admin
export const updateReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'resolved', 'dismissed', 'pending'

    if (!['resolved', 'dismissed', 'pending'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status option');
    }

    const report = await Report.findById(id);
    if (!report) {
      res.status(404);
      throw new Error('Report not found');
    }

    report.status = status;
    await report.save();

    res.json({
      success: true,
      message: `Report status updated to ${status}`,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a user report
// @route   POST /api/v1/admin/reports
// @access  Private
export const createReport = async (req, res, next) => {
  try {
    const { type, targetId, reason } = req.body;

    if (!type || !targetId || !reason) {
      res.status(400);
      throw new Error('Type, target ID and reason are required');
    }

    if (!['video', 'comment', 'user'].includes(type)) {
      res.status(400);
      throw new Error('Invalid report type');
    }

    const report = await Report.create({
      reporter: req.user._id,
      type,
      targetId,
      reason,
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};
