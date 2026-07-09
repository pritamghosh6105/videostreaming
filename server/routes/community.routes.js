import { Router } from 'express';
import {
  createCommunityPost,
  getChannelPosts,
  deleteCommunityPost,
  voteOnPoll,
  togglePostLike,
  getCommunityFeed,
  addCommunityComment,
  getCommunityComments,
  deleteCommunityComment,
} from '../controllers/community.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

// Public routes
router.get('/feed', getCommunityFeed);
router.get('/c/:username', getChannelPosts);
router.get('/:id/comments', getCommunityComments);

// Protected routes
router.post('/create', verifyJWT, upload.single('image'), createCommunityPost);
router.delete('/:id', verifyJWT, deleteCommunityPost);
router.post('/:id/vote', verifyJWT, voteOnPoll);
router.post('/:id/like', verifyJWT, togglePostLike);
router.post('/:id/comments', verifyJWT, addCommunityComment);
router.delete('/comments/:commentId', verifyJWT, deleteCommunityComment);

export default router;

