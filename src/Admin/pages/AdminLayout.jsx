import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const SIDEBAR_WIDTH = 250;
const headerStyle = {
  height: 64,
  background: '#f4f6f8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: '0 32px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const info = localStorage.getItem('adminInfo');
    if (info) setAdmin(JSON.parse(info));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f8' }}>
      <AdminSidebar currentPath={location.pathname} onNavigate={navigate} />
      <div style={{
        flex: 1,
        minHeight: '100vh',
        background: '#f4f6f8',
        marginLeft: SIDEBAR_WIDTH,
        transition: 'margin-left 0.2s',
      }}>
        {/* Header admin */}
        <div style={headerStyle}>
          {admin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <img src={admin.anhDaiDien || 'https://ui-avatars.com/api/?name=Admin'} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #b71c1c' }} />
              <span style={{ fontWeight: 600, color: '#23272f', fontSize: 17 }}>{admin.hoTen || 'Quản trị viên'}</span>
              <button style={{ background: '#b71c1c', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px', fontWeight: 500, marginLeft: 16, cursor: 'pointer', fontSize: 15 }}>Đăng xuất</button>
            </div>
          )}
        </div>
        <div style={{ padding: 32, minHeight: 'calc(100vh - 64px)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 