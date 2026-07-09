import { Router } from 'express';
import {
  uploadVideo,
  getAllVideos,
  getVideoById,
  editVideo,
  deleteVideo,
  getWatchHistory,
  clearWatchHistory,
  getTrendingVideos,
  getRecommendedVideos,
  getRelatedVideos,
} from '../controllers/video.controller.js';
import { verifyJWT, optionalVerifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

// Routes with optional auth (for recommendations and user reactions)
router.get('/', optionalVerifyJWT, getAllVideos);
router.get('/feed/trending', optionalVerifyJWT, getTrendingVideos);
router.get('/feed/recommended', optionalVerifyJWT, getRecommendedVideos);
router.get('/:id', optionalVerifyJWT, getVideoById);
router.get('/:id/related', optionalVerifyJWT, getRelatedVideos);

// Protected routes
router.post('/upload', verifyJWT, upload.fields([
  { name: 'videoFile', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), uploadVideo);

router.put('/:id', verifyJWT, upload.single('thumbnail'), editVideo);
router.delete('/:id', verifyJWT, deleteVideo);

// Watch History routes
router.route('/history/watch')
  .get(verifyJWT, getWatchHistory)
  .delete(verifyJWT, clearWatchHistory);

export default router;
