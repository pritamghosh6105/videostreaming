import { Router } from 'express';
import {
  toggleVideoLike,
  toggleVideoDislike,
  toggleCommentLike,
  toggleCommentDislike,
  getLikedVideos,
} from '../controllers/like.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT); // All reaction routes are protected

router.post('/toggle/v/:videoId', toggleVideoLike);
router.post('/toggle/d/:videoId', toggleVideoDislike);
router.post('/toggle/c/:commentId', toggleCommentLike);
router.post('/toggle/dc/:commentId', toggleCommentDislike);
router.get('/videos', getLikedVideos);

export default router;
