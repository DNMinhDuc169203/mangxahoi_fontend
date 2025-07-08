import React from 'react';

const ReportManagement = () => {
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Quản lý báo cáo vi phạm</h1>
      {/* TODO: Bảng danh sách báo cáo, filter, thao tác xử lý, xem chi tiết */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
          <select style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
            <option>Trạng thái</option>
            <option>Chờ xử lý</option>
            <option>Đã xử lý</option>
            <option>Bỏ qua</option>
          </select>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f4f6f8' }}>
              <th style={{ padding: 8, border: '1px solid #eee' }}>ID</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Người báo cáo</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Người bị báo cáo</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Loại vi phạm</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Trạng thái</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Ngày gửi</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {/* TODO: Render danh sách báo cáo ở đây */}
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

export default ReportManagement; 