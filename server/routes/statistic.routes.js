import express from 'express';
import {
    getRevenue,
    getRevenueExport
} from '../controllers/statistic.controller.js';
import authMiddleware from '../middleware/auth.js';
import { managerOrAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

// All statistic routes require authentication and MANAGER/ADMIN role
router.use(authMiddleware);
router.use(managerOrAdmin);

router.get('/', getRevenue);
router.get('/report', getRevenueExport);

export default router;

