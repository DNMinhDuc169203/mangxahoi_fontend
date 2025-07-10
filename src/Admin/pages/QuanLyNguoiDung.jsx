import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaLock, FaUnlock } from "react-icons/fa";

const API_USERS = 'http://localhost:8080/network/api/admin/nguoi-dung?page=0&size=20';
const API_VI_PHAM = 'http://localhost:8080/network/api/admin/nguoi-dung'; // + /{id}/thong-tin-vi-pham

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [viPhamMap, setViPhamMap] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null); // 'khoa' | 'moKhoa' | 'lichSu' | 'xuLyViPham'
  const [lyDoKhoa, setLyDoKhoa] = useState('');
  const [lichSuViPham, setLichSuViPham] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [noiDungViPham, setNoiDungViPham] = useState('');
  const [loaiViPham, setLoaiViPham] = useState('');
  const [ghiChuViPham, setGhiChuViPham] = useState('');
  const [thongTinViPham, setThongTinViPham] = useState(null); // Thông tin tổng quan vi phạm
  const [loaiViPhamKhac, setLoaiViPhamKhac] = useState(''); // Lưu loại vi phạm tự nhập
  const [thongTinViPhamMap, setThongTinViPhamMap] = useState({});

  // Danh sách loại vi phạm enum (đồng bộ backend)
  const LOAI_VI_PHAM_OPTIONS = [
    { value: 'SPAM', label: 'Spam' },
    { value: 'NGON_TU_KICH_DONG', label: 'Ngôn từ kích động/thù địch' },
    { value: 'THONG_TIN_SAI_SU_THAT', label: 'Thông tin sai sự thật' },
    { value: 'NOI_DUNG_NHAY_CAM', label: 'Nội dung nhạy cảm/đồi trụy' },
    { value: 'QUANG_CAO', label: 'Quảng cáo không phép' },
    { value: 'LUA_DAO', label: 'Lừa đảo' },
    { value: 'KHAC', label: 'Khác' },
  ];

  useEffect(() => {
    setLoading(true);
    setError('');
    const fetchUsers = () => {
      axios.get(API_USERS, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      })
        .then(res => {
          setUsers(res.data.content || []);
          setLoading(false);
        })
        .catch(() => {
          setError('Không thể tải danh sách người dùng!');
          setLoading(false);
        });
    };
    fetchUsers();
    const interval = setInterval(fetchUsers, 5000); 
    return () => clearInterval(interval);
  }, []);

  // Lấy số lần vi phạm cho từng user
  useEffect(() => {
    users.forEach(user => {
      axios.get(`${API_VI_PHAM}/${user.id}/thong-tin-vi-pham`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      })
        .then(res => {
          setViPhamMap(prev => ({ ...prev, [user.id]: res.data.tongSoLanViPham }));
        })
        .catch(() => {});
    });
  }, [users]);

  // Lấy tổng quan vi phạm cho từng user (trạng thái, số lần vi phạm)
  useEffect(() => {
    users.forEach(user => {
      axios.get(`${API_VI_PHAM}/${user.id}/thong-tin-vi-pham`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      })
        .then(res => {
          setThongTinViPhamMap(prev => ({ ...prev, [user.id]: res.data }));
          setViPhamMap(prev => ({ ...prev, [user.id]: res.data.tongSoLanViPham })); // giữ lại cho cột số lần vi phạm
        })
        .catch(() => {});
    });
  }, [users]);

  const filteredUsers = users.filter(u =>
    u.hoTen?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Xử lý khóa tài khoản
  const handleKhoa = (user) => {
    setSelectedUser(user);
    setLyDoKhoa('');
    setModalType('khoa');
    setActionMsg('');
  };
  const confirmKhoa = () => {
    if (!lyDoKhoa.trim()) {
      setActionMsg('Vui lòng nhập lý do khóa!');
      return;
    }
    setModalLoading(true);
    axios.post(`http://localhost:8080/network/api/admin/nguoi-dung/${selectedUser.id}/khoa`, { lyDo: lyDoKhoa }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    })
      .then(() => {
        setUsers(users => users.map(u => u.id === selectedUser.id ? { ...u, biTamKhoa: true } : u));
        setModalType(null);
      })
      .catch(() => setActionMsg('Khóa tài khoản thất bại!'))
      .finally(() => setModalLoading(false));
  };

  // Xử lý mở khóa tài khoản
  const handleMoKhoa = (user) => {
    setSelectedUser(user);
    setModalType('moKhoa');
    setActionMsg('');
  };
  const confirmMoKhoa = () => {
    setModalLoading(true);
    axios.post(`http://localhost:8080/network/api/admin/nguoi-dung/${selectedUser.id}/mo-khoa`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    })
      .then(() => {
        setUsers(users => users.map(u => u.id === selectedUser.id ? { ...u, biTamKhoa: false } : u));
        setModalType(null);
      })
      .catch(() => setActionMsg('Mở khóa tài khoản thất bại!'))
      .finally(() => setModalLoading(false));
  };

  // Xem lịch sử vi phạm
  const handleLichSu = (user) => {
    setSelectedUser(user);
    setModalType('lichSu');
    setModalLoading(true);
    axios.get(`${API_VI_PHAM}/${user.id}/lich-su-vi-pham`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    })
      .then(res => setLichSuViPham(res.data || []))
      .catch(() => setLichSuViPham([]))
      .finally(() => setModalLoading(false));
  };

  // Xử lý vi phạm
  const handleXuLyViPham = (user) => {
    setSelectedUser(user);
    setModalType('xuLyViPham');
    setNoiDungViPham('');
    setLoaiViPham('');
    setGhiChuViPham('');
    setActionMsg('');
    setModalLoading(true);
    axios.get(`${API_VI_PHAM}/${user.id}/thong-tin-vi-pham`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    })
      .then(res => setThongTinViPham(res.data))
      .catch(() => setThongTinViPham(null))
      .finally(() => setModalLoading(false));
  };
  // Khi submit, nếu chọn 'KHAC' thì gửi giá trị tự nhập, còn lại gửi enum
  const confirmXuLyViPham = () => {
    if (!noiDungViPham.trim() || !loaiViPham.trim() || (loaiViPham === 'KHAC' && !loaiViPhamKhac.trim())) {
      setActionMsg('Vui lòng nhập đầy đủ nội dung và loại vi phạm!');
      return;
    }
    let loaiViPhamGui = loaiViPham;
    if (loaiViPham === 'KHAC') {
      loaiViPhamGui = loaiViPhamKhac.trim().toUpperCase().replace(/\s+/g, '_');
    }
    // Lấy adminId từ localStorage adminInfo
    let adminId = null;
    try {
      const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');
      adminId = adminInfo.id;
    } catch (e) {}
    if (!adminId) {
      setActionMsg('Không xác định được adminId! Vui lòng đăng nhập lại.');
      return;
    }
    setModalLoading(true);
    axios.post(`http://localhost:8080/network/api/admin/nguoi-dung/them-vi-pham?adminId=${adminId}`,
      {
        userId: selectedUser.id,
        noiDungViPham,
        loaiViPham: loaiViPhamGui,
        ghiChu: ghiChuViPham
      },
      { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
    )
      .then(() => {
        setModalType(null);
        // Có thể reload lại số lần vi phạm nếu muốn
      })
      .catch(() => setActionMsg('Xử lý vi phạm thất bại!'))
      .finally(() => setModalLoading(false));
  };

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Quản lý tài khoản người dùng</h1>
      <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: 16 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm theo tên, email..." style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', width: 300 }} />
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
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 16 }}>Đang tải...</td></tr>
            ) : error ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 16, color: '#d32f2f' }}>{error}</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 16, color: '#888' }}>Không có dữ liệu</td></tr>
            ) : filteredUsers.map(user => (
              <tr key={user.id}>
                <td style={{ padding: 8, textAlign: 'center' }}>
                  <img src={user.anhDaiDien || 'https://ui-avatars.com/api/?name=U'} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #b71c1c' }} />
                </td>
                <td style={{ padding: 8 }}>{user.hoTen}</td>
                <td style={{ padding: 8 }}>{user.email}</td>
                <td style={{ padding: 8, fontWeight: 600, color: (thongTinViPhamMap[user.id]?.trangThaiTaiKhoan === 'Đang bị khóa' || user.biTamKhoa) ? '#d32f2f' : '#388e3c' }}>
                  {thongTinViPhamMap[user.id]?.trangThaiTaiKhoan || (user.biTamKhoa ? 'Bị khóa' : 'Bình thường')}
                </td>
                <td style={{ padding: 8, textAlign: 'center' }}>{thongTinViPhamMap[user.id]?.tongSoLanViPham ?? viPhamMap[user.id] ?? '...'}</td>
                <td style={{ padding: 8 }}>{user.ngayTao ? new Date(user.ngayTao).toLocaleDateString() : ''}</td>
                <td style={{ padding: 8 }}>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'nowrap', alignItems: 'center' }}>
                    {user.biTamKhoa || thongTinViPhamMap[user.id]?.trangThaiTaiKhoan === 'Đang bị khóa' ? (
                      <button
                        onClick={() => handleMoKhoa(user)}
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: '40%',
                          background: '#388e3c',
                          color: '#fff',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 4px #e0e0e0',
                          transition: 'background 0.2s, box-shadow 0.2s',
                          cursor: 'pointer',
                          fontSize: 20
                        }}
                        title="Bạn có thể mở khóa sớm cho user này trước thời hạn"
                        onMouseOver={e => e.currentTarget.style.background = '#256029'}
                        onMouseOut={e => e.currentTarget.style.background = '#388e3c'}
                      >
                        <FaUnlock />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleKhoa(user)}
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: '40%',
                          background: '#d32f2f',
                          color: '#fff',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 4px #e0e0e0',
                          transition: 'background 0.2s, box-shadow 0.2s',
                          cursor: 'pointer',
                          fontSize: 20
                        }}
                        title="Khóa tài khoản"
                        onMouseOver={e => e.currentTarget.style.background = '#b71c1c'}
                        onMouseOut={e => e.currentTarget.style.background = '#d32f2f'}
                      >
                        <FaLock />
                      </button>
                    )}
                    <button
                      onClick={() => handleLichSu(user)}
                      style={{
                        background: '#23272f',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '0 22px',
                        height: 45,
                        fontWeight: 600,
                        fontSize: 16,
                        boxShadow: '0 1px 4px #e0e0e0',
                        transition: 'background 0.2s, transform 0.2s',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#444'}
                      onMouseOut={e => e.currentTarget.style.background = '#23272f'}
                    >
                      Lịch sử vi phạm
                    </button>
                    <button
                      onClick={() => handleXuLyViPham(user)}
                      style={{
                        background: '#b71c1c',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '0 22px',
                        height: 45,
                        fontWeight: 600,
                        fontSize: 16,
                        boxShadow: '0 1px 4px #e0e0e0',
                        transition: 'background 0.2s, transform 0.2s',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#7f1010'}
                      onMouseOut={e => e.currentTarget.style.background = '#b71c1c'}
                    >
                      Xử lý vi phạm
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal xác nhận khóa/mở khóa */}
      {modalType === 'khoa' && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 340, boxShadow: '0 2px 16px rgba(0,0,0,0.12)' }}>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 18 }}>Khóa tài khoản</h3>
            <div style={{ marginBottom: 12 }}>Nhập lý do khóa tài khoản <b>{selectedUser?.hoTen}</b>:</div>
            <textarea value={lyDoKhoa} onChange={e => setLyDoKhoa(e.target.value)} rows={3} style={{ width: '100%', borderRadius: 6, border: '1px solid #ccc', padding: 8, marginBottom: 10 }} />
            {actionMsg && <div style={{ color: '#d32f2f', marginBottom: 8 }}>{actionMsg}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setModalType(null)} style={{ padding: '7px 18px', borderRadius: 5, border: 'none', background: '#eee', color: '#23272f', fontWeight: 500 }}>Hủy</button>
              <button onClick={confirmKhoa} disabled={modalLoading} style={{ padding: '7px 18px', borderRadius: 5, border: 'none', background: '#d32f2f', color: '#fff', fontWeight: 600 }}>{modalLoading ? 'Đang xử lý...' : 'Khóa'}</button>
            </div>
          </div>
        </div>
      )}
      {modalType === 'moKhoa' && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 340, boxShadow: '0 2px 16px rgba(0,0,0,0.12)' }}>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 18 }}>Mở khóa tài khoản</h3>
            <div style={{ marginBottom: 12 }}>Bạn chắc chắn muốn mở khóa tài khoản <b>{selectedUser?.hoTen}</b>?</div>
            {actionMsg && <div style={{ color: '#d32f2f', marginBottom: 8 }}>{actionMsg}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setModalType(null)} style={{ padding: '7px 18px', borderRadius: 5, border: 'none', background: '#eee', color: '#23272f', fontWeight: 500 }}>Hủy</button>
              <button onClick={confirmMoKhoa} disabled={modalLoading} style={{ padding: '7px 18px', borderRadius: 5, border: 'none', background: '#388e3c', color: '#fff', fontWeight: 600 }}>{modalLoading ? 'Đang xử lý...' : 'Mở khóa'}</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal lịch sử vi phạm */}
      {modalType === 'lichSu' && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 420, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 2px 16px rgba(0,0,0,0.12)' }}>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 18 }}>Lịch sử vi phạm của <b>{selectedUser?.hoTen}</b></h3>
            {modalLoading ? <div>Đang tải...</div> : (
              lichSuViPham.length === 0 ? <div style={{ color: '#888' }}>Không có vi phạm nào.</div> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
                  <thead>
                    <tr style={{ background: '#f4f6f8' }}>
                      <th style={{ padding: 8, border: '1px solid #eee' }}>Nội dung</th>
                      <th style={{ padding: 8, border: '1px solid #eee' }}>Loại</th>
                      <th style={{ padding: 8, border: '1px solid #eee' }}>Thời gian</th>
                      <th style={{ padding: 8, border: '1px solid #eee' }}>Hình phạt</th>
                      <th style={{ padding: 8, border: '1px solid #eee' }}>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lichSuViPham.map(vp => (
                      <tr key={vp.id}>
                        <td style={{ padding: 8 }}>{vp.noiDungViPham}</td>
                        <td style={{ padding: 8 }}>{vp.loaiViPham}</td>
                        <td style={{ padding: 8 }}>{vp.thoiGianViPham ? new Date(vp.thoiGianViPham).toLocaleString() : ''}</td>
                        <td style={{ padding: 8 }}>{vp.hinhPhat}</td>
                        <td style={{ padding: 8 }}>{vp.ghiChu}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
              <button onClick={() => setModalType(null)} style={{ padding: '7px 18px', borderRadius: 5, border: 'none', background: '#eee', color: '#23272f', fontWeight: 500 }}>Đóng</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal xử lý vi phạm */}
      {modalType === 'xuLyViPham' && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 420, maxWidth: 500, boxShadow: '0 2px 16px rgba(0,0,0,0.12)' }}>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 18 }}>Xử lý vi phạm cho <b>{selectedUser?.hoTen}</b></h3>
            {modalLoading ? <div>Đang tải...</div> : (
              <>
                <div style={{ marginBottom: 10 }}>
                  <b>Số lần vi phạm trước đó:</b> {thongTinViPham?.tongSoLanViPham ?? '...'}<br />
                  <b>Hình phạt sẽ áp dụng:</b> {(() => {
                    const n = thongTinViPham?.tongSoLanViPham || 0;
                    if (n === 0) return 'Cảnh báo';
                    if (n === 1) return 'Khóa 1 ngày';
                    if (n === 2) return 'Khóa 3 ngày';
                    if (n >= 3) return 'Khóa vĩnh viễn';
                    return '';
                  })()}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div><b>Nội dung vi phạm:</b></div>
                  <textarea value={noiDungViPham} onChange={e => setNoiDungViPham(e.target.value)} rows={2} style={{ width: '100%', borderRadius: 6, border: '1px solid #ccc', padding: 8 }} />
                </div>
                {/* Loại vi phạm: */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontWeight: 500, marginTop: 12 }}>Loại vi phạm:</label>
                  <select
                    value={loaiViPham}
                    onChange={e => setLoaiViPham(e.target.value)}
                    style={{ width: '100%', borderRadius: 6, border: '1px solid #ccc', padding: 8, marginBottom: 10 }}
                  >
                    <option value="">-- Chọn loại vi phạm --</option>
                    {LOAI_VI_PHAM_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {loaiViPham === 'KHAC' && (
                    <input
                      type="text"
                      placeholder="Nhập loại vi phạm khác..."
                      value={loaiViPhamKhac || ''}
                      onChange={e => setLoaiViPhamKhac(e.target.value)}
                      style={{ width: '100%', borderRadius: 6, border: '1px solid #ccc', padding: 8, marginBottom: 10 }}
                    />
                  )}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div><b>Ghi chú (tuỳ chọn):</b></div>
                  <input value={ghiChuViPham} onChange={e => setGhiChuViPham(e.target.value)} style={{ width: '100%', borderRadius: 6, border: '1px solid #ccc', padding: 8 }} />
                </div>
                {actionMsg && <div style={{ color: '#d32f2f', marginBottom: 8 }}>{actionMsg}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
                  <button onClick={() => setModalType(null)} style={{ padding: '7px 18px', borderRadius: 5, border: 'none', background: '#eee', color: '#23272f', fontWeight: 500 }}>Hủy</button>
                  <button onClick={confirmXuLyViPham} disabled={modalLoading} style={{ padding: '7px 18px', borderRadius: 5, border: 'none', background: '#b71c1c', color: '#fff', fontWeight: 600 }}>{modalLoading ? 'Đang xử lý...' : 'Xử lý'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 