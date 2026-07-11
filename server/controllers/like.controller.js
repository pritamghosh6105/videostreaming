import Like from '../models/Like.js';
import Video from '../models/Video.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';

// Helper to update video reaction counters
const updateVideoLikesCount = async (videoId) => {
  const likesCount = await Like.countDocuments({ video: videoId, type: 'like' });
  const dislikesCount = await Like.countDocuments({ video: videoId, type: 'dislike' });
  await Video.findByIdAndUpdate(videoId, { $set: { likesCount, dislikesCount } });
};

// @desc    Toggle like on video
// @route   POST /api/v1/likes/toggle/v/:videoId
// @access  Private
export const toggleVideoLike = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const userId = req.user._id;

    const video = await Video.findById(videoId);
    if (!video) {
      res.status(404);
      throw new Error('Video not found');
    }

    const existingReaction = await Like.findOne({ video: videoId, likedBy: userId });

    if (existingReaction) {
      if (existingReaction.type === 'like') {
        // Remove like
        await existingReaction.deleteOne();
        await updateVideoLikesCount(videoId);
        return res.json({ success: true, message: 'Reaction removed', data: { liked: false, disliked: false } });
      } else {
        // Change from dislike to like
        existingReaction.type = 'like';
        await existingReaction.save();
        await updateVideoLikesCount(videoId);

        // Notify video owner
        if (video.owner.toString() !== userId.toString()) {
          await Notification.create({
            sender: userId,
            receiver: video.owner,
            type: 'like',
            video: videoId,
          });
        }

        return res.json({ success: true, message: 'Changed to like', data: { liked: true, disliked: false } });
      }
    } else {
      // Create new like
      await Like.create({ video: videoId, likedBy: userId, type: 'like' });
      await updateVideoLikesCount(videoId);

      // Notify video owner
      if (video.owner.toString() !== userId.toString()) {
        await Notification.create({
          sender: userId,
          receiver: video.owner,
          type: 'like',
          video: videoId,
        });
      }

      return res.json({ success: true, message: 'Video liked', data: { liked: true, disliked: false } });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle dislike on video
// @route   POST /api/v1/likes/toggle/d/:videoId
// @access  Private
export const toggleVideoDislike = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const userId = req.user._id;

    const video = await Video.findById(videoId);
    if (!video) {
      res.status(404);
      throw new Error('Video not found');
    }

    const existingReaction = await Like.findOne({ video: videoId, likedBy: userId });

    if (existingReaction) {
      if (existingReaction.type === 'dislike') {
        // Remove dislike
        await existingReaction.deleteOne();
        await updateVideoLikesCount(videoId);
        return res.json({ success: true, message: 'Reaction removed', data: { liked: false, disliked: false } });
      } else {
        // Change from like to dislike
        existingReaction.type = 'dislike';
        await existingReaction.save();
        await updateVideoLikesCount(videoId);
        return res.json({ success: true, message: 'Changed to dislike', data: { liked: false, disliked: true } });
      }
    } else {
      // Create new dislike
      await Like.create({ video: videoId, likedBy: userId, type: 'dislike' });
      await updateVideoLikesCount(videoId);
      return res.json({ success: true, message: 'Video disliked', data: { liked: false, disliked: true } });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like on a comment
// @route   POST /api/v1/likes/toggle/c/:commentId
// @access  Private
export const toggleCommentLike = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404);
      throw new Error('Comment not found');
    }

    const existingReaction = await Like.findOne({ comment: commentId, likedBy: userId });

    if (existingReaction) {
      if (existingReaction.type === 'like') {
        await existingReaction.deleteOne();
        return res.json({ success: true, message: 'Reaction removed', data: { liked: false, disliked: false } });
      } else {
        existingReaction.type = 'like';
        await existingReaction.save();
        return res.json({ success: true, message: 'Changed to like', data: { liked: true, disliked: false } });
      }
    } else {
      await Like.create({ comment: commentId, likedBy: userId, type: 'like' });
      return res.json({ success: true, message: 'Comment liked', data: { liked: true, disliked: false } });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle dislike on a comment
// @route   POST /api/v1/likes/toggle/dc/:commentId
// @access  Private
export const toggleCommentDislike = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404);
      throw new Error('Comment not found');
    }

    const existingReaction = await Like.findOne({ comment: commentId, likedBy: userId });

    if (existingReaction) {
      if (existingReaction.type === 'dislike') {
        await existingReaction.deleteOne();
        return res.json({ success: true, message: 'Reaction removed', data: { liked: false, disliked: false } });
      } else {
        existingReaction.type = 'dislike';
        await existingReaction.save();
        return res.json({ success: true, message: 'Changed to dislike', data: { liked: false, disliked: true } });
      }
    } else {
      await Like.create({ comment: commentId, likedBy: userId, type: 'dislike' });
      return res.json({ success: true, message: 'Comment disliked', data: { liked: false, disliked: true } });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get liked videos of a user
// @route   GET /api/v1/likes/videos
// @access  Private
export const getLikedVideos = async (req, res, next) => {
  try {
    const likedRecords = await Like.find({ likedBy: req.user._id, video: { $ne: null }, type: 'like' })
      .populate({
        path: 'video',
        populate: [
          {
            path: 'owner',
            select: 'fullName username avatar',
          },
          {
            path: 'category',
            select: 'name slug',
          }
        ],
      });

    const videos = likedRecords.map(record => record.video).filter(Boolean);

    res.json({
      success: true,
      data: videos,
    });
  } catch (error) {
    next(error);
  }
};
