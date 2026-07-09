import { Router } from 'express';
import { chatWithAI } from '../controllers/ai.controller.js';
import { optionalVerifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/chat', optionalVerifyJWT, chatWithAI);

export default router;
