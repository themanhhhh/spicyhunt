import Order from '../models/Order.js';
import Food from '../models/Food.js';

// Get all orders for current user
export const getOrders = async (req, res) => {
    try {
        const { page = 0, size = 10, status } = req.query;

        const filter = { userId: req.userId };
        if (status) {
            filter.orderState = status;
        }

        const total = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate('items.foodId', 'name nameEN price imgUrl')
            .populate('addressId', 'addressDetail')
            .sort({ createdAt: -1 })
            .skip(Number(page) * Number(size))
            .limit(Number(size));

        res.json({
            content: orders,
            totalElements: total,
            totalPages: Math.ceil(total / Number(size)),
            page: Number(page),
            size: Number(size)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get order by ID
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, userId: req.userId })
            .populate('items.foodId', 'name nameEN price imgUrl description')
            .populate('addressId', 'addressDetail addressIp')
            .populate('userId', 'fullName email phoneNumber');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get orders by customer ID (admin)
export const getOrderByCustomerId = async (req, res) => {
    try {
        const { page = 0, size = 10 } = req.query;
        const customerId = req.params.customerId;

        const filter = { userId: customerId };
        const total = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate('items.foodId', 'name nameEN price imgUrl')
            .sort({ createdAt: -1 })
            .skip(Number(page) * Number(size))
            .limit(Number(size));

        res.json({
            content: orders,
            totalElements: total,
            totalPages: Math.ceil(total / Number(size)),
            page: Number(page),
            size: Number(size)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new order
export const createOrder = async (req, res) => {
    try {
        const { foodInfo } = req.body;

        if (!foodInfo || !Array.isArray(foodInfo) || foodInfo.length === 0) {
            return res.status(400).json({ message: 'foodInfo array is required' });
        }

        // Calculate total amount
        let totalAmount = 0;
        const items = [];

        for (const item of foodInfo) {
            const food = await Food.findById(item.foodId);
            if (!food) {
                return res.status(404).json({ message: `Food with id ${item.foodId} not found` });
            }

            const itemTotal = food.price * item.quantity;
            totalAmount += itemTotal;

            items.push({
                foodId: item.foodId,
                quantity: item.quantity,
                price: food.price,
                note: item.note
            });
        }

        const order = new Order({
            userId: req.userId,
            items,
            totalAmount,
            finalAmount: totalAmount,
            orderState: 'PENDING'
        });

        await order.save();

        // Populate and return
        await order.populate('items.foodId', 'name nameEN price imgUrl');

        res.status(201).json({
            message: 'Order created successfully',
            id: order._id,
            data: order
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update order information
export const updateOrderInfo = async (req, res) => {
    try {
        const { addressId, deliveryAddress, note, paymentMethod } = req.body;

        const updateData = {};
        if (addressId !== undefined) updateData.addressId = addressId;
        if (deliveryAddress !== undefined) updateData.deliveryAddress = deliveryAddress;
        if (note !== undefined) updateData.note = note;
        if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;

        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            updateData,
            { new: true }
        ).populate('items.foodId', 'name nameEN price imgUrl');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ message: 'Order updated successfully', data: order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove food from order
export const removeFoodFromOrder = async (req, res) => {
    try {
        const { foodId } = req.body;

        const order = await Order.findOne({ _id: req.params.id, userId: req.userId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Remove the item
        order.items = order.items.filter(item => item.foodId.toString() !== foodId);

        // Recalculate total
        let totalAmount = 0;
        for (const item of order.items) {
            totalAmount += item.price * item.quantity;
        }
        order.totalAmount = totalAmount;
        order.finalAmount = totalAmount - order.discountAmount;

        await order.save();
        await order.populate('items.foodId', 'name nameEN price imgUrl');

        res.json({ message: 'Food removed from order', data: order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update food in order (quantity) - supports both single item and array format
export const updateFoodOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, userId: req.userId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Support both formats:
        // 1. Single item: { foodId, quantity }
        // 2. Array format: { foodInfo: [{ foodId, quantity }] }
        let itemsToUpdate = [];

        if (req.body.foodInfo && Array.isArray(req.body.foodInfo)) {
            // Array format from frontend
            itemsToUpdate = req.body.foodInfo;
        } else if (req.body.foodId) {
            // Single item format
            itemsToUpdate = [{ foodId: req.body.foodId, quantity: req.body.quantity }];
        } else {
            return res.status(400).json({ message: 'foodId or foodInfo array is required' });
        }

        // Process each item
        for (const updateItem of itemsToUpdate) {
            const { foodId, quantity } = updateItem;

            // Find the item in order
            const itemIndex = order.items.findIndex(item => item.foodId.toString() === foodId);

            if (itemIndex === -1) {
                // Item not found in order - skip or log warning
                console.warn(`Food item ${foodId} not found in order ${order._id}`);
                continue;
            }

            if (quantity <= 0) {
                // Remove item if quantity is 0 or less
                order.items.splice(itemIndex, 1);
            } else {
                order.items[itemIndex].quantity = quantity;
            }
        }

        // Recalculate total
        let totalAmount = 0;
        for (const item of order.items) {
            totalAmount += item.price * item.quantity;
        }
        order.totalAmount = totalAmount;
        order.finalAmount = totalAmount - (order.discountAmount || 0);

        await order.save();
        await order.populate('items.foodId', 'name nameEN price imgUrl');

        res.json({ message: 'Order updated successfully', data: order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update order state
export const updateOrderState = async (req, res) => {
    try {
        const { orderState } = req.body;

        const validStates = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'PAID', 'FAILED'];
        if (!orderState || !validStates.includes(orderState)) {
            return res.status(400).json({ message: 'Valid orderState is required' });
        }

        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { orderState },
            { new: true }
        ).populate('items.foodId', 'name nameEN price imgUrl');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ message: 'Order state updated', data: order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create VNPay payment
export const createPayment = async (req, res) => {
    try {
        const { orderId, bankCode, locale } = req.body;

        const order = await Order.findOne({ _id: orderId, userId: req.userId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if order is already paid
        if (order.orderState === 'PAID' || order.orderState === 'COMPLETED') {
            return res.status(400).json({ message: 'Order is already paid' });
        }

        // Import VNPay utility
        const vnpay = await import('../utils/vnpay.js');

        // Create payment URL
        const paymentUrl = vnpay.createPaymentUrl({
            orderId: order._id.toString(),
            amount: order.finalAmount || order.totalAmount,
            orderInfo: `Thanh toan don hang ${order._id}`,
            ipAddr: vnpay.getClientIp(req),
            bankCode: bankCode || '',
            locale: locale || 'vn'
        });

        // Update order state to PROCESSING
        order.orderState = 'PROCESSING';
        order.paymentMethod = 'VNPAY';
        await order.save();

        res.json({
            message: 'Payment URL created successfully',
            paymentUrl,
            orderId: order._id,
            amount: order.finalAmount || order.totalAmount
        });
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ message: error.message });
    }
};

// VNPay IPN (Instant Payment Notification) - Server-to-server callback
export const vnpayIPN = async (req, res) => {
    try {
        const vnpay = await import('../utils/vnpay.js');
        const vnp_Params = req.query;

        // Verify checksum
        if (!vnpay.verifyChecksum(vnp_Params)) {
            return res.json({ RspCode: '97', Message: 'Checksum failed' });
        }

        const orderId = vnp_Params.vnp_TxnRef;
        const responseCode = vnp_Params.vnp_ResponseCode;
        const transactionNo = vnp_Params.vnp_TransactionNo;
        const amount = parseInt(vnp_Params.vnp_Amount) / 100; // VNPay sends amount * 100

        // Find order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.json({ RspCode: '01', Message: 'Order not found' });
        }

        // Check amount
        const expectedAmount = order.finalAmount || order.totalAmount;
        if (amount !== expectedAmount) {
            return res.json({ RspCode: '04', Message: 'Amount not match' });
        }

        // Check if order already processed
        if (order.orderState === 'PAID' || order.orderState === 'COMPLETED') {
            return res.json({ RspCode: '02', Message: 'Order already confirmed' });
        }

        // Update order status based on response code
        if (responseCode === '00') {
            order.orderState = 'PAID';
            order.paymentTransactionNo = transactionNo;
            order.paidAt = new Date();
            await order.save();

            console.log(`Order ${orderId} payment successful. TransactionNo: ${transactionNo}`);
            return res.json({ RspCode: '00', Message: 'Confirm Success' });
        } else {
            order.orderState = 'FAILED';
            order.paymentTransactionNo = transactionNo;
            await order.save();

            console.log(`Order ${orderId} payment failed. ResponseCode: ${responseCode}`);
            return res.json({ RspCode: '00', Message: 'Confirm Success' });
        }
    } catch (error) {
        console.error('VNPay IPN error:', error);
        return res.json({ RspCode: '99', Message: 'Unknown error' });
    }
};

// VNPay Return URL - Redirect user back to frontend
export const vnpayReturn = async (req, res) => {
    try {
        const vnpay = await import('../utils/vnpay.js');
        const vnp_Params = req.query;

        // Verify checksum
        const isValidChecksum = vnpay.verifyChecksum(vnp_Params);

        const orderId = vnp_Params.vnp_TxnRef;
        const responseCode = vnp_Params.vnp_ResponseCode;
        const transactionNo = vnp_Params.vnp_TransactionNo || '';
        const amount = parseInt(vnp_Params.vnp_Amount) / 100;
        const bankCode = vnp_Params.vnp_BankCode || '';
        const payDate = vnp_Params.vnp_PayDate || '';

        // Parse response
        const result = vnpay.parseResponseCode(responseCode);

        // Return result data (frontend will handle display)
        res.json({
            success: isValidChecksum && result.success,
            orderId,
            amount,
            transactionNo,
            bankCode,
            payDate,
            responseCode,
            message: isValidChecksum ? result.message : 'Chữ ký không hợp lệ'
        });
    } catch (error) {
        console.error('VNPay return error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi xử lý kết quả thanh toán'
        });
    }
};

// Check payment status
export const checkPaymentStatus = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.orderId, userId: req.userId });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Map order state to payment status
        const stateMap = {
            'PAID': 'PAID',
            'COMPLETED': 'SUCCESS',
            'PENDING': 'PENDING',
            'FAILED': 'FAILED',
            'CANCELLED': 'CANCELLED'
        };

        res.json({
            status: stateMap[order.orderState] || 'PENDING',
            orderData: order
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
    try {
        const { page = 0, size = 10, status, userId } = req.query;

        const filter = {};
        if (status) filter.orderState = status;
        if (userId) filter.userId = userId;

        const total = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate('items.foodId', 'name nameEN price imgUrl')
            .populate('userId', 'fullName email phoneNumber')
            .populate('addressId', 'addressDetail')
            .sort({ createdAt: -1 })
            .skip(Number(page) * Number(size))
            .limit(Number(size));

        res.json({
            content: orders,
            totalElements: total,
            totalPages: Math.ceil(total / Number(size)),
            page: Number(page),
            size: Number(size)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
