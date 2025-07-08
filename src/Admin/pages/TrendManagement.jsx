import React from 'react';

const TrendManagement = () => {
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Quản lý xu hướng</h1>
      {/* TODO: Danh sách hashtag thịnh hành, filter, quảng bá, ưu tiên, xem chi tiết */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
          <input placeholder="Tìm kiếm hashtag..." style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', width: 220 }} />
          <select style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
            <option>Trạng thái</option>
            <option>Ưu tiên</option>
            <option>Bình thường</option>
          </select>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f4f6f8' }}>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Hashtag</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Số lượng sử dụng</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Trạng thái</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Ngày ưu tiên</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {/* TODO: Render danh sách hashtag ở đây */}
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: 16, color: '#888' }}>
                Chưa có dữ liệu
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrendManagement; 