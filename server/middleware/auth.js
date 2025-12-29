import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user to get role and verify user still exists
    const user = await User.findById(decoded.userId).select('-password -refreshToken -otpCode -otpExpiry -resetPasswordToken');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if user is blocked or inactive
    if (user.state === 'BLOCKED') {
      return res.status(403).json({ message: 'Your account has been blocked' });
    }
    if (user.state === 'INACTIVE') {
      return res.status(403).json({ message: 'Your account is inactive' });
    }

    // Attach user info to request
    req.userId = decoded.userId;
    req.user = user;
    req.userRole = user.role;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authMiddleware;
