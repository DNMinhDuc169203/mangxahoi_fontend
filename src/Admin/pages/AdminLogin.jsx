import React, { useState } from 'react';

const API_URL = 'http://localhost:8080/network/api/admin/dang-nhap';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, matKhau: password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Đăng nhập thất bại!');
      } else {
        // Sau khi đăng nhập thành công:
        localStorage.setItem('adminToken', data.token || '');
        // Đảm bảo lưu đúng object adminInfo (có id)
        if (data.nguoiDung) {
          localStorage.setItem('adminInfo', JSON.stringify(data.nguoiDung));
        } else if (data.admin) {
          localStorage.setItem('adminInfo', JSON.stringify(data.admin));
        } else {
          localStorage.setItem('adminInfo', '{}');
        }
        window.location.href = '/admin/dashboard';
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #2d2d2d 0%, #b71c1c 100%)' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 40, borderRadius: 12, boxShadow: '0 4px 24px rgba(183,28,28,0.12)', minWidth: 340, maxWidth: 360 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
          <span style={{ fontWeight: 'bold', fontSize: 28, color: '#b71c1c', letterSpacing: 1 }}>Admin</span>
          <span style={{ fontWeight: 600, fontSize: 22, color: '#2d2d2d', marginLeft: 8 }}>TopTrend</span>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#b71c1c', fontWeight: 500 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1.5px solid #b71c1c', marginTop: 4, fontSize: 16 }} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#b71c1c', fontWeight: 500 }}>Mật khẩu</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1.5px solid #b71c1c', marginTop: 4, fontSize: 16 }} />
        </div>
        {error && <div style={{ color: '#d32f2f', marginBottom: 16, textAlign: 'center', fontWeight: 500 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 6, background: loading ? '#b71c1c99' : '#b71c1c', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: 17, letterSpacing: 1, boxShadow: '0 2px 8px rgba(183,28,28,0.08)', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin; 