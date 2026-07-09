import { Router } from 'express';
import {
  addComment,
  getCommentsByVideoId,
  getRepliesByCommentId,
  editComment,
  deleteComment,
} from '../controllers/comment.controller.js';
import { verifyJWT, optionalVerifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Retrieve comments
router.get('/:videoId', optionalVerifyJWT, getCommentsByVideoId);
router.get('/replies/:commentId', optionalVerifyJWT, getRepliesByCommentId);

// Add / Modify comments
router.post('/:videoId', verifyJWT, addComment);
router.put('/:id', verifyJWT, editComment);
router.delete('/:id', verifyJWT, deleteComment);

export default router;
