import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './NotificationModal.css';
import { AiOutlineHeart, AiOutlineComment, AiOutlineUserAdd, AiOutlineLike } from 'react-icons/ai';
import { BiTime } from 'react-icons/bi';
import { useNotificationContext } from '../../contexts/NotificationContext';

// Component cho trường hợp có context
const NotificationPanelWithContext = ({ isOpen, onClose }) => {
  const panelRef = useRef();
  const { 
    thisMonth, 
    earlier, 
    loading, 
    error, 
    markAsRead, 
    deleteNotification
  } = useNotificationContext();

  // Đóng panel khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Xử lý loading và error
  if (loading) {
    return createPortal(
      <div className="notification-panel" ref={panelRef}>
        <h2 className="text-2xl font-bold px-6 pt-6 pb-2">Notifications</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Đang tải thông báo...</div>
        </div>
      </div>,
      document.body
    );
  }

  if (error) {
    return createPortal(
      <div className="notification-panel" ref={panelRef}>
        <h2 className="text-2xl font-bold px-6 pt-6 pb-2">Notifications</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-red-500">Lỗi: {error}</div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="notification-panel" ref={panelRef}>
      <h2 className="text-2xl font-bold px-6 pt-6 pb-2">Notifications</h2>
      <div className="divide-y divide-gray-200">
        {thisMonth.length > 0 && (
          <div className="mb-2">
            <div className="font-semibold text-gray-700 px-6 py-2">This month</div>
            {thisMonth.map(n => (
              <NotificationItem 
                key={n.id} 
                notification={n} 
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
          </div>
        )}
        {earlier.length > 0 && (
          <div>
            <div className="font-semibold text-gray-700 px-6 py-2">Earlier</div>
            {earlier.map(n => (
              <NotificationItem 
                key={n.id} 
                notification={n} 
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

function NotificationItem({ notification, onMarkAsRead, onDelete }) {
  const handleClick = () => {
    // Đánh dấu đã đọc khi click vào thông báo
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleAcceptFriend = (e) => {
    e.stopPropagation();
    // Xử lý chấp nhận lời mời kết bạn
    console.log('Chấp nhận lời mời kết bạn từ:', notification.originalData?.nguoiGui?.id);
  };

  return (
    <div 
      className={`flex items-center px-6 py-3 hover:bg-gray-50 transition cursor-pointer ${!notification.daDoc ? 'bg-blue-50' : ''}`}
      onClick={handleClick}
    >
      {/* Avatar hoặc nhóm avatar */}
      <div className="flex-shrink-0 flex -space-x-2">
        {notification.users ? (
          notification.users.slice(0, 2).map((u, idx) => (
            <img
              key={u.name}
              src={u.avatar}
              alt={u.name}
              className="w-9 h-9 rounded-full border-2 border-white z-10"
              style={{ marginLeft: idx === 0 ? 0 : -12 }}
            />
          ))
        ) : (
          <img
            src={notification.avatar || 'https://via.placeholder.com/40'}
            alt="avatar"
            className="w-9 h-9 rounded-full border-2 border-white"
          />
        )}
      </div>
      {/* Nội dung */}
      <div className="ml-4 flex-1 min-w-0">
        <div className="text-sm text-gray-900">
          {notification.message}
        </div>
        <div className="flex items-center mt-1 text-xs text-gray-500">
          <BiTime className="mr-1" />
          {notification.time}
        </div>
      </div>
      {/* Nút follow nếu là thông báo friend request */}
      {notification.type === 'friend_request' && (
        <button
          onClick={handleAcceptFriend}
          className={`ml-2 px-3 py-1 rounded font-semibold text-sm transition focus:outline-none ${notification.isFollowing ? 'bg-gray-100 text-gray-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          {notification.isFollowing ? 'Đã chấp nhận' : 'Chấp nhận'}
        </button>
      )}
    </div>
  );
}

// Component chính với fallback
const NotificationPanel = ({ isOpen, onClose, userId }) => {
  // Thử render với context, nếu lỗi thì render empty
  try {
    return <NotificationPanelWithContext isOpen={isOpen} onClose={onClose} />;
  } catch (error) {
    // Fallback: render panel rỗng
    if (!isOpen) return null;
    
    return createPortal(
      <div className="notification-panel">
        <h2 className="text-2xl font-bold px-6 pt-6 pb-2">Notifications</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Vui lòng đăng nhập để xem thông báo</div>
        </div>
      </div>,
      document.body
    );
  }
};

export default NotificationPanel; 