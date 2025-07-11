import React, { useEffect, useState } from 'react';
import { fetchReports } from '../services/BaoCaoService';

const statusOptions = [
  { value: '', label: 'Trạng thái' },
  { value: 'cho_xu_ly', label: 'Chờ xử lý' },
  { value: 'da_xu_ly', label: 'Đã xử lý' },
  { value: 'tu_choi', label: 'Từ chối' },
];
const PAGE_SIZE = 10;

const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        trangThai: status || undefined,
        page,
        size: PAGE_SIZE,
      };
      const res = await fetchReports(params);
      setReports(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setReports([]);
      setTotalPages(1);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [status, page]);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(0);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) setPage(newPage);
  };

  const openModal = (report) => {
    setSelectedReport(report);
    setShowModal(true);
    setError('');
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedReport(null);
    setError('');
  };

  // Gọi API cập nhật trạng thái báo cáo
  const handleUpdateStatus = async (trangThai) => {
    if (!selectedReport) return;
    setUpdating(true);
    setError('');
    try {
      // Gọi API cập nhật trạng thái
      await fetch(`http://localhost:8080/network/api/admin/bao-cao/${selectedReport.id}/xu-ly`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trangThai }),
      });
      closeModal();
      fetchData();
    } catch (err) {
      setError('Cập nhật trạng thái thất bại!');
    }
    setUpdating(false);
  };

  // Thêm hàm map trạng thái
  const getTrangThaiText = (trangThai) => {
    switch (trangThai) {
      case 'cho_xu_ly': return 'Chờ xử lý';
      case 'da_xu_ly': return 'Đã xử lý';
      case 'tu_choi': return 'Từ chối';
      default: return trangThai || '';
    }
  };

  const isFinal = selectedReport && (selectedReport.trangThai === 'da_xu_ly' || selectedReport.trangThai === 'tu_choi');

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Quản lý báo cáo vi phạm</h1>
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <select
            value={status}
            onChange={handleStatusChange}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-base">
                <th className="py-3 px-4 font-semibold text-center">ID</th>
                <th className="py-3 px-4 font-semibold text-center">Người báo cáo</th>
                <th className="py-3 px-4 font-semibold text-center">Người bị báo cáo</th>
                <th className="py-3 px-4 font-semibold text-center">Loại đối tượng</th>
                <th className="py-3 px-4 font-semibold text-center">Nội dung đối tượng</th>
                <th className="py-3 px-4 font-semibold text-center">Loại vi phạm</th>
                <th className="py-3 px-4 font-semibold text-center">Trạng thái</th>
                <th className="py-3 px-4 font-semibold text-center">Ngày gửi</th>
                <th className="py-3 px-4 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-6 text-gray-500">Đang tải...</td></tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-6 text-gray-400">Chưa có dữ liệu</td>
                </tr>
              ) : reports.map(report => (
                <tr key={report.id} className="hover:bg-gray-50 transition">
                  <td className="py-2 px-4 text-center">{report.id}</td>
                  <td className="py-2 px-4 text-center">{report.tenNguoiBaoCao || 'Ẩn danh'}</td>
                  <td className="py-2 px-4 text-center">{report.tenNguoiBiBaoCao || 'Ẩn danh'}</td>
                  <td className="py-2 px-4 text-center">{report.loaiDoiTuongBiBaoCao || ''}</td>
                  <td className="py-2 px-4 text-center">{report.noiDungDoiTuongBiBaoCao || ''}</td>
                  <td className="py-2 px-4 text-center">{report.loaiBaoCao || ''}</td>
                  <td className="py-2 px-4 text-center">{getTrangThaiText(report.trangThai)}</td>
                  <td className="py-2 px-4 text-center">{report.ngayGui ? new Date(report.ngayGui).toLocaleString() : ''}</td>
                  <td className="py-2 px-4 text-center">
                    <button onClick={() => openModal(report)} className="px-3 py-1 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-sm hover:bg-blue-100 transition">Xem</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex justify-center items-center gap-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
            className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-gray-500 hover:bg-gray-200 transition ${page === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-600'}`}
            title="Trang trước"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-gray-700 font-medium">Trang {page + 1} / {totalPages}</span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page + 1 >= totalPages}
            className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-gray-500 hover:bg-gray-200 transition ${(page + 1 >= totalPages) ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-600'}`}
            title="Trang sau"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
      {/* Modal chi tiết báo cáo */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative animate-fadeIn">
            <button onClick={closeModal} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
            <h2 className="text-2xl font-bold mb-4 text-blue-700">Chi tiết báo cáo</h2>
            <div className="space-y-2 text-base">
              <div><span className="font-semibold">ID:</span> {selectedReport.id}</div>
              <div><span className="font-semibold">Người báo cáo:</span> {selectedReport.tenNguoiBaoCao || 'Ẩn danh'}</div>
              <div><span className="font-semibold">Người bị báo cáo:</span> {selectedReport.tenNguoiBiBaoCao || 'Ẩn danh'}</div>
              <div><span className="font-semibold">Loại đối tượng:</span> {selectedReport.loaiDoiTuongBiBaoCao || ''}</div>
              <div><span className="font-semibold">Nội dung đối tượng:</span> {selectedReport.noiDungDoiTuongBiBaoCao || ''}</div>
              <div><span className="font-semibold">Loại vi phạm:</span> {selectedReport.loaiBaoCao || ''}</div>
              <div><span className="font-semibold">Mô tả:</span> {selectedReport.noiDung || ''}</div>
              <div><span className="font-semibold">Trạng thái:</span> {getTrangThaiText(selectedReport.trangThai)}</div>
              <div><span className="font-semibold">Ngày gửi:</span> {selectedReport.ngayGui ? new Date(selectedReport.ngayGui).toLocaleString() : ''}</div>
            </div>
            {error && <div className="text-red-500 mt-2">{error}</div>}
            <div className="flex gap-4 mt-6 justify-end">
              <button
                onClick={() => handleUpdateStatus('tu_choi')}
                disabled={updating || isFinal}
                className={`px-4 py-2 rounded-lg font-semibold border transition ${isFinal ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100'}`}
              >
                Từ chối
              </button>
              <button
                onClick={() => handleUpdateStatus('da_xu_ly')}
                disabled={updating || isFinal}
                className={`px-4 py-2 rounded-lg font-semibold border transition ${isFinal ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'}`}
              >
                Xử lý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagement; 