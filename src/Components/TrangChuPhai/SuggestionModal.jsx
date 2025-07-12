import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MutualFriendsModal from './MutualFriendsModal';

const SuggestionModal = ({ isOpen, onClose, onUpdate }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingRequests, setSendingRequests] = useState(new Set());
  const [showMutualFriends, setShowMutualFriends] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchAllSuggestions();
    }
  }, [isOpen]);

  const fetchAllSuggestions = async () => {
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

  const handleSendFriendRequest = async (userId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSendingRequests(prev => new Set(prev).add(userId));
    
    try {
      await axios.post(
        `http://localhost:8080/network/api/ket-ban/loi-moi/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Cập nhật danh sách để loại bỏ người dùng đã gửi lời mời
      setSuggestions(prev => prev.filter(s => s.nguoiTrongGoiY.id !== userId));
      
      // Gọi callback để cập nhật danh sách chính
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error("Lỗi khi gửi lời mời kết bạn:", err);
      alert("Có lỗi xảy ra khi gửi lời mời kết bạn");
    } finally {
      setSendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleShowMutualFriends = (user) => {
    setSelectedUser(user);
    setShowMutualFriends(true);
  };

  const getMutualFriendsText = (suggestion) => {
    if (!suggestion.lyDoGoiY) return "0 bạn chung";
    
    try {
      const lyDo = JSON.parse(suggestion.lyDoGoiY);
      const banChung = lyDo.ban_chung || 0;
      
      if (banChung === 0) return "Không có bạn chung";
      if (banChung === 1) return "1 bạn chung";
      return `${banChung} bạn chung`;
    } catch (e) {
      return "0 bạn chung";
    }
  };

  const getMutualFriendsCount = (suggestion) => {
    if (!suggestion.lyDoGoiY) return 0;
    
    try {
      const lyDo = JSON.parse(suggestion.lyDoGoiY);
      return lyDo.ban_chung || 0;
    } catch (e) {
      return 0;
    }
  };

  const getSuggestionReason = (suggestion) => {
    if (!suggestion.lyDoGoiY) return "";
    
    try {
      const lyDo = JSON.parse(suggestion.lyDoGoiY);
      const reasons = [];
      
      if (lyDo.ban_chung > 0) {
        reasons.push(`${lyDo.ban_chung} bạn chung`);
      }
      if (lyDo.diem_tuong_tac > 0) {
        reasons.push("Tương tác chung");
      }
      if (lyDo.cung_dia_chi) {
        reasons.push("Cùng địa chỉ");
      }
      
      return reasons.join(", ");
    } catch (e) {
      return "";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Đề xuất kết bạn</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              Đang tải gợi ý...
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-4">
              {suggestions.map((suggestion) => {
                const mutualFriendsCount = getMutualFriendsCount(suggestion);
                return (
                  <div key={suggestion.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center flex-1">
                      <img
                        className="w-12 h-12 rounded-full object-cover"
                        src={suggestion?.nguoiTrongGoiY?.anhDaiDien || "/anhbandau.jpg"}
                        alt={suggestion?.nguoiTrongGoiY?.hoTen || "User"}
                      />
                      <div className="ml-4 flex-1">
                        <p className="font-semibold text-gray-900">
                          {suggestion?.nguoiTrongGoiY?.hoTen || "Username"}
                        </p>
                        <button
                          onClick={() => mutualFriendsCount > 0 && handleShowMutualFriends(suggestion.nguoiTrongGoiY)}
                          className={`text-sm ${
                            mutualFriendsCount > 0 
                              ? 'text-blue-600 hover:text-blue-800 cursor-pointer underline' 
                              : 'text-gray-600 cursor-default'
                          }`}
                        >
                          {getMutualFriendsText(suggestion)}
                        </button>
                        {getSuggestionReason(suggestion) && (
                          <p className="text-xs text-gray-500 mt-1">
                            {getSuggestionReason(suggestion)}
                          </p>
                        )}
                        {suggestion.diemGoiY && (
                          <p className="text-xs text-blue-600 mt-1">
                            Điểm gợi ý: {suggestion.diemGoiY}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendFriendRequest(suggestion.nguoiTrongGoiY.id)}
                      disabled={sendingRequests.has(suggestion.nguoiTrongGoiY.id)}
                      className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                        sendingRequests.has(suggestion.nguoiTrongGoiY.id)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {sendingRequests.has(suggestion.nguoiTrongGoiY.id) ? 'Đang gửi...' : 'Kết bạn'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">🤔</div>
              <p className="text-lg font-medium mb-2">Không có gợi ý kết bạn nào</p>
              <p className="text-sm">Hãy thử tương tác nhiều hơn để nhận được gợi ý phù hợp</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal hiển thị bạn bè chung */}
      <MutualFriendsModal
        isOpen={showMutualFriends}
        onClose={() => setShowMutualFriends(false)}
        targetUserId={selectedUser?.id}
        targetUserName={selectedUser?.hoTen}
      />
    </>
  );
};

export default SuggestionModal;