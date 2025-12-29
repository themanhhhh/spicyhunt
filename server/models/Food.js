import mongoose from 'mongoose';

const FoodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    nameEN: { type: String }, // English name
    description: { type: String },
    descriptionEN: { type: String }, // English description
    price: { type: Number, required: true },
    imgUrl: { type: String },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    state: { type: String, enum: ['AVAILABLE', 'UNAVAILABLE', 'OUT_OF_STOCK'], default: 'AVAILABLE' },
    quantity: { type: Number, default: 0 },
    isMain: { type: Boolean, default: false }, // Main dish flag
    order: { type: Number, default: 0 }, // For sorting
}, { timestamps: true });

export default mongoose.model('Food', FoodSchema);
