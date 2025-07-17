# API Thông Báo - Frontend Integration Guide

## 🔗 Base URL
```
http://localhost:8080/api/thong-bao
```

## 📋 Danh Sách API

### 1. Lấy Thông Báo Của Người Dùng
```http
GET /api/thong-bao/nguoi-dung/{idNguoiDung}
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 1,
    "loai": "tuong_tac",
    "tieuDe": "Bài viết của bạn vừa được thích!",
    "noiDung": "Người dùng nhí vừa thích bài viết của bạn.",
    "daDoc": false,
    "mucDoUuTien": "trung_binh",
    "ngayTao": "2025-07-05T23:11:51",
    "nguoiNhanId": 9,
    "nguoiNhanTen": "Thuận",
    "idBaiViet": 31,
    "idBinhLuan": null,
    "loaiTuongTac": "thich_bai_viet",
    "noiDungTuongTac": "Đã thích bài viết của bạn",
    "idNguoiGui": 8,
    "tenNguoiGui": "nhí",
    "idKetBan": null,
    "loaiKetBan": null,
    "idTinNhan": null,
    "idCuocTroChuyen": null,
    "loaiHeThong": null,
    "urlHanhDong": null
  },
  {
    "id": 19,
    "loai": "moi_ket_ban",
    "tieuDe": "Bạn có lời mời kết bạn mới!",
    "noiDung": "Người dùng Thuận vừa gửi lời mời kết bạn cho bạn.",
    "daDoc": false,
    "mucDoUuTien": "cao",
    "ngayTao": "2025-07-05T20:46:47",
    "nguoiNhanId": 8,
    "nguoiNhanTen": "nhí",
    "idBaiViet": null,
    "idBinhLuan": null,
    "loaiTuongTac": null,
    "noiDungTuongTac": null,
    "idNguoiGui": 9,
    "tenNguoiGui": "Thuận",
    "idKetBan": 7,
    "loaiKetBan": "moi_ket_ban",
    "idTinNhan": null,
    "idCuocTroChuyen": null,
    "loaiHeThong": null,
    "urlHanhDong": null
  }
]
```

### 2. Đánh Dấu Thông Báo Đã Đọc
```http
PUT /api/thong-bao/da-doc/{idThongBao}
Authorization: Bearer {token}
```

**Response:**
```json
"Đã đánh dấu thông báo đã đọc"
```

### 3. Đánh Dấu Tất Cả Thông Báo Đã Đọc
```http
PUT /api/thong-bao/da-doc-tat-ca/{idNguoiDung}
Authorization: Bearer {token}
```

**Response:**
```json
"Đã đánh dấu tất cả thông báo đã đọc"
```

### 4. Đếm Số Thông Báo Chưa Đọc
```http
GET /api/thong-bao/dem-chua-doc/{idNguoiDung}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "soThongBaoChuaDoc": 5
}
```

### 5. Gửi Thông Báo Tùy Chỉnh
```http
POST /api/thong-bao/gui
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "idNguoiNhan": 1,
  "loai": "tuong_tac",
  "tieuDe": "Tiêu đề thông báo",
  "noiDung": "Nội dung thông báo",
  "idBaiViet": 1,
  "idBinhLuan": null,
  "idKetBan": null,
  "idTinNhan": null,
  "idCuocTroChuyen": null,
  "loaiTuongTac": "thich_bai_viet",
  "loaiKetBan": null,
  "loaiHeThong": null,
  "urlHanhDong": null,
  "noiDungTuongTac": "Đã thích bài viết của bạn",
  "mucDoUuTien": "trung_binh"
}
```

**Response:**
```json
"Đã gửi thông báo thành công"
```

## 🎯 Các Loại Thông Báo

### 1. Tương Tác (`tuong_tac`)
- **thich_bai_viet**: Thích bài viết
- **thich_binh_luan**: Thích bình luận
- **binh_luan**: Bình luận bài viết
- **tra_loi_binh_luan**: Trả lời bình luận

### 2. Kết Bạn (`moi_ket_ban`, `chap_nhan_ban`)
- **moi_ket_ban**: Lời mời kết bạn
- **chap_nhan_ban**: Chấp nhận kết bạn

### 3. Tin Nhắn (`nhan_tin`)
- Thông báo tin nhắn mới

### 4. Hệ Thống (`he_thong`)
- Thông báo từ hệ thống

## 💻 Frontend Integration Examples

### React Hook để quản lý thông báo
```javascript
import { useState, useEffect } from 'react';

const useNotifications = (userId, token) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Lấy thông báo
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/thong-bao/nguoi-dung/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông báo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Đếm thông báo chưa đọc
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/thong-bao/dem-chua-doc/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.soThongBaoChuaDoc);
      }
    } catch (error) {
      console.error('Lỗi khi đếm thông báo:', error);
    }
  };

  // Đánh dấu đã đọc
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/thong-bao/da-doc/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        // Cập nhật lại danh sách và số lượng
        await fetchNotifications();
        await fetchUnreadCount();
      }
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
    }
  };

  // Đánh dấu tất cả đã đọc
  const markAllAsRead = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/thong-bao/da-doc-tat-ca/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        await fetchNotifications();
        await fetchUnreadCount();
      }
    } catch (error) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [userId, token]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
};

export default useNotifications;
```

