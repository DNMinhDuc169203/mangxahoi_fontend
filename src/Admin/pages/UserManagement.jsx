import React from 'react';

const UserManagement = () => {
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Quản lý tài khoản người dùng</h1>
      {/* TODO: Bảng danh sách user, filter, tìm kiếm, thao tác khóa/mở, xóa, xem chi tiết */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: 16 }}>
          <input placeholder="Tìm kiếm theo tên, email..." style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', width: 300 }} />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f4f6f8' }}>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Avatar</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Tên</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Email</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Trạng thái</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Số lần vi phạm</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Ngày tạo</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {/* TODO: Render danh sách user ở đây */}
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: 16, color: '#888' }}>
                Chưa có dữ liệu
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement; 