import React, { useState, useEffect } from 'react'
import axios from 'axios'
import MutualFriendsModal from './MutualFriendsModal'
import { useNavigate } from "react-router-dom";

const SuggetionCard = ({ suggestion, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(!!suggestion.daGuiLoiMoi)
  const [showMutualFriends, setShowMutualFriends] = useState(false)
  const [friendRequestId, setFriendRequestId] = useState(suggestion.idLoiMoi || null);
  const navigate = useNavigate();
  const [mutualCount, setMutualCount] = useState(null);

  useEffect(() => {
    if (suggestion?.nguoiTrongGoiY?.id) {
      fetchMutualCount(suggestion.nguoiTrongGoiY.id);
    }
  }, [suggestion?.nguoiTrongGoiY?.id]);

  const fetchMutualCount = async (targetUserId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(
        `http://localhost:8080/network/api/ket-ban/dem/ban-be-chung/${targetUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMutualCount(res.data.count);
    } catch (err) {
      setMutualCount(0);
    }
  };

  const handleSendFriendRequest = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    setIsLoading(true)
    try {
      const res = await axios.post(
        `http://localhost:8080/network/api/ket-ban/loi-moi/${suggestion.nguoiTrongGoiY.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      setIsSent(true)
      setFriendRequestId(res.data.idLoiMoi || res.data.id || null); // Lưu lại id lời mời nếu backend trả về
      // KHÔNG gọi onUpdate ở đây để giữ trạng thái local
      // if (onUpdate) {
      //   onUpdate()
      // }
    } catch (err) {
      console.error("Lỗi khi gửi lời mời kết bạn:", err)
      alert("Có lỗi xảy ra khi gửi lời mời kết bạn")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelFriendRequest = async () => {
    const token = localStorage.getItem("token");
    if (!token || !friendRequestId) return;
    setIsLoading(true);
    try {
      await axios.delete(
        `http://localhost:8080/network/api/ket-ban/huy-loi-moi/${friendRequestId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsSent(false);
      setFriendRequestId(null);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert("Có lỗi xảy ra khi hủy lời mời");
    } finally {
      setIsLoading(false);
    }
  };

  const getMutualFriendsText = () => {
    if (!suggestion.lyDoGoiY) return "0 bạn chung"
    
    try {
      const lyDo = JSON.parse(suggestion.lyDoGoiY)
      const banChung = lyDo.ban_chung || 0
      
      if (banChung === 0) return "0 có bạn chung"
      if (banChung === 1) return "1 bạn chung"
      return `${banChung} bạn chung`
    } catch (e) {
      return "0 bạn chung"
    }
  }

  const getMutualFriendsCount = () => {
    if (!suggestion.lyDoGoiY) return 0
    
    try {
      const lyDo = JSON.parse(suggestion.lyDoGoiY)
      return lyDo.ban_chung || 0
    } catch (e) {
      return 0
    }
  }

  const getSuggestionReason = () => {
    if (!suggestion.lyDoGoiY) return ""
    
    try {
      const lyDo = JSON.parse(suggestion.lyDoGoiY)
      const reasons = []
      
      if (lyDo.ban_chung > 0) {
        reasons.push(`${lyDo.ban_chung} bạn chung`)
      }
      if (lyDo.diem_tuong_tac > 0) {
        reasons.push("Tương tác chung")
      }
      if (lyDo.cung_dia_chi) {
        reasons.push("Cùng địa chỉ")
      }
      
      return reasons.join(", ")
    } catch (e) {
      return ""
    }
  }

  const mutualFriendsCount = getMutualFriendsCount()

  return (
    <>
      <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
        <div className='flex justify-between items-center'>
          <div className='flex items-center'>
            <img 
              className='w-10 h-10 rounded-full object-cover cursor-pointer' 
              src={suggestion?.nguoiTrongGoiY?.anhDaiDien || "/anhbandau.jpg"} 
              alt={suggestion?.nguoiTrongGoiY?.hoTen || "User"} 
              onClick={() => suggestion?.nguoiTrongGoiY?.id && navigate(`/profile/${suggestion.nguoiTrongGoiY.id}`)}
            />
            <div className='ml-3'>
              <p className='text-sm font-semibold text-gray-900 cursor-pointer'
                onClick={() => suggestion?.nguoiTrongGoiY?.id && navigate(`/profile/${suggestion.nguoiTrongGoiY.id}`)}
              >
                {suggestion?.nguoiTrongGoiY?.hoTen || "Username"}
              </p>
              <p className='text-xs text-gray-500 cursor-pointer'
                onClick={() => suggestion?.nguoiTrongGoiY?.id && navigate(`/profile/${suggestion.nguoiTrongGoiY.id}`)}
              >
                {suggestion?.nguoiTrongGoiY?.email}
              </p>
              <p className='text-xs mt-1'>
                <span
                  className={
                    mutualCount > 0
                      ? 'text-blue-600 underline cursor-pointer hover:text-blue-800'
                      : 'text-gray-400'
                  }
                  onClick={() => {
                    if (mutualCount > 0) setShowMutualFriends(true);
                  }}
                  title={mutualCount > 0 ? 'Xem danh sách bạn chung' : ''}
                >
                  {mutualCount === null
                    ? "Đang tải bạn chung..."
                    : mutualCount === 0
                      ? "0 có bạn chung"
                      : mutualCount === 1
                        ? "1 bạn chung"
                        : `${mutualCount} bạn chung`
                  }
                </span>
              </p>
              {getSuggestionReason() && (
                <p className='text-xs text-gray-500 mt-1'>
                  {getSuggestionReason()}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end">
            {isSent ? (
              <button
                onClick={handleCancelFriendRequest}
                disabled={isLoading}
                className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${
                  isLoading 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isLoading ? 'Đang hủy...' : 'Hủy lời mời'}
              </button>
            ) : (
              <button
                onClick={handleSendFriendRequest}
                disabled={isLoading}
                className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${
                  isLoading 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoading ? 'Đang gửi...' : 'Kết bạn'}
              </button>
            )}
            {/* {suggestion.diemGoiY && (
              <span className="text-xs text-gray-400 mt-1">
                Điểm: {suggestion.diemGoiY}
              </span>
            )} */}
          </div>
        </div>
      </div>

      {/* Modal hiển thị bạn bè chung */}
      <MutualFriendsModal
        isOpen={showMutualFriends}
        onClose={() => setShowMutualFriends(false)}
        targetUserId={suggestion?.nguoiTrongGoiY?.id}
        targetUserName={suggestion?.nguoiTrongGoiY?.hoTen}
      />
    </>
  )
}

export default SuggetionCard