### Component hiển thị thông báo
```jsx
import React from 'react';
import useNotifications from './useNotifications';

const NotificationPanel = ({ userId, token }) => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications(userId, token);

  const renderNotificationContent = (notification) => {
    switch (notification.loai) {
      case 'tuong_tac':
        return (
          <div className="notification-item">
            <div className="notification-header">
              <span className="user-name">{notification.tenNguoiGui}</span>
              <span className="action">{notification.noiDungTuongTac}</span>
            </div>
            {notification.idBaiViet && (
              <div className="notification-link">
                <a href={`/bai-viet/${notification.idBaiViet}`}>
                  Xem bài viết
                </a>
              </div>
            )}
            {notification.idBinhLuan && (
              <div className="notification-link">
                <a href={`/binh-luan/${notification.idBinhLuan}`}>
                  Xem bình luận
                </a>
              </div>
            )}
          </div>
        );

      case 'moi_ket_ban':
        return (
          <div className="notification-item">
            <div className="notification-header">
              <span className="user-name">{notification.tenNguoiGui}</span>
              <span className="action">gửi lời mời kết bạn</span>
            </div>
            <div className="notification-actions">
              <button className="btn-accept">Chấp nhận</button>
              <button className="btn-decline">Từ chối</button>
            </div>
          </div>
        );

      case 'nhan_tin':
        return (
          <div className="notification-item">
            <div className="notification-header">
              <span className="user-name">{notification.tenNguoiGui}</span>
              <span className="action">gửi tin nhắn cho bạn</span>
            </div>
            <div className="notification-link">
              <a href={`/tin-nhan/${notification.idCuocTroChuyen}`}>
                Xem tin nhắn
              </a>
            </div>
          </div>
        );

      default:
        return (
          <div className="notification-item">
            <div className="notification-content">
              {notification.noiDung}
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return <div>Đang tải thông báo...</div>;
  }

  return (
    <div className="notification-panel">
      <div className="notification-header">
        <h3>Thông báo ({unreadCount} chưa đọc)</h3>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn-mark-all-read">
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">Không có thông báo nào</div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.daDoc ? 'unread' : ''}`}
              onClick={() => markAsRead(notification.id)}
            >
              {renderNotificationContent(notification)}
              <div className="notification-time">
                {new Date(notification.ngayTao).toLocaleString('vi-VN')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
```

### Component Badge thông báo
```jsx
import React from 'react';

const NotificationBadge = ({ userId, token }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/thong-bao/dem-chua-doc/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.soThongBaoChuaDoc);
        }
      } catch (error) {
        console.error('Lỗi khi đếm thông báo:', error);
      }
    };

    fetchUnreadCount();
    // Cập nhật mỗi 30 giây
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [userId, token]);

  return (
    <div className="notification-badge">
      <i className="fas fa-bell"></i>
      {unreadCount > 0 && (
        <span className="badge">{unreadCount}</span>
      )}
    </div>
  );
};

export default NotificationBadge;
```

## 🎨 CSS Styles
```css
.notification-panel {
  width: 400px;
  max-height: 500px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.notification-header {
  padding: 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  padding: 15px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item.unread {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.notification-item.unread:hover {
  background-color: #bbdefb;
}

.user-name {
  font-weight: bold;
  color: #2196f3;
}

.action {
  color: #666;
}

.notification-link a {
  color: #2196f3;
  text-decoration: none;
  font-size: 14px;
}

.notification-link a:hover {
  text-decoration: underline;
}

.notification-time {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.notification-badge {
  position: relative;
  cursor: pointer;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f44336;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.btn-mark-all-read {
  background: #2196f3;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-mark-all-read:hover {
  background: #1976d2;
}

.no-notifications {
  padding: 20px;
  text-align: center;
  color: #666;
}
```

## 🚀 Cách Sử Dụng

1. **Cài đặt hook**:
```javascript
const { notifications, unreadCount, markAsRead } = useNotifications(userId, token);
```

2. **Hiển thị badge**:
```jsx
<NotificationBadge userId={userId} token={token} />
```

3. **Hiển thị panel**:
```jsx
<NotificationPanel userId={userId} token={token} />
```

4. **Tự động cập nhật**:
- Hook sẽ tự động fetch dữ liệu khi component mount
- Badge sẽ tự động cập nhật mỗi 30 giây
- Khi click vào thông báo, sẽ tự động đánh dấu đã đọc

## 📱 Responsive Design
```css
@media (max-width: 768px) {
  .notification-panel {
    width: 100%;
    max-height: 70vh;
  }
  
  .notification-item {
    padding: 12px;
  }
}
```

Với setup này, frontend sẽ có một hệ thống thông báo hoàn chỉnh với:
- ✅ Hiển thị thông tin chi tiết
- ✅ Badge số thông báo chưa đọc
- ✅ Đánh dấu đã đọc
- ✅ Link điều hướng đến nội dung liên quan
- ✅ Responsive design
- ✅ Auto-refresh 