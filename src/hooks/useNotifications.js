import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function formatTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
  
    if (diffDay >= 1) {
      return `${diffDay} ngày trước`;
    } else if (diffHour >= 1) {
      return `${diffHour} giờ trước`;
    } else if (diffMin >= 1) {
      return `${diffMin} phút trước`;
    } else {
      return `Vừa xong`;
    }
  }

  // Chuyển đổi thông báo từ API sang format hiển thị
  const transformNotification = (apiNotification) => {
    const now = new Date();
    const notificationDate = new Date(apiNotification.ngayTao);
    const diffInDays = Math.floor((now - notificationDate) / (1000 * 60 * 60 * 24));
    
    // Xác định nhóm thời gian
    let group = 'earlier';
    if (diffInDays < 1) {
      group = 'this_month';
    }

    // Xác định loại thông báo và format message
    let type = 'system';
    let message = apiNotification.noiDung;
    let avatar = null;
    let users = null;
    let isFollowing = false;

    switch (apiNotification.loai) {
      case 'tuong_tac':
        if (apiNotification.noiDung.includes('thích bài viết')) {
          type = 'like_post';
        } else if (apiNotification.noiDung.includes('bình luận')) {
          type = 'comment_post';
        } else if (apiNotification.noiDung.includes('thích bình luận')) {
          type = 'like_comment';
        } else if (apiNotification.noiDung.includes('trả lời bình luận')) {
          type = 'reply_comment';
        }
        break;
      case 'moi_ket_ban':
        type = 'friend_request';
        isFollowing = false;
        break;
      case 'chap_nhan_ban':
        type = 'friend_request';
        isFollowing = true;
        break;
      default:
        type = 'system';
    }

    // Format thời gian
    let timeDisplay = formatTimeAgo(apiNotification.ngayTao);

    return {
      id: apiNotification.id,
      type,
      message,
      time: timeDisplay,
      anhDaiDienNguoiGui: apiNotification.anhDaiDienNguoiGui,
      group,
      users,
      isFollowing,
      originalData: apiNotification
    };
  };

  // Lấy thông báo từ API
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const apiNotifications = await notificationService.getNotifications(userId);
      const transformedNotifications = apiNotifications.map(transformNotification);
      setNotifications(transformedNotifications);
    } catch (err) {
      setError(err.message);
      console.error('Lỗi khi lấy thông báo:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Đánh dấu thông báo đã đọc
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Cập nhật state nếu cần
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, daDoc: true }
            : notif
        )
      );
    } catch (err) {
      console.error('Lỗi khi đánh dấu đã đọc:', err);
    }
  }, []);

  // Xóa thông báo
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (err) {
      console.error('Lỗi khi xóa thông báo:', err);
    }
  }, []);

  // Thêm thông báo mới (cho real-time)
  const addNotification = useCallback((newNotification) => {
    const transformed = transformNotification(newNotification);
    setNotifications(prev => [transformed, ...prev]);
  }, []);

  // Load thông báo khi component mount hoặc userId thay đổi
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Nhóm thông báo theo thời gian
  const thisMonth = notifications.filter(n => n.group === 'this_month');
  const earlier = notifications.filter(n => n.group === 'earlier');

  return {
    notifications,
    thisMonth,
    earlier,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    addNotification,
    setNotifications 
  };
}; 