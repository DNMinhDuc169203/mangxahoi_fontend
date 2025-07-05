# Hướng dẫn Setup Hệ thống Thông báo

## ✅ Đã hoàn thành

Hệ thống thông báo đã được tích hợp thành công với các tính năng:

1. **API Integration**: Kết nối với backend API
2. **Context Provider**: Quản lý state toàn cục
3. **Real-time Updates**: Cập nhật tự động mỗi 30 giây
4. **Fallback Support**: Hoạt động ngay cả khi không có context
5. **Error Handling**: Xử lý lỗi gracefully

## 🚀 Cách sử dụng

### 1. Trong Sidebar (đã setup)
```jsx
// src/Components/SideBar/Sidebar.jsx
<NotificationPanel 
  onClose={onNotificationClose} 
  isOpen={isNotificationOpen} 
  userId={JSON.parse(localStorage.getItem('user') || '{}').id}
/>
```

### 2. Trong Header/Navbar
```jsx
import NotificationIcon from './Components/ThongBao/NotificationIcon';

function Header() {
  return (
    <header>
      <NotificationIcon />
    </header>
  );
}
```

### 3. Sử dụng Context trong component khác
```jsx
import { useNotificationContext } from './contexts/NotificationContext';

function SomeComponent() {
  const { unreadCount, addNotification } = useNotificationContext();
  
  return (
    <div>
      <p>Thông báo chưa đọc: {unreadCount}</p>
    </div>
  );
}
```

## 🔧 Cấu hình cần thiết

### 1. Environment Variables
Tạo file `.env` trong thư mục gốc:
```env
REACT_APP_API_URL=http://localhost:8080/api
```

### 2. Dependencies
Đảm bảo đã cài đặt:
```bash
npm install axios react-icons
```

### 3. User Authentication
Đảm bảo user đã đăng nhập và có token trong localStorage:
```javascript
// Token được lưu với key 'token'
localStorage.setItem('token', 'your-jwt-token');

// User info được lưu với key 'user'
localStorage.setItem('user', JSON.stringify({
  id: 1,
  email: 'user@example.com',
  hoTen: 'Nguyễn Văn A'
}));
```

## 📁 Cấu trúc Files

```
src/
├── contexts/
│   └── NotificationContext.js          # Context toàn cục
├── hooks/
│   ├── useNotifications.js             # Hook quản lý thông báo
│   └── useNotificationCount.js         # Hook đếm thông báo
├── services/
│   └── notificationService.js          # Service gọi API
└── Components/
    └── ThongBao/
        ├── NotificationIcon.jsx        # Icon với badge
        ├── NotificationPanel.jsx       # Panel hiển thị
        └── README.md                   # Hướng dẫn chi tiết
```

## 🐛 Troubleshooting

### Lỗi "useNotificationContext must be used within a NotificationProvider"

**Nguyên nhân**: Component đang sử dụng context mà không được wrap trong provider.

**Giải pháp**: 
1. Đảm bảo `App.js` đã được wrap với `NotificationProvider`
2. Hoặc sử dụng `NotificationPanel` với fallback (đã setup)

### Lỗi API không response

**Nguyên nhân**: Backend chưa chạy hoặc CORS issue.

**Giải pháp**:
1. Kiểm tra backend có đang chạy không
2. Kiểm tra URL API trong `.env`
3. Kiểm tra CORS configuration ở backend

### Thông báo không hiển thị

**Nguyên nhân**: User chưa đăng nhập hoặc token expired.

**Giải pháp**:
1. Kiểm tra user đã đăng nhập chưa
2. Kiểm tra token trong localStorage
3. Refresh token nếu cần

## 🔄 Cập nhật trong tương lai

1. **WebSocket**: Thay thế polling bằng WebSocket
2. **Push Notifications**: Thông báo đẩy
3. **Sound Alerts**: Âm thanh thông báo
4. **Mark All as Read**: Đánh dấu tất cả đã đọc
5. **Filter & Search**: Lọc và tìm kiếm thông báo

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Console browser để xem lỗi
2. Network tab để kiểm tra API calls
3. LocalStorage để kiểm tra user/token
4. Backend logs để kiểm tra server errors 