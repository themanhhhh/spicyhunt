import Food from '../models/Food.js';

// Helper function to normalize _id to id for frontend compatibility
const normalizeId = (doc) => {
    const obj = doc.toObject ? doc.toObject() : { ...doc };
    if (obj._id && !obj.id) {
        obj.id = obj._id.toString();
    }
    // Also normalize categoryId to string for easier comparison
    // And preserve categoryName for frontend display
    if (obj.categoryId) {
        if (typeof obj.categoryId === 'object' && obj.categoryId._id) {
            // It's a populated object - extract name before converting to string
            obj.categoryName = obj.categoryId.name || '';
            obj.categoryNameEN = obj.categoryId.nameEN || '';
            obj.categoryId = obj.categoryId._id.toString();
        } else if (obj.categoryId.toString) {
            obj.categoryId = obj.categoryId.toString();
        }
    }
    return obj;
};

// Helper function to get localized fields
const getLocalizedFood = (food, language = 'VI') => {
    const item = normalizeId(food);
    if (language === 'EN') {
        return {
            ...item,
            name: item.nameEN || item.name,
            description: item.descriptionEN || item.description,
            categoryName: item.categoryNameEN || item.categoryName
        };
    }
    return item;
};

// Get foods with pagination
export const getFoods = async (req, res) => {
    try {
        const { page = 0, size = 10, language = 'VI', name, categoryId, state, isMain } = req.query;

        const filter = {};
        if (name) {
            filter.$or = [
                { name: { $regex: name, $options: 'i' } },
                { nameEN: { $regex: name, $options: 'i' } }
            ];
        }
        if (categoryId) {
            filter.categoryId = categoryId;
        }
        if (state) {
            filter.state = state;
        }
        if (isMain !== undefined) {
            filter.isMain = isMain === 'true';
        }

        const total = await Food.countDocuments(filter);
        const foods = await Food.find(filter)
            .populate('categoryId', 'name nameEN')
            .sort({ order: 1, createdAt: -1, _id: 1 })
            .skip(Number(page) * Number(size))
            .limit(Number(size));

        const localizedFoods = foods.map(food => getLocalizedFood(food, language));

        res.json({
            content: localizedFoods,
            totalElements: total,
            totalPages: Math.ceil(total / Number(size)),
            page: Number(page),
            size: Number(size)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get main dishes
export const getMainDishes = async (req, res) => {
    try {
        const { page = 0, size = 100, language = 'VI' } = req.query;

        const filter = { isMain: true, state: 'AVAILABLE' };

        const total = await Food.countDocuments(filter);
        const foods = await Food.find(filter)
            .populate('categoryId', 'name nameEN')
            .sort({ order: 1, createdAt: -1, _id: 1 })
            .skip(Number(page) * Number(size))
            .limit(Number(size));

        const localizedFoods = foods.map(food => getLocalizedFood(food, language));

        res.json({
            content: localizedFoods,
            totalElements: total,
            totalPages: Math.ceil(total / Number(size)),
            page: Number(page),
            size: Number(size)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all foods with filters
export const getAllFoods = async (req, res) => {
    try {
        const { page = 0, size = 10, language = 'VI', name, categoryId, state } = req.query;

        const filter = {};
        if (name) {
            filter.$or = [
                { name: { $regex: name, $options: 'i' } },
                { nameEN: { $regex: name, $options: 'i' } }
            ];
        }
        if (categoryId) {
            filter.categoryId = categoryId;
        }
        if (state) {
            filter.state = state;
        }

        const total = await Food.countDocuments(filter);
        const foods = await Food.find(filter)
            .populate('categoryId', 'name nameEN')
            .sort({ order: 1, createdAt: -1, _id: 1 })
            .skip(Number(page) * Number(size))
            .limit(Number(size));

        const localizedFoods = foods.map(food => getLocalizedFood(food, language));

        res.json({
            content: localizedFoods,
            totalElements: total,
            totalPages: Math.ceil(total / Number(size)),
            page: Number(page),
            size: Number(size)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get food by ID
export const getFoodById = async (req, res) => {
    try {
        const { language = 'VI' } = req.query;
        const food = await Food.findById(req.params.id)
            .populate('categoryId', 'name nameEN');

        if (!food) {
            return res.status(404).json({ message: 'Food not found' });
        }

        res.json(getLocalizedFood(food, language));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add new food
export const addFood = async (req, res) => {
    try {
        const { name, nameEN, description, descriptionEN, price, imgUrl, categoryId, state, quantity, isMain, order } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({ message: 'Name and price are required' });
        }

        const food = new Food({
            name,
            nameEN,
            description,
            descriptionEN,
            price,
            imgUrl,
            categoryId,
            state: state || 'AVAILABLE',
            quantity: quantity || 0,
            isMain: isMain || false,
            order: order || 0
        });

        await food.save();

        // Populate category before returning
        await food.populate('categoryId', 'name nameEN');

        res.status(201).json({
            message: 'Food created successfully',
            id: food._id,
            data: food
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update food
export const updateFood = async (req, res) => {
    try {
        const { language = 'VI' } = req.query;
        const { name, nameEN, description, descriptionEN, price, imgUrl, categoryId, state, quantity, isMain, order } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (nameEN !== undefined) updateData.nameEN = nameEN;
        if (description !== undefined) updateData.description = description;
        if (descriptionEN !== undefined) updateData.descriptionEN = descriptionEN;
        if (price !== undefined) updateData.price = price;
        if (imgUrl !== undefined) updateData.imgUrl = imgUrl;
        if (categoryId !== undefined) updateData.categoryId = categoryId;
        if (state !== undefined) updateData.state = state;
        if (quantity !== undefined) updateData.quantity = quantity;
        if (isMain !== undefined) updateData.isMain = isMain;
        if (order !== undefined) updateData.order = order;

        const food = await Food.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('categoryId', 'name nameEN');

        if (!food) {
            return res.status(404).json({ message: 'Food not found' });
        }

        res.json({
            message: 'Food updated successfully',
            data: getLocalizedFood(food, language)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete food
export const deleteFood = async (req, res) => {
    try {
        const food = await Food.findByIdAndDelete(req.params.id);
        if (!food) {
            return res.status(404).json({ message: 'Food not found' });
        }
        res.json({ message: 'Food deleted successfully', data: food });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get food view (public - no auth required)
export const getFoodView = async (req, res) => {
    try {
        const { size = 100, language = 'VI', state = 'AVAILABLE', isMain, categoryId, name, page = 0 } = req.query;

        const filter = {};
        if (state) {
            filter.state = state;
        }
        if (isMain !== undefined) {
            filter.isMain = isMain === 'true';
        }
        if (categoryId) {
            filter.categoryId = categoryId;
        }
        if (name) {
            filter.$or = [
                { name: { $regex: name, $options: 'i' } },
                { nameEN: { $regex: name, $options: 'i' } }
            ];
        }

        const total = await Food.countDocuments(filter);
        const foods = await Food.find(filter)
            .populate('categoryId', 'name nameEN')
            .sort({ order: 1, createdAt: -1, _id: 1 })
            .skip(Number(page) * Number(size))
            .limit(Number(size));

        const localizedFoods = foods.map(food => getLocalizedFood(food, language));

        res.json({
            content: localizedFoods,
            totalElements: total,
            totalPages: Math.ceil(total / Number(size)),
            page: Number(page),
            size: Number(size)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get food by ID (public view)
export const getFoodByIdView = async (req, res) => {
    try {
        const { language = 'VI' } = req.query;
        const food = await Food.findById(req.params.id)
            .populate('categoryId', 'name nameEN');

        if (!food) {
            return res.status(404).json({ message: 'Food not found' });
        }

        res.json(getLocalizedFood(food, language));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
