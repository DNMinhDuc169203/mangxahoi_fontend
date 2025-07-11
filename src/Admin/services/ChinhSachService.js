// Service gọi API quản lý chính sách cho admin
import axios from 'axios';
const API_BASE = 'http://localhost:8080/network/api/admin/chinh-sach';

export async function getPolicies() {
  const res = await fetch(`${API_BASE}`);
  if (!res.ok) throw new Error('Lấy danh sách chính sách thất bại');
  return res.json();
}

export async function getPolicyDetail(id) {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error('Lấy chi tiết chính sách thất bại');
  return res.json();
}

export async function createPolicy({ tieuDe, noiDung, adminId }) {
  const res = await fetch(`${API_BASE}?adminId=${adminId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tieuDe, noiDung }),
  });
  if (!res.ok) throw new Error('Tạo chính sách thất bại');
  return res.json();
}

export async function updatePolicy(id, { tieuDe, noiDung, adminId }) {
  const res = await fetch(`${API_BASE}/${id}?adminId=${adminId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tieuDe, noiDung }),
  });
  if (!res.ok) throw new Error('Cập nhật chính sách thất bại');
  return res.json();
}

export async function deletePolicy(id, adminId) {
  const res = await fetch(`${API_BASE}/${id}?adminId=${adminId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Xóa chính sách thất bại');
  return res.json();
}

export const logoutAdmin = async (token) => {
  return axios.post('/api/admin/dang-xuat', { token });
}; 