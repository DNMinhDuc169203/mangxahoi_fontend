# Hệ thống Thông báo (Notification System)

## Tổng quan

Hệ thống thông báo được tích hợp với API backend để hiển thị thông báo real-time cho người dùng. Hệ thống bao gồm:

- **NotificationService**: Gọi API thông báo
- **useNotifications Hook**: Quản lý state thông báo
- **useNotificationCount Hook**: Đếm số thông báo chưa đọc
- **NotificationContext**: Context toàn cục cho thông báo
- **NotificationIcon**: Icon hiển thị với badge số đếm
- **NotificationPanel**: Panel hiển thị danh sách thông báo

## Cách sử dụng

### 1. Wrap ứng dụng với NotificationProvider

```jsx
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  const userId = getCurrentUserId(); // Lấy ID người dùng hiện tại
  
  return (
    <NotificationProvider userId={userId}>
      {/* Các component con */}
    </NotificationProvider>
  );
}
```

### 2. Sử dụng NotificationIcon trong header/navbar

```jsx
import NotificationIcon from './Components/ThongBao/NotificationIcon';

function Header() {
  return (
    <header>
      <div className="flex items-center">
        <NotificationIcon />
        {/* Các component khác */}
      </div>
    </header>
  );
}
```

### 3. Sử dụng context trong component khác

```jsx
import { useNotificationContext } from './contexts/NotificationContext';

function SomeComponent() {
  const { 
    unreadCount, 
    addNotification, 
    markAsRead 
  } = useNotificationContext();

  const handleSomeAction = () => {
    // Thêm thông báo mới
    addNotification({
      id: Date.now(),
      loai: 'tuong_tac',
      noiDung: 'Có thông báo mới!',
      ngayTao: new Date().toISOString()
    });
  };

  return (
    <div>
      <p>Số thông báo chưa đọc: {unreadCount}</p>
      <button onClick={handleSomeAction}>Tạo thông báo</button>
    </div>
  );
}
```

## Cấu trúc API

### Endpoints

- `GET /api/thong-bao/nguoi-dung/{userId}` - Lấy thông báo của người dùng
- `POST /api/thong-bao/gui` - Gửi thông báo (admin)
- `PUT /api/thong-bao/{id}/doc` - Đánh dấu đã đọc
- `DELETE /api/thong-bao/{id}` - Xóa thông báo

### Loại thông báo

- `tuong_tac` - Tương tác (like, comment, reply)
- `moi_ket_ban` - Lời mời kết bạn
- `chap_nhan_ban` - Chấp nhận kết bạn
- `he_thong` - Thông báo hệ thống

## Tính năng

### ✅ Đã hoàn thành

1. **Tích hợp API**: Gọi API backend để lấy thông báo
2. **Real-time updates**: Polling mỗi 30 giây để cập nhật
3. **Phân loại thời gian**: "This month" và "Earlier"
4. **Đánh dấu đã đọc**: Click vào thông báo để đánh dấu
5. **Badge số đếm**: Hiển thị số thông báo chưa đọc
6. **Xử lý lỗi**: Loading states và error handling
7. **Responsive**: Panel thông báo responsive

### 🔄 Cần cải thiện

1. **WebSocket**: Thay thế polling bằng WebSocket cho real-time tốt hơn
2. **Push notifications**: Thông báo đẩy khi có thông báo mới
3. **Sound alerts**: Âm thanh thông báo
4. **Mark all as read**: Đánh dấu tất cả đã đọc
5. **Filter notifications**: Lọc theo loại thông báo
6. **Pagination**: Phân trang cho thông báo cũ

## Cấu hình

### Environment Variables

```env
REACT_APP_API_URL=http://localhost:8080/api
```

### Dependencies

```json
{
  "axios": "^1.6.0",
  "react-icons": "^4.12.0"
}
```

## Troubleshooting

### Lỗi thường gặp

1. **CORS Error**: Kiểm tra cấu hình CORS ở backend
2. **Token expired**: Kiểm tra token trong localStorage
3. **API không response**: Kiểm tra URL API và network
4. **Thông báo không hiển thị**: Kiểm tra format dữ liệu từ API

### Debug

```jsx
// Thêm vào component để debug
const { notifications, loading, error } = useNotificationContext();
console.log('Notifications:', notifications);
console.log('Loading:', loading);
console.log('Error:', error);
``` 