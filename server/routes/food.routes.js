import express from 'express';
import {
    getFoods,
    getMainDishes,
    getAllFoods,
    getFoodById,
    addFood,
    updateFood,
    deleteFood,
    getFoodView,
    getFoodByIdView
} from '../controllers/food.controller.js';
import authMiddleware from '../middleware/auth.js';
import { managerOrAdmin, staffOrAbove } from '../middleware/roleAuth.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/view', getFoodView);
router.get('/view/:id', getFoodByIdView);
router.get('/main-dishes', getMainDishes);

// Protected routes - require auth + appropriate roles
// Read routes - STAFF, MANAGER, ADMIN can view
router.get('/', authMiddleware, staffOrAbove, getFoods);
router.get('/all', authMiddleware, staffOrAbove, getAllFoods);
router.get('/:id', authMiddleware, staffOrAbove, getFoodById);

// Write routes - only MANAGER and ADMIN can modify
router.post('/', authMiddleware, managerOrAdmin, addFood);
router.put('/:id', authMiddleware, managerOrAdmin, updateFood);
router.delete('/:id', authMiddleware, managerOrAdmin, deleteFood);

export default router;

