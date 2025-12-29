// Local backend API URL
const API_URL = 'http://localhost:3001/api';

const getToken = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; token=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Helper function to format address data into a single string
const formatAddressDetail = (addressData) => {
  const addressParts = [
    addressData.label || 'HOME',
    addressData.street || '',
    addressData.apt ? `Apt: ${addressData.apt}` : '',
    addressData.city || '',
    addressData.state || '',
    addressData.zipCode || '',
    addressData.country || '',
    addressData.formatted_address ? `Full: ${addressData.formatted_address}` : '',
    addressData.latitude && addressData.longitude ? `Coords: ${addressData.latitude},${addressData.longitude}` : '',
    addressData.place_id ? `PlaceID: ${addressData.place_id}` : ''
  ].filter(Boolean);

  return addressParts.join(' | ');
};

const addressService = {
  // Create a new address
  createAddress: async (addressData) => {
    try {
      const token = getToken();
      if (!token) throw new Error('No authentication token found');

      // addressDetail là string, addressIp là string, isDefault là boolean
      const { addressDetail, addressIp, isDefault } = addressData;
      if (!addressDetail || !addressIp) throw new Error('addressDetail and addressIp are required');

      const response = await fetch(`${API_URL}/address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          addressDetail,
          addressIp,
          isDefault: isDefault || false
        })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Address created successfully',
          id: data.id,
          data: data
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to create address',
          data: data
        };
      }
    } catch (error) {
      console.error('Error creating address:', error);
      return {
        success: false,
        message: error.message || 'Network error occurred',
        error: error
      };
    }
  },

  // Get all addresses for current user
  getUserAddresses: async (page = 0, size = 10) => {
    try {
      const token = getToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_URL}/address?page=${page}&size=${size}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        method: 'GET',
      });
      return response.json();
    } catch (error) {
      console.error('Error fetching user addresses:', error);
      throw error;
    }
  },

  // Get address by ID
  getAddressById: async (addressId) => {
    try {
      const token = getToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_URL}/address/${addressId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        method: 'GET',
      });
      return response.json();
    } catch (error) {
      console.error('Error fetching address:', error);
      throw error;
    }
  },

  // Update an address
  updateAddress: async (addressId, addressData) => {
    try {
      const token = getToken();
      if (!token) throw new Error('No authentication token found');

      const addressDetail = formatAddressDetail(addressData);

      const response = await fetch(`${API_URL}/address/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          addressDetail: addressDetail,
          isDefault: addressData.isDefault || false
        })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Address updated successfully',
          id: data.id,
          data: data
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to update address',
          data: data
        };
      }
    } catch (error) {
      console.error('Error updating address:', error);
      return {
        success: false,
        message: error.message || 'Network error occurred',
        error: error
      };
    }
  },

  // Delete an address
  deleteAddress: async (addressId) => {
    try {
      const token = getToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_URL}/address/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      // Kiểm tra HTTP status code để xác định thành công
      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Address deleted successfully',
          data: data
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to delete address',
          data: data
        };
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      return {
        success: false,
        message: error.message || 'Network error occurred',
        error: error
      };
    }
  },

  // Set default address
  setDefaultAddress: async (addressId) => {
    try {
      const token = getToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_URL}/address/${addressId}/default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      return response.json();
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  },

  // Search addresses using OpenStreetMap Nominatim API
  searchAddresses: async (query, limit = 5) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=${limit}&q=${encodeURIComponent(query)}`,
        {
          headers: {
            'User-Agent': 'RestaurantApp/1.0'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.map(item => ({
          id: item.place_id,
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          address: {
            house_number: item.address?.house_number || '',
            road: item.address?.road || '',
            city: item.address?.city || item.address?.town || item.address?.village || '',
            state: item.address?.state || '',
            postcode: item.address?.postcode || '',
            country: item.address?.country || ''
          },
          formatted_address: item.display_name
        }));
      }
      return [];
    } catch (error) {
      console.error('Error searching addresses:', error);
      return [];
    }
  },

  // Reverse geocoding - get address from coordinates
  reverseGeocode: async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'RestaurantApp/1.0'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          formatted_address: data.display_name,
          address_components: {
            street_number: data.address?.house_number || '',
            route: data.address?.road || '',
            locality: data.address?.city || data.address?.town || data.address?.village || '',
            administrative_area_level_1: data.address?.state || '',
            postal_code: data.address?.postcode || '',
            country: data.address?.country || ''
          },
          latitude: parseFloat(data.lat),
          longitude: parseFloat(data.lon),
          place_id: data.place_id
        };
      }
      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  },
  updateAddressDefault: async (addressId) => {
    try {
      const token = getToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_URL}/address/default/${addressId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isDefault: true })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Default address updated successfully',
          data: data
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to update default address',
          data: data
        };
      }
    } catch (error) {
      console.error('Error updating address default:', error);
      return {
        success: false,
        message: error.message || 'Network error occurred',
        error: error
      };
    }
  }
};

export { addressService }; 