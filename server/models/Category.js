import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    nameEN: { type: String }, // English name for multi-language support
    description: { type: String },
    descriptionEN: { type: String },
    imgUrl: { type: String },
    state: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    order: { type: Number, default: 0 }, // For sorting categories
}, { timestamps: true });

export default mongoose.model('Category', CategorySchema);
