# Hướng dẫn sử dụng các tính năng Modal mới

## Tổng quan
Đã tích hợp đầy đủ các chức năng cho modal tuỳ chọn bài viết (3 chấm) với giao diện đẹp và API thực sự.

## Các Modal đã tạo

### 1. ModalBaoCaoBaiViet.jsx
**Chức năng:** Báo cáo bài viết
**API:** `POST /api/bao-cao/guibaocao`
**Tính năng:**
- Chọn lý do báo cáo (Spam, Quấy rối, Nội dung không phù hợp, Tin giả, Khác)
- Nhập mô tả thêm (không bắt buộc)
- Toast thông báo kết quả
- Loading state khi gửi

### 2. ModalChinhSuaBaiViet.jsx
**Chức năng:** Chỉnh sửa nội dung và quyền riêng tư bài viết
**API:** `PUT /api/bai-viet/{id}`
**Tính năng:**
- Chỉnh sửa nội dung bài viết
- Thay đổi quyền riêng tư (Công khai, Bạn bè, Riêng tư)
- Giao diện đẹp với icons
- Validation và loading state

### 3. ModalChonQuyenRiengTu.jsx
**Chức năng:** Chỉ thay đổi quyền riêng tư bài viết
**API:** `PUT /api/bai-viet/{id}`
**Tính năng:**
- Chọn quyền riêng tư với mô tả chi tiết
- Giao diện tối ưu cho chức năng đơn lẻ
- Loading state và validation

## Cách sử dụng

### Trong BaiDang.jsx (Card bài viết)
```jsx
// Import các modal
import ModalBaoCaoBaiViet from './ModalBaoCaoBaiViet';
import ModalChinhSuaBaiViet from './ModalChinhSuaBaiViet';
import ModalChonQuyenRiengTu from './ModalChonQuyenRiengTu';

// Thêm state cho các modal
const [isBaoCaoModalOpen, setIsBaoCaoModalOpen] = useState(false);
const [isChinhSuaModalOpen, setIsChinhSuaModalOpen] = useState(false);
const [isQuyenRiengTuModalOpen, setIsQuyenRiengTuModalOpen] = useState(false);

// Các hàm xử lý
const handleEdit = () => {
  setIsOptionModalOpen(false);
  setIsChinhSuaModalOpen(true);
};

const handlePrivacy = () => {
  setIsOptionModalOpen(false);
  setIsQuyenRiengTuModalOpen(true);
};

const handleDelete = async () => {
  // Gọi API xóa bài viết
  // Hiển thị confirm dialog
  // Toast thông báo kết quả
};

const handleReport = () => {
  setIsOptionModalOpen(false);
  setIsBaoCaoModalOpen(true);
};

// Render các modal
<ModalBaoCaoBaiViet
  isOpen={isBaoCaoModalOpen}
  onClose={() => setIsBaoCaoModalOpen(false)}
  postId={post?.id}
  postTitle={post?.noiDung}
/>

<ModalChinhSuaBaiViet
  isOpen={isChinhSuaModalOpen}
  onClose={() => setIsChinhSuaModalOpen(false)}
  post={post}
  onPostUpdated={handlePostUpdated}
/>

<ModalChonQuyenRiengTu
  isOpen={isQuyenRiengTuModalOpen}
  onClose={() => setIsQuyenRiengTuModalOpen(false)}
  post={post}
  onPostUpdated={handlePostUpdated}
/>
```

### Trong BaiDangChiTietModal.jsx (Modal chi tiết bài viết)
Tương tự như BaiDang.jsx, nhưng cần thêm props:
```jsx
const PostDetailModal = ({ 
  post, 
  isOpen, 
  onClose, 
  onCommentAdded, 
  onLikeChanged, 
  onPostDeleted,  // Mới
  onPostUpdated   // Mới
}) => {
  // Logic tương tự
};
```

## API Endpoints

### 1. Xóa bài viết
```
DELETE /api/bai-viet/{id}
Header: Authorization: Bearer <token>
Response: { thanhCong: true, message: "Đã xóa bài viết thành công" }
```

### 2. Cập nhật bài viết
```
PUT /api/bai-viet/{id}
Header: Authorization: Bearer <token>
Body: {
  noiDung: string,
  cheDoRiengTu: "cong_khai" | "ban_be" | "rieng_tu"
}
```

### 3. Báo cáo bài viết
```
POST /api/bao-cao/guibaocao
Header: Authorization: Bearer <token>
Body: {
  lyDo: "spam" | "quay_roi" | "noi_dung_khong_phu_hop" | "tin_gia" | "khac",
  moTa: string,
  baiViet: { id: number }
}
```

## Tính năng đặc biệt

### 1. Xác định chủ bài viết
```jsx
const user = JSON.parse(localStorage.getItem('user') || '{}');
const isOwnPost = post.idNguoiDung === user.id;
```

### 2. Hiển thị menu khác nhau
- **Bài viết của mình:** Chỉnh sửa, Quyền riêng tư, Xóa
- **Bài viết của người khác:** Báo cáo

### 3. Toast notifications
Sử dụng Chakra UI toast để thông báo kết quả:
```jsx
const toast = useToast();
toast({
  title: 'Thành công',
  status: 'success',
  duration: 2000,
  isClosable: true,
  position: 'top'
});
```

### 4. Loading states
Tất cả các modal đều có loading state khi gọi API:
```jsx
const [isSubmitting, setIsSubmitting] = useState(false);
// Sử dụng trong Button: isLoading={isSubmitting}
```

## Cập nhật Props

### BaiDang.jsx
```jsx
const PostCard = ({ 
  post, 
  onLikePost, 
  onCommentAdded, 
  onPostDeleted,  // Mới
  onPostUpdated   // Mới
}) => {
  // Logic
};
```

### PostDetailModal
```jsx
const PostDetailModal = ({ 
  post, 
  isOpen, 
  onClose, 
  onCommentAdded, 
  onLikeChanged, 
  onPostDeleted,  // Mới
  onPostUpdated   // Mới
}) => {
  // Logic
};
```

## Files đã cập nhật

1. **BaiDang.jsx** - Thêm các modal và API calls
2. **BaiDangChiTietModal.jsx** - Thêm các modal và API calls
3. **TrangChu.jsx** - Thêm props mới
4. **QuanLiBaiVietNguoiDung.jsx** - Thêm props mới
5. **ModalBaoCaoBaiViet.jsx** - Modal mới
6. **ModalChinhSuaBaiViet.jsx** - Modal mới
7. **ModalChonQuyenRiengTu.jsx** - Modal mới

## Lưu ý

- Tất cả API calls đều có error handling
- Sử dụng Chakra UI cho giao diện nhất quán
- Có confirm dialog cho các hành động quan trọng (xóa)
- Toast notifications cho user feedback
- Loading states cho UX tốt hơn
- Responsive design cho mobile 