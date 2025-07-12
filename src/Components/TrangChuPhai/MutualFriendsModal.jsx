import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MutualFriendsModal = ({ isOpen, onClose, targetUserId, targetUserName }) => {
  const [mutualFriends, setMutualFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && targetUserId) {
      fetchMutualFriends();
    }
  }, [isOpen, targetUserId]);

  const fetchMutualFriends = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.get(
        `http://localhost:8080/network/api/ket-ban/thong-tin-ban-be-chung/${targetUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMutualFriends(res.data.danhSachBanBeChung || []);
    } catch (err) {
      console.error("Lỗi khi lấy thông tin bạn bè chung:", err);
      setError("Không thể tải thông tin bạn bè chung");
      setMutualFriends([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Bạn bè chung với {targetUserName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Đang tải...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 text-4xl mb-2">⚠️</div>
            <p className="text-red-600 font-medium mb-2">Có lỗi xảy ra</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        ) : mutualFriends.length > 0 ? (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              {mutualFriends.length} bạn bè chung
            </p>
            <div className="space-y-3">
              {mutualFriends.map((friend) => (
                <div key={friend.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                  <img
                    className="w-10 h-10 rounded-full object-cover"
                    src={friend.anhDaiDien || "/anhbandau.jpg"}
                    alt={friend.hoTen || "User"}
                  />
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-gray-900">
                      {friend.hoTen || "Username"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {friend.email || "email@example.com"}
                    </p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Xem trang
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">👥</div>
            <p className="text-lg font-medium mb-2">Không có bạn bè chung</p>
            <p className="text-sm text-gray-500">
              Bạn và {targetUserName} chưa có bạn bè chung nào
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MutualFriendsModal; 