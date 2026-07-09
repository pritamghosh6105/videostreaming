import CommunityPost from '../models/CommunityPost.js';
import User from '../models/User.js';
import CommunityComment from '../models/CommunityComment.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import mongoose from 'mongoose';


// @desc    Create a new community post (text, image, or poll)
// @route   POST /api/v1/community/create
// @access  Private
export const createCommunityPost = async (req, res, next) => {
  try {
    const { type, content, pollOptions } = req.body;
    const userId = req.user._id;

    if (!content) {
      res.status(400);
      throw new Error('Post content text is required');
    }

    let attachmentUrl = '';
    let attachmentPid = '';
    let parsedPollOptions = [];

    // Handle image upload if type is image
    if (type === 'image' && req.file) {
      const uploadResult = await uploadOnCloudinary(req.file.path, 'image');
      attachmentUrl = uploadResult.url;
      attachmentPid = uploadResult.publicId;
    }

    // Handle poll options parsing if type is poll
    if (type === 'poll' && pollOptions) {
      try {
        const optionsArray = typeof pollOptions === 'string' ? JSON.parse(pollOptions) : pollOptions;
        if (Array.isArray(optionsArray)) {
          parsedPollOptions = optionsArray
            .filter(opt => opt && opt.trim())
            .map(opt => ({ optionText: opt.trim(), votes: [] }));
        }
      } catch (err) {
        res.status(400);
        throw new Error('Invalid poll options format. Must be an array of choices.');
      }

      if (parsedPollOptions.length < 2) {
        res.status(400);
        throw new Error('Poll must have at least 2 choices');
      }
    }

    const newPost = await CommunityPost.create({
      owner: userId,
      type: type || 'text',
      content,
      attachment: attachmentUrl,
      attachmentPublicId: attachmentPid,
      pollOptions: parsedPollOptions,
    });

    const populatedPost = await CommunityPost.findById(newPost._id).populate(
      'owner',
      'fullName username avatar'
    );

    res.status(201).json({
      success: true,
      message: 'Community post published successfully',
      data: {
        ...populatedPost.toObject(),
        commentsCount: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all community posts of a channel
// @route   GET /api/v1/community/c/:username
// @access  Public
export const getChannelPosts = async (req, res, next) => {
  try {
    const { username } = req.params;

    const channel = await User.findOne({ username: username.toLowerCase() });
    if (!channel) {
      res.status(404);
      throw new Error('Channel not found');
    }

    const posts = await CommunityPost.find({ owner: channel._id })
      .populate('owner', 'fullName username avatar')
      .sort({ createdAt: -1 });

    const postsWithCommentsCount = await Promise.all(
      posts.map(async (post) => {
        const commentsCount = await CommunityComment.countDocuments({ communityPost: post._id });
        return {
          ...post.toObject(),
          commentsCount,
        };
      })
    );

    res.json({
      success: true,
      data: postsWithCommentsCount,
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete a community post
// @route   DELETE /api/v1/community/:id
// @access  Private (Owner or Admin)
export const deleteCommunityPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await CommunityPost.findById(id);
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    // Check authorization: must be owner or admin
    if (post.owner.toString() !== userId.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Unauthorized to delete this post');
    }

    // Clean up Cloudinary/local attachment if any
    if (post.attachmentPublicId) {
      await deleteFromCloudinary(post.attachmentPublicId, 'image');
    }

    await post.deleteOne();

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Vote on a poll option
// @route   POST /api/v1/community/:id/vote
// @access  Private
export const voteOnPoll = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { optionIndex } = req.body;
    const userId = req.user._id;

    if (optionIndex === undefined) {
      res.status(400);
      throw new Error('Option index is required');
    }

    const post = await CommunityPost.findById(id);
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    if (post.type !== 'poll') {
      res.status(400);
      throw new Error('This post is not a poll');
    }

    const optIndex = parseInt(optionIndex);
    if (isNaN(optIndex) || optIndex < 0 || optIndex >= post.pollOptions.length) {
      res.status(400);
      throw new Error('Invalid option index choice');
    }

    // Check if user has already voted
    let userVotedOptionIndex = -1;
    post.pollOptions.forEach((opt, idx) => {
      const alreadyVoted = opt.votes.some(id => id.toString() === userId.toString());
      if (alreadyVoted) {
        userVotedOptionIndex = idx;
      }
    });

    if (userVotedOptionIndex === optIndex) {
      // Toggle off (remove vote)
      post.pollOptions[optIndex].votes = post.pollOptions[optIndex].votes.filter(
        id => id.toString() !== userId.toString()
      );
    } else {
      // Remove from previous choice
      if (userVotedOptionIndex !== -1) {
        post.pollOptions[userVotedOptionIndex].votes = post.pollOptions[userVotedOptionIndex].votes.filter(
          id => id.toString() !== userId.toString()
        );
      }
      // Add vote to the new option
      post.pollOptions[optIndex].votes.push(userId);
    }

    await post.save();

    // Populate owner directly and count comments in parallel (avoiding redundant findById)
    const [commentsCount] = await Promise.all([
      CommunityComment.countDocuments({ communityPost: post._id }),
      post.populate('owner', 'fullName username avatar')
    ]);

    res.json({
      success: true,
      message: 'Vote registered successfully',
      data: {
        ...post.toObject(),
        commentsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like/dislike on a community post
// @route   POST /api/v1/community/:id/like
// @access  Private
export const togglePostLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'like' or 'dislike'
    const userId = req.user._id;

    if (!['like', 'dislike'].includes(type)) {
      res.status(400);
      throw new Error('Invalid reaction type. Must be like or dislike');
    }

    const post = await CommunityPost.findById(id);
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    const hasLiked = post.likes.some(id => id.toString() === userId.toString());
    const hasDisliked = post.dislikes.some(id => id.toString() === userId.toString());

    if (type === 'like') {
      if (hasLiked) {
        // Toggle OFF like
        post.likes = post.likes.filter(id => id.toString() !== userId.toString());
      } else {
        // Toggle ON like, remove dislike if exists
        post.likes.push(userId);
        post.dislikes = post.dislikes.filter(id => id.toString() !== userId.toString());
      }
    } else {
      if (hasDisliked) {
        // Toggle OFF dislike
        post.dislikes = post.dislikes.filter(id => id.toString() !== userId.toString());
      } else {
        // Toggle ON dislike, remove like if exists
        post.dislikes.push(userId);
        post.likes = post.likes.filter(id => id.toString() !== userId.toString());
      }
    }

    await post.save();

    const updatedPost = await CommunityPost.findById(id).populate(
      'owner',
      'fullName username avatar'
    );

    const commentsCount = await CommunityComment.countDocuments({ communityPost: updatedPost._id });

    res.json({
      success: true,
      message: 'Reaction updated successfully',
      data: {
        ...updatedPost.toObject(),
        commentsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get global community posts feed
// @route   GET /api/v1/community/feed
// @access  Public
export const getCommunityFeed = async (req, res, next) => {
  try {
    const posts = await CommunityPost.find()
      .populate('owner', 'fullName username avatar')
      .sort({ createdAt: -1 })
      .limit(6);

    const postsWithCommentsCount = await Promise.all(
      posts.map(async (post) => {
        const commentsCount = await CommunityComment.countDocuments({ communityPost: post._id });
        return {
          ...post.toObject(),
          commentsCount,
        };
      })
    );

    res.json({
      success: true,
      data: postsWithCommentsCount,
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Add a comment to a community post
// @route   POST /api/v1/community/:id/comments
// @access  Private
export const addCommunityComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content) {
      res.status(400);
      throw new Error('Comment content is required');
    }

    const post = await CommunityPost.findById(id);
    if (!post) {
      res.status(404);
      throw new Error('Community post not found');
    }

    const comment = await CommunityComment.create({
      content,
      communityPost: id,
      owner: userId,
    });

    const populatedComment = await CommunityComment.findById(comment._id).populate(
      'owner',
      'fullName username avatar'
    );

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments of a community post
// @route   GET /api/v1/community/:id/comments
// @access  Public
export const getCommunityComments = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comments = await CommunityComment.find({ communityPost: id })
      .populate('owner', 'fullName username avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a community comment
// @route   DELETE /api/v1/community/comments/:commentId
// @access  Private (Comment Owner, Post Owner, or Admin)
export const deleteCommunityComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await CommunityComment.findById(commentId);
    if (!comment) {
      res.status(404);
      throw new Error('Comment not found');
    }

    const post = await CommunityPost.findById(comment.communityPost);

    const isCommentOwner = comment.owner.toString() === userId.toString();
    const isPostOwner = post && post.owner.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCommentOwner && !isPostOwner && !isAdmin) {
      res.status(403);
      throw new Error('Unauthorized to delete this comment');
    }

    await comment.deleteOne();

    res.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};


