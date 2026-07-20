import Video from '../models/Video.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import mongoose from 'mongoose';

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
      const qTrim = query.trim();

      // Find matching categories by tokens or full query
      const tokens = qTrim.split(/\s+/).filter((t) => t.length >= 2);
      const catQueryConditions = tokens.flatMap((t) => [
        { name: { $regex: t, $options: 'i' } },
        { slug: { $regex: t, $options: 'i' } }
      ]);
      catQueryConditions.push(
        { name: { $regex: qTrim, $options: 'i' } },
        { slug: { $regex: qTrim, $options: 'i' } }
      );

      const matchingCats = await Category.find({
        $or: catQueryConditions
      }).select('_id');

      const catIds = matchingCats.map((c) => c._id);

      const searchOr = [
        { title: { $regex: qTrim, $options: 'i' } },
        { description: { $regex: qTrim, $options: 'i' } },
        { tags: { $in: [new RegExp(qTrim, 'i')] } }
      ];

      if (catIds.length > 0) {
        searchOr.push({ category: { $in: catIds } });
      }

      matchQuery.$or = searchOr;
    }

    // Category filter
    if (activeCategory) {
      let catId = activeCategory;
      if (!mongoose.Types.ObjectId.isValid(activeCategory)) {
        const cat = await Category.findOne({
          $or: [
            { slug: activeCategory.toLowerCase() },
            { name: new RegExp(`^${activeCategory}$`, 'i') }
          ]
        });
        if (cat) {
          catId = cat._id;
        } else {
          catId = new mongoose.Types.ObjectId(); // Non-matching dummy ObjectId
        }
      }
      matchQuery.category = catId;
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
