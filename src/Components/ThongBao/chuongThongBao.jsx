import React from 'react';
import { AiOutlineBell } from 'react-icons/ai';
import { useNotificationContext } from '../../contexts/thongBaoDongBo';
import NotificationPanel from './hienThiThongBao';

const NotificationIcon = () => {
  const { 
    isPanelOpen, 
    unreadCount, 
    togglePanel, 
    closePanel 
  } = useNotificationContext();

  return (
    <div className="relative">
      {/* Icon thông báo */}
      <button
        onClick={togglePanel}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
        aria-label="Thông báo"
      >
        <AiOutlineBell size={24} />
        
        {/* Badge hiển thị số thông báo chưa đọc */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel thông báo */}
      <NotificationPanel
        isOpen={isPanelOpen}
        onClose={closePanel}
        userId={JSON.parse(localStorage.getItem('user') || '{}').id}
      />
    </div>
  );
};

export default NotificationIcon; 