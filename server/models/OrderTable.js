import mongoose from 'mongoose';

const orderTableSchema = new mongoose.Schema({
    email: {
        type: String
    },
    fullName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    periodType: {
        type: String,
        enum: ['MORNING', 'AFTERNOON', 'EVENING'],
        default: 'EVENING'
    },
    tableId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    orderTime: {
        type: Date,
        required: true
    },
    orderTableState: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
        default: 'PENDING'
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
orderTableSchema.index({ tableId: 1, orderTime: 1 });
orderTableSchema.index({ userId: 1 });
orderTableSchema.index({ orderTableState: 1 });

const OrderTable = mongoose.model('OrderTable', orderTableSchema);

export default OrderTable;
