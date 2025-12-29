// Local backend API URL
const API_URL = 'http://localhost:3001/api';

const getToken = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; token=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const ordertableService = {
  getOrderTables: async (page = 0, size = 10) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/table?page=${page}&size=${size}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });
    return response.json();
  },

  // Get all tables with filtering
  getAllTables: async (name = '', state = null, page = 0, size = 10) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    let url = `${API_URL}/table?page=${page}&size=${size}`;
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

  getOrderTableById: async (id) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/table/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });
    return response.json();
  },
  getOrderTableByUser: async (userId, page = 0, size = 10) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/order-table?userId=${userId}&page=${page}&size=${size}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });
    return response.json();
  },


  getActiveTable: async (page = 0, size = 100) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/table/active?page=${page}&size=${size}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });
    return response.json();
  },

  createOrderTable: async (name, state, numberOfChair, page = 0, size = 10) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/table?page=${page}&size=${size}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ name, state, numberOfChair }),
    });
    return response.json();
  },

  updateOrderTable: async (id, name, state, numberOfChair) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/table/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body: JSON.stringify({ name, state, numberOfChair }),
    });
    return response.json();
  },

  deleteOrderTable: async (id) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/table/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'DELETE',
    });
    return response.json();
  },

  updateOrderTableState: async (id, state) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/table/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body: JSON.stringify({ state }),
    });
    return response.json();
  },

  createOrder: async (email, fullName, description, phoneNumber, periodType, tableId, orderTime, orderTableState) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/order-table`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ email, fullName, description, phoneNumber, periodType, tableId, orderTime, orderTableState }),
    });
    return response.json();
  }
}

export default ordertableService;


