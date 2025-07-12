import React, { useEffect, useState } from "react";
import SuggetionCard from "./SuggetionCard";
import SuggestionModal from "./SuggestionModal";
import axios from "axios";

const HomeRight = () => {
  const [user, setUser] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        "http://localhost:8080/network/api/nguoi-dung/thong-tin-hien-tai",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(res.data);
    } catch (err) {
      setUser(null);
    }
  };

  const fetchSuggestions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:8080/network/api/nguoi-dung/goi-y-ket-ban",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuggestions(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy gợi ý kết bạn:", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleSuggestionUpdate = () => {
    // Cập nhật lại danh sách gợi ý khi có thay đổi
    fetchSuggestions();
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      {/* User Profile Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <img
            className="w-12 h-12 rounded-full object-cover"
            src={user?.anhDaiDien || "/anhbandau.jpg"}
            alt={user?.hoTen || "User"}
          />
          <div className="ml-3">
            <p className="font-semibold text-gray-900">{user?.hoTen || "Fullname"}</p>
            <p className="text-sm text-gray-500">{user?.email || "email@example.com"}</p>
          </div>
        </div>
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          Chuyển đổi
        </button>
      </div>
      
      {/* Suggestions Section */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Đề xuất cho bạn</h3>
          {suggestions.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Xem tất cả
            </button>
          )}
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Đang tải gợi ý...</p>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.slice(0, 4).map((suggestion, idx) => (
              <SuggetionCard 
                key={suggestion.id || idx} 
                suggestion={suggestion} 
                onUpdate={handleSuggestionUpdate}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">🤔</div>
              <p className="text-sm text-gray-500 mb-1">Không có gợi ý nào</p>
              <p className="text-xs text-gray-400">Hãy thử tương tác nhiều hơn</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <SuggestionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onUpdate={handleSuggestionUpdate}
      />
    </div>
  );
};

export default HomeRight;
