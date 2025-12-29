import Category from '../models/Category.js';

// Helper function to normalize _id to id for frontend compatibility
const normalizeId = (doc) => {
    const obj = doc.toObject ? doc.toObject() : { ...doc };
    if (obj._id && !obj.id) {
        obj.id = obj._id.toString();
    }
    return obj;
};

// Helper function to get localized fields
const getLocalizedCategory = (category, language = 'VI') => {
    const cat = normalizeId(category);
    if (language === 'EN') {
        return {
            ...cat,
            name: cat.nameEN || cat.name,
            description: cat.descriptionEN || cat.description
        };
    }
    return cat;
};

// Get categories with pagination (view endpoint)
export const getCategories = async (req, res) => {
    try {
        const { page = 0, size = 10, language = 'VI', name, state } = req.query;

        // Build query filter
        const filter = {};
        if (name) {
            filter.$or = [
                { name: { $regex: name, $options: 'i' } },
                { nameEN: { $regex: name, $options: 'i' } }
            ];
        }
        if (state) {
            filter.state = state;
        }

        const total = await Category.countDocuments(filter);
        const categories = await Category.find(filter)
            .sort({ order: 1, createdAt: -1 })
            .skip(Number(page) * Number(size))
            .limit(Number(size));

        const localizedCategories = categories.map(cat => getLocalizedCategory(cat, language));

        res.json({
            content: localizedCategories,
            totalElements: total,
            totalPages: Math.ceil(total / Number(size)),
            page: Number(page),
            size: Number(size)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all categories with filters
export const getAllCategories = async (req, res) => {
    try {
        const { page = 0, size = 10, language = 'VI', name, state } = req.query;

        const filter = {};
        if (name) {
            filter.$or = [
                { name: { $regex: name, $options: 'i' } },
                { nameEN: { $regex: name, $options: 'i' } }
            ];
        }
        if (state) {
            filter.state = state;
        }

        const total = await Category.countDocuments(filter);
        const categories = await Category.find(filter)
            .sort({ order: 1, createdAt: -1 })
            .skip(Number(page) * Number(size))
            .limit(Number(size));

        const localizedCategories = categories.map(cat => getLocalizedCategory(cat, language));

        res.json({
            content: localizedCategories,
            totalElements: total,
            totalPages: Math.ceil(total / Number(size)),
            page: Number(page),
            size: Number(size)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
    try {
        const { language = 'VI' } = req.query;
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(getLocalizedCategory(category, language));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add new category
export const addCategory = async (req, res) => {
    try {
        const { name, nameEN, description, descriptionEN, imgUrl, state, order } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const category = new Category({
            name,
            nameEN,
            description,
            descriptionEN,
            imgUrl,
            state: state || 'ACTIVE',
            order: order || 0
        });

        await category.save();
        res.status(201).json({
            message: 'Category created successfully',
            id: category._id,
            data: category
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update category
export const updateCategory = async (req, res) => {
    try {
        const { language = 'VI' } = req.query;
        const { name, nameEN, description, descriptionEN, imgUrl, state, order } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (nameEN !== undefined) updateData.nameEN = nameEN;
        if (description !== undefined) updateData.description = description;
        if (descriptionEN !== undefined) updateData.descriptionEN = descriptionEN;
        if (imgUrl !== undefined) updateData.imgUrl = imgUrl;
        if (state !== undefined) updateData.state = state;
        if (order !== undefined) updateData.order = order;

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({
            message: 'Category updated successfully',
            data: getLocalizedCategory(category, language)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete category
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully', data: category });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get active categories only
export const getActiveCategories = async (req, res) => {
    try {
        const { language = 'VI' } = req.query;
        const categories = await Category.find({ state: 'ACTIVE' })
            .sort({ order: 1, createdAt: -1 });

        const localizedCategories = categories.map(cat => getLocalizedCategory(cat, language));
        res.json(localizedCategories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get category view (public - no auth required)
export const getCategoryView = async (req, res) => {
    try {
        const { size = 100, language = 'VI', state = 'ACTIVE' } = req.query;

        const filter = {};
        if (state) {
            filter.state = state;
        }

        const categories = await Category.find(filter)
            .sort({ order: 1, createdAt: -1 })
            .limit(Number(size));

        const localizedCategories = categories.map(cat => getLocalizedCategory(cat, language));

        res.json({
            content: localizedCategories,
            totalElements: localizedCategories.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
