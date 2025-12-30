// Local backend API URL
const API_URL = 'https://spicyhunt-yqoi.onrender.com/api';

const getToken = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; token=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export const categoryService = {
  getCategories: async (page = 0, pageSize = 10, language = 'VI') => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/category/view?page=${page}&size=${pageSize}&language=${language}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });

    return response.json();
  },

  // Get categories with filter options
  getAllCategories: async (name = '', state = null, page = 0, pageSize = 10, language = 'VI') => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    let url = `${API_URL}/category/view?page=${page}&size=${pageSize}&language=${language}`;
    if (name) url += `&name=${encodeURIComponent(name)}`;
    if (state) url += `&state=${state}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });

    return response.json();
  },

  getCategoryById: async (id, language = 'VI') => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/category/view/${id}?language=${language}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });

    return response.json();
  },

  addCategory: async (category) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/category`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(category),
    });

    return response.json();
  },

  updateCategory: async (id, category, language = 'VI') => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/category/${id}?language=${language}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body: JSON.stringify(category),
    });

    return response.json();
  },

  deleteCategory: async (id) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/category/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'DELETE',
    });

    return response.json();
  },

  getActiveCategories: async () => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/category/active`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });

    return response.json();
  },
  getCategoryView: async (size = 100, language = 'VI') => {
    const response = await fetch(`${API_URL}/category/view?state=ACTIVE&size=${size}&language=${language}`, {
      method: 'GET',
    });
    return response.json();
  },
};



