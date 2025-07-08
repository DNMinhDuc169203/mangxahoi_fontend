import React, { useEffect, useState } from 'react';

const API_URL = 'http://localhost:8080/network/api/admin/thong-ke';
const API_POSTS = 'http://localhost:8080/network/api/admin/bai-viet/moi-nhat';
const API_REPORTS = 'http://localhost:8080/network/api/admin/bao-cao/moi-nhat';

const cardColors = [
  {
    bg: 'linear-gradient(135deg, #b71c1c 60%, #23272f 100%)',
    color: '#fff',
    label: 'Tổng số tài khoản',
    key: 'tongSoNguoiDung',
  },
  {
    bg: 'linear-gradient(135deg, #1976d2 60%, #23272f 100%)',
    color: '#fff',
    label: 'Tổng số bài đăng',
    key: 'tongSoBaiViet',
  },
  {
    bg: 'linear-gradient(135deg, #fbc02d 60%, #b71c1c 100%)',
    color: '#23272f',
    label: 'Báo cáo vi phạm',
    key: 'tongSoBaoCao',
  },
  {
    bg: 'linear-gradient(135deg, #23272f 60%, #b71c1c 100%)',
    color: '#fff',
    label: 'Hashtag thịnh hành',
    key: 'trendTuanNay',
  },
];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(API_URL).then(res => res.json()),
      fetch(API_POSTS).then(res => res.json()),
      fetch(API_REPORTS).then(res => res.json()),
    ])
      .then(([stat, postRes, reportRes]) => {
        setData(stat);
        setPosts(postRes || []);
        setReports(reportRes || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Không thể tải dữ liệu thống kê!');
        setLoading(false);
      });
  }, []);

  // Dữ liệu cho biểu đồ cột
  const chartData = [
    { label: 'User mới', value: data?.nguoiDungMoi || 0, color: '#b71c1c' },
    { label: 'Bài viết mới', value: data?.baiVietMoi || 0, color: '#1976d2' },
    { label: 'Bình luận mới', value: data?.binhLuanMoi || 0, color: '#fbc02d' },
  ];
  const maxChart = Math.max(...chartData.map(c => c.value), 1);

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 36, color: '#23272f', letterSpacing: 1 }}>Dashboard Quản trị viên</h1>
      {error && <div style={{ color: '#d32f2f', fontWeight: 600, marginBottom: 24 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
        {cardColors.map((c, idx) => (
          <div
            key={c.label}
            style={{
              background: c.bg,
              color: c.color,
              padding: '38px 44px',
              borderRadius: 22,
              minWidth: 240,
              minHeight: 120,
              boxShadow: '0 4px 24px rgba(35,39,47,0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: 0.5,
              position: 'relative',
              transition: 'transform 0.15s',
            }}
          >
            <div style={{ marginBottom: 12 }}>{c.label}</div>
            <div style={{ fontSize: 30, fontWeight: 900, opacity: 0.7 }}>
              {loading ? '...' :
                c.key === 'trendTuanNay'
                  ? (data?.trendTuanNay?.hashtagPhoThong ? `#${data.trendTuanNay.hashtagPhoThong}` : '...')
                  : (data?.[c.key] ?? '...')
              }
            </div>
          </div>
        ))}
      </div>
      {/* Biểu đồ cột đơn giản */}
      <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px rgba(35,39,47,0.06)', padding: 32, maxWidth: 600, margin: '0 auto', marginBottom: 40 }}>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 18, color: '#23272f' }}>Tăng trưởng tuần này</div>
        <svg width="100%" height="180" viewBox="0 0 360 180">
          {chartData.map((c, i) => (
            <g key={c.label}>
              <rect x={40 + i * 100} y={160 - (c.value / maxChart) * 120} width={60} height={(c.value / maxChart) * 120} rx={12} fill={c.color} />
              <text x={70 + i * 100} y={155} textAnchor="middle" fontSize="16" fill="#23272f" fontWeight="bold">{c.value}</text>
              <text x={70 + i * 100} y={175} textAnchor="middle" fontSize="15" fill="#888">{c.label}</text>
            </g>
          ))}
        </svg>
      </div>
      {/* Bảng bài đăng mới nhất và báo cáo mới nhất */}
      <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px rgba(35,39,47,0.06)', padding: 24, minWidth: 350, maxWidth: 420, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#b71c1c', marginBottom: 16 }}>Bài đăng mới nhất</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f4f6f8' }}>
                <th style={{ padding: 8, textAlign: 'left', color: '#888', fontWeight: 600 }}>User</th>
                <th style={{ padding: 8, textAlign: 'left', color: '#888', fontWeight: 600 }}>Nội dung</th>
                <th style={{ padding: 8, textAlign: 'left', color: '#888', fontWeight: 600 }}>Ngày</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={3} style={{ textAlign: 'center', color: '#888' }}>Đang tải...</td></tr> :
                posts.length === 0 ? <tr><td colSpan={3} style={{ textAlign: 'center', color: '#888' }}>Không có dữ liệu</td></tr> :
                  posts.map(post => (
                    <tr key={post.id} style={{ borderBottom: '1px solid #f4f6f8' }}>
                      <td style={{ padding: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src={post.anhDaiDienNguoiDung || 'https://ui-avatars.com/api/?name=U'} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #b71c1c' }} />
                        <span style={{ fontWeight: 600 }}>{post.hoTenNguoiDung}</span>
                      </td>
                      <td style={{ padding: 8, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.noiDung}</td>
                      <td style={{ padding: 8, color: '#888', fontSize: 14 }}>{post.ngayTao ? new Date(post.ngayTao).toLocaleDateString() : ''}</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px rgba(35,39,47,0.06)', padding: 24, minWidth: 350, maxWidth: 420, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#b71c1c', marginBottom: 16 }}>Báo cáo vi phạm mới nhất</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f4f6f8' }}>
                <th style={{ padding: 8, textAlign: 'left', color: '#888', fontWeight: 600 }}>Người dùng</th>
                <th style={{ padding: 8, textAlign: 'left', color: '#888', fontWeight: 600 }}>Loại vi phạm</th>
                <th style={{ padding: 8, textAlign: 'left', color: '#888', fontWeight: 600 }}>Ngày</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={3} style={{ textAlign: 'center', color: '#888' }}>Đang tải...</td></tr> :
                reports.length === 0 ? <tr><td colSpan={3} style={{ textAlign: 'center', color: '#888' }}>Không có dữ liệu</td></tr> :
                  reports.map(rp => (
                    <tr key={rp.id} style={{ borderBottom: '1px solid #f4f6f8' }}>
                      <td style={{ padding: 8, fontWeight: 600 }}>{rp.tenNguoiBaoCao}</td>
                      <td style={{ padding: 8 }}>{rp.loaiBaoCao}</td>
                      <td style={{ padding: 8, color: '#888', fontSize: 14 }}>{rp.ngayTao ? new Date(rp.ngayTao).toLocaleDateString() : ''}</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 