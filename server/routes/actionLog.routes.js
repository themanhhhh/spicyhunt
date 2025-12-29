import express from 'express';
import {
    getLogs,
    getLogActivity,
    createLog,
    getLogById,
    getActionTypes
} from '../controllers/actionLog.controller.js';
import authMiddleware from '../middleware/auth.js';
import { managerOrAdmin, staffOrAbove } from '../middleware/roleAuth.js';

const router = express.Router();

// All action-log routes require authentication
router.use(authMiddleware);

// Read routes - MANAGER and ADMIN only (audit logs are sensitive)
router.get('/', managerOrAdmin, getLogActivity);
router.get('/types', managerOrAdmin, getActionTypes);
router.get('/:id', managerOrAdmin, getLogById);

// Create log - STAFF, MANAGER, ADMIN can create logs
router.post('/', staffOrAbove, createLog);

export default router;

