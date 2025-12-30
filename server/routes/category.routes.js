import express from 'express';
import {
    getCategories,
    getAllCategories,
    getCategoryById,
    getCategoryByIdPublic,
    addCategory,
    updateCategory,
    deleteCategory,
    getActiveCategories,
    getCategoryView
} from '../controllers/category.controller.js';
import authMiddleware from '../middleware/auth.js';
import { managerOrAdmin, staffOrAbove } from '../middleware/roleAuth.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/view', getCategoryView);
router.get('/view/:id', getCategoryByIdPublic);

// Protected routes - require auth + appropriate roles
// Read routes - STAFF, MANAGER, ADMIN can view
router.get('/', authMiddleware, staffOrAbove, getCategories);
router.get('/all', authMiddleware, staffOrAbove, getAllCategories);
router.get('/active', authMiddleware, staffOrAbove, getActiveCategories);
router.get('/:id', authMiddleware, staffOrAbove, getCategoryById);

// Write routes - only MANAGER and ADMIN can modify
router.post('/', authMiddleware, managerOrAdmin, addCategory);
router.put('/:id', authMiddleware, managerOrAdmin, updateCategory);
router.delete('/:id', authMiddleware, managerOrAdmin, deleteCategory);

export default router;

