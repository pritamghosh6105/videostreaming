import { Router } from 'express';
import { getChannelProfile, getCurrentChannelProfile, getAllChannels } from '../controllers/user.controller.js';
import { verifyJWT, optionalVerifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getAllChannels);
router.get('/me', verifyJWT, getCurrentChannelProfile);
router.get('/:username', optionalVerifyJWT, getChannelProfile);

export default router;
