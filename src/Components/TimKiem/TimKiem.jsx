import React, { useState, useEffect } from "react";
import "./TimKiem.css";
import SearchUserCard from "./TimKiemNguoiDung";
import axios from "axios";

const SearchComponents = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) {
      setUsers([]);
      setError(null);
      return;
    }
    const delayDebounce = setTimeout(() => {
      setLoading(true);
      setError(null);
      axios
        .get(`http://localhost:8080/network/api/nguoi-dung/tim-kiem?tuKhoa=${encodeURIComponent(query)}`)
        .then((res) => {
          setUsers(res.data.content || []);
        })
        .catch(() => setError("Không thể tìm kiếm người dùng."))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="searchcontainer">
      <div className="px-3 pb-5">
        <h1 className="text-xl pb-5">Search</h1>
        <input
          className="searchInput"
          type="text"
          placeholder="Search..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>
      <hr />
      <div className="px-3 py-5">
        {loading ? (
          <div>Đang tìm kiếm...</div>
        ) : error ? (
          <div>{error}</div>
        ) : users.length === 0 && query ? (
          <div>Không tìm thấy người dùng nào.</div>
        ) : (
          users.map(user => <SearchUserCard key={user.id} user={user} />)
        )}
      </div>
    </div>
  );
};

export default SearchComponents;
