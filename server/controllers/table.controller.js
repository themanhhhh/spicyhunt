import Table from '../models/Table.js';
import OrderTable from '../models/OrderTable.js';

// Helper function to normalize _id to id for frontend compatibility
const normalizeId = (doc) => {
    const obj = doc.toObject ? doc.toObject() : { ...doc };
    if (obj._id && !obj.id) {
        obj.id = obj._id.toString();
    }
    return obj;
};

// Get tables with pagination and filters
export const getTables = async (req, res) => {
    try {
        const { page = 0, size = 10, name, state } = req.query;

        const filter = {};
        if (name) {
            filter.name = { $regex: name, $options: 'i' };
        }
        if (state) {
            filter.state = state;
        }

        const total = await Table.countDocuments(filter);
        const tables = await Table.find(filter)
            .sort({ createdAt: -1 })
            .skip(Number(page) * Number(size))
            .limit(Number(size));

        res.json({
            content: tables,
            totalElements: total,
            totalPages: Math.ceil(total / Number(size)),
            page: Number(page),
            size: Number(size)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get table by ID
export const getTableById = async (req, res) => {
    try {
        const table = await Table.findById(req.params.id);

        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        res.json(table);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get active tables
export const getActiveTables = async (req, res) => {
    try {
        const { page = 0, size = 100 } = req.query;

        const filter = { state: 'ACTIVE' };

        const total = await Table.countDocuments(filter);
        const tables = await Table.find(filter)
            .sort({ name: 1 })
            .skip(Number(page) * Number(size))
            .limit(Number(size));

        // Normalize tables to include 'id' field for frontend compatibility
        const normalizedTables = tables.map(normalizeId);

        res.json(normalizedTables);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create table
export const createTable = async (req, res) => {
    try {
        const { name, state, numberOfChair } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const table = new Table({
            name,
            state: state || 'ACTIVE',
            numberOfChair: numberOfChair || 4
        });

        await table.save();

        res.status(201).json({
            message: 'Table created successfully',
            id: table._id,
            data: table
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update table
export const updateTable = async (req, res) => {
    try {
        const { name, state, numberOfChair } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (state !== undefined) updateData.state = state;
        if (numberOfChair !== undefined) updateData.numberOfChair = numberOfChair;

        const table = await Table.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        res.json({
            message: 'Table updated successfully',
            data: table
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete table
export const deleteTable = async (req, res) => {
    try {
        const table = await Table.findByIdAndDelete(req.params.id);

        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        res.json({ message: 'Table deleted successfully', data: table });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get order tables by user
export const getOrderTablesByUser = async (req, res) => {
    try {
        const { userId, page = 0, size = 10 } = req.query;

        const filter = {};
        if (userId) {
            filter.userId = userId;
        }

        const total = await OrderTable.countDocuments(filter);
        const orderTables = await OrderTable.find(filter)
            .populate('tableId', 'name state numberOfChair')
            .sort({ orderTime: -1 })
            .skip(Number(page) * Number(size))
            .limit(Number(size));

        res.json({
            content: orderTables,
            totalElements: total,
            totalPages: Math.ceil(total / Number(size)),
            page: Number(page),
            size: Number(size)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create order table (reservation)
export const createOrderTable = async (req, res) => {
    try {
        const { email, fullName, description, phoneNumber, periodType, tableId, orderTime, orderTableState } = req.body;

        if (!fullName || !phoneNumber || !tableId || !orderTime) {
            return res.status(400).json({ message: 'FullName, phoneNumber, tableId and orderTime are required' });
        }

        // Check if table exists
        const table = await Table.findById(tableId);
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        const orderTable = new OrderTable({
            email,
            fullName,
            description,
            phoneNumber,
            periodType: periodType || 'EVENING',
            tableId,
            userId: req.user?._id,
            orderTime: new Date(orderTime),
            orderTableState: orderTableState || 'PENDING'
        });

        await orderTable.save();

        // Populate table info before returning
        await orderTable.populate('tableId', 'name state numberOfChair');

        res.status(201).json({
            message: 'Table reservation created successfully',
            id: orderTable._id,
            data: orderTable
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update order table state
export const updateOrderTableState = async (req, res) => {
    try {
        const { orderTableState } = req.body;

        const orderTable = await OrderTable.findByIdAndUpdate(
            req.params.id,
            { orderTableState },
            { new: true }
        ).populate('tableId', 'name state numberOfChair');

        if (!orderTable) {
            return res.status(404).json({ message: 'Order table not found' });
        }

        res.json({
            message: 'Order table state updated successfully',
            data: orderTable
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
