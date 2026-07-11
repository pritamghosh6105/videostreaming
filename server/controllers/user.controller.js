import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import Video from '../models/Video.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/v1/users/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, username, password, bio } = req.body;

    if (!fullName || !email || !username || !password) {
      res.status(400);
      throw new Error('Please fill in all required fields');
    }

    // Check if user exists
    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      res.status(400);
      throw new Error('Username or email already exists');
    }

    // Handle avatar and banner uploads (if any)
    let avatarUrl = undefined;
    let avatarPid = '';
    let bannerUrl = undefined;
    let bannerPid = '';

    if (req.files && req.files.avatar && req.files.avatar[0]) {
      const avatarUpload = await uploadOnCloudinary(req.files.avatar[0].path, 'image');
      avatarUrl = avatarUpload?.url;
      avatarPid = avatarUpload?.publicId;
    }

    if (req.files && req.files.banner && req.files.banner[0]) {
      const bannerUpload = await uploadOnCloudinary(req.files.banner[0].path, 'image');
      bannerUrl = bannerUpload?.url;
      bannerPid = bannerUpload?.publicId;
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      username: username.toLowerCase().replace(/\s+/g, ''),
      password,
      bio: bio || '',
      avatar: avatarUrl,
      avatarPublicId: avatarPid,
      banner: bannerUrl,
      bannerPublicId: bannerPid,
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          banner: user.banner,
          bio: user.bio,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/v1/users/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      res.status(400);
      throw new Error('Please enter credentials and password');
    }

    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername.toLowerCase() },
      ],
    });

    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    if (user.isBanned) {
      res.status(403);
      throw new Error('This user channel is banned');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        banner: user.banner,
        bio: user.bio,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/v1/users/me
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/v1/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.fullName = req.body.fullName || user.fullName;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;

    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        res.status(400);
        throw new Error('Email is already in use');
      }
      user.email = req.body.email;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        username: updatedUser.username,
        avatar: updatedUser.avatar,
        banner: updatedUser.banner,
        bio: updatedUser.bio,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update avatar
// @route   PATCH /api/v1/users/avatar
// @access  Private
export const updateUserAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload an avatar image file');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Delete old avatar from Cloudinary
    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId, 'image');
    }

    // Upload new one
    const uploadResult = await uploadOnCloudinary(req.file.path, 'image');

    user.avatar = uploadResult.url;
    user.avatarPublicId = uploadResult.publicId;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: { avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update banner
// @route   PATCH /api/v1/users/banner
// @access  Private
export const updateUserBanner = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a banner image file');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Delete old banner
    if (user.bannerPublicId) {
      await deleteFromCloudinary(user.bannerPublicId, 'image');
    }

    const uploadResult = await uploadOnCloudinary(req.file.path, 'image');

    user.banner = uploadResult.url;
    user.bannerPublicId = uploadResult.publicId;
    await user.save();

    res.json({
      success: true,
      message: 'Banner updated successfully',
      data: { banner: user.banner },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PATCH /api/v1/users/change-password
// @access  Private
export const changeCurrentPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      res.status(400);
      throw new Error('Please provide old and new passwords');
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(oldPassword);

    if (!isMatch) {
      res.status(400);
      throw new Error('Incorrect old password');
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get channel details
// @route   GET /api/v1/users/c/:username
// @access  Public (Optional auth for checking subscription status)
export const getChannelProfile = async (req, res, next) => {
  try {
    const { username } = req.params;

    const channel = await User.findOne({ username: username.toLowerCase() }).select('-password');
    if (!channel) {
      res.status(404);
      throw new Error('Channel not found');
    }

    // Block access if channel is banned, unless the requester is an admin
    if (channel.isBanned) {
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isAdmin) {
        res.status(403);
        throw new Error('This channel has been banned');
      }
    }

    // Fetch subscriber count
    const subscribersCount = await Subscription.countDocuments({ channel: channel._id });

    // Fetch channels subscribed to
    const channelsSubscribedTo = await Subscription.countDocuments({ subscriber: channel._id });

    // Check if the requesting user is subscribed
    let isSubscribed = false;
    if (req.user) {
      const subRecord = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channel._id,
      });
      isSubscribed = !!subRecord;
    }

    // Fetch total videos count
    const videosCount = await Video.countDocuments({ owner: channel._id, isPublished: true });

    res.json({
      success: true,
      data: {
        ...channel.toObject(),
        subscribersCount,
        channelsSubscribedTo,
        isSubscribed,
        videosCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get subscribed channels
// @route   GET /api/v1/users/subscriptions
// @access  Private
export const getSubscribedChannels = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({ subscriber: req.user._id })
      .populate('channel', 'fullName username avatar bio isBanned');

    res.json({
      success: true,
      data: subscriptions
        .map(sub => sub.channel)
        .filter(channel => channel && !channel.isBanned),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all channels registered on the platform
// @route   GET /api/v1/users/channels
// @access  Public
export const getAllChannels = async (req, res, next) => {
  try {
    const channels = await User.find({ isBanned: false }).select('-password -email -role -watchHistory');
    
    const channelsWithDetails = await Promise.all(
      channels.map(async (channel) => {
        const subscribersCount = await Subscription.countDocuments({ channel: channel._id });
        const videosCount = await Video.countDocuments({ owner: channel._id, isPublished: true });
        
        const userVideos = await Video.find({ owner: channel._id, isPublished: true }).select('views');
        const totalViewsCount = userVideos.reduce((acc, curr) => acc + (curr.views || 0), 0);
        
        // Fetch latest 3 videos for their "content" preview
        const latestVideos = await Video.find({ owner: channel._id, isPublished: true })
          .sort({ createdAt: -1 })
          .limit(3)
          .select('title thumbnail duration views createdAt');

        return {
          ...channel.toObject(),
          subscribersCount,
          videosCount,
          totalViewsCount,
          latestVideos,
        };
      })
    );

    // Sort by subscriber count (highest first)
    channelsWithDetails.sort((a, b) => b.subscribersCount - a.subscribersCount);

    res.json({
      success: true,
      data: channelsWithDetails,
    });
  } catch (error) {
    next(error);
  }
};
