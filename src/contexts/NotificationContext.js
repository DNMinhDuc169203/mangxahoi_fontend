import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useNotificationCount } from '../hooks/useNotificationCount';

const NotificationContext = createContext();

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children, userId }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // Sử dụng các hooks
  const notificationData = useNotifications(userId);
  const countData = useNotificationCount(userId);

  // Kết hợp dữ liệu từ cả hai hooks
  const contextValue = {
    // Panel state
    isPanelOpen,
    setIsPanelOpen,
    
    // Notification data
    notifications: notificationData.notifications,
    thisMonth: notificationData.thisMonth,
    earlier: notificationData.earlier,
    loading: notificationData.loading,
    error: notificationData.error,
    
    // Count data
    unreadCount: countData.unreadCount,
    countLoading: countData.loading,
    
    // Actions
    markAsRead: (id) => {
      notificationData.markAsRead(id);
      countData.markAsRead(id);
    },
    deleteNotification: notificationData.deleteNotification,
    addNotification: (notification) => {
      notificationData.addNotification(notification);
      countData.addNewNotification();
    },
    refreshNotifications: notificationData.fetchNotifications,
    refreshCount: countData.refreshCount,
    
    // Panel actions
    openPanel: () => setIsPanelOpen(true),
    closePanel: () => setIsPanelOpen(false),
    togglePanel: () => setIsPanelOpen(!isPanelOpen)
  };

  // Real-time updates (có thể sử dụng WebSocket sau này)
  useEffect(() => {
    if (!userId) return;

    // Polling để cập nhật thông báo mới
    const interval = setInterval(() => {
      notificationData.fetchNotifications();
      countData.refreshCount();
    }, 30000); // 30 giây

    return () => clearInterval(interval);
  }, [userId, notificationData.fetchNotifications, countData.refreshCount]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}; 