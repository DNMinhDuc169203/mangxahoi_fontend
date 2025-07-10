import React, { useEffect, useState } from 'react';
import {
  fetchPosts,
  hidePost,
  deletePost,
  restorePost
} from '../services/postService';

const statusOptions = [
  { value: '', label: 'Trạng thái' },
  { value: 'binh_thuong', label: 'Bình thường' },
  { value: 'an', label: 'Đã ẩn' },
];
const typeOptions = [
  { value: '', label: 'Loại' },
  { value: 'thong_thuong', label: 'Thông thường' },
  { value: 'hashtag', label: 'Hashtag' },
];
const sensitiveOptions = [
  { value: '', label: 'Nhạy cảm' },
  { value: 'true', label: 'Có' },
  { value: 'false', label: 'Không' },
];

const ADMIN_ID = 1; // TODO: Lấy từ context hoặc auth thực tế
const PAGE_SIZE = 10;

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    keyword: '',
    hashtag: '',
    trangThai: '',
    loai: '',
    sensitive: '',
  });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        keyword: filters.keyword || undefined,
        trangThai: filters.trangThai || undefined,
        loai: filters.loai || undefined,
        sensitive: filters.sensitive !== '' ? filters.sensitive : undefined,
        page,
        size: PAGE_SIZE,
      };
      if (filters.hashtag.trim() !== '') {
        params.hashtag = filters.hashtag.startsWith('#') ? filters.hashtag.slice(1) : filters.hashtag;
      }
      const res = await fetchPosts(params);
      setPosts(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setPosts([]);
      setTotalPages(1);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [filters, page]);

  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(0);
  };

  const handleAction = async (postId, action) => {
    setLoading(true);
    try {
      if (action === 'hide') await hidePost(postId, ADMIN_ID, 'Vi phạm chính sách');
      if (action === 'delete') await deletePost(postId, ADMIN_ID, 'Vi phạm nghiêm trọng');
      if (action === 'restore') await restorePost(postId, ADMIN_ID);
      fetchData();
    } catch (err) {}
    setLoading(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) setPage(newPage);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Quản lý bài đăng</h1>
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <input
            name="keyword"
            value={filters.keyword}
            onChange={handleInputChange}
            placeholder="Tìm kiếm theo nội dung..."
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition w-56"
          />
          <input
            name="hashtag"
            value={filters.hashtag}
            onChange={handleInputChange}
            placeholder="Hashtag..."
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition w-40"
          />
          <select
            name="trangThai"
            value={filters.trangThai}
            onChange={handleInputChange}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            name="loai"
            value={filters.loai}
            onChange={handleInputChange}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          >
            {typeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            name="sensitive"
            value={filters.sensitive}
            onChange={handleInputChange}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          >
            {sensitiveOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-base">
                <th className="py-3 px-4 font-semibold text-center">ID</th>
                <th className="py-3 px-4 font-semibold text-center">User</th>
                <th className="py-3 px-4 font-semibold text-center">Nội dung</th>
                <th className="py-3 px-4 font-semibold text-center">Hashtag</th>
                <th className="py-3 px-4 font-semibold text-center">Trạng thái</th>
                <th className="py-3 px-4 font-semibold text-center">Nhạy cảm</th>
                <th className="py-3 px-4 font-semibold text-center">Ngày đăng</th>
                <th className="py-3 px-4 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-6 text-gray-500">Đang tải...</td></tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-400">Chưa có dữ liệu</td>
                </tr>
              ) : posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50 transition">
                  <td className="py-2 px-4 text-center">{post.id}</td>
                  <td className="py-2 px-4 text-center">{post.hoTenNguoiDung || post.userName || post.user?.name || 'Ẩn danh'}</td>
                  <td className="py-2 px-4 max-w-xs truncate" title={post.noiDung || post.content}>{post.noiDung || post.content}</td>
                  <td className="py-2 px-4 text-center">{post.hashtags?.map(h => h.startsWith('#') ? h : `#${h}`).join(', ')}</td>
                  <td className="py-2 px-4 text-center">{post.biAn ? <span className="text-yellow-600 font-semibold">Đã ẩn</span> : <span className="text-green-700 font-semibold">Bình thường</span>}</td>
                  <td className="py-2 px-4 text-center">{post.sensitive ? <span className="text-red-500 font-semibold">Có</span> : <span className="text-gray-700">Không</span>}</td>
                  <td className="py-2 px-4 text-center">{post.ngayTao ? new Date(post.ngayTao).toLocaleString() : ''}</td>
                  <td className="py-2 px-4 text-center flex justify-center gap-2">
                    {!post.biAn && (
                      <button
                        onClick={() => handleAction(post.id, 'hide')}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 font-semibold border border-yellow-300 shadow-sm hover:bg-yellow-100 transition"
                        title="Ẩn bài viết"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-4s2.25-3.25 6.16-4.47m3.72-.53A3 3 0 1112 7a3 3 0 013 3c0 .512-.13.995-.36 1.41" /></svg>
                        Ẩn
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(post.id, 'delete')}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-700 font-semibold border border-red-200 shadow-sm hover:bg-red-100 transition"
                      title="Xóa bài viết"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      Xóa
                    </button>
                    {post.biAn && (
                      <button
                        onClick={() => handleAction(post.id, 'restore')}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 font-semibold border border-green-200 shadow-sm hover:bg-green-100 transition"
                        title="Khôi phục bài viết"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h3m4 4v1a3 3 0 01-3 3H7a3 3 0 01-3-3V7a3 3 0 013-3h5" /></svg>
                        Khôi phục
                      </button>
                    )}
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
    </div>
  );
};

export default PostManagement; 