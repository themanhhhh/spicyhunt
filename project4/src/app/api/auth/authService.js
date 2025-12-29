import { apiRequest } from '../../lib/api';

// Local backend API URL - change to external URL for production
const API_URL = 'http://localhost:3001/api';

export const authService = {
  // Đăng nhập
  login: async (username, password, rememberMe) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          rememberMe
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Đăng ký
  register: async (fullName, username, password, phoneNumber, email) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, username, password, phoneNumber, email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Đăng xuất
  logout: async () => {
    try {
      const token = getCookie('refreshToken');
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: token })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Logout failed');
      }

      return data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Làm mới token
  refreshToken: async () => {
    try {
      const refreshToken = getCookie('refreshToken');
      const response = await fetch(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Token refresh failed');
      }

      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const token = getToken();
      console.log('🔍 getProfile called with token:', token ? 'exists' : 'null');

      // Nếu không có token, trả về null thay vì gọi API
      if (!token) {
        console.log('⚠️ No token in getProfile, returning null');
        return null;
      }

      console.log('📡 getProfile using apiRequest...');
      const { data } = await apiRequest(`${API_URL}/auth/profile`);
      console.log('✅ Profile fetched successfully via interceptor');
      return data;
    } catch (error) {
      console.log('❌ getProfile error:', error);
      // Throw error thay vì return null để AuthContext có thể catch
      throw error;
    }
  },

  updateProfile: async (fullName, phoneNumber, email, imgUrl = null) => {
    try {
      const profileData = { fullName, phoneNumber, email };
      // Chỉ thêm imgUrl vào request nếu nó được cung cấp
      if (imgUrl) {
        profileData.imgUrl = imgUrl;
      }

      const { data } = await apiRequest(`${API_URL}/auth/update-profile`, {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });

      return data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },

  changePassword: async (oldPassword, newPassword, confirmPassword) => {
    try {
      const { data } = await apiRequest(`${API_URL}/auth/change-password`, {
        method: 'PUT',
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword })
      });

      return data;
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }

      return data;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  },
  verifyOtp: async (email, otpCode) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otpCode })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      return data;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  },
  resetPassword: async (email, password, confirmPassword, token) => {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, confirmPassword, token })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }

      return data;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }
};
// Helper function để lấy cookie
const getToken = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; token=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}; 