import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './NotificationModal.css';
import { AiOutlineHeart, AiOutlineComment, AiOutlineUserAdd, AiOutlineLike } from 'react-icons/ai';
import { BiTime } from 'react-icons/bi';

const mockNotifications = [
  // This month
  {
    id: 1,
    type: 'like_post',
    message: 'dnganhkiet và miaa_dth đã thích bài viết của bạn.',
    time: '07 thg 6',
    avatar: 'https://via.placeholder.com/40',
    group: 'this_month',
    users: [
      { name: 'dnganhkiet', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { name: 'miaa_dth', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' }
    ]
  },
  {
    id: 2,
    type: 'friend_request',
    message: 'audingmef.3 đã gửi lời mời kết bạn.',
    time: '06 thg 6',
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
    group: 'this_month',
    isFollowing: false
  },
  {
    id: 3,
    type: 'comment_post',
    message: 'mr.tulee đã bình luận bài viết của bạn: "Bài viết rất hay! 👍"',
    time: '05 thg 6',
    avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
    group: 'this_month'
  },
  {
    id: 4,
    type: 'like_comment',
    message: 'hang_02_ và oandag.07 đã thích bình luận của bạn.',
    time: '04 thg 6',
    avatar: '',
    group: 'this_month',
    users: [
      { name: 'hang_02_', avatar: 'https://randomuser.me/api/portraits/women/66.jpg' },
      { name: 'oandag.07', avatar: 'https://randomuser.me/api/portraits/men/34.jpg' }
    ]
  },
  {
    id: 5,
    type: 'reply_comment',
    message: 'ba_koi_hihi đã trả lời bình luận của bạn: "Tôi cũng nghĩ vậy!"',
    time: '03 thg 6',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    group: 'this_month'
  },
  // Earlier
  {
    id: 6,
    type: 'friend_request',
    message: 'cardlordepzai đã gửi lời mời kết bạn.',
    time: '02 thg 6',
    avatar: 'https://randomuser.me/api/portraits/men/35.jpg',
    group: 'earlier',
    isFollowing: false
  },
  {
    id: 7,
    type: 'like_post',
    message: 'miaa_dth đã thích bài viết của bạn.',
    time: '01 thg 6',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    group: 'earlier'
  },
  {
    id: 8,
    type: 'comment_post',
    message: 'dnganhkiet đã bình luận bài viết của bạn: "Cảm ơn bạn đã chia sẻ!"',
    time: '31 thg 5',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    group: 'earlier'
  },
  {
    id: 9,
    type: 'like_comment',
    message: 'audingmef.3 đã thích bình luận của bạn.',
    time: '30 thg 5',
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
    group: 'earlier'
  },
  {
    id: 10,
    type: 'friend_request',
    message: 'hang_02_ đã gửi lời mời kết bạn.',
    time: '29 thg 5',
    avatar: 'https://randomuser.me/api/portraits/women/66.jpg',
    group: 'earlier',
    isFollowing: false
  },
  {
    id: 11,
    type: 'reply_comment',
    message: 'mr.tulee đã trả lời bình luận của bạn: "Tôi hoàn toàn đồng ý!"',
    time: '28 thg 5',
    avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
    group: 'earlier'
  },
  {
    id: 12,
    type: 'like_post',
    message: 'hang_02_, miaa_dth và oandag.07 đã thích bài viết của bạn.',
    time: '27 thg 5',
    avatar: '',
    group: 'earlier',
    users: [
      { name: 'hang_02_', avatar: 'https://randomuser.me/api/portraits/women/66.jpg' },
      { name: 'miaa_dth', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
      { name: 'oandag.07', avatar: 'https://randomuser.me/api/portraits/men/34.jpg' }
    ]
  },
  {
    id: 13,
    type: 'comment_post',
    message: 'ba_koi_hihi đã bình luận bài viết của bạn: "Thật tuyệt vời! 😊"',
    time: '26 thg 5',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    group: 'earlier'
  },
  {
    id: 14,
    type: 'like_comment',
    message: 'dnganhkiet và cardlordepzai đã thích bình luận của bạn.',
    time: '25 thg 5',
    avatar: '',
    group: 'earlier',
    users: [
      { name: 'dnganhkiet', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { name: 'cardlordepzai', avatar: 'https://randomuser.me/api/portraits/men/35.jpg' }
    ]
  },
  {
    id: 15,
    type: 'reply_comment',
    message: 'audingmef.3 đã trả lời bình luận của bạn: "Tôi cũng có cùng suy nghĩ!"',
    time: '24 thg 5',
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
    group: 'earlier'
  }
];

const NotificationPanel = ({ isOpen, onClose }) => {
  const panelRef = useRef();
  const [notifications] = useState(mockNotifications);

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

  // Nhóm thông báo
  const thisMonth = notifications.filter(n => n.group === 'this_month');
  const earlier = notifications.filter(n => n.group === 'earlier');

  return createPortal(
    <div className="notification-panel" ref={panelRef}>
      <h2 className="text-2xl font-bold px-6 pt-6 pb-2">Notifications</h2>
      <div className="divide-y divide-gray-200">
        {thisMonth.length > 0 && (
          <div className="mb-2">
            <div className="font-semibold text-gray-700 px-6 py-2">This month</div>
            {thisMonth.map(n => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </div>
        )}
        {earlier.length > 0 && (
          <div>
            <div className="font-semibold text-gray-700 px-6 py-2">Earlier</div>
            {earlier.map(n => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

function NotificationItem({ notification }) {
  return (
    <div className="flex items-center px-6 py-3 hover:bg-gray-50 transition cursor-pointer">
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
          className={`ml-2 px-3 py-1 rounded font-semibold text-sm transition focus:outline-none ${notification.isFollowing ? 'bg-gray-100 text-gray-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          {notification.isFollowing ? 'Đã chấp nhận' : 'Chấp nhận'}
        </button>
      )}
    </div>
  );
}

export default NotificationPanel; 