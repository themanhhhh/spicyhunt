import express from 'express';
import {
    getTables,
    getTableById,
    getActiveTables,
    createTable,
    updateTable,
    deleteTable,
    getOrderTablesByUser,
    createOrderTable,
    updateOrderTableState
} from '../controllers/table.controller.js';
import authMiddleware from '../middleware/auth.js';
import { managerOrAdmin, staffOrAbove } from '../middleware/roleAuth.js';

const router = express.Router();

// Table routes (protected) - require auth + appropriate roles
// Read routes - STAFF, MANAGER, ADMIN can view all tables
router.get('/', authMiddleware, staffOrAbove, getTables);
// Active tables - any authenticated user (including CUSTOMER) can view for reservation
router.get('/active', authMiddleware, getActiveTables);
router.get('/:id', authMiddleware, staffOrAbove, getTableById);

// Write routes - only MANAGER and ADMIN can modify tables
router.post('/', authMiddleware, managerOrAdmin, createTable);
router.put('/:id', authMiddleware, managerOrAdmin, updateTable);
router.delete('/:id', authMiddleware, managerOrAdmin, deleteTable);

// Order table (reservation) routes - STAFF can manage reservations
router.get('/order-table', authMiddleware, staffOrAbove, getOrderTablesByUser);
router.post('/order-table', authMiddleware, staffOrAbove, createOrderTable);
router.put('/order-table/:id', authMiddleware, staffOrAbove, updateOrderTableState);

export default router;

