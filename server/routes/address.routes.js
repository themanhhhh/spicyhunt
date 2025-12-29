import express from 'express';
import {
  createAddress,
  getUserAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  updateAddressDefault
} from '../controllers/address.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// All address routes require authentication
router.use(authMiddleware);

router.post('/', createAddress);
router.get('/', getUserAddresses);
router.get('/:id', getAddressById);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.put('/:id/default', setDefaultAddress);
router.put('/default/:id', updateAddressDefault);

export default router;
