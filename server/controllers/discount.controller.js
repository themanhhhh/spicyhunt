import Discount from '../models/Discount.js';

// Get discounts with pagination and filters
export const getDiscounts = async (req, res) => {
    try {
        const { page = 0, size = 10, name, status } = req.query;

        const filter = {};
        if (name) {
            filter.name = { $regex: name, $options: 'i' };
        }
        if (status) {
            filter.status = status;
        }

        const total = await Discount.countDocuments(filter);
        const discounts = await Discount.find(filter)
            .sort({ createdAt: -1 })
            .skip(Number(page) * Number(size))
            .limit(Number(size));

        res.json({
            content: discounts,
            totalElements: total,
            totalPages: Math.ceil(total / Number(size)),
            page: Number(page),
            size: Number(size)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get discount by ID
export const getDiscountById = async (req, res) => {
    try {
        const discount = await Discount.findById(req.params.id);

        if (!discount) {
            return res.status(404).json({ message: 'Discount not found' });
        }

        res.json(discount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get discounts by total price (applicable discounts)
export const getDiscountByPrice = async (req, res) => {
    try {
        const { price } = req.params;
        const totalPrice = Number(price);

        if (isNaN(totalPrice)) {
            return res.status(400).json({ message: 'Invalid price' });
        }

        const now = new Date();
        const discounts = await Discount.find({
            status: 'ACTIVE',
            minTotalPrice: { $lte: totalPrice },
            $or: [
                { startDate: null, endDate: null },
                { startDate: { $lte: now }, endDate: null },
                { startDate: null, endDate: { $gte: now } },
                { startDate: { $lte: now }, endDate: { $gte: now } }
            ]
        }).sort({ discountPercent: -1, discountAmount: -1 });

        res.json({
            content: discounts,
            totalElements: discounts.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add new discount
export const addDiscount = async (req, res) => {
    try {
        const { name, description, discountPercent, discountAmount, minTotalPrice, maxDiscount, startDate, endDate, status } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const discount = new Discount({
            name,
            description,
            discountPercent: discountPercent || 0,
            discountAmount: discountAmount || 0,
            minTotalPrice: minTotalPrice || 0,
            maxDiscount: maxDiscount || 0,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            status: status || 'ACTIVE'
        });

        await discount.save();

        res.status(201).json({
            message: 'Discount created successfully',
            id: discount._id,
            data: discount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update discount
export const updateDiscount = async (req, res) => {
    try {
        const { name, description, discountPercent, discountAmount, minTotalPrice, maxDiscount, startDate, endDate, status } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (discountPercent !== undefined) updateData.discountPercent = discountPercent;
        if (discountAmount !== undefined) updateData.discountAmount = discountAmount;
        if (minTotalPrice !== undefined) updateData.minTotalPrice = minTotalPrice;
        if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount;
        if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
        if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
        if (status !== undefined) updateData.status = status;

        const discount = await Discount.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!discount) {
            return res.status(404).json({ message: 'Discount not found' });
        }

        res.json({
            message: 'Discount updated successfully',
            data: discount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete discount
export const deleteDiscount = async (req, res) => {
    try {
        const discount = await Discount.findByIdAndDelete(req.params.id);

        if (!discount) {
            return res.status(404).json({ message: 'Discount not found' });
        }

        res.json({ message: 'Discount deleted successfully', data: discount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
