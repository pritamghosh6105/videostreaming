import Comment from '../models/Comment.js';
import Video from '../models/Video.js';
import Notification from '../models/Notification.js';

// @desc    Add comment (or reply)
// @route   POST /api/v1/comments/:videoId
// @access  Private
export const addComment = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { content, parentCommentId } = req.body;

    if (!content) {
      res.status(400);
      throw new Error('Comment content is required');
    }

    const video = await Video.findById(videoId);
    if (!video) {
      res.status(404);
      throw new Error('Video not found');
    }

    let parentComment = null;
    if (parentCommentId) {
      parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        res.status(404);
        throw new Error('Parent comment not found');
      }
    }

    const comment = await Comment.create({
      content,
      video: videoId,
      owner: req.user._id,
      parentComment: parentCommentId || null,
    });

    // Populate owner details to send back
    const populatedComment = await Comment.findById(comment._id).populate(
      'owner',
      'fullName username avatar'
    );

    // Send notifications
    if (parentComment) {
      // Reply notification to parent comment owner
      if (parentComment.owner.toString() !== req.user._id.toString()) {
        await Notification.create({
          sender: req.user._id,
          receiver: parentComment.owner,
          type: 'comment',
          video: videoId,
          comment: comment._id,
        });
      }
    } else {
      // Comment notification to video owner
      if (video.owner.toString() !== req.user._id.toString()) {
        await Notification.create({
          sender: req.user._id,
          receiver: video.owner,
          type: 'comment',
          video: videoId,
          comment: comment._id,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get root comments of a video
// @route   GET /api/v1/comments/:videoId
// @access  Public
export const getCommentsByVideoId = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find root comments (parentComment = null)
    const comments = await Comment.find({ video: videoId, parentComment: null })
      .populate('owner', 'fullName username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count of root comments
    const totalCount = await Comment.countDocuments({ video: videoId, parentComment: null });

    // Include replies count for each comment
    const commentsWithRepliesCount = await Promise.all(
      comments.map(async (comment) => {
        const repliesCount = await Comment.countDocuments({ parentComment: comment._id });
        return {
          ...comment.toObject(),
          repliesCount,
        };
      })
    );

    res.json({
      success: true,
      data: commentsWithRepliesCount,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        pages: Math.ceil(totalCount / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get replies for a specific comment
// @route   GET /api/v1/comments/replies/:commentId
// @access  Public
export const getRepliesByCommentId = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    const replies = await Comment.find({ parentComment: commentId })
      .populate('owner', 'fullName username avatar')
      .sort({ createdAt: 1 }); // Sort replies chronologically

    res.json({
      success: true,
      data: replies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit comment
// @route   PUT /api/v1/comments/:id
// @access  Private (Owner or Admin)
export const editComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      res.status(400);
      throw new Error('Comment content is required');
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      res.status(404);
      throw new Error('Comment not found');
    }

    // Authorization: owner of comment or admin
    if (comment.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('You do not have permission to edit this comment');
    }

    comment.content = content;
    await comment.save();

    const updatedComment = await Comment.findById(id).populate('owner', 'fullName username avatar');

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: updatedComment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/v1/comments/:id
// @access  Private (Owner, Video Owner, or Admin)
export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      res.status(404);
      throw new Error('Comment not found');
    }

    const video = await Video.findById(comment.video);

    // Authorization: comment owner OR video owner OR admin
    const isCommentOwner = comment.owner.toString() === req.user._id.toString();
    const isVideoOwner = video && video.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCommentOwner && !isVideoOwner && !isAdmin) {
      res.status(403);
      throw new Error('You do not have permission to delete this comment');
    }

    // Delete comment
    await comment.deleteOne();

    // Delete all child replies
    await Comment.deleteMany({ parentComment: id });

    // Delete related notifications
    await Notification.deleteMany({ comment: id });

    res.json({
      success: true,
      message: 'Comment and replies deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
