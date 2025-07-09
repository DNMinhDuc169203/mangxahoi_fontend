import React, { useState, useRef, useEffect } from "react";
import "./TinNhan.css";
import { BsEmojiSmile } from "react-icons/bs";
import { BiImageAlt } from "react-icons/bi";
import {
  guiTinNhan,
  timKiemTinNhan,
  taoCuocTroChuyen,
  uploadTinNhanFile,
  getDanhSachCuocTroChuyen,
  markMessagesAsRead
} from "../../services/tinNhanService";
import axios from "axios";

// Thêm hàm formatTimeAgo
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = (now - date) / 1000; // giây

  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;

  // Hôm nay
  if (date.toDateString() === now.toDateString()) {
    return `Hôm nay ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  }
  // Hôm qua
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Hôm qua ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  }
  // Ngày khác
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth()+1).toString().padStart(2, "0")}/${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

const TinNhan = () => {
  const [conversations, setConversations] = useState([]); // Danh sách cuộc trò chuyện, ban đầu rỗng
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]); // Tin nhắn của cuộc trò chuyện đang chọn
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newChatUser, setNewChatUser] = useState("");
  const [creatingChat, setCreatingChat] = useState(false);
  const [error, setError] = useState("");
  const [friends, setFriends] = useState([]); // Danh sách bạn bè
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const fileInputRef = useRef(null);
  const [userInfo, setUserInfo] = useState({ id: null, hoTen: "", anhDaiDien: "" });
  const [selectedFriendIds, setSelectedFriendIds] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [groupImage, setGroupImage] = useState(null);
  const [groupImagePreview, setGroupImagePreview] = useState(null);

  // Hàm lấy id user hiện tại bằng API
  async function fetchCurrentUserId() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const res = await axios.get("http://localhost:8080/network/api/nguoi-dung/thong-tin-hien-tai", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.id; // hoặc res.data.userId, tuỳ backend
    } catch {
      return null;
    }
  }

  // Khi mở modal tạo chat mới, load danh sách bạn bè
  useEffect(() => {
    if (!showNewMessageModal) return;
    const fetchFriends = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8080/network/api/ket-ban/danh-sach/ban-be", {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Friends API result:", res.data);
        setFriends(Array.isArray(res.data.content) ? res.data.content : []);
      } catch (err) {
        setFriends([]);
      }
    };
    fetchFriends();
  }, [showNewMessageModal]);

  // Khi chọn cuộc trò chuyện, lấy tin nhắn
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedId) return;
      setMessages([]);
      setError("");
      try {
        const data = await timKiemTinNhan({
          idCuocTroChuyen: selectedId,
          tuKhoa: "",
          trang: 0,
          kichThuoc: 50,
        });
        setMessages(data);
      } catch (err) {
        setError("Không thể tải tin nhắn");
      }
    };
    fetchMessages();
  }, [selectedId]);

  // Lấy thông tin user hiện tại khi load component
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8080/network/api/nguoi-dung/thong-tin-hien-tai", {
          headers: { Authorization: `Bearer ${token}` }
        });
        let avatar = "./anhbandau.jpg";
        if (res.data.anhDaiDien) {
          avatar = res.data.anhDaiDien;
        } else if (res.data.avatar) {
          avatar = res.data.avatar;
        }
        setUserInfo({
          id: res.data.id,
          hoTen: res.data.hoTen || res.data.name || "",
          anhDaiDien: avatar
        });
      } catch (err) {
        setUserInfo({ id: null, hoTen: "", anhDaiDien: "./anhbandau.jpg" });
      }
    };
    fetchUserInfo();
  }, []);

  // Khi load component, lấy danh sách cuộc trò chuyện
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getDanhSachCuocTroChuyen();
        setConversations(data || []);
        setSelectedId(null);
      } catch (err) {
        setConversations([]);
        setSelectedId(null);
      }
    };
    fetchConversations();
  }, []);

  // Xử lý gửi tin nhắn
  const handleSend = async () => {
    if (!messageInput.trim() && !file) return;
    setSending(true);
    setError("");
    try {
      let urlTepTin = null;
      if (file) {
        const uploadRes = await uploadTinNhanFile(file);
        urlTepTin = uploadRes.url;
      }
      let loaiTinNhan = "van_ban";
      if (file) {
        console.log("file.type:", file.type);
        if (file.type.startsWith("image/")) loaiTinNhan = "hinh_anh";
        else if (file.type.startsWith("video/")) loaiTinNhan = "video";
        // Nếu muốn hỗ trợ loại khác, cần thêm vào enum backend!
      }
      console.log("Gửi tin nhắn với loaiTinNhan:", loaiTinNhan);
      await guiTinNhan({
        idCuocTroChuyen: selectedId,
        noiDung: messageInput,
        loaiTinNhan,
        urlTepTin: urlTepTin,
      });
      setMessageInput("");
      setFile(null);
      // Reload messages
      const data = await timKiemTinNhan({
        idCuocTroChuyen: selectedId,
        tuKhoa: "",
        trang: 0,
        kichThuoc: 50,
      });
      setMessages(data);
    } catch (err) {
      setError("Gửi tin nhắn thất bại");
    }
    setSending(false);
  };

  // Xử lý chọn file
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      console.log("Chọn file:", files[0]);
      setFile(files[0]);
    }
  };

  // Sửa lại handleCreateChat để luôn truyền cả id của bạn và id bạn bè
  const handleToggleFriend = (id) => {
    setSelectedFriendIds(prev => {
      const newArr = prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id];
      console.log("Đã chọn:", newArr);
      return newArr;
    });
  };

  // Hàm xử lý chọn ảnh nhóm
  const handleGroupImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setGroupImage(e.target.files[0]);
      setGroupImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleCreateChat = async () => {
    const myId = await fetchCurrentUserId();
    const ids = [myId, ...selectedFriendIds];
    console.log("Tạo nhóm với idThanhVien:", ids); 
    if (!myId || selectedFriendIds.length === 0) return;
    setCreatingChat(true);
    setError("");
    try {
      let anhNhomUrl = null;
      if (groupImage) {
        // Sử dụng hàm uploadTinNhanFile đã có
        const uploadRes = await uploadTinNhanFile(groupImage);
        anhNhomUrl = uploadRes.url;
      }
      const res = await taoCuocTroChuyen({
        idThanhVien: ids,
        tenNhom: ids.length > 2 ? groupName : null,
        anhNhom: anhNhomUrl,
      });
      setShowNewMessageModal(false);
      setSelectedFriendIds([]);
      setGroupName("");
      setGroupImage(null);
      setGroupImagePreview(null);
      setSelectedId(res.idCuocTroChuyen);
      setConversations(prev => {
        if (prev.some(c => c.id === res.idCuocTroChuyen)) return prev;
        const isGroup = res.loai === "nhom";
        const newList = [
          ...prev,
          {
            id: res.idCuocTroChuyen,
            loai: res.loai,
            name: isGroup ? res.tenNhom : res.tenDoiPhuong || "Người dùng",
            avatar: isGroup ? res.anhNhom : res.anhDaiDienDoiPhuong || "./anhbandau.jpg",
            tenNhom: res.tenNhom,
            anhNhom: res.anhNhom,
            tenDoiPhuong: res.tenDoiPhuong,
            anhDaiDienDoiPhuong: res.anhDaiDienDoiPhuong,
            lastMessage: "",
            time: "",
          }
        ];
        return newList;
      });
    } catch (err) {
      setError("Tạo cuộc trò chuyện thất bại");
    }
    setCreatingChat(false);
  };

  const selectedConv = conversations.find(c => (c.idCuocTroChuyen || c.id) === selectedId);
  const isGroup = selectedConv?.loai === "nhom";

  useEffect(() => {
    if (selectedId && userInfo.id) {
      markMessagesAsRead(selectedId, userInfo.id);
    }
  }, [selectedId, userInfo.id]);

  return (
    <div className="messenger-main-layout">
      {/* Sidebar chat (danh sách chat) */}
      <div className="messenger-sidebar-chat">
        <div className="messenger-profile">
          <img
            src={userInfo.anhDaiDien}
            alt="Your avatar"
            className="messenger-profile-avatar"
            onError={e => { e.target.onerror = null; e.target.src = "./anhbandau.jpg"; }}
          />
          <div className="messenger-profile-name">{userInfo.hoTen || ""}</div>
        </div>
        <div className="messenger-search">
          <input type="text" placeholder="Search" />
        </div>
        <div className="messenger-tabs">
          <span className="active">Messages</span>
          <span>Requests</span>
        </div>
        <div className="messenger-list">
          {conversations.map((conv) => {
            const isGroupItem = conv.loai === "nhom";
            return (
              <div
                key={conv.idCuocTroChuyen || conv.id}
                className={`messenger-item ${selectedId === (conv.idCuocTroChuyen || conv.id) ? "active" : ""}`}
                onClick={() => setSelectedId(conv.idCuocTroChuyen || conv.id)}
              >
                <img
                  src={isGroupItem ? (conv.anhNhom || "./anhbandau.jpg") : (conv.anhDaiDienDoiPhuong || "./anhbandau.jpg")}
                  alt={isGroupItem ? conv.tenNhom : conv.tenDoiPhuong || "avatar"}
                  className="messenger-avatar"
                />
                <div>
                  <div className="messenger-name">{isGroupItem ? conv.tenNhom : conv.tenDoiPhuong || "Người dùng"}</div>
                  <div className="messenger-last">{conv.lastMessage}</div>
                </div>
                <div className="messenger-time">{conv.time}</div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Main chat area */}
      <div className="messenger-main-chat">
        {!selectedId ? (
          <div className="messenger-empty">
            <div className="messenger-empty-title">Your messages</div>
            <div className="messenger-empty-desc">Send a message to start a chat.</div>
            <button className="messenger-btn" onClick={() => setShowNewMessageModal(true)}>
              Send message
            </button>
          </div>
        ) : (
          <div className="messenger-chat">
            <div className="messenger-chat-header">
              <img
                src={isGroup ? (selectedConv?.anhNhom || "./anhbandau.jpg") : (selectedConv?.anhDaiDienDoiPhuong || "./anhbandau.jpg")}
                alt={isGroup ? selectedConv?.tenNhom : selectedConv?.tenDoiPhuong || "avatar"}
                className="messenger-avatar"
              />
              <span>
                {isGroup ? selectedConv?.tenNhom : selectedConv?.tenDoiPhuong || ""}
              </span>
            </div>
            <div className="messenger-chat-body">
              {error && <div style={{ color: "red" }}>{error}</div>}
              {messages.length === 0 ? (
                <div className="messenger-message">Chưa có tin nhắn</div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.idNguoiGui === userInfo.id;
                  // Tìm thông tin người gửi (nếu là nhóm)
                  let senderName = "";
                  let senderAvatar = "./anhbandau.jpg";
                  if (isGroup) {
                    senderName = msg.tenNguoiGui || "Người dùng";
                    senderAvatar = msg.anhNguoiGui || "./anhbandau.jpg";
                  } else {
                    senderAvatar = isMe ? userInfo.anhDaiDien : selectedConv?.anhDaiDienDoiPhuong || "./anhbandau.jpg";
                  }
                  // Xác định có hiển thị thời gian dưới tin nhắn này không
                  let showTime = false;
                  if (idx === messages.length - 1) {
                    showTime = true;
                  } else {
                    const nextMsg = messages[idx + 1];
                    const nextTime = new Date(nextMsg.ngayTao);
                    const currTime = new Date(msg.ngayTao);
                    if ((nextTime - currTime) / 1000 >= 60) { // cách nhau >= 1 phút
                      showTime = true;
                    }
                  }
                  return (
                    <div
                      key={msg.idTinNhan}
                      className={`messenger-message${isMe ? " my-message" : ""}`}
                      style={{ display: "flex", alignItems: "flex-end", gap: 8, position: "relative" }}
                    >
                      {/* Avatar bên trái nếu không phải mình */}
                      {!isMe && (
                        <img
                          src={senderAvatar}
                          alt={senderName}
                          style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", marginRight: 6 }}
                        />
                      )}
                      <div style={{ position: "relative" }}>
                        {/* Nếu là nhóm, hiện tên người gửi */}
                        {isGroup && !isMe && (
                          <div style={{ fontWeight: 500, fontSize: 13, color: "#4267b2", marginBottom: 2 }}>
                            {senderName}
                          </div>
                        )}
                        {/* Nội dung tin nhắn */}
                        {msg.loaiTinNhan === "hinh_anh" && msg.urlTepTin ? (
                          <img src={msg.urlTepTin} alt="img" style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8, display: "block", marginBottom: 4 }} />
                        ) : null}
                        {msg.loaiTinNhan === "video" && msg.urlTepTin ? (
                          <video src={msg.urlTepTin} controls style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8, display: "block", marginBottom: 4 }} />
                        ) : null}
                        {msg.noiDung}
                        {/* Thời gian dưới tin nhắn */}
                        {showTime && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "black",
                              marginTop: 4,
                              textAlign: isMe ? "right" : "left",
                              minWidth: 80
                            }}
                          >
                            {formatTimeAgo(msg.ngayTao)}
                          </div>
                        )}
                        {/* Nếu là tin nhắn cuối cùng của mình và đã được đọc */}
                        {isMe && showTime && (
                          <div style={{ fontSize: 11, color: msg.daDoc ? "#4caf50" : "#888", textAlign: "right" }}>
                            {msg.daDoc ? "Đã xem" : "Đã gửi"}
                          </div>
                        )}
                      </div>
                      {/* Avatar bên phải nếu là mình */}
                      {isMe && (
                        <img
                          src={userInfo.anhDaiDien}
                          alt={userInfo.hoTen}
                          style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", marginLeft: 6 }}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <div className="messenger-chat-input">
              <span className="emoji-icon">
                <BsEmojiSmile />
              </span>
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                disabled={sending}
              />
              {/* Nút chọn ảnh */}
              <span
                className="image-upload-btn"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{ cursor: "pointer", marginLeft: 8 }}
                title="Gửi hình ảnh hoặc video"
              >
                <BiImageAlt />
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />
              </span>
              {/* Hiển thị preview ảnh đã chọn */}
              {file && file.type.startsWith("image/") && (
                <div className="image-preview">
                  <img src={URL.createObjectURL(file)} alt="preview" />
                  <span className="remove-image" onClick={() => setFile(null)}>×</span>
                </div>
              )}
              {/* Hiển thị tên file nếu là video */}
              {file && file.type.startsWith("video/") && (
                <span style={{ marginLeft: 8, color: "#888" }}>{file.name}</span>
              )}
              <button onClick={handleSend} disabled={sending}>
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        )}
        {/* Modal tạo tin nhắn mới */}
        {showNewMessageModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <span>New message</span>
                <button className="modal-close" onClick={() => setShowNewMessageModal(false)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div style={{ marginBottom: 10, fontWeight: 500 }}>Chọn bạn để nhắn tin:</div>
                <div className="modal-suggest-list">
                  {Array.isArray(friends) && friends.length === 0 && <div>Không có bạn bè nào.</div>}
                  {Array.isArray(friends) && friends.map((friend) => (
                    <div
                      key={friend.id}
                      className={`modal-suggest-item ${selectedFriendIds.includes(friend.id) ? "active" : ""}`}
                      onClick={() => handleToggleFriend(friend.id)}
                      style={{ display: "flex", alignItems: "center", cursor: "pointer", background: selectedFriendIds.includes(friend.id) ? "#f0f0f0" : undefined }}
                    >
                      <img
                        src={friend.avatar || friend.anhDaiDien || "./anhbandau.jpg"}
                        alt={friend.name || friend.hoTen}
                        style={{ width: 40, height: 40, borderRadius: "50%", marginRight: 10 }}
                      />
                      <span>{friend.name || friend.hoTen}</span>
                      <input
                        type="checkbox"
                        checked={selectedFriendIds.includes(friend.id)}
                        onChange={() => handleToggleFriend(friend.id)}
                        style={{ marginLeft: "auto" }}
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                  ))}
                </div>
                {/* Hiển thị input nhập tên nhóm nếu chọn nhiều người */}
                {selectedFriendIds.length > 1 && (
                  <>
                    
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleGroupImageChange}
                      style={{ margin: "10px 0", display: "block" }}
                    />
                    {groupImagePreview && (
                      <img
                        src={groupImagePreview}
                        alt="Ảnh nhóm"
                        style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", marginBottom: 10 }}
                      />
                    )}
                    <input
                      type="text"
                      placeholder="Nhập tên nhóm..."
                      value={groupName}
                      onChange={e => setGroupName(e.target.value)}
                      style={{ margin: "10px 0", width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
                    />
                  </>
                )}
                <button
                  className="modal-chat-btn"
                  style={{ marginTop: 20, width: "100%" }}
                  onClick={handleCreateChat}
                  disabled={creatingChat || selectedFriendIds.length === 0}
                >
                  {creatingChat ? "Đang tạo..." : "Chat"}
                </button>
                {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TinNhan;
