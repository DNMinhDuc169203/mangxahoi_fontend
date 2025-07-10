import React, { useState, useRef, useEffect } from "react";
import "./TinNhan.css";
import { BsEmojiSmile } from "react-icons/bs";
import { BiImageAlt } from "react-icons/bi";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import {
  guiTinNhan,
  timKiemTinNhan,
  taoCuocTroChuyen,
  uploadTinNhanFile,
  getDanhSachCuocTroChuyen,
  markMessagesAsRead,
  markGroupMessagesAsRead
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
  const [showNguoiDocModal, setShowNguoiDocModal] = useState(null);
  const stompClientRef = useRef(null);

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
        // Sắp xếp theo thời gian mới nhất (ưu tiên trường time, nếu không có thì dùng tinNhanCuoi hoặc 0)
        const sorted = [...(data || [])].sort((a, b) => {
          const timeA = new Date(a.time || a.tinNhanCuoi || 0).getTime();
          const timeB = new Date(b.time || b.tinNhanCuoi || 0).getTime();
          return timeB - timeA;
        });
        setConversations(sorted);
        setSelectedId(null);
      } catch (err) {
        setConversations([]);
        setSelectedId(null);
      }
    };
    fetchConversations();
  }, []);

  // WebSocket real-time chat effect
  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/network/ws/chat");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe("/topic/tin-nhan", (message) => {
          const msg = JSON.parse(message.body);
          // Luôn cập nhật conversations (đẩy lên đầu)
          setConversations(prev => {
            const idx = prev.findIndex(
              c => (c.idCuocTroChuyen || c.id) === msg.idCuocTroChuyen
            );
            if (idx === -1) return prev;
            const isMe = msg.idNguoiGui === userInfo.id;
            let unreadCount = prev[idx].unreadCount || 0;
            // Nếu là tin nhắn đến từ người khác và không phải đang mở, tăng unreadCount
            if (!isMe && (msg.idCuocTroChuyen !== selectedId)) {
              unreadCount += 1;
            }
            const updatedConv = {
              ...prev[idx],
              lastMessage: msg.noiDung || (msg.loaiTinNhan === "hinh_anh" ? "[Hình ảnh]" : msg.loaiTinNhan === "video" ? "[Video]" : ""),
              time: formatTimeAgo(msg.ngayTao),
              lastMessageContent: msg.noiDung,
              lastMessageType: msg.loaiTinNhan,
              lastMessageSenderId: msg.idNguoiGui,
              lastMessageSenderName: msg.tenNguoiGui,
              lastMessageTime: msg.ngayTao,
              unreadCount,
            };
            const newList = [updatedConv, ...prev.filter((_, i) => i !== idx)];
            return newList;
          });
          // Chỉ cập nhật messages nếu đang mở đúng cuộc trò chuyện
          if (msg.idCuocTroChuyen === selectedId) {
            setMessages((prev) => {
              if (prev.some(m => m.idTinNhan === msg.idTinNhan)) return prev;
              return [...prev, msg];
            });
            // Gọi API đánh dấu đã đọc nếu là chat cá nhân
            const selectedConv = conversations.find(c => (c.idCuocTroChuyen || c.id) === selectedId);
            const isGroup = selectedConv?.loai === "nhom";
            if (!isGroup) {
              markMessagesAsRead(selectedId);
            } else {
              markGroupMessagesAsRead(selectedId);
            }
          }
        });
      },
    });
    stompClient.activate();
    stompClientRef.current = stompClient;
    return () => {
      stompClient.deactivate();
    };
  }, [selectedId, userInfo.id, conversations]); // Thêm conversations vào phụ thuộc

  // Reset unreadCount về 0 khi mở cuộc trò chuyện
  useEffect(() => {
    if (selectedId) {
      setConversations(prev =>
        prev.map(conv =>
          (conv.idCuocTroChuyen || conv.id) === selectedId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    }
  }, [selectedId]);

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
        if (file.type.startsWith("image/")) loaiTinNhan = "hinh_anh";
        else if (file.type.startsWith("video/")) loaiTinNhan = "video";
      }
      const msg = {
        idCuocTroChuyen: selectedId,
        idNguoiGui: userInfo.id,
        noiDung: messageInput,
        loaiTinNhan,
        urlTepTin: urlTepTin,
      };
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.publish({
          destination: "/app/chat/gui",
          body: JSON.stringify(msg),
        });
      } else {
        await guiTinNhan(msg);
        // Nếu gửi qua API, tự cập nhật conversations
        setConversations(prev => {
          const idx = prev.findIndex(
            c => (c.idCuocTroChuyen || c.id) === selectedId
          );
          if (idx === -1) return prev;
          const updatedConv = {
            ...prev[idx],
            lastMessage: msg.noiDung || (msg.loaiTinNhan === "hinh_anh" ? "[Hình ảnh]" : msg.loaiTinNhan === "video" ? "[Video]" : ""),
            time: formatTimeAgo(new Date())
          };
          const newList = [updatedConv, ...prev.filter((_, i) => i !== idx)];
          return newList;
        });
      }
      setMessageInput("");
      setFile(null);
      setSending(false);
    } catch (err) {
      setError("Gửi tin nhắn thất bại");
      setSending(false);
    }
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
      if (isGroup) {
        markGroupMessagesAsRead(selectedId);
      } else {
        markMessagesAsRead(selectedId);
      }
    }
  }, [selectedId, userInfo.id, isGroup]);

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
            // Lấy nội dung tin nhắn cuối cùng từ backend
            let lastMsg = "";
            if (conv.lastMessageType === "hinh_anh") lastMsg = "[Hình ảnh]";
            else if (conv.lastMessageType === "video") lastMsg = "[Video]";
            else lastMsg = conv.lastMessageContent || "";
            // Hiển thị tên người gửi nếu là nhóm
            let lastMsgSender = "";
            if (isGroupItem && conv.lastMessageSenderName) {
              lastMsgSender = conv.lastMessageSenderName + ": ";
            }
            // Hiển thị thời gian tin nhắn cuối
            let lastMsgTime = "";
            if (conv.lastMessageTime) {
              lastMsgTime = formatTimeAgo(conv.lastMessageTime);
            }
            // Xác định có tin nhắn chưa đọc không
            const isUnread = conv.unreadCount > 0;
            return (
              <div
                key={conv.idCuocTroChuyen || conv.id}
                className={`messenger-item${selectedId === (conv.idCuocTroChuyen || conv.id) ? " active" : ""}${isUnread ? " unread" : ""}`}
                onClick={() => setSelectedId(conv.idCuocTroChuyen || conv.id)}
              >
                <img
                  src={isGroupItem ? (conv.anhNhom || "./anhbandau.jpg") : (conv.anhDaiDienDoiPhuong || "./anhbandau.jpg")}
                  alt={isGroupItem ? conv.tenNhom : conv.tenDoiPhuong || "avatar"}
                  className="messenger-avatar"
                />
                <div>
                  <div className="messenger-name" style={isUnread ? {fontWeight: 'bold', color: '#1877f2'} : {}}>{isGroupItem ? conv.tenNhom : conv.tenDoiPhuong || "Người dùng"}</div>
                  <div className="messenger-last">{lastMsgSender}{lastMsg}</div>
                </div>
                <div className="messenger-time">
                  {lastMsgTime}
                  {isUnread && <span className="unread-dot"> ●</span>}
                </div>
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
                  // Xác định tin nhắn cuối cùng của mình đã được đọc
                  let isLastReadMyMsg = false;
                  if (isMe && isGroup && msg.danhSachNguoiDoc && msg.danhSachNguoiDoc.length > 0) {
                    isLastReadMyMsg = messages.slice(idx + 1).findIndex(
                      m => m.idNguoiGui === userInfo.id && m.danhSachNguoiDoc && m.danhSachNguoiDoc.length > 0
                    ) === -1;
                  } else if (isMe && !isGroup && msg.daDoc) {
                    isLastReadMyMsg = messages.slice(idx + 1).findIndex(m => m.idNguoiGui === userInfo.id && m.daDoc) === -1;
                  }

                  // Giả sử bạn có danh sách thành viên nhóm: groupMemberIds
                  // Và userInfo.id là id của mình

                  // Tìm id các thành viên khác mình
                  const groupMemberIds = selectedConv?.thanhVien || [];
                  const otherMemberIds = groupMemberIds.filter(id => id !== userInfo.id);

                  // Tìm index tin nhắn cuối cùng đã được tất cả otherMemberIds xem
                  let lastReadMsgIdx = -1;
                  messages.forEach((msg, idx) => {
                    if (
                      msg.danhSachNguoiDoc &&
                      otherMemberIds.every(id => msg.danhSachNguoiDoc.some(u => u.id === id))
                    ) {
                      lastReadMsgIdx = idx;
                    }
                  });

                  // Khi render từng tin nhắn:
                  const showGroupSeen = isGroup && idx === lastReadMsgIdx && msg.danhSachNguoiDoc && msg.danhSachNguoiDoc.length > 0;

                  return (
                    <div
                      key={msg.idTinNhan}
                      className={`message-row${isMe ? " me" : ""}`}
                    >
                      {/* Avatar chỉ hiện với người khác */}
                      {!isMe && (
                        <img
                          src={senderAvatar}
                          alt={senderName}
                          className="message-avatar"
                        />
                      )}
                      <div>
                        {/* Tên người gửi (nếu là nhóm và không phải mình) */}
                        {isGroup && !isMe && (
                          <div style={{ fontWeight: 500, fontSize: 13, color: "#4267b2", marginBottom: 2 }}>
                            {senderName}
                          </div>
                        )}
                        <div className={`message-bubble${isMe ? " my-bubble" : " other-bubble"}`}>
                          {/* Nội dung tin nhắn (ảnh/video/...) */}
                          {msg.loaiTinNhan === "hinh_anh" && msg.urlTepTin ? (
                            <img src={msg.urlTepTin} alt="img" style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8, display: "block", marginBottom: 4 }} />
                          ) : null}
                          {msg.loaiTinNhan === "video" && msg.urlTepTin ? (
                            <video src={msg.urlTepTin} controls style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8, display: "block", marginBottom: 4 }} />
                          ) : null}
                          {msg.noiDung}
                        </div>
                        {/* Thời gian gửi */}
                        {showTime && (
                          <div className="message-time">
                            {formatTimeAgo(msg.ngayTao)}
                          </div>
                        )}
                        {/* Đã xem cá nhân */}
                        {isLastReadMyMsg && !isGroup && (
                          <div style={{
                            fontSize: 12,
                            color: "#888",
                            marginTop: 2,
                            marginLeft: isMe ? 0 : 44,
                            marginRight: isMe ? 44 : 0,
                            textAlign: isMe ? "right" : "left"
                          }}>
                            Đã xem
                          </div>
                        )}
                        {/* Đã xem nhóm */}
                        {showGroupSeen && (
                          <div
                            className="seen-by-group"
                            style={{
                              cursor: "pointer",
                              color: "#888",
                              marginTop: 2,
                              marginBottom: 4,
                              background: "transparent",
                              fontSize: 13,
                              paddingLeft: 8,
                              paddingRight: 8,
                              whiteSpace: "nowrap",
                              alignSelf: isMe ? "flex-end" : "flex-start"
                            }}
                            onClick={() => setShowNguoiDocModal(msg.danhSachNguoiDoc)}
                            title="Xem danh sách người đã xem"
                          >
                            👁️ Đã xem ({msg.danhSachNguoiDoc.length})
                          </div>
                        )}
                      </div>
                      {/* Avatar của mình (nếu muốn, có thể bỏ) */}
                      {/* isMe && (
                        <img
                          src={userInfo.anhDaiDien}
                          alt={userInfo.hoTen}
                          className="message-avatar"
                        />
                      ) */}
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
        {showNguoiDocModal && (
          <div className="modal-overlay" onClick={() => setShowNguoiDocModal(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <span>Danh sách người đã xem</span>
                <button className="modal-close" onClick={() => setShowNguoiDocModal(null)}>×</button>
              </div>
              <div className="modal-body">
                {showNguoiDocModal.map(user => (
                  <div key={user.id} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                    <img src={user.anhDaiDien || "./anhbandau.jpg"} alt={user.hoTen} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", marginRight: 8 }} />
                    <span>{user.hoTen}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TinNhan;
