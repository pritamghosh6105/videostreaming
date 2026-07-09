import { Router } from 'express';
import {
  createPlaylist,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getUserPlaylists,
} from '../controllers/playlist.controller.js';
import { verifyJWT, optionalVerifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Public / Optional auth routes
router.get('/:id', optionalVerifyJWT, getPlaylistById);
router.get('/user/:userId', optionalVerifyJWT, getUserPlaylists);

// Protected routes
router.post('/', verifyJWT, createPlaylist);
router.route('/:id')
  .put(verifyJWT, updatePlaylist)
  .delete(verifyJWT, deletePlaylist);

router.patch('/:id/add/:videoId', verifyJWT, addVideoToPlaylist);
router.patch('/:id/remove/:videoId', verifyJWT, removeVideoFromPlaylist);

export default router;
