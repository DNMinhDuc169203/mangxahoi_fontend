import React from 'react';
import { FaTachometerAlt, FaUsers, FaFileAlt, FaFlag, FaGavel, FaHashtag, FaSignOutAlt } from 'react-icons/fa';
import { logoutAdmin } from '../services/ChinhSachService';
import { useNavigate } from 'react-router-dom';

const menu = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <FaTachometerAlt /> },
  { label: 'Tài khoản', path: '/admin/users', icon: <FaUsers /> },
  { label: 'Bài đăng', path: '/admin/posts', icon: <FaFileAlt /> },
  { label: 'Báo cáo', path: '/admin/reports', icon: <FaFlag /> },
  { label: 'Chính sách', path: '/admin/policies', icon: <FaGavel /> },
  { label: 'Xu hướng', path: '/admin/trends', icon: <FaHashtag /> },
];

const AdminSidebar = ({ currentPath, onNavigate }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      if (token) await logoutAdmin(token);
    } catch (e) {}
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };

  return (
    <div style={{
      width: 250,
      background: 'linear-gradient(180deg, #23272f 0%, #b71c1c 100%)',
      color: '#fff',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 100,
      paddingTop: 32,
      boxShadow: '2px 0 12px rgba(0,0,0,0.08)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
    }}>
      <div style={{ fontWeight: 'bold', fontSize: 26, textAlign: 'center', marginBottom: 40, letterSpacing: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <span style={{ color: '#b71c1c', fontSize: 32 }}>■</span>
        <span style={{ color: '#fff' }}>TopTrend</span>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
        {menu.map(item => (
          <li key={item.path} style={{ marginBottom: 8 }}>
            <button
              onClick={() => onNavigate(item.path)}
              style={{
                width: '90%',
                marginLeft: '5%',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                background: currentPath === item.path ? '#fff' : 'transparent',
                color: currentPath === item.path ? '#b71c1c' : '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px 18px',
                fontWeight: currentPath === item.path ? 'bold' : 500,
                fontSize: 17,
                cursor: 'pointer',
                boxShadow: currentPath === item.path ? '0 2px 8px rgba(183,28,28,0.08)' : 'none',
                transition: 'all 0.18s',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#b71c1c33'}
              onMouseOut={e => e.currentTarget.style.background = currentPath === item.path ? '#fff' : 'transparent'}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      <div style={{ width: '100%', textAlign: 'center', marginBottom: 32 }}>
        <button style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 500, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto' }}
          onClick={handleLogout}
        >
          <FaSignOutAlt style={{ fontSize: 18 }} /> Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar; 