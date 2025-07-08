import React, { useState, useRef, useEffect } from "react";
import "./TinNhan.css";
import { BsEmojiSmile } from "react-icons/bs";
import { BiImageAlt } from "react-icons/bi";
import {
  guiTinNhan,
  timKiemTinNhan,
  taoCuocTroChuyen,
  uploadTinNhanFile,
  getDanhSachCuocTroChuyen
} from "../../services/tinNhanService";
import axios from "axios";

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
  const handleCreateChat = async () => {
    const myId = await fetchCurrentUserId();
    const otherId = selectedFriendId;
    console.log("Gọi API tạo chat với:", myId, otherId);
    if (!myId || !otherId) return;
    setCreatingChat(true);
    setError("");
    try {
      // Đảm bảo truyền cả id của bạn và id bạn bè
      const res = await taoCuocTroChuyen({
        idThanhVien: [myId, otherId],
        tenNhom: null,
        anhNhom: null,
      });
      console.log("Tạo chat thành công:", res);
      setShowNewMessageModal(false);
      setSelectedFriendId(null);
      setSelectedId(res.idCuocTroChuyen);
      // Thêm vào conversations nếu chưa có
      setConversations(prev => {
        if (prev.some(c => c.id === res.idCuocTroChuyen)) return prev;
        const newList = [
          ...prev,
          {
            id: res.idCuocTroChuyen,
            name: res.tenDoiPhuong || "Người dùng",
            avatar: res.anhDaiDienDoiPhuong || "./anhbandau.jpg",
            lastMessage: "",
            time: "",
          }
        ];
        console.log("Cập nhật conversations:", newList);
        return newList;
      });
    } catch (err) {
      setError("Tạo cuộc trò chuyện thất bại");
      console.error("Lỗi tạo cuộc trò chuyện:", err);
    }
    setCreatingChat(false);
  };

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
          {conversations.map((conv) => (
            <div
              key={conv.idCuocTroChuyen}
              className={`messenger-item ${selectedId === conv.idCuocTroChuyen ? "active" : ""}`}
              onClick={() => setSelectedId(conv.idCuocTroChuyen)}
            >
              <img
                src={
                  conv.anhDaiDienDoiPhuong ||
                  conv.anhNhom ||
                  "./anhbandau.jpg "
                }
                alt={conv.tenDoiPhuong || conv.tenNhom || "avatar"}
                className="messenger-avatar"
              />
              <div>
                <div className="messenger-name">{conv.tenDoiPhuong || conv.tenNhom || "Người dùng"}</div>
                <div className="messenger-last">{conv.lastMessage}</div>
              </div>
              <div className="messenger-time">{conv.time}</div>
            </div>
          ))}
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
                src={
                  conversations.find((c) => c.idCuocTroChuyen === selectedId)?.anhDaiDienDoiPhuong ||
                  conversations.find((c) => c.idCuocTroChuyen === selectedId)?.anhNhom ||
                  "./anhbandau.jpg"
                }
                alt={
                  conversations.find((c) => c.idCuocTroChuyen === selectedId)?.tenDoiPhuong ||
                  conversations.find((c) => c.idCuocTroChuyen === selectedId)?.tenNhom ||
                  "avatar"
                }
                className="messenger-avatar"
              />
              <span>
                {conversations.find((c) => c.idCuocTroChuyen === selectedId)?.tenDoiPhuong ||
                 conversations.find((c) => c.idCuocTroChuyen === selectedId)?.tenNhom ||
                 ""}
              </span>
            </div>
            <div className="messenger-chat-body">
              {error && <div style={{ color: "red" }}>{error}</div>}
              {messages.length === 0 ? (
                <div className="messenger-message">Chưa có tin nhắn</div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.idNguoiGui === userInfo.id;
                  return (
                    <div
                      key={msg.idTinNhan}
                      className={`messenger-message${isMe ? " my-message" : ""}`}
                    >
                      {/* Hiển thị ảnh nếu là tin nhắn hình ảnh */}
                      {msg.loaiTinNhan === "hinh_anh" && msg.urlTepTin && (
                        <img
                          src={msg.urlTepTin}
                          alt="img"
                          style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8, display: "block", marginBottom: 4 }}
                        />
                      )}
                      {/* Hiển thị video nếu là tin nhắn video */}
                      {msg.loaiTinNhan === "video" && msg.urlTepTin && (
                        <video
                          src={msg.urlTepTin}
                          controls
                          style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8, display: "block", marginBottom: 4 }}
                        />
                      )}
                      {/* Hiển thị nội dung văn bản nếu có */}
                      {msg.noiDung}
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
              <span
                className="anh"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{ cursor: "pointer" }}
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
              {file && (
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
                      className={`modal-suggest-item ${selectedFriendId === friend.id ? "active" : ""}`}
                      onClick={() => setSelectedFriendId(friend.id)}
                      style={{ display: "flex", alignItems: "center", cursor: "pointer", background: selectedFriendId === friend.id ? "#f0f0f0" : undefined }}
                    >
                      <img
                        src={friend.avatar || friend.anhDaiDien || "https://via.placeholder.com/40"}
                        alt={friend.name || friend.hoTen}
                        style={{ width: 40, height: 40, borderRadius: "50%", marginRight: 10 }}
                      />
                      <span>{friend.name || friend.hoTen}</span>
                      <input
                        type="radio"
                        name="selectedUser"
                        checked={selectedFriendId === friend.id}
                        onChange={() => setSelectedFriendId(friend.id)}
                        style={{ marginLeft: "auto" }}
                      />
                    </div>
                  ))}
                </div>
                <button
                  className="modal-chat-btn"
                  style={{ marginTop: 20, width: "100%" }}
                  onClick={handleCreateChat}
                  disabled={creatingChat || !selectedFriendId}
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
