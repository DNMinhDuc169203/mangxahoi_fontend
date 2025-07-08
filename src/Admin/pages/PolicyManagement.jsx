import React from 'react';

const PolicyManagement = () => {
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Quản lý chính sách</h1>
      {/* TODO: Danh sách chính sách, tạo mới, cập nhật, xem chi tiết */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
          <button style={{ padding: '8px 16px', borderRadius: 4, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 'bold' }}>Tạo chính sách mới</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f4f6f8' }}>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Tiêu đề</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Ngày tạo</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Trạng thái</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {/* TODO: Render danh sách chính sách ở đây */}
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: 16, color: '#888' }}>
                Chưa có dữ liệu
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PolicyManagement; 