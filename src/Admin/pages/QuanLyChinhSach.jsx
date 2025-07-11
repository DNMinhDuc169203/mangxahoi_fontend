import React, { useEffect, useState } from 'react';
import {
  getPolicies,
  getPolicyDetail,
  createPolicy,
  updatePolicy,
  deletePolicy
} from '../services/ChinhSachService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PolicyManagement = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' | 'edit' | 'detail'
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [form, setForm] = useState({ tieuDe: '', noiDung: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // const adminId = 1; // TODO: lấy từ context/auth thực tế
  const admin = JSON.parse(localStorage.getItem('adminInfo') || '{}');
  const adminId = admin.id;

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getPolicies();
      setPolicies(data);
    } catch (e) {
      toast.error('Lỗi tải danh sách chính sách!');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setForm({ tieuDe: '', noiDung: '' });
    setModalType('create');
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openEditModal = async (policy) => {
    setModalType('edit');
    setSelectedPolicy(policy);
    setForm({ tieuDe: policy.tieuDe, noiDung: policy.noiDung });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openDetailModal = async (policy) => {
    setModalType('detail');
    setSelectedPolicy(policy);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPolicy(null);
    setForm({ tieuDe: '', noiDung: '' });
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    if (!form.tieuDe.trim() || !form.noiDung.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung!');
      return;
    }
    try {
      await createPolicy({ ...form, adminId });
      toast.success('Tạo chính sách thành công!');
      fetchData();
      setTimeout(closeModal, 1000);
    } catch (e) {
      toast.error('Tạo chính sách thất bại!');
    }
  };

  const handleUpdate = async () => {
    if (!form.tieuDe.trim() || !form.noiDung.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung!');
      return;
    }
    try {
      await updatePolicy(selectedPolicy.id, { ...form, adminId });
      toast.success('Cập nhật chính sách thành công!');
      fetchData();
      setTimeout(closeModal, 1000);
    } catch (e) {
      toast.error('Cập nhật chính sách thất bại!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chính sách này?')) return;
    try {
      await deletePolicy(id, adminId);
      toast.success('Xóa chính sách thành công!');
      fetchData();
    } catch (e) {
      toast.error('Xóa chính sách thất bại!');
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Quản lý chính sách</h1>
      {/* Toast notification */}
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">{success}</div>}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="mb-6 flex justify-between items-center">
          <span className="text-xl font-semibold">Danh sách chính sách</span>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >Thêm chính sách</button>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-base">
                <th className="py-3 px-4 font-semibold text-center">#</th>
                <th className="py-3 px-4 font-semibold text-center">Tiêu đề</th>
                <th className="py-3 px-4 font-semibold text-center">Ngày cập nhật</th>
                <th className="py-3 px-4 font-semibold text-center">Admin cập nhật</th>
                <th className="py-3 px-4 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-6 text-gray-500">Đang tải...</td></tr>
              ) : policies.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-6 text-gray-400">Chưa có dữ liệu</td></tr>
              ) : policies.map((p, idx) => (
                <tr key={p.id}>
                  <td className="py-2 px-4 text-center">{idx + 1}</td>
                  <td className="py-2 px-4 text-center font-semibold">{p.tieuDe}</td>
                  <td className="py-2 px-4 text-center">{p.ngayCapNhat ? new Date(p.ngayCapNhat).toLocaleString() : ''}</td>
                  <td className="py-2 px-4 text-center">{p.adminHoTen || '-'}</td>
                  <td className="py-2 px-4 text-center flex gap-2 justify-center">
                    <button
                      onClick={() => openDetailModal(p)}
                      className="px-3 py-1 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-sm hover:bg-blue-100 transition"
                    >Xem</button>
                    <button
                      onClick={() => openEditModal(p)}
                      className="px-3 py-1 rounded bg-yellow-50 text-yellow-700 font-semibold border border-yellow-200 shadow-sm hover:bg-yellow-100 transition"
                    >Sửa</button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-3 py-1 rounded bg-red-50 text-red-700 font-semibold border border-red-200 shadow-sm hover:bg-red-100 transition"
                    >Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal tạo/sửa/xem chi tiết chính sách */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative animate-fadeIn">
            <button onClick={closeModal} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
            {modalType === 'detail' ? (
              <>
                <h2 className="text-2xl font-bold mb-4 text-blue-700">Chi tiết chính sách</h2>
                <div className="space-y-2 text-base">
                  <div><span className="font-semibold">Tiêu đề:</span> {selectedPolicy?.tieuDe}</div>
                  <div><span className="font-semibold">Nội dung:</span></div>
                  <div className="whitespace-pre-line border rounded p-2 bg-gray-50">{selectedPolicy?.noiDung}</div>
                  <div><span className="font-semibold">Ngày cập nhật:</span> {selectedPolicy?.ngayCapNhat ? new Date(selectedPolicy.ngayCapNhat).toLocaleString() : ''}</div>
                  <div><span className="font-semibold">Admin cập nhật:</span> {selectedPolicy?.adminCapNhat ? selectedPolicy.adminCapNhat.hoTen : '-'}</div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4 text-green-700">{modalType === 'create' ? 'Thêm chính sách' : 'Cập nhật chính sách'}</h2>
                <div className="mb-4">
                  <label className="block font-semibold mb-1">Tiêu đề:</label>
                  <input
                    type="text"
                    name="tieuDe"
                    className="w-full border rounded p-2"
                    value={form.tieuDe}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <label className="block font-semibold mb-1">Nội dung:</label>
                  <textarea
                    name="noiDung"
                    className="w-full border rounded p-2"
                    rows={6}
                    value={form.noiDung}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg border bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >Hủy</button>
                  <button
                    onClick={modalType === 'create' ? handleCreate : handleUpdate}
                    className="px-4 py-2 rounded-lg border bg-green-500 text-white font-semibold hover:bg-green-600"
                  >{modalType === 'create' ? 'Tạo mới' : 'Cập nhật'}</button>
                </div>
              </>
            )}
            {error && <div className="text-red-500 mt-2">{error}</div>}
            {success && <div className="text-green-600 mt-2">{success}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyManagement; 