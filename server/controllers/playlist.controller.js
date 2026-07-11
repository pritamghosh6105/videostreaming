import Playlist from '../models/Playlist.js';
import Video from '../models/Video.js';
import mongoose from 'mongoose';

// @desc    Create playlist
// @route   POST /api/v1/playlists
// @access  Private
export const createPlaylist = async (req, res, next) => {
  try {
    const { name, description, isPrivate } = req.body;

    if (!name) {
      res.status(400);
      throw new Error('Playlist name is required');
    }

    const playlist = await Playlist.create({
      name,
      description: description || '',
      owner: req.user._id,
      isPrivate: isPrivate === 'true' || isPrivate === true,
      videos: [],
    });

    res.status(201).json({
      success: true,
      message: 'Playlist created successfully',
      data: playlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get playlist by ID
// @route   GET /api/v1/playlists/:id
// @access  Public (Checks private visibility permissions)
export const getPlaylistById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid playlist ID format');
    }

    const playlist = await Playlist.findById(id)
      .populate('owner', 'fullName username avatar')
      .populate({
        path: 'videos',
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

    if (!playlist) {
      res.status(404);
      throw new Error('Playlist not found');
    }

    // Visibility check
    if (playlist.isPrivate) {
      const isOwner = req.user && req.user._id.toString() === playlist.owner._id.toString();
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        res.status(403);
        throw new Error('This playlist is private');
      }
    }

    res.json({
      success: true,
      data: playlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update playlist
// @route   PUT /api/v1/playlists/:id
// @access  Private (Owner only)
export const updatePlaylist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, isPrivate } = req.body;

    const playlist = await Playlist.findById(id);

    if (!playlist) {
      res.status(404);
      throw new Error('Playlist not found');
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You do not have permission to edit this playlist');
    }

    playlist.name = name || playlist.name;
    playlist.description = description !== undefined ? description : playlist.description;
    playlist.isPrivate = isPrivate !== undefined ? isPrivate === 'true' || isPrivate === true : playlist.isPrivate;

    const updatedPlaylist = await playlist.save();

    res.json({
      success: true,
      message: 'Playlist updated successfully',
      data: updatedPlaylist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete playlist
// @route   DELETE /api/v1/playlists/:id
// @access  Private (Owner only)
export const deletePlaylist = async (req, res, next) => {
  try {
    const { id } = req.params;

    const playlist = await Playlist.findById(id);

    if (!playlist) {
      res.status(404);
      throw new Error('Playlist not found');
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You do not have permission to delete this playlist');
    }

    await playlist.deleteOne();

    res.json({
      success: true,
      message: 'Playlist deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add video to playlist
// @route   PATCH /api/v1/playlists/:id/add/:videoId
// @access  Private (Owner only)
export const addVideoToPlaylist = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      res.status(404);
      throw new Error('Playlist not found');
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You do not have permission to add videos to this playlist');
    }

    const video = await Video.findById(videoId);
    if (!video) {
      res.status(404);
      throw new Error('Video not found');
    }

    // Check if video is already in playlist
    if (playlist.videos.includes(videoId)) {
      res.status(400);
      throw new Error('Video is already in this playlist');
    }

    playlist.videos.push(videoId);
    await playlist.save();

    res.json({
      success: true,
      message: 'Video added to playlist successfully',
      data: playlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove video from playlist
// @route   PATCH /api/v1/playlists/:id/remove/:videoId
// @access  Private (Owner only)
export const removeVideoFromPlaylist = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      res.status(404);
      throw new Error('Playlist not found');
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You do not have permission to modify this playlist');
    }

    // Remove video ID
    playlist.videos = playlist.videos.filter(v => v.toString() !== videoId.toString());
    await playlist.save();

    res.json({
      success: true,
      message: 'Video removed from playlist successfully',
      data: playlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get playlists owned by a user
// @route   GET /api/v1/playlists/user/:userId
// @access  Public (Returns only public playlists if viewing another user's profile)
export const getUserPlaylists = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const isSelf = req.user && req.user._id.toString() === userId.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    const filter = { owner: userId };
    if (!isSelf && !isAdmin) {
      filter.isPrivate = false;
    }

    const playlists = await Playlist.find(filter)
      .populate('owner', 'fullName username avatar')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: playlists,
    });
  } catch (error) {
    next(error);
  }
};
