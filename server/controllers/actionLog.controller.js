import ActionLog from '../models/ActionLog.js';
import User from '../models/User.js';

// Get logs with pagination
export const getLogs = async (req, res) => {
    try {
        const { page = 0, size = 10 } = req.query;

        const total = await ActionLog.countDocuments();
        const logs = await ActionLog.find()
            .populate('userId', 'fullName email username')
            .sort({ createdAt: -1 })
            .skip(Number(page) * Number(size))
            .limit(Number(size));

        res.json({
            content: logs,
            totalElements: total,
            totalPages: Math.ceil(total / Number(size)),
            page: Number(page),
            size: Number(size)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get logs with advanced filtering
export const getLogActivity = async (req, res) => {
    try {
        const {
            page = 0,
            size = 10,
            username,
            accountRole,
            actionType,
            gte, // Date greater than or equal
            lte  // Date less than or equal
        } = req.query;

        const filter = {};

        // Filter by username (partial match, case insensitive)
        if (username) {
            filter.username = { $regex: username, $options: 'i' };
        }

        // Filter by account role
        if (accountRole) {
            filter.accountRole = accountRole;
        }

        // Filter by action type
        if (actionType) {
            filter.actionType = actionType;
        }

        // Filter by date range
        if (gte || lte) {
            filter.createdAt = {};
            if (gte) {
                filter.createdAt.$gte = new Date(gte);
            }
            if (lte) {
                const endDate = new Date(lte);
                endDate.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = endDate;
            }
        }

        const total = await ActionLog.countDocuments(filter);
        const logs = await ActionLog.find(filter)
            .populate('userId', 'fullName email username')
            .sort({ createdAt: -1 })
            .skip(Number(page) * Number(size))
            .limit(Number(size));

        res.json({
            content: logs,
            totalElements: total,
            totalPages: Math.ceil(total / Number(size)),
            page: Number(page),
            size: Number(size)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new log entry (internal use)
export const createLog = async (req, res) => {
    try {
        const { actionType, description, targetType, targetId, details } = req.body;

        // Get user info
        const user = await User.findById(req.userId);

        const log = new ActionLog({
            userId: req.userId,
            username: user?.fullName || user?.email || 'Unknown',
            accountRole: user?.role || 'guest',
            actionType,
            description,
            targetType,
            targetId,
            details,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        await log.save();
        res.status(201).json({ message: 'Log created successfully', data: log });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to create log (for use in other controllers)
export const logAction = async (userId, actionType, description, targetType = null, targetId = null, details = null) => {
    try {
        const user = await User.findById(userId);

        const log = new ActionLog({
            userId,
            username: user?.fullName || user?.email || 'Unknown',
            accountRole: user?.role || 'guest',
            actionType,
            description,
            targetType,
            targetId,
            details
        });

        await log.save();
        return log;
    } catch (error) {
        console.error('Error creating action log:', error);
        return null;
    }
};

// Get log by ID
export const getLogById = async (req, res) => {
    try {
        const log = await ActionLog.findById(req.params.id)
            .populate('userId', 'fullName email username');

        if (!log) {
            return res.status(404).json({ message: 'Log not found' });
        }

        res.json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get action types (for filter dropdown)
export const getActionTypes = async (req, res) => {
    try {
        const actionTypes = ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'OTHER'];
        res.json(actionTypes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
