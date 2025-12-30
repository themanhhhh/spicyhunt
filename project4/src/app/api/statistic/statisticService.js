// Local backend API URL
const API_URL = 'https://spicyhunt-yqoi.onrender.com/api';

// Helper function để lấy accessToken từ cookie
const getToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

export const statisticService = {
    getRevenue: async (startDate, endDate) => {
        const token = getToken();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}/statistic?startDate=${startDate}&endDate=${endDate}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        return response.json();
    },

    // Hàm download file export - trả về blob để download
    getRevenueExport: async (startDate, endDate) => {
        const token = getToken();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}/statistic/report?startDate=${startDate}&endDate=${endDate}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
                // Không set Content-Type để server tự định dạng
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Lấy blob để download file
        const blob = await response.blob();

        // Lấy tên file từ Content-Disposition header (nếu có)
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `revenue_export_${startDate}_${endDate}.xlsx`; // Default filename

        if (contentDisposition) {
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
            if (matches && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
            }
        }

        return {
            blob,
            filename,
            type: response.headers.get('Content-Type') || 'application/octet-stream'
        };
    },

    // Helper function để trigger download
    downloadRevenueExport: async (startDate, endDate) => {
        try {
            const { blob, filename } = await statisticService.getRevenueExport(startDate, endDate);

            // Tạo URL cho blob
            const url = window.URL.createObjectURL(blob);

            // Tạo link download
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';

            // Thêm vào DOM và click để download
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            return { success: true, filename };
        } catch (error) {
            console.error('Error downloading revenue export:', error);
            throw error;
        }
    }
};