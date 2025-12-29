import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    state: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'RESERVED', 'OCCUPIED'],
        default: 'ACTIVE'
    },
    numberOfChair: {
        type: Number,
        default: 4
    }
}, {
    timestamps: true
});

// Index for efficient querying
tableSchema.index({ state: 1 });
tableSchema.index({ name: 'text' });

const Table = mongoose.model('Table', tableSchema);

export default Table;
