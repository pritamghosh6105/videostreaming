import Video from '../models/Video.js';
import User from '../models/User.js';

// @desc    Global search for videos and channels
// @route   GET /api/v1/search
// @access  Public
export const globalSearch = async (req, res, next) => {
  try {
    const query = req.query.query || req.query.q || '';
    const activeCategory = req.query.category || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortType = req.query.sortType || 'desc';

    let videos = [];
    let channels = [];

    // 1. Search Channels / Users (Public fields only)
    if (query.trim()) {
      channels = await User.find({
        isBanned: false,
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { fullName: { $regex: query, $options: 'i' } }
        ]
      })
      .select('username fullName avatar bio subscribersCount')
      .limit(5);
    }

    // 2. Search Videos
    const matchQuery = {};
    const bannedUsers = await User.find({ isBanned: true }).select('_id');
    const bannedUserIds = bannedUsers.map((u) => u._id);

    matchQuery.owner = { $nin: bannedUserIds };

    if (query.trim()) {
      matchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ];
    }

    // Category filter
    if (activeCategory) {
      matchQuery.category = activeCategory;
    }

    // Only return published videos
    matchQuery.isPublished = true;

    const sortOrder = sortType === 'asc' ? 1 : -1;
    const sortRule = { [sortBy]: sortOrder };

    videos = await Video.find(matchQuery)
      .populate('owner', 'username fullName avatar')
      .populate('category', 'name slug')
      .sort(sortRule)
      .limit(40);

    res.status(200).json({
      success: true,
      data: {
        videos,
        channels
      }
    });
  } catch (error) {
    next(error);
  }
};
