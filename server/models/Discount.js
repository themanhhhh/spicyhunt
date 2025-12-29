import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    discountPercent: {
        type: Number,
        default: 0
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    minTotalPrice: {
        type: Number,
        default: 0
    },
    maxDiscount: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    }
}, {
    timestamps: true
});

// Index for efficient querying
discountSchema.index({ status: 1, startDate: 1, endDate: 1 });
discountSchema.index({ name: 'text' });

const Discount = mongoose.model('Discount', discountSchema);

export default Discount;
