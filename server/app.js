import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

// Import routers
import userRouter from './routes/user.routes.js';
import videoRouter from './routes/video.routes.js';
import commentRouter from './routes/comment.routes.js';
import likeRouter from './routes/like.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import playlistRouter from './routes/playlist.routes.js';
import notificationRouter from './routes/notification.routes.js';
import adminRouter from './routes/admin.routes.js';
import categoryRouter from './routes/category.routes.js';
import communityRouter from './routes/community.routes.js';
import aiRouter from './routes/ai.routes.js';

// Import error handler
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

// Log requests
app.use(morgan('dev'));

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Standard parser middlewares
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Set up public upload static serving
const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(publicUploadsDir)) {
  fs.mkdirSync(publicUploadsDir, { recursive: true });
}
app.use('/uploads', express.static(publicUploadsDir));

// Rate limiting (Protect API from DDoS/abuse)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 10000 : 200, // Higher limit in development to prevent 429 errors
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api/', apiLimiter);

// Mount routers
app.use('/api/v1/users', userRouter);
app.use('/api/v1/videos', videoRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/likes', likeRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/playlists', playlistRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/community', communityRouter);
app.use('/api/v1/ai', aiRouter);

// Health check API
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    status: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend in production (optional fallback, but we focus on separate deployment)
app.get('/', (req, res) => {
  res.send('YouTube Video Streaming Platform API Server is Running');
});

// Error handling middleware
app.use(errorHandler);

export default app;
