const API_URL = 'https://dev.quyna.online/project_4/restaurant';

const getToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

// Get basic logs
export const getLogs = async (page = 0, size = 10) => {
  const token = getToken();
  if (!token) throw new Error('No authentication token found');
  try {
      const response = await fetch(`${API_URL}/action-log?page=${page}&size=${size}`, {
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
          },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
  }
};

// Get logs with advanced filtering
export const getLogActivity = async (username = '', accountRole = '', actionType = '', gte = null, lte = null, page = 0, size = 10) => {
  const token = getToken();
  if (!token) throw new Error('No authentication token found');
  
  try {
    let url = `${API_URL}/action-log?page=${page}&size=${size}`;
    if (username) url += `&username=${encodeURIComponent(username)}`;
    if (accountRole) url += `&accountRole=${encodeURIComponent(accountRole)}`;
    if (actionType) url += `&actionType=${encodeURIComponent(actionType)}`;
    if (gte) url += `&gte=${encodeURIComponent(gte)}`;
    if (lte) url += `&lte=${encodeURIComponent(lte)}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch log activity');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching log activity:', error);
    throw error;
  }
};

// Keep the logService object for backward compatibility
export const logService = {
  getLogs,
  getLogActivity
};

export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const getActionTypeColor = (actionType) => {
  return 'black'
};