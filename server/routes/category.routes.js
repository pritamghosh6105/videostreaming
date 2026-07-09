import { Router } from 'express';
import {
  getCategories,
  createCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { verifyJWT, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getCategories);
router.post('/', verifyJWT, isAdmin, createCategory);
router.delete('/:id', verifyJWT, isAdmin, deleteCategory);

export default router;
