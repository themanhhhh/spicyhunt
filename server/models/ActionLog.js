import mongoose from 'mongoose';

const ActionLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: { type: String },
    accountRole: { type: String },
    actionType: {
        type: String,
        enum: ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'OTHER'],
        default: 'OTHER'
    },
    description: { type: String },
    targetType: { type: String }, // e.g., 'Order', 'Food', 'User'
    targetId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: mongoose.Schema.Types.Mixed }, // Additional details
    ipAddress: { type: String },
    userAgent: { type: String },
}, { timestamps: true });

// Index for efficient querying
ActionLogSchema.index({ createdAt: -1 });
ActionLogSchema.index({ userId: 1, createdAt: -1 });
ActionLogSchema.index({ actionType: 1 });

export default mongoose.model('ActionLog', ActionLogSchema);
