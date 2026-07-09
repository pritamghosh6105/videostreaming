import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateUserAvatar,
  updateUserBanner,
  changeCurrentPassword,
  getChannelProfile,
  getSubscribedChannels,
  getAllChannels,
} from '../controllers/user.controller.js';
import { verifyJWT, optionalVerifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

// Public routes
router.post('/register', upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), registerUser);

router.post('/login', loginUser);
router.get('/channels', getAllChannels);
router.get('/c/:username', optionalVerifyJWT, getChannelProfile);

// Private routes
router.get('/me', verifyJWT, getUserProfile);
router.put('/profile', verifyJWT, updateUserProfile);
router.patch('/avatar', verifyJWT, upload.single('avatar'), updateUserAvatar);
router.patch('/banner', verifyJWT, upload.single('banner'), updateUserBanner);
router.patch('/change-password', verifyJWT, changeCurrentPassword);
router.get('/subscriptions', verifyJWT, getSubscribedChannels);

export default router;
