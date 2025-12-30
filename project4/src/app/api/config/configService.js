// Local backend API URL
const API_URL = 'https://spicyhunt-yqoi.onrender.com/api';

const getToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

const handleApiError = (error, operation = 'operation') => {
    console.error(`Error during ${operation}:`, error);

    if (error.status === 401 || error.message?.includes('401')) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
    } else if (error.status === 403) {
        throw new Error('Bạn không có quyền thực hiện thao tác này!');
    } else if (error.status === 404) {
        throw new Error('Không tìm thấy dữ liệu yêu cầu!');
    } else if (error.status === 400) {
        throw new Error('Dữ liệu gửi lên không hợp lệ!');
    } else if (error.status === 500) {
        throw new Error('Lỗi máy chủ. Vui lòng thử lại sau!');
    } else if (!navigator.onLine) {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra kết nối!');
    } else {
        throw new Error(error.message || `Có lỗi xảy ra khi ${operation}. Vui lòng thử lại!`);
    }
};

export const configService = {
    getConfig: async () => {
        const token = getToken();
        if (!token) throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại!');

        try {
            const response = await fetch(`${API_URL}/admin/config`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                method: 'GET',
            });

            if (!response.ok) {
                handleApiError({ status: response.status, message: response.statusText }, 'tải danh sách configuration');
            }

            return await response.json();
        } catch (error) {
            if (error.message.includes('fetch')) {
                handleApiError({ message: 'Không thể kết nối đến máy chủ' }, 'tải danh sách configuration');
            }
            throw error;
        }
    },

    updateConfig: async (id, valueConfig) => {
        const token = getToken();
        if (!token) throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại!');

        try {
            const response = await fetch(`${API_URL}/admin/config/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                method: 'PUT',
                body: JSON.stringify({ valueConfig }),
            });

            if (!response.ok) {
                handleApiError({ status: response.status, message: response.statusText }, 'cập nhật configuration');
            }

            return await response.json();
        } catch (error) {
            if (error.message.includes('fetch')) {
                handleApiError({ message: 'Không thể kết nối đến máy chủ' }, 'cập nhật configuration');
            }
            throw error;
        }
    },

    getConfigDetail: async (id) => {
        const token = getToken();
        if (!token) throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại!');

        try {
            const response = await fetch(`${API_URL}/admin/config/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                method: 'GET',
            });

            if (!response.ok) {
                handleApiError({ status: response.status, message: response.statusText }, 'tải chi tiết configuration');
            }

            return await response.json();
        } catch (error) {
            if (error.message.includes('fetch')) {
                handleApiError({ message: 'Không thể kết nối đến máy chủ' }, 'tải chi tiết configuration');
            }
            throw error;
        }
    },

    createConfig: async (config) => {
        const token = getToken();
        if (!token) throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại!');

        try {
            const response = await fetch(`${API_URL}/admin/config`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify(config),
            });

            if (!response.ok) {
                if (response.status === 409) {
                    throw new Error('Key configuration này đã tồn tại!');
                }
                handleApiError({ status: response.status, message: response.statusText }, 'tạo configuration');
            }

            return await response.json();
        } catch (error) {
            if (error.message.includes('fetch')) {
                handleApiError({ message: 'Không thể kết nối đến máy chủ' }, 'tạo configuration');
            }
            throw error;
        }
    },

    deleteConfig: async (id) => {
        const token = getToken();
        if (!token) throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại!');

        try {
            const response = await fetch(`${API_URL}/admin/config/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                method: 'DELETE',
            });

            if (!response.ok) {
                if (response.status === 409) {
                    throw new Error('Không thể xóa configuration này vì đang được sử dụng!');
                }
                handleApiError({ status: response.status, message: response.statusText }, 'xóa configuration');
            }

            return await response.json();
        } catch (error) {
            if (error.message.includes('fetch')) {
                handleApiError({ message: 'Không thể kết nối đến máy chủ' }, 'xóa configuration');
            }
            throw error;
        }
    }
}