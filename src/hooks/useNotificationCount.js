import { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';

export const useNotificationCount = (userId) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const notifications = await notificationService.getNotifications(userId);
      // Đếm số thông báo chưa đọc (giả sử có trường daDoc)
      const unread = notifications.filter(notif => !notif.daDoc).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Lỗi khi lấy số thông báo chưa đọc:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Không còn polling 30 giây nữa, chỉ fetch khi mount hoặc userId đổi
    return () => {};
  }, [userId]);

  const markAsRead = (notificationId) => {
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const addNewNotification = () => {
    setUnreadCount(prev => prev + 1);
  };

  return {
    unreadCount,
    loading,
    markAsRead,
    addNewNotification,
    refreshCount: fetchUnreadCount
  };
}; 