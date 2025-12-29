import { authService } from '../api/auth/authService';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper functions for cookie management
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const setCookie = (name, value, days) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const removeCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

const clearAllAuthCookies = () => {
  removeCookie('token');
  removeCookie('user');
  removeCookie('refreshToken');
  removeCookie('session');
  removeCookie('auth');
  removeCookie('remember_me');
};

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// API interceptor with automatic token refresh
export const apiRequest = async (url, options = {}) => {
  const token = getCookie('token');
  
  // Add authorization header if token exists
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const requestOptions = {
    ...options,
    headers,
  };
  
  try {
    console.log('📡 Making API request to:', url);
    const response = await fetch(url, requestOptions);
    const data = await response.json();
    
    // If request is successful, return the result
    if (response.ok) {
      return { response, data };
    }
    
    // Handle 401 - Token expired
    if (response.status === 401) {
      console.log('⚠️ Token expired (401), attempting refresh...');
      
      // If already refreshing, add to queue
      if (isRefreshing) {
        console.log('🔄 Already refreshing, adding to queue...');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          // Retry with new token
          return apiRequest(url, {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${token}`
            }
          });
        });
      }
      
      // Start refresh process
      isRefreshing = true;
      
      try {
        console.log('🔄 Refreshing token...');
        const refreshResult = await authService.refreshToken();
        console.log('✅ Token refreshed successfully');
        
        // Update cookies with new tokens
        const newAccessToken = refreshResult.accessToken || refreshResult.token;
        const newRefreshToken = refreshResult.refreshToken;
        
        if (newAccessToken) {
          setCookie('token', newAccessToken, 7);
          console.log('🍪 Updated access token in cookie');
        }
        
        if (newRefreshToken) {
          setCookie('refreshToken', newRefreshToken, 7);
          console.log('🍪 Updated refresh token in cookie');
        }
        
        // Update user data if available
        if (refreshResult.user) {
          setCookie('user', JSON.stringify(refreshResult.user), 7);
        }
        
        // Process queued requests
        processQueue(null, newAccessToken);
        
        // Dispatch custom event to notify AuthContext
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('tokenRefreshed', {
            detail: { newAccessToken, newRefreshToken }
          }));
        }
        
        // Show success toast for token refresh (optional, can be removed if too noisy)
        toast.success('Phiên đăng nhập đã được gia hạn tự động', {
          duration: 1500,
          position: 'top-right',
          style: {
            fontSize: '12px',
            background: '#28a745',
            color: 'white',
          },
        });
        
        // Retry original request with new token
        return apiRequest(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newAccessToken}`
          }
        });
        
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        
        // Process queue with error
        processQueue(refreshError, null);
        
        // Show error message
        toast.error('Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại.', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#ff6b6b',
            color: 'white',
            fontWeight: '500',
          },
        });
        
        // Clear auth data and redirect to login
        clearAllAuthCookies();
        
        setTimeout(() => {
          window.location.href = '/login';
        }, 3500);
        
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }
    
    // For other errors, throw with response data
    throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
    
  } catch (error) {
    console.error('❌ API request failed:', error);
    throw error;
  }
};

// Convenience methods
export const api = {
  get: (url, options = {}) => apiRequest(url, { ...options, method: 'GET' }),
  post: (url, data, options = {}) => apiRequest(url, { 
    ...options, 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  put: (url, data, options = {}) => apiRequest(url, { 
    ...options, 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (url, options = {}) => apiRequest(url, { ...options, method: 'DELETE' }),
  patch: (url, data, options = {}) => apiRequest(url, { 
    ...options, 
    method: 'PATCH', 
    body: JSON.stringify(data) 
  })
};

export default api;

export const authApi = {
  signin: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return response.json();
  },

  signout: async (refreshToken) => {
    const response = await fetch(`${API_BASE_URL}/auth/signout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    return response.json();
  },
};

export const userApi = {
  getAll: async (token) => {
    const response = await fetch(`${API_BASE_URL}/account`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  create: async (userData, token) => {
    const response = await fetch(`${API_BASE_URL}/account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

};