import React, { useEffect, useState } from 'react';
import {
  getTrendingHashtags,
  promoteHashtag,
  unpromoteHashtag,
  getPostsByHashtag
} from '../services/XuHuongService';

const TrendManagement = () => {
  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, hashtag: null });
  const [promoteModal, setPromoteModal] = useState({ open: false, hashtag: null });
  const [moTaUuTien, setMoTaUuTien] = useState('');
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState('');

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(hashtags.length / PAGE_SIZE);
  const pagedHashtags = hashtags.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getTrendingHashtags();
      setHashtags(data);
    } catch (e) {
      setError('Lỗi tải trending hashtag!');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Tự động reload mỗi 2 phút
    const interval = setInterval(() => {
      fetchData();
    }, 10000); //10 giây

    return () => clearInterval(interval);
  }, []);

  const handlePromote = (hashtag) => {
    setPromoteModal({ open: true, hashtag });
    setMoTaUuTien(hashtag.moTaUuTien || '');
  };

  const handlePromoteSubmit = async () => {
    try {
      await promoteHashtag(promoteModal.hashtag.id, moTaUuTien);
      setPromoteModal({ open: false, hashtag: null });
      setMoTaUuTien('');
      fetchData();
    } catch (e) {
      setError('Ưu tiên hashtag thất bại!');
    }
  };

  const handleUnpromote = async (hashtag) => {
    try {
      await unpromoteHashtag(hashtag.id);
      fetchData();
    } catch (e) {
      setError('Hủy ưu tiên hashtag thất bại!');
    }
  };

  const handleViewPosts = async (hashtag) => {
    setModal({ open: true, hashtag });
    setPostsLoading(true);
    try {
      const data = await getPostsByHashtag(hashtag.id);
      setPosts(data);
    } catch (e) {
      setPosts([]);
    }
    setPostsLoading(false);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Quản lý xu hướng (Trending Hashtag)</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-base">
                <th className="py-3 px-4 font-semibold text-center">#</th>
                <th className="py-3 px-4 font-semibold text-center">Hashtag</th>
                <th className="py-3 px-4 font-semibold text-center">Số lần sử dụng</th>
                <th className="py-3 px-4 font-semibold text-center">Ưu tiên</th>
                <th className="py-3 px-4 font-semibold text-center">Thời gian ưu tiên</th>
                <th className="py-3 px-4 font-semibold text-center">Mô tả ưu tiên</th>
                <th className="py-3 px-4 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-6 text-gray-500">Đang tải...</td></tr>
              ) : pagedHashtags.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-6 text-gray-400">Chưa có dữ liệu</td></tr>
              ) : pagedHashtags.map((h, idx) => (
                <tr key={h.id} className={h.uuTien ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4 text-center">{idx + 1 + page * PAGE_SIZE}</td>
                  <td className="py-2 px-4 text-center font-semibold">{h.ten}</td>
                  <td className="py-2 px-4 text-center">{h.soLanSuDung}</td>
                  <td className="py-2 px-4 text-center">
                    {h.uuTien ? <span className="text-green-600 font-bold">Đang ưu tiên</span> : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {h.uuTien && h.thoiGianUuTienKetThuc ? (
                      <span>
                        Đến {new Date(h.thoiGianUuTienKetThuc).toLocaleString()}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="py-2 px-4 text-center">{h.moTaUuTien || '-'}</td>
                  <td className="py-2 px-4 text-center flex gap-2 justify-center">
                    <button
                      onClick={() => handleViewPosts(h)}
                      className="px-3 py-1 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-sm hover:bg-blue-100 transition"
                    >Xem bài viết</button>
                    {h.uuTien ? (
                      <button
                        onClick={() => handleUnpromote(h)}
                        className="px-3 py-1 rounded bg-red-50 text-red-700 font-semibold border border-red-200 shadow-sm hover:bg-red-100 transition"
                      >Hủy ưu tiên</button>
                    ) : (
                      <button
                        onClick={() => handlePromote(h)}
                        className="px-3 py-1 rounded bg-green-50 text-green-700 font-semibold border border-green-200 shadow-sm hover:bg-green-100 transition"
                      >Ưu tiên</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex justify-center items-center gap-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-gray-500 hover:bg-gray-200 transition ${page === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-600'}`}
            title="Trang trước"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-gray-700 font-medium">Trang {page + 1} / {totalPages}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page + 1 >= totalPages}
            className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-gray-500 hover:bg-gray-200 transition ${(page + 1 >= totalPages) ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-600'}`}
            title="Trang sau"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
      {/* Modal xem bài viết */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl relative animate-fadeIn">
            <button onClick={() => setModal({ open: false, hashtag: null })} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
            <h2 className="text-2xl font-bold mb-4 text-blue-700">Bài viết với {modal.hashtag.ten}</h2>
            {postsLoading ? <div>Đang tải...</div> : posts.length === 0 ? <div>Không có bài viết.</div> : (
              <ul className="space-y-3 max-h-96 overflow-y-auto">
                {posts.map(post => (
                  <li key={post.id} className="border-b pb-2">
                    <div className="font-semibold">ID: {post.id}</div>
                    <div className="text-gray-700">{post.noiDung}</div>
                    <div className="text-gray-400 text-xs">Ngày tạo: {post.ngayTao ? new Date(post.ngayTao).toLocaleString() : ''}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {/* Modal ưu tiên hashtag */}
      {promoteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative animate-fadeIn">
            <button onClick={() => setPromoteModal({ open: false, hashtag: null })} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
            <h2 className="text-2xl font-bold mb-4 text-green-700">Ưu tiên hashtag {promoteModal.hashtag.ten}</h2>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Mô tả ưu tiên (tùy chọn):</label>
              <textarea
                className="w-full border rounded p-2"
                rows={3}
                value={moTaUuTien}
                onChange={e => setMoTaUuTien(e.target.value)}
                placeholder="Ví dụ: Hashtag tích cực, khuyến khích nội dung tốt..."
              />
            </div>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setPromoteModal({ open: false, hashtag: null })}
                className="px-4 py-2 rounded-lg border bg-gray-100 text-gray-600 hover:bg-gray-200"
              >Hủy</button>
              <button
                onClick={handlePromoteSubmit}
                className="px-4 py-2 rounded-lg border bg-green-500 text-white font-semibold hover:bg-green-600"
              >Ưu tiên</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendManagement; 