import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number }, // Price at time of order
    note: { type: String }
});

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    totalAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, default: 0 },
    orderState: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'PAID', 'FAILED'],
        default: 'PENDING'
    },
    paymentMethod: { type: String, enum: ['CASH', 'VNPAY', 'MOMO', 'CARD'], default: 'CASH' },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], default: 'PENDING' },
    paymentTransactionNo: { type: String }, // VNPay transaction number
    paidAt: { type: Date }, // Payment timestamp
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
    deliveryAddress: { type: String },
    note: { type: String },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
    discountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Discount' },
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);
