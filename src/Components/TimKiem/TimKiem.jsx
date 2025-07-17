import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MAX_HISTORY = 10;

const SearchComponents = ({ setIsSearchVisible }) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  // Load history from localStorage
  useEffect(() => {
    const h = JSON.parse(localStorage.getItem("search_history") || "[]");
    setHistory(h);
  }, []);

  // Save history to localStorage
  const saveHistory = (item) => {
    let h = JSON.parse(localStorage.getItem("search_history") || "[]");
    // Xóa trùng
    h = h.filter((i) => i.id !== item.id);
    h.unshift(item);
    if (h.length > MAX_HISTORY) h = h.slice(0, MAX_HISTORY);
    setHistory(h);
    localStorage.setItem("search_history", JSON.stringify(h));
  };

  // Xóa 1 dòng lịch sử
  const removeHistory = (id) => {
    let h = history.filter((i) => i.id !== id);
    setHistory(h);
    localStorage.setItem("search_history", JSON.stringify(h));
  };

  // Xóa tất cả lịch sử
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("search_history");
  };

  useEffect(() => {
    if (!query) {
      setUsers([]);
      setError(null);
      return;
    }
    const delayDebounce = setTimeout(() => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token"); // hoặc "accessToken" nếu bạn lưu tên khác
      axios
        .get(
          `http://localhost:8080/network/api/nguoi-dung/tim-kiem?tuKhoa=${encodeURIComponent(query)}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }
        )
        .then((res) => {
          setUsers(res.data.content || []);
        })
        .catch(() => setError("Không thể tìm kiếm người dùng."))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsSearchVisible && setIsSearchVisible(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchVisible]);

  // Click vào user hoặc lịch sử
  const handleSelectUser = async (user) => {
    const token = localStorage.getItem("token");
    try {
      // Kiểm tra quyền truy cập profile
      await axios.get(
        `http://localhost:8080/network/api/nguoi-dung/${user.id}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      // Nếu thành công, cho phép truy cập profile
      saveHistory({
        id: user.id,
        hoTen: user.hoTen,
        anhDaiDien: user.anhDaiDien || "/anhbandau.jpg",
      });
      setIsSearchVisible && setIsSearchVisible(false);
      navigate(`/profile/${user.id}`);
    } catch (err) {
      // Nếu bị chặn hoặc không truy cập được
      removeHistory(user.id);
      alert("Bạn không thể xem thông tin người này.");
    }
  };

  return (
    <div style={{
      borderRadius: '32px 0 0 32px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      padding: 0,
      background: 'white',
      height: '100vh',
      width: 400,
      position: 'fixed',
      left: 88, // Để không che sidebar (sidebar ~88px)
      top: 0,
      zIndex: 30,
      border: 'none', // Loại bỏ viền đen
      overflow: 'hidden',
      transition: 'all 0.2s',
    }}>
      <div style={{ padding: 24, borderBottom: '1px solid #eee', fontWeight: 600, fontSize: 24 }}>Tìm kiếm</div>
      <div style={{ padding: 24, paddingBottom: 0 }}>
        <input
          className="searchInput"
          type="text"
          placeholder="Tìm kiếm..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #eee', outline: 'none', fontSize: 16, background: '#fafafa', marginBottom: 16 }}
        />
      </div>
      <hr />
      <div style={{ padding: 24, paddingTop: 12, height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
        {!query && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 600, fontSize: 18 }}>Mới đây</span>
              {history.length > 0 && <span onClick={clearHistory} style={{ color: '#0095f6', cursor: 'pointer', fontSize: 14 }}>Xóa tất cả</span>}
            </div>
            {history.length === 0 && <div style={{ color: '#888', fontSize: 15 }}>Không có lịch sử tìm kiếm.</div>}
            {history.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 16, cursor: 'pointer' }}>
                <img src={item.anhDaiDien || "/anhbandau.jpg"} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', marginRight: 12 }} />
                <span style={{ flex: 1, fontWeight: 500, fontSize: 16 }} onClick={() => handleSelectUser(item)}>{item.hoTen}</span>
                <span onClick={() => removeHistory(item.id)} style={{ color: '#888', fontSize: 22, marginLeft: 8, cursor: 'pointer' }}>&times;</span>
              </div>
            ))}
          </>
        )}
        {query && (
          <>
            {loading ? (
              <div>Đang tìm kiếm...</div>
            ) : error ? (
              <div>{error}</div>
            ) : users.length === 0 ? (
              <div>Không tìm thấy người dùng nào.</div>
            ) : (
              users.map(user => (
                <div key={user.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 16, cursor: 'pointer' }} onClick={() => handleSelectUser(user)}>
                  <img src={user.anhDaiDien || "/anhbandau.jpg"} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', marginRight: 12 }} />
                  <span style={{ flex: 1, fontWeight: 500, fontSize: 16 }}>{user.hoTen}</span>
                </div>
              ))
            )}
          </>
        )}
      </div>
      {/* Nút đóng search */}
      {setIsSearchVisible && (
        <button style={{position:'absolute',top:18,right:18,fontSize:24,background:'none',border:'none',cursor:'pointer'}} onClick={()=>setIsSearchVisible(false)}>&times;</button>
      )}
    </div>
  );
};

export default SearchComponents;
