import express from 'express';
import {
    getOrders,
    getOrderById,
    getOrderByCustomerId,
    createOrder,
    updateOrderInfo,
    removeFoodFromOrder,
    updateFoodOrder,
    updateOrderState,
    createPayment,
    checkPaymentStatus,
    getAllOrders,
    vnpayIPN,
    vnpayReturn
} from '../controllers/order.controller.js';
import authMiddleware from '../middleware/auth.js';
import { managerOrAdmin, staffOrAbove } from '../middleware/roleAuth.js';

const router = express.Router();

// VNPay callback routes - NO AUTH REQUIRED (called by VNPay server)
router.get('/vnpay/ipn', vnpayIPN);
router.get('/vnpay/return', vnpayReturn);

// All other order routes require authentication
router.use(authMiddleware);

// Customer order routes - any authenticated user can access their own orders
router.get('/', getOrders);
// NOTE: Specific routes MUST come before /:id to avoid matching conflict
router.get('/order-byUserId/:customerId', getOrderByCustomerId);
router.get('/:id', getOrderById);
router.post('/', createOrder);
// Allow customers to modify their own orders (controller validates ownership via userId)
router.put('/order-updateFood/:id', updateFoodOrder);
router.put('/order-Info/:id', updateOrderInfo);
router.put('/order-delFood/:id', removeFoodFromOrder);

// Staff routes - require STAFF+ roles for changing order state (affects restaurant workflow)
router.put('/order-state/:id', staffOrAbove, updateOrderState);

// Admin/Manager route - view all orders
router.get('/all', managerOrAdmin, getAllOrders);

// Payment routes - any authenticated user
router.post('/payment/vnpay', createPayment);
router.get('/payment/status/:orderId', checkPaymentStatus);

export default router;
