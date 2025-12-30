import express from 'express';
import {
    getDiscounts,
    getDiscountById,
    getDiscountByPrice,
    addDiscount,
    updateDiscount,
    deleteDiscount
} from '../controllers/discount.controller.js';
import authMiddleware from '../middleware/auth.js';
import { managerOrAdmin, staffOrAbove } from '../middleware/roleAuth.js';

const router = express.Router();

// Protected routes - require auth + appropriate roles
// Read routes - STAFF, MANAGER, ADMIN can view
router.get('/view', authMiddleware, staffOrAbove, getDiscounts);
router.get('/view/:id', authMiddleware, staffOrAbove, getDiscountById);
// Customer route - any authenticated user can check discount by price
router.get('/requirement-totalPrice/:price', authMiddleware, getDiscountByPrice);

// Write routes - only MANAGER and ADMIN can modify
router.post('/', authMiddleware, managerOrAdmin, addDiscount);
router.put('/:id', authMiddleware, managerOrAdmin, updateDiscount);
router.delete('/:id', authMiddleware, managerOrAdmin, deleteDiscount);

export default router;

