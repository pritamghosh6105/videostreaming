import { Router } from 'express';
import {
  toggleSubscription,
  getChannelSubscribers,
  getSubscribedChannels,
} from '../controllers/subscription.controller.js';
import { verifyJWT, optionalVerifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/toggle/:channelId', verifyJWT, toggleSubscription);
router.get('/subscribers/:channelId', optionalVerifyJWT, getChannelSubscribers);
router.get('/channels/:subscriberId', optionalVerifyJWT, getSubscribedChannels);

export default router;
