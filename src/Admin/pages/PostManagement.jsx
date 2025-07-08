import React from 'react';

const PostManagement = () => {
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Quản lý bài đăng</h1>
      {/* TODO: Bảng danh sách bài đăng, filter, tìm kiếm, thao tác ẩn/xóa/khôi phục, xem chi tiết */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
          <input placeholder="Tìm kiếm theo nội dung..." style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', width: 220 }} />
          <input placeholder="Hashtag..." style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', width: 140 }} />
          <select style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
            <option>Trạng thái</option>
            <option>Bình thường</option>
            <option>Đã ẩn</option>
            <option>Đã xóa</option>
          </select>
          <select style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
            <option>Loại</option>
            <option>Thông thường</option>
            <option>Hashtag</option>
          </select>
          <select style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
            <option>Nhạy cảm</option>
            <option>Có</option>
            <option>Không</option>
          </select>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f4f6f8' }}>
              <th style={{ padding: 8, border: '1px solid #eee' }}>ID</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>User</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Nội dung</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Hashtag</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Trạng thái</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Nhạy cảm</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Ngày đăng</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {/* TODO: Render danh sách bài đăng ở đây */}
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', padding: 16, color: '#888' }}>
                Chưa có dữ liệu
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PostManagement; 