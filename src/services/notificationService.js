import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/network/api';

// Tạo instance axios với interceptor để tự động thêm token
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động thêm token vào header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const notificationService = {
  // Lấy danh sách thông báo của người dùng
  getNotifications: async (userId) => {
    try {
      const response = await apiClient.get(`/thong-bao/nguoi-dung/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy thông báo:', error);
      throw error;
    }
  },

  // Gửi thông báo (cho admin hoặc hệ thống)
  sendNotification: async (notificationData) => {
    try {
      const response = await apiClient.post('/thong-bao/gui', notificationData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gửi thông báo:', error);
      throw error;
    }
  },

  // Đánh dấu thông báo đã đọc (nếu có API này)
  markAsRead: async (notificationId) => {
    try {
      const response = await apiClient.put(`/thong-bao/da-doc/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
      throw error;
    }
  },

  // Xóa thông báo (nếu có API này)
  deleteNotification: async (notificationId) => {
    try {
      const response = await apiClient.delete(`/thong-bao/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi xóa thông báo:', error);
      throw error;
    }
  }
};

export default notificationService; 