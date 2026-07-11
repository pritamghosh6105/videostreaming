import Video from '../models/Video.js';
import User from '../models/User.js';
import Like from '../models/Like.js';
import Subscription from '../models/Subscription.js';
import Notification from '../models/Notification.js';
import Category from '../models/Category.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import mongoose from 'mongoose';

// @desc    Upload video and thumbnail
// @route   POST /api/v1/videos/upload
// @access  Private
export const uploadVideo = async (req, res, next) => {
  try {
    const { title, description, category, tags, isPublished } = req.body;

    if (!title || !description || !category) {
      res.status(400);
      throw new Error('Title, description and category are required');
    }

    if (!req.files || !req.files.videoFile || !req.files.videoFile[0]) {
      res.status(400);
      throw new Error('Please select a video file to upload');
    }

    if (!req.files.thumbnail || !req.files.thumbnail[0]) {
      res.status(400);
      throw new Error('Please select a thumbnail file to upload');
    }

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      res.status(404);
      throw new Error('Selected category not found');
    }

    // Upload to Cloudinary
    const videoUpload = await uploadOnCloudinary(req.files.videoFile[0].path, 'video');
    const thumbnailUpload = await uploadOnCloudinary(req.files.thumbnail[0].path, 'image');

    // Parse tags (comma separated string to array)
    let tagsArray = [];
    if (tags) {
      tagsArray = tags.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean);
    }

    const video = await Video.create({
      title,
      description,
      category,
      tags: tagsArray,
      videoFile: videoUpload.url,
      videoPublicId: videoUpload.publicId,
      thumbnail: thumbnailUpload.url,
      thumbnailPublicId: thumbnailUpload.publicId,
      duration: Math.round(videoUpload.duration || 0),
      owner: req.user._id,
      isPublished: isPublished !== undefined ? isPublished === 'true' || isPublished === true : true,
    });

    // Create notifications for subscribers
    const subscribers = await Subscription.find({ channel: req.user._id });
    const notifications = subscribers.map((sub) => ({
      sender: req.user._id,
      receiver: sub.subscriber,
      type: 'video_upload',
      video: video._id,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: video,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all videos (with search, category filter, sorting, pagination)
// @route   GET /api/v1/videos
// @access  Public
export const getAllVideos = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      query,
      category,
      userId,
      sortBy = 'createdAt', // createdAt, views, likes
      sortType = 'desc',
    } = req.query;

    const pipeline = [];

    // Filter by visibility (only published videos unless the creator is asking)
    const matchRules = { isPublished: true };

    if (userId) {
      matchRules.owner = new mongoose.Types.ObjectId(userId);
      // If creator is requesting their own videos, let them see drafts
      if (req.user && req.user._id.toString() === userId.toString()) {
        delete matchRules.isPublished;
      }
    }

    // Category filter
    if (category) {
      // Find category by slug or id
      let catId = category;
      if (!mongoose.Types.ObjectId.isValid(category)) {
        const cat = await Category.findOne({ slug: category });
        if (cat) catId = cat._id;
      }
      matchRules.category = new mongoose.Types.ObjectId(catId);
    }

    // Search query
    if (query) {
      matchRules.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ];
    }

    pipeline.push({ $match: matchRules });

    // Join with owner info
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'ownerDetails',
      },
    });

    pipeline.push({ $unwind: '$ownerDetails' });

    // Project fields to keep response light and clean
    pipeline.push({
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        likesCount: 1,
        dislikesCount: 1,
        isPublished: 1,
        createdAt: 1,
        updatedAt: 1,
        category: 1,
        tags: 1,
        owner: {
          _id: '$ownerDetails._id',
          fullName: '$ownerDetails.fullName',
          username: '$ownerDetails.username',
          avatar: '$ownerDetails.avatar',
        },
      },
    });

    // Sorting
    const sortStage = {};
    const direction = sortType === 'asc' ? 1 : -1;
    if (sortBy === 'likes') {
      sortStage.likesCount = direction;
    } else if (sortBy === 'views') {
      sortStage.views = direction;
    } else {
      sortStage.createdAt = direction;
    }
    pipeline.push({ $sort: sortStage });

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    const videos = await Video.aggregate(pipeline);
    const totalCount = await Video.countDocuments(matchRules);

    res.json({
      success: true,
      data: videos,
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

// @desc    Get video by ID (including incrementing view count)
// @route   GET /api/v1/videos/:id
// @access  Public (Optional auth for checking likes & subscriptions)
export const getVideoById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid video ID format');
    }

    const video = await Video.findById(id)
      .populate('owner', 'fullName username avatar bio banner')
      .populate('category', 'name slug');

    if (!video) {
      res.status(404);
      throw new Error('Video not found');
    }

    // Only allow views if published, or if owner/admin is viewing
    if (!video.isPublished) {
      const isOwner = req.user && req.user._id.toString() === video.owner._id.toString();
      const isAdminUser = req.user && req.user.role === 'admin';
      if (!isOwner && !isAdminUser) {
        res.status(403);
        throw new Error('This video is private');
      }
    }

    // Increment view count
    video.views += 1;
    await video.save();

    // Add to user watch history (if logged in)
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { watchHistory: video._id }, // Remove if already exists (move to front)
      });
      await User.findByIdAndUpdate(req.user._id, {
        $push: { watchHistory: { $each: [video._id], $position: 0 } }, // Push to front
      });
    }

    // Determine like & subscription status of the current user
    let userReaction = null; // 'like', 'dislike', or null
    let isSubscribed = false;

    if (req.user) {
      const reaction = await Like.findOne({
        video: video._id,
        likedBy: req.user._id,
      });
      if (reaction) {
        userReaction = reaction.type;
      }

      const subRecord = await Subscription.findOne({
        subscriber: req.user._id,
        channel: video.owner._id,
      });
      isSubscribed = !!subRecord;
    }

    // Get owner's total subscriber count
    const ownerSubscribersCount = await Subscription.countDocuments({ channel: video.owner._id });

    res.json({
      success: true,
      data: {
        ...video.toObject(),
        owner: {
          ...video.owner.toObject(),
          subscribersCount: ownerSubscribersCount,
        },
        userReaction,
        isSubscribed,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit video details
// @route   PUT /api/v1/videos/:id
// @access  Private (Owner or Admin)
export const editVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, tags, isPublished } = req.body;

    const video = await Video.findById(id);

    if (!video) {
      res.status(404);
      throw new Error('Video not found');
    }

    // Check ownership
    if (video.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('You do not have permission to edit this video');
    }

    // Update details
    video.title = title || video.title;
    video.description = description || video.description;
    video.isPublished = isPublished !== undefined ? isPublished === 'true' || isPublished === true : video.isPublished;

    if (category) {
      const catExists = await Category.findById(category);
      if (!catExists) {
        res.status(404);
        throw new Error('Selected category not found');
      }
      video.category = category;
    }

    if (tags) {
      video.tags = tags.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean);
    }

    // Update thumbnail if provided
    if (req.file) {
      // Delete old thumbnail
      if (video.thumbnailPublicId) {
        await deleteFromCloudinary(video.thumbnailPublicId, 'image');
      }
      const newThumbnail = await uploadOnCloudinary(req.file.path, 'image');
      video.thumbnail = newThumbnail.url;
      video.thumbnailPublicId = newThumbnail.publicId;
    }

    const updatedVideo = await video.save();

    res.json({
      success: true,
      message: 'Video updated successfully',
      data: updatedVideo,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete video
// @route   DELETE /api/v1/videos/:id
// @access  Private (Owner or Admin)
export const deleteVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);

    if (!video) {
      res.status(404);
      throw new Error('Video not found');
    }

    // Check ownership or admin
    if (video.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('You do not have permission to delete this video');
    }

    // Delete files from Cloudinary/Local storage
    if (video.videoPublicId) {
      await deleteFromCloudinary(video.videoPublicId, 'video');
    }
    if (video.thumbnailPublicId) {
      await deleteFromCloudinary(video.thumbnailPublicId, 'image');
    }

    // Delete video document from Mongoose
    await video.deleteOne();

    // Cleanup associated likes, comments, and notifications
    await Like.deleteMany({ video: id });
    await Notification.deleteMany({ video: id });

    // Note: Comments cleanup could be handled by a Cascade middleware or simple deleteMany
    // Import Comment dynamically inside or use global schema registration
    mongoose.model('Comment').deleteMany({ video: id }).catch(console.error);

    res.json({
      success: true,
      message: 'Video and associated resources deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user watch history
// @route   GET /api/v1/videos/history/watch
// @access  Private
export const getWatchHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'watchHistory',
      populate: {
        path: 'owner',
        select: 'fullName username avatar',
      },
    });

    res.json({
      success: true,
      data: user.watchHistory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear user watch history
// @route   DELETE /api/v1/videos/history/watch
// @access  Private
export const clearWatchHistory = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $set: { watchHistory: [] },
    });

    res.json({
      success: true,
      message: 'Watch history cleared successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a video from user watch history
// @route   DELETE /api/v1/videos/history/watch/:videoId
// @access  Private
export const deleteWatchHistoryItem = async (req, res, next) => {
  try {
    const { videoId } = req.params;

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { watchHistory: videoId },
    });

    res.json({
      success: true,
      message: 'Video removed from watch history',
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get Trending videos (Sort by views/likes and uploaded recently)
// @route   GET /api/v1/videos/feed/trending
// @access  Public
export const getTrendingVideos = async (req, res, next) => {
  try {
    // Trending algorithm: Sort by views desc, but prioritize newer videos
    const videos = await Video.find({ isPublished: true })
      .populate('owner', 'fullName username avatar')
      .sort({ views: -1, createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: videos,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Recommended videos for user
// @route   GET /api/v1/videos/feed/recommended
// @access  Public (Uses watch history if authenticated, falls back to popular)
export const getRecommendedVideos = async (req, res, next) => {
  try {
    let videos = [];

    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user && user.watchHistory && user.watchHistory.length > 0) {
        // Find categories of user's watch history
        const historyVideos = await Video.find({ _id: { $in: user.watchHistory } });
        const categories = historyVideos.map((v) => v.category).filter(Boolean);

        // Find videos in those categories, excluding already watched ones
        videos = await Video.find({
          isPublished: true,
          category: { $in: categories },
          _id: { $nin: user.watchHistory },
        })
          .populate('owner', 'fullName username avatar')
          .sort({ views: -1 })
          .limit(12);
      }
    }

    // Fallback if not logged in or no history or too few results
    if (videos.length < 6) {
      const excludeIds = videos.map((v) => v._id);
      if (req.user && req.user.watchHistory) {
        excludeIds.push(...req.user.watchHistory);
      }

      const popularVideos = await Video.find({
        isPublished: true,
        _id: { $nin: excludeIds },
      })
        .populate('owner', 'fullName username avatar')
        .sort({ views: -1 })
        .limit(12 - videos.length);

      videos = [...videos, ...popularVideos];
    }

    res.json({
      success: true,
      data: videos,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get related videos (same category or tags)
// @route   GET /api/v1/videos/:id/related
// @access  Public
export const getRelatedVideos = async (req, res, next) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);

    if (!video) {
      res.status(404);
      throw new Error('Video not found');
    }

    let related = await Video.find({
      _id: { $ne: id },
      isPublished: true,
      $or: [
        { category: video.category },
        { tags: { $in: video.tags } },
      ],
    })
      .populate('owner', 'fullName username avatar')
      .sort({ views: -1 })
      .limit(8);

    // Fallback: If we have fewer than 8 related videos, fill the list with other popular published videos
    if (related.length < 8) {
      const excludeIds = [id, ...related.map((v) => v._id)];
      const fallbackVideos = await Video.find({
        isPublished: true,
        _id: { $nin: excludeIds },
      })
        .populate('owner', 'fullName username avatar')
        .sort({ views: -1 })
        .limit(8 - related.length);

      related = [...related, ...fallbackVideos];
    }

    res.json({
      success: true,
      data: related,
    });
  } catch (error) {
    next(error);
  }
};
