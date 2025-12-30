import { apiRequest } from '../../lib/api';

// Local backend API URL
const API_URL = 'https://spicyhunt-yqoi.onrender.com/api';

// Helper function để lấy accessToken từ cookie
const getToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

export const userService = {
    addUser: async (fullName, username, password, phoneNumber, email, role, state) => {
        const { data } = await apiRequest(`${API_URL}/account`, {
            method: 'POST',
            body: JSON.stringify({ fullName, username, password, phoneNumber, email, role, state }),
        });

        // Check for application-level errors in response
        if (data.code && data.code !== 200 && data.code >= 1000) {
            throw new Error(data.message || 'API error occurred');
        }

        return data;
    },

    getUser: async (page = 0, size = 10) => {
        const { data } = await apiRequest(`${API_URL}/account?page=${page}&size=${size}`);
        return data;
    },

    // Get all user accounts with filter
    getAllUsers: async (search = '', state = null, page = 0, size = 20) => {
        let url = `${API_URL}/account?page=${page}&size=${size}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (state) url += `&state=${state}`;

        const { data } = await apiRequest(url);
        return data;
    },

    getUserById: async (id) => {
        const { data } = await apiRequest(`${API_URL}/account/${id}`);
        return data;
    },

    updateUser: async (id, fullName, username, password, phoneNumber, email, role, state) => {
        const { data } = await apiRequest(`${API_URL}/account/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ fullName, username, password, phoneNumber, email, role, state }),
        });

        // Check for application-level errors in response
        if (data.code && data.code !== 200 && data.code >= 1000) {
            throw new Error(data.message || 'API error occurred');
        }

        return data;
    },

    deleteUser: async (id) => {
        const { data } = await apiRequest(`${API_URL}/account/${id}`, {
            method: 'DELETE'
        });
        return data;
    }
};  