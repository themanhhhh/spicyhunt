import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret';

// Đăng ký
export const register = async (req, res) => {
  try {
    const { fullName, username, password, phoneNumber, email } = req.body;
    if (!fullName || !username || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ fullName, username, password: hashedPassword, phoneNumber, email });
    await user.save();
    res.status(201).json({ message: 'Registration successful', userId: user._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đăng nhập
export const login = async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Check if user is blocked or inactive
    if (user.state === 'BLOCKED') {
      return res.status(403).json({ message: 'Your account has been blocked' });
    }
    if (user.state === 'INACTIVE') {
      return res.status(403).json({ message: 'Your account is inactive' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Token expiry based on rememberMe
    const tokenExpiry = rememberMe ? '7d' : '1h';
    const refreshTokenExpiry = rememberMe ? '30d' : '7d';

    const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: tokenExpiry });
    const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: refreshTokenExpiry });
    user.refreshToken = refreshToken;
    await user.save();

    // Response format matching frontend expectations
    res.json({
      accessToken,
      refreshToken,
      username: user.username,
      role: user.role,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        imgUrl: user.imgUrl,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đăng xuất
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Làm mới token
export const refreshToken = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No refresh token provided' });

    const payload = jwt.verify(token, JWT_REFRESH_SECRET);
    const user = await User.findById(payload.userId);
    if (!user || user.refreshToken !== token) return res.status(401).json({ message: 'Invalid refresh token' });

    const newAccessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ accessToken: newAccessToken, token: newAccessToken }); // Both for backward compatibility
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

// Lấy profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -refreshToken -otpCode -otpExpiry -resetPasswordToken');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật profile
export const updateProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, email, imgUrl } = req.body;
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (email) updateData.email = email;
    if (imgUrl) updateData.imgUrl = imgUrl;

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true }
    ).select('-password -refreshToken -otpCode -otpExpiry -resetPasswordToken');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đổi mật khẩu
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Old password is incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Quên mật khẩu - gửi OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Trả về thành công để tránh lộ thông tin user tồn tại
      return res.json({ message: 'If email exists, OTP has been sent' });
    }

    // Tạo OTP 6 số
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    user.otpCode = otpCode;
    user.otpExpiry = otpExpiry;
    await user.save();

    // TODO: Gửi email thực tế (hiện tại chỉ log ra console)
    console.log(`[FORGOT PASSWORD] OTP for ${email}: ${otpCode}`);

    res.json({ message: 'OTP has been sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xác thực OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otpCode } = req.body;
    if (!email || !otpCode) {
      return res.status(400).json({ message: 'Email and OTP code are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or OTP' });
    }

    if (!user.otpCode || user.otpCode !== otpCode) {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Tạo reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.otpCode = null;
    user.otpExpiry = null;
    await user.save();

    res.json({
      message: 'OTP verified successfully',
      token: resetToken
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset mật khẩu
export const resetPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword, token } = req.body;

    if (!email || !password || !confirmPassword || !token) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const user = await User.findOne({ email, resetPasswordToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or reset token' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
