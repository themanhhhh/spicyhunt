import express from 'express';
import {
    getUsers,
    getAllUsers,
    getUserById,
    addUser,
    updateUser,
    deleteUser,
    toggleUserState
} from '../controllers/user.controller.js';
import authMiddleware from '../middleware/auth.js';
import { adminOnly } from '../middleware/roleAuth.js';

const router = express.Router();

// All user management routes require authentication and ADMIN role
router.use(authMiddleware);
router.use(adminOnly);

router.get('/', getUsers);
router.get('/all', getAllUsers);
router.get('/:id', getUserById);
router.post('/', addUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.put('/:id/state', toggleUserState);

export default router;

