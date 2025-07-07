import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './NotificationModal.css';
import { AiOutlineHeart, AiOutlineComment, AiOutlineUserAdd, AiOutlineLike } from 'react-icons/ai';
import { BiTime } from 'react-icons/bi';
import { useNotificationContext } from '../../contexts/NotificationContext';
import axios from "axios";
import BaiDangChiTietModal from "../BinhLuan/BaiDangChiTietModal";

// Component cho trường hợp có context
const NotificationPanelWithContext = ({ isOpen, onClose, onShowPostModal }) => {
  const panelRef = useRef();
  const { 
    thisMonth, 
    earlier, 
    loading, 
    error, 
    markAsRead, 
    deleteNotification,
    setNotifications,
    fetchNotifications
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

  // Hàm xử lý khi click vào notification
  const handleNotificationClick = async (notification) => {
    const idBaiViet = notification.idBaiViet || notification.originalData?.idBaiViet || notification.originalData?.id;
    if (idBaiViet) {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          `http://localhost:8080/network/api/bai-viet/${idBaiViet}`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        );
        onShowPostModal && onShowPostModal(res.data);
      } catch (err) {
        alert("Không thể tải chi tiết bài viết!");
      }
    }
  };

  // Sắp xếp thông báo mới nhất lên đầu
  const sortedThisMonth = [...thisMonth].sort((a, b) => {
    const dateA = new Date(a.originalData?.ngayTao || a.ngayTao);
    const dateB = new Date(b.originalData?.ngayTao || b.ngayTao);
    return dateB - dateA;
  });
  const sortedEarlier = [...earlier].sort((a, b) => {
    const dateA = new Date(a.originalData?.ngayTao || a.ngayTao);
    const dateB = new Date(b.originalData?.ngayTao || b.ngayTao);
    return dateB - dateA;
  });

  return createPortal(
    <div className="notification-panel" ref={panelRef}>
      <h2 className="text-2xl font-bold px-6 pt-6 pb-2">Notifications</h2>
      <div className="divide-y divide-gray-200">
        {sortedThisMonth.length > 0 && (
          <div className="mb-2">
            <div className="font-semibold text-gray-700 px-6 py-2">Hôm Nay</div>
            {sortedThisMonth.map(n => (
              <NotificationItem 
                key={n.id} 
                notification={n} 
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                onNotificationClick={handleNotificationClick}
                setNotifications={setNotifications}
                fetchNotifications={fetchNotifications}
              />
            ))}
          </div>
        )}
        {sortedEarlier.length > 0 && (
          <div>
            <div className="font-semibold text-gray-700 px-6 py-2">Trước đó</div>
            {sortedEarlier.map(n => (
              <NotificationItem 
                key={n.id} 
                notification={n} 
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                onNotificationClick={handleNotificationClick}
                setNotifications={setNotifications}
                fetchNotifications={fetchNotifications}
              />
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

function NotificationItem({ notification, onMarkAsRead, onDelete, onNotificationClick, setNotifications, fetchNotifications }) {
  const handleClick = () => {
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleAcceptFriend = async (e) => {
    e.stopPropagation();
    const idKetBan = notification.idKetBan || notification.originalData?.idKetBan;
    if (!idKetBan) {
      alert("Không tìm thấy id lời mời kết bạn!");
      return;
    }
    try {
      await axios.post(
        `http://localhost:8080/network/api/ket-ban/chap-nhan/${idKetBan}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      alert("Đã chấp nhận lời mời kết bạn!");
      // Cập nhật lại UI:
      if (typeof setNotifications === "function") {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id
              ? { ...n, isFollowing: true }
              : n
          )
        );
      } else if (typeof fetchNotifications === "function") {
        fetchNotifications();
      }
    } catch (err) {
      alert("Chấp nhận lời mời kết bạn thất bại!");
      console.error(err);
    }
    console.log('Chấp nhận lời mời kết bạn từ:', notification.originalData?.idNguoiGui, notification.originalData?.tenNguoiGui);
  };

  return (
    <div 
      className={`flex items-center px-6 py-3 hover:bg-gray-50 transition cursor-pointer ${!notification.daDoc ? 'bg-blue-50' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        handleClick();
        if (onNotificationClick) {
          onNotificationClick(notification);
        }
      }}
    >
      {/* Avatar hoặc nhóm avatar */}
      <div className="flex-shrink-0 flex -space-x-2">
        {notification.users ? (
          notification.users.slice(0, 2).map((u, idx) => (
            <img
              key={u.name}
              src={u.anhDaiDienNguoiGui}
              alt={u.name}
              className="w-9 h-9 rounded-full border-2 border-white z-10"
              style={{ marginLeft: idx === 0 ? 0 : -12 }}
            />
          ))
        ) : (
          <img
            src={notification.anhDaiDienNguoiGui || "./anhbandau.jpg"}
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
        {/* Hiển thị trích đoạn nội dung bài viết nếu có */}
        {notification.originalData?.noiDungBaiViet && (
          <div className="text-xs text-gray-600 mt-1 italic truncate">
            Bài viết: {notification.originalData.noiDungBaiViet.slice(0, 40)}...
          </div>
        )}
      </div>
      {/* Nút follow nếu là thông báo friend request */}
      {notification.type === 'friend_request' && !notification.isFollowing && (
        <button
          onClick={handleAcceptFriend}
          className={`ml-2 px-3 py-1 rounded font-semibold text-sm transition focus:outline-none bg-blue-500 text-white hover:bg-blue-600`}
        >
          Chấp nhận
        </button>
      )}
      {notification.type === 'friend_request' && notification.isFollowing && (
        <span className="ml-2 px-3 py-1 rounded font-semibold text-sm bg-gray-100 text-gray-700">Đã chấp nhận</span>
      )}
    </div>
  );
}

// Component chính với fallback
const NotificationPanel = ({ isOpen, onClose, userId, onShowPostModal }) => {
  // Thử render với context, nếu lỗi thì render empty
  try {
    return <NotificationPanelWithContext isOpen={isOpen} onClose={onClose} onShowPostModal={onShowPostModal} />;
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