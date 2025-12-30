// Local backend API URL
const API_URL = 'https://spicyhunt-yqoi.onrender.com/api';

const getToken = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; token=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export const discountService = {
  getDiscounts: async (page = 0, size = 10) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/discount/view?page=${page}&size=${size}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });

    return response.json();
  },

  // Get discounts with filtering
  getAllDiscounts: async (name = '', status = null, page = 0, size = 10) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    let url = `${API_URL}/discount/view?page=${page}&size=${size}`;
    if (name) url += `&name=${encodeURIComponent(name)}`;
    if (status) url += `&status=${status}`;

    const response = await fetch(`${url}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });

    return response.json();
  },

  getDiscountByPrice: async (price) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/discount/requirement-totalPrice/${price}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });

    return response.json();
  },

  getDiscountById: async (id) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/discount/view/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });

    return response.json();
  },

  addDiscount: async (discount) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/discount`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(discount),
    });

    return response.json();
  },

  updateDiscount: async (id, discount) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/discount/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body: JSON.stringify(discount),
    });

    return response.json();
  },

  deleteDiscount: async (id) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/discount/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'DELETE',
    });

    return response.json();
  },
}; 