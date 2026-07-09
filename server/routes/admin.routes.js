import { Router } from 'express';
import {
  getAdminStats,
  getAllUsers,
  toggleUserBan,
  getAllReports,
  updateReportStatus,
  createReport,
} from '../controllers/admin.controller.js';
import { verifyJWT, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Route for any authenticated user to create a report
router.post('/reports', verifyJWT, createReport);

// Admin-only protected routes
router.use(verifyJWT, isAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/ban', toggleUserBan);
router.get('/reports', getAllReports);
router.patch('/reports/:id/status', updateReportStatus);

export default router;
