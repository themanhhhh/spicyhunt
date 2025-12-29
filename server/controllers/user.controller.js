import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Get users with pagination
export const getUsers = async (req, res) => {
    try {
        const { page = 0, size = 10, search, state, role } = req.query;

        const filter = {};
        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } }
            ];
        }
        if (state) {
            filter.state = state;
        }
        if (role) {
            filter.role = role;
        }

        const total = await User.countDocuments(filter);
        const users = await User.find(filter)
            .select('-password -refreshToken -otpCode -otpExpiry -resetPasswordToken')
            .sort({ createdAt: -1 })
            .skip(Number(page) * Number(size))
            .limit(Number(size));

        res.json({
            content: users,
            totalElements: total,
            totalPages: Math.ceil(total / Number(size)),
            page: Number(page),
            size: Number(size)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all users with filters
export const getAllUsers = async (req, res) => {
    try {
        const { page = 0, size = 20, search, state, role } = req.query;

        const filter = {};
        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } }
            ];
        }
        if (state) {
            filter.state = state;
        }
        if (role) {
            filter.role = role;
        }

        const total = await User.countDocuments(filter);
        const users = await User.find(filter)
            .select('-password -refreshToken -otpCode -otpExpiry -resetPasswordToken')
            .sort({ createdAt: -1 })
            .skip(Number(page) * Number(size))
            .limit(Number(size));

        res.json({
            content: users,
            totalElements: total,
            totalPages: Math.ceil(total / Number(size)),
            page: Number(page),
            size: Number(size)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user by ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -refreshToken -otpCode -otpExpiry -resetPasswordToken');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add new user (admin function)
export const addUser = async (req, res) => {
    try {
        const { fullName, username, password, phoneNumber, email, role, state } = req.body;

        if (!fullName || !username || !password) {
            return res.status(400).json({ message: 'fullName, username and password are required' });
        }

        // Check if username or email already exists
        const existingUser = await User.findOne({
            $or: [
                { username },
                ...(email ? [{ email }] : [])
            ]
        });

        if (existingUser) {
            return res.status(409).json({ message: 'Username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            fullName,
            username,
            password: hashedPassword,
            phoneNumber,
            email,
            role: role || 'CUSTOMER',
            state: state || 'ACTIVE'
        });

        await user.save();

        // Return user without sensitive fields
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.refreshToken;
        delete userResponse.otpCode;
        delete userResponse.otpExpiry;
        delete userResponse.resetPasswordToken;

        res.status(201).json({
            message: 'User created successfully',
            id: user._id,
            data: userResponse
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user (admin function)
export const updateUser = async (req, res) => {
    try {
        const { fullName, username, password, phoneNumber, email, role, state, imgUrl } = req.body;

        const updateData = {};
        if (fullName !== undefined) updateData.fullName = fullName;
        if (username !== undefined) updateData.username = username;
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
        if (email !== undefined) updateData.email = email;
        if (role !== undefined) updateData.role = role;
        if (state !== undefined) updateData.state = state;
        if (imgUrl !== undefined) updateData.imgUrl = imgUrl;

        // If password is provided, hash it
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Check if username/email already exists (excluding current user)
        if (username || email) {
            const existingUser = await User.findOne({
                _id: { $ne: req.params.id },
                $or: [
                    ...(username ? [{ username }] : []),
                    ...(email ? [{ email }] : [])
                ]
            });

            if (existingUser) {
                return res.status(409).json({ message: 'Username or email already exists' });
            }
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select('-password -refreshToken -otpCode -otpExpiry -resetPasswordToken');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Toggle user state (ACTIVE/INACTIVE/BLOCKED)
export const toggleUserState = async (req, res) => {
    try {
        const { state } = req.body;

        if (!state || !['ACTIVE', 'INACTIVE', 'BLOCKED'].includes(state)) {
            return res.status(400).json({ message: 'Valid state is required (ACTIVE/INACTIVE/BLOCKED)' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { state },
            { new: true }
        ).select('-password -refreshToken -otpCode -otpExpiry -resetPasswordToken');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: `User state changed to ${state}`,
            data: user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
