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
  markGroupMessagesAsRead,
  thuHoiTinNhan,
  themThanhVien // <-- thêm import
} from "../../services/tinNhanService";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
  const chatBodyRef = useRef(null);
  const [showHeaderModal, setShowHeaderModal] = useState(false);
  const headerModalRef = useRef();
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showSearchMessageModal, setShowSearchMessageModal] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState(null); // Tin nhắn đang hover
  const [showRecallMenuMsgId, setShowRecallMenuMsgId] = useState(null); // Tin nhắn đang mở menu thu hồi
  const recallMenuRef = useRef();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [addMemberFriends, setAddMemberFriends] = useState([]); // bạn bè chưa thuộc nhóm
  const [selectedAddMemberIds, setSelectedAddMemberIds] = useState([]);
  const [addingMembers, setAddingMembers] = useState(false);
  const [addMemberError, setAddMemberError] = useState("");
  const [showMemberListModal, setShowMemberListModal] = useState(false);
  const navigate = useNavigate();
  const [showKickMemberModal, setShowKickMemberModal] = useState(false);
  const [kickMemberIds, setKickMemberIds] = useState([]);
  const [showLeaveGroupModal, setShowLeaveGroupModal] = useState(false);
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);
  const [kickMemberError, setKickMemberError] = useState("");
  const [leaveGroupError, setLeaveGroupError] = useState("");
  const [deleteGroupError, setDeleteGroupError] = useState("");

  // Đóng modal khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (showHeaderModal && headerModalRef.current && !headerModalRef.current.contains(event.target)) {
        setShowHeaderModal(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showHeaderModal]);

  // Đóng menu thu hồi khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (showRecallMenuMsgId && recallMenuRef.current && !recallMenuRef.current.contains(event.target)) {
        setShowRecallMenuMsgId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRecallMenuMsgId]);

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
          kichThuoc: 30,
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
    socket.onopen = () => {
      console.log("SockJS connection opened");
      // Log sessionId nếu có thể lấy được
      if (socket._transport && socket._transport.url) {
        const match = socket._transport.url.match(/\/([^\/\?]+)\/websocket/);
        if (match) {
          console.log("SockJS sessionId:", match[1]);
        }
      }
    };
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("STOMP connected");
        stompClient.subscribe("/topic/tin-nhan", (message) => {
          console.log("Received message on /topic/tin-nhan:", message.body);
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
        // Lắng nghe lỗi từ backend qua WebSocket
        stompClient.subscribe("/user/queue/errors", (message) => {
          console.log("WS ERROR:", message.body);
          try {
            const error = JSON.parse(message.body);
            if (error.type === "error" && error.message) {
              setError(error.message + " " + Date.now());
            }
          } catch (e) {
            setError("Có lỗi xảy ra khi nhận thông báo lỗi từ máy chủ. " + Date.now());
          }
        });
      },
      onStompError: (frame) => {
        console.log("STOMP error frame:", frame);
      },
      onWebSocketError: (event) => {
        console.log("WebSocket error:", event);
      },
      onDisconnect: () => {
        console.log("STOMP disconnected");
      }
    });
    stompClient.activate();
    stompClientRef.current = stompClient;
    return () => {
      stompClient.deactivate();
      console.log("STOMP deactivated");
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
      console.log("Gửi tin nhắn:", msg);
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.publish({
          destination: "/app/chat/gui",
          body: JSON.stringify(msg),
        });
        console.log("Đã gửi tin nhắn qua WebSocket");
      } else {
        await guiTinNhan(msg);
        console.log("Đã gửi tin nhắn qua REST API");
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
      // Kiểm tra lỗi trả về từ backend
      let msg = "Gửi tin nhắn thất bại";
      if (
        err.response &&
        err.response.data &&
        typeof err.response.data === "string" &&
        err.response.data.includes("không còn là bạn bè")
      ) {
        msg = "Bạn không còn là bạn bè với người này, không thể gửi tin nhắn.";
      } else if (
        err.response &&
        err.response.data &&
        err.response.data.message &&
        err.response.data.message.includes("không còn là bạn bè")
      ) {
        msg = "Bạn không còn là bạn bè với người này, không thể gửi tin nhắn.";
      }
      setError(msg);
      setSending(false);
      console.log("Lỗi khi gửi tin nhắn:", err);
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

    // Nếu chỉ chọn 1 người (chat cá nhân)
    if (selectedFriendIds.length === 1) {
      // Tìm cuộc trò chuyện cá nhân đã có giữa 2 người
      const existingConv = conversations.find(conv => {
        // Điều kiện: loại là cá nhân, và idDoiPhuong === selectedFriendIds[0] hoặc idDoiPhuong === myId
        return conv.loai !== "nhom" &&
          ((conv.idDoiPhuong === selectedFriendIds[0]) || (conv.idDoiPhuong === myId && conv.idNguoiDung === selectedFriendIds[0]));
      });
      if (existingConv) {
        setShowNewMessageModal(false);
        setSelectedFriendIds([]);
        setGroupName("");
        setGroupImage(null);
        setGroupImagePreview(null);
        setSelectedId(existingConv.idCuocTroChuyen || existingConv.id);
        return;
      }
    }
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

  // Scroll xuống cuối khi messages thay đổi hoặc khi chọn cuộc trò chuyện
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, selectedId]);

  // Tính tổng số tin nhắn chưa đọc
  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  const handleSearchMessages = async () => {
    setSearching(true);
    setSearchError("");
    try {
      const data = await timKiemTinNhan({
        idCuocTroChuyen: selectedId,
        tuKhoa: searchKeyword,
        trang: 0,
        kichThuoc: 10,
      });
      setSearchResults(data);
    } catch (err) {
      setSearchError("Không tìm thấy tin nhắn hoặc có lỗi xảy ra.");
      setSearchResults([]);
    }
    setSearching(false);
  };

  // Khi mở modal thêm thành viên, lấy danh sách bạn bè chưa thuộc nhóm
  useEffect(() => {
    if (!showAddMemberModal || !selectedConv) return;
    const fetchFriends = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8080/network/api/ket-ban/danh-sach/ban-be", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const allFriends = Array.isArray(res.data.content) ? res.data.content : [];
        // Log để debug
        console.log("Danh sách thành viên nhóm:", selectedConv.thanhVien);
        console.log("Danh sách bạn bè:", allFriends.map(f => f.id));
        // Lọc ra bạn bè chưa thuộc nhóm (không hiển thị bạn bè đã là thành viên nhóm)
        const groupMembers = Array.isArray(selectedConv.thanhVien)
          ? selectedConv.thanhVien
          : (Array.isArray(selectedConv.idThanhVien) ? selectedConv.idThanhVien : []);
        const groupMemberIds = groupMembers.map(id => String(id));
        const notInGroup = allFriends.filter(f => !groupMemberIds.includes(String(f.id)));
        setAddMemberFriends(notInGroup);
      } catch (err) {
        setAddMemberFriends([]);
      }
      setSelectedAddMemberIds([]);
      setAddMemberError("");
    };
    fetchFriends();
  }, [showAddMemberModal, selectedConv]);

  // Hàm xử lý chọn bạn bè để thêm
  const handleToggleAddMember = (id) => {
    setSelectedAddMemberIds(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
  };

  // Xác định quyền trưởng nhóm/quản trị viên
  const isTruongNhom = isGroup && userInfo.id === selectedConv?.idTruongNhom;
  const isAdmin = isGroup && selectedConv?.danhSachThanhVien?.find(m => m.id === userInfo.id)?.vaiTro === "quan_tri";

  return (
    <div className="messenger-main-layout flex" style={{height: '100vh'}}>
      {/* Sidebar chat (danh sách chat) */}
      <div className="messenger-sidebar-chat" style={{width: 320, flexShrink: 0}}>
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
          <input type="text" placeholder="Tìm kiếm" />
        </div>
        <div className="messenger-tabs">
          <span className="active" style={{position: 'relative', display: 'inline-block'}}>
            Tin nhắn
            {totalUnread > 0 && (
              <span style={{
                position: 'absolute',
                top: -8,
                right: -18,
                background: 'red',
                color: '#fff',
                borderRadius: '50%',
                fontSize: 12,
                minWidth: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 5px',
                fontWeight: 600,
                zIndex: 1
              }}>
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </span>
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
      <div className="messenger-main-chat flex-1 min-w-0">
        {!selectedId ? (
          <div className="messenger-empty">
            <div className="messenger-empty-title">Tin nhắn của bạn</div>
            <div className="messenger-empty-desc">Gửi một tin nhắn để bắt đầu cuộc trò chuyện.</div>
            <button className="messenger-btn" onClick={() => setShowNewMessageModal(true)}>
              Gửi tin nhắn
            </button>
          </div>
        ) : (
          <div className="messenger-chat">
            <div className="messenger-chat-header">
              <img
                src={isGroup ? (selectedConv?.anhNhom || "./anhbandau.jpg") : (selectedConv?.anhDaiDienDoiPhuong || "./anhbandau.jpg")}
                alt={isGroup ? selectedConv?.tenNhom : selectedConv?.tenDoiPhuong || "avatar"}
                className="messenger-avatar cursor-pointer"
                onClick={() => !isGroup && selectedConv?.idDoiPhuong && navigate(`/profile/${selectedConv.idDoiPhuong}`)}
              />
              <span
                className={!isGroup ? "cursor-pointer" : undefined}
                onClick={() => !isGroup && selectedConv?.idDoiPhuong && navigate(`/profile/${selectedConv.idDoiPhuong}`)}
              >
                {isGroup ? selectedConv?.tenNhom : selectedConv?.tenDoiPhuong || ""}
              </span>
              <button className="messenger-header-btn" onClick={() => setShowHeaderModal(true)}>...</button>
              {showHeaderModal && (
                <div className="messenger-header-modal" ref={headerModalRef}>
                  {isGroup ? (
                    <>
                      {(isTruongNhom || isAdmin) && (
                        <button onClick={() => { setShowHeaderModal(false); setShowKickMemberModal(true); }}>Xóa thành viên</button>
                      )}
                      {isTruongNhom && (
                        <button onClick={() => { setShowHeaderModal(false); setShowDeleteGroupModal(true); }}>Xóa nhóm</button>
                      )}
                      <button onClick={() => { setShowHeaderModal(false); setShowLeaveGroupModal(true); }}>Rời nhóm</button>
                      <button onClick={() => { setShowHeaderModal(false); setShowMemberListModal(true); }}>Danh sách thành viên</button>
                      <button onClick={() => { setShowHeaderModal(false); setShowAddMemberModal(true); }}>Thêm Thành viên</button>
                      <button onClick={() => { setShowHeaderModal(false); setShowSearchMessageModal(true); }}>Tìm kiếm tin nhắn</button>
                    </>
                  ) : (
                    <button onClick={() => { setShowHeaderModal(false); setShowSearchMessageModal(true); }}>Tìm kiếm tin nhắn</button>
                  )}
                </div>
              )}
            </div>
            <div className="messenger-chat-body" ref={chatBodyRef}>
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

                  // Nếu là tin nhắn thong_bao thì hiển thị đặc biệt
                  if (msg.loaiTinNhan === "thong_bao") {
                    return (
                      <div key={msg.idTinNhan} style={{ textAlign: "center", color: "#888", fontStyle: "italic", margin: "12px 0" }}>
                        {msg.noiDung}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.idTinNhan}
                      className={`message-row${isMe ? " me" : ""}`}
                      onMouseEnter={() => isMe && setHoveredMsgId(msg.idTinNhan)}
                      onMouseLeave={() => isMe && setHoveredMsgId(null)}
                      style={{ position: 'relative' }}
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
                          {msg.loaiTinNhan === "thu_hoi" ? (
                            <span style={{ fontStyle: 'italic', color: '#888' }}>{msg.noiDung || 'Tin nhắn đã được thu hồi'}</span>
                          ) : (
                            msg.noiDung
                          )}
                          {/* Nút ba chấm dọc khi hover vào tin nhắn của mình */}
                          {isMe && hoveredMsgId === msg.idTinNhan && (
                            <span
                              className="recall-dot-menu-btn"
                              style={{
                                position: 'absolute',
                                top: 6,
                                right: isMe ? 0 : undefined,
                                left: isMe ? undefined : 0,
                                cursor: 'pointer',
                                background: 'transparent',
                                border: 'none',
                                fontSize: 20,
                                zIndex: 2
                              }}
                              onClick={e => {
                                e.stopPropagation();
                                setShowRecallMenuMsgId(msg.idTinNhan);
                              }}
                              title="Tùy chọn tin nhắn"
                            >
                              <span style={{ display: 'inline-block', transform: 'rotate(90deg)' }}>⋮</span>
                            </span>
                          )}
                          {/* Menu thu hồi tin nhắn */}
                          {isMe && showRecallMenuMsgId === msg.idTinNhan && (
                            <div
                              ref={recallMenuRef}
                              className="recall-menu"
                              style={{
                                position: 'absolute',
                                top: 28,
                                right: isMe ? 0 : undefined,
                                left: isMe ? undefined : 0,
                                background: '#fff',
                                border: '1px solid #ccc',
                                borderRadius: 6,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                                zIndex: 10,
                                minWidth: 120,
                                padding: '4px 0',
                              }}
                            >
                              <button
                                style={{
                                  width: '100%',
                                  background: 'none',
                                  color: 'black',
                                  border: 'none',
                                  padding: '8px 12px',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  fontSize: 13
                                }}
                                onClick={async () => {
                                  setShowRecallMenuMsgId(null);
                                  try {
                                    await thuHoiTinNhan({ idTinNhan: msg.idTinNhan });
                                    setMessages(prevMsgs => prevMsgs.map(m =>
                                      m.idTinNhan === msg.idTinNhan
                                        ? { ...m, noiDung: 'Tin nhắn đã được thu hồi', loaiTinNhan: 'thu_hoi', urlTepTin: null }
                                        : m
                                    ));
                                  } catch (err) {
                                    alert('Thu hồi tin nhắn thất bại!');
                                  }
                                }}
                              >
                                Thu hồi tin nhắn
                              </button>
                            </div>
                          )}
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
            {/* Hiển thị lỗi gửi tin nhắn */}
            {error && (
              <div style={{ color: "red", margin: "8px 0", fontWeight: 500, textAlign: "center" }}>
                {error}
              </div>
            )}
            <div className="messenger-chat-input">
              <span className="emoji-icon">
                <BsEmojiSmile />
              </span>
              <input
                type="text"
                placeholder="Gõ một tin nhắn..."
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  setError(""); // Reset lỗi khi gõ lại
                }}
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
                {sending ? "Đang gửi..." : "Gửi"}
              </button>
            </div>
          </div>
        )}
        {/* Modal tạo tin nhắn mới */}
        {showNewMessageModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <span>Tin nhắn mới</span>
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
                  {creatingChat ? "Đang tạo..." : "Nhắn"}
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
        {showAddMemberModal && (
          <div className="messenger-modal-overlay" onClick={() => setShowAddMemberModal(false)}>
            <div className="messenger-modal-content" onClick={e => e.stopPropagation()}>
              <h3>Thành viên nhóm</h3>
              {/* Danh sách thành viên hiện tại */}
              <ul style={{maxHeight: '120px', overflowY: 'auto', marginBottom: 8}}>
                {(selectedConv?.danhSachThanhVien || []).map((member, idx) => (
                  <li key={member.id} style={{display: 'flex', alignItems: 'center', marginBottom: 4}}>
                    <img
                      src={member.anhDaiDien || "./anhbandau.jpg"}
                      alt={member.hoTen}
                      style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", marginRight: 8 }}
                    />
                    <span>
                      {member.hoTen}
                      {member.id === selectedConv.idTruongNhom && (
                        <span style={{ color: '#1877f2', fontWeight: 600, marginLeft: 6 }} title="Trưởng nhóm">
                          👑
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <hr />
              <h4>Thêm thành viên mới</h4>
              <div style={{maxHeight: '180px', overflowY: 'auto', marginBottom: 8}}>
                {addMemberFriends.length === 0 && <div style={{color:'#888'}}>Không còn bạn bè nào để thêm.</div>}
                {addMemberFriends.map(friend => (
                  <div key={friend.id} style={{display: 'flex', alignItems: 'center', padding: '4px 0'}}>
                    <img src={friend.avatar || friend.anhDaiDien || "./anhbandau.jpg"} alt={friend.name || friend.hoTen} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", marginRight: 8 }} />
                    <span>{friend.name || friend.hoTen}</span>
                    <input
                      type="checkbox"
                      checked={selectedAddMemberIds.includes(friend.id)}
                      onChange={() => handleToggleAddMember(friend.id)}
                      style={{ marginLeft: "auto" }}
                    />
                  </div>
                ))}
              </div>
              <button
                style={{ width: '100%', marginTop: 8 }}
                onClick={async () => {
                  setAddingMembers(true);
                  setAddMemberError("");
                  try {
                    await themThanhVien({
                      idCuocTroChuyen: selectedConv.idCuocTroChuyen || selectedConv.id,
                      idThanhVienMoi: selectedAddMemberIds,
                      idNguoiThucHien: userInfo.id
                    });
                    setShowAddMemberModal(false);
                    setSelectedAddMemberIds([]);
                    // Có thể reload lại nhóm hoặc cập nhật UI ở đây nếu muốn
                  } catch (err) {
                    setAddMemberError("Thêm thành viên thất bại!");
                  }
                  setAddingMembers(false);
                }}
                disabled={addingMembers || selectedAddMemberIds.length === 0}
              >
                {addingMembers ? "Đang thêm..." : "Thêm"}
              </button>
              {addMemberError && <div style={{ color: "red", marginTop: 8 }}>{addMemberError}</div>}
              <button style={{ width: '100%', marginTop: 8 }} onClick={() => setShowAddMemberModal(false)}>Đóng</button>
            </div>
          </div>
        )}
        {showSearchMessageModal && (
          <div className="messenger-modal-overlay" onClick={() => setShowSearchMessageModal(false)}>
            <div className="messenger-modal-content" onClick={e => e.stopPropagation()}>
              <h3>Tìm kiếm tin nhắn</h3>
              <input
                type="text"
                placeholder="Nhập từ khóa..."
                style={{ width: '100%', marginBottom: 8 }}
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearchMessages(); }}
              />
              <button style={{ width: '100%' }} onClick={handleSearchMessages} disabled={searching}>
                {searching ? "Đang tìm..." : "Tìm kiếm"}
              </button>
              {searchError && <div style={{ color: "red", marginTop: 8 }}>{searchError}</div>}
              <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 8 }}>
                {searchResults && searchResults.length > 0 ? (
                  searchResults.map(msg => (
                    <div key={msg.idTinNhan} style={{ padding: 6, borderBottom: '1px solid #eee', fontSize: 14 }}>
                      <b>{msg.tenNguoiGui || "Bạn"}:</b> {msg.noiDung}
                      <div style={{ fontSize: 12, color: '#888' }}>{formatTimeAgo(msg.ngayTao)}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#888', fontStyle: 'italic' }}>Không có kết quả.</div>
                )}
              </div>
              <button style={{ width: '100%', marginTop: 8 }} onClick={() => setShowSearchMessageModal(false)}>Đóng</button>
            </div>
          </div>
        )}
        {showMemberListModal && (
          <div className="messenger-modal-overlay" onClick={() => setShowMemberListModal(false)}>
            <div className="messenger-modal-content" onClick={e => e.stopPropagation()}>
              <h3>Danh sách thành viên nhóm</h3>
              <ul style={{maxHeight: '240px', overflowY: 'auto', marginBottom: 8}}>
                {(selectedConv?.danhSachThanhVien || []).map((member, idx) => (
                  <li key={member.id} style={{display: 'flex', alignItems: 'center', marginBottom: 4}}>
                    <img
                      src={member.anhDaiDien || "./anhbandau.jpg"}
                      alt={member.hoTen}
                      style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", marginRight: 8 }}
                    />
                    <span>
                      {member.hoTen}
                      {member.id === selectedConv.idTruongNhom && (
                        <span style={{ color: '#1877f2', fontWeight: 600, marginLeft: 6 }} title="Trưởng nhóm">
                          👑
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <button style={{ width: '100%', marginTop: 8 }} onClick={() => setShowMemberListModal(false)}>Đóng</button>
            </div>
          </div>
        )}
        {showKickMemberModal && (
          <div className="modal-overlay" onClick={() => { setShowKickMemberModal(false); setKickMemberIds([]); setKickMemberError(""); }}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <span>Xóa thành viên khỏi nhóm</span>
                <button className="modal-close" onClick={() => { setShowKickMemberModal(false); setKickMemberIds([]); setKickMemberError(""); }}>×</button>
              </div>
              <div className="modal-body">
                <div>Chọn thành viên cần xóa:</div>
                <ul style={{maxHeight: 200, overflowY: 'auto', margin: '10px 0'}}>
                  {(selectedConv?.danhSachThanhVien || [])
                    .filter(m => m.id !== userInfo.id)
                    .map(member => (
                    <li key={member.id} style={{display: 'flex', alignItems: 'center', marginBottom: 6}}>
                      <img src={member.anhDaiDien || "./anhbandau.jpg"} alt={member.hoTen} style={{width: 32, height: 32, borderRadius: "50%", marginRight: 8}} />
                      <span>{member.hoTen}</span>
                      <input
                        type="checkbox"
                        checked={kickMemberIds.includes(member.id)}
                        onChange={() => setKickMemberIds(prev => prev.includes(member.id) ? prev.filter(id => id !== member.id) : [...prev, member.id])}
                        style={{marginLeft: "auto"}}
                      />
                    </li>
                  ))}
                </ul>
                <button
                  style={{width: '100%', marginTop: 8}}
                  disabled={kickMemberIds.length === 0}
                  onClick={async () => {
                    setKickMemberError("");
                    try {
                      const token = localStorage.getItem("token");
                      for (const idNguoiBiXoa of kickMemberIds) {
                        await axios.post("http://localhost:8080/network/api/tinnhan/cuoc-tro-chuyen/xoa-thanh-vien", {
                          idCuocTroChuyen: selectedConv.idCuocTroChuyen || selectedConv.id,
                          idNguoiBiXoa
                        }, { headers: { Authorization: `Bearer ${token}` } });
                      }
                      setShowKickMemberModal(false);
                      setKickMemberIds([]);
                      // Reload lại nhóm hoặc cập nhật UI nếu muốn
                      window.location.reload();
                    } catch (err) {
                      setKickMemberError("Xóa thành viên thất bại!");
                    }
                  }}
                >Xóa</button>
                {kickMemberError && <div style={{color: "red", marginTop: 8}}>{kickMemberError}</div>}
                <button style={{width: '100%', marginTop: 8}} onClick={() => { setShowKickMemberModal(false); setKickMemberIds([]); setKickMemberError(""); }}>Đóng</button>
              </div>
            </div>
          </div>
        )}
        {showLeaveGroupModal && (
          <div className="modal-overlay" onClick={() => { setShowLeaveGroupModal(false); setLeaveGroupError(""); }}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <span>Rời nhóm</span>
                <button className="modal-close" onClick={() => { setShowLeaveGroupModal(false); setLeaveGroupError(""); }}>×</button>
              </div>
              <div className="modal-body">
                <div>Bạn có chắc chắn muốn rời nhóm không?</div>
                <button
                  style={{width: '100%', marginTop: 8, background: '#e53935', color: '#fff'}}
                  onClick={async () => {
                    setLeaveGroupError("");
                    try {
                      const token = localStorage.getItem("token");
                      await axios.post("http://localhost:8080/network/api/tinnhan/cuoc-tro-chuyen/roi-nhom", {
                        idCuocTroChuyen: selectedConv.idCuocTroChuyen || selectedConv.id
                      }, { headers: { Authorization: `Bearer ${token}` } });
                      setShowLeaveGroupModal(false);
                      // Chuyển về trang chủ hoặc reload lại danh sách nhóm
                      window.location.reload();
                    } catch (err) {
                      setLeaveGroupError("Rời nhóm thất bại!");
                    }
                  }}
                >Xác nhận rời nhóm</button>
                {leaveGroupError && <div style={{color: "red", marginTop: 8}}>{leaveGroupError}</div>}
                <button style={{width: '100%', marginTop: 8}} onClick={() => { setShowLeaveGroupModal(false); setLeaveGroupError(""); }}>Đóng</button>
              </div>
            </div>
          </div>
        )}
        {showDeleteGroupModal && (
          <div className="modal-overlay" onClick={() => { setShowDeleteGroupModal(false); setDeleteGroupError(""); }}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <span>Xóa nhóm</span>
                <button className="modal-close" onClick={() => { setShowDeleteGroupModal(false); setDeleteGroupError(""); }}>×</button>
              </div>
              <div className="modal-body">
                <div style={{color: "#e53935", fontWeight: 600}}>Bạn có chắc chắn muốn xóa nhóm này? Hành động này không thể hoàn tác!</div>
                <button
                  style={{width: '100%', marginTop: 8, background: '#e53935', color: '#fff'}}
                  onClick={async () => {
                    setDeleteGroupError("");
                    try {
                      const token = localStorage.getItem("token");
                      await axios.post("http://localhost:8080/network/api/tinnhan/cuoc-tro-chuyen/xoa-nhom", {
                        idCuocTroChuyen: selectedConv.idCuocTroChuyen || selectedConv.id
                      }, { headers: { Authorization: `Bearer ${token}` } });
                      setShowDeleteGroupModal(false);
                      // Chuyển về trang chủ hoặc reload lại danh sách nhóm
                      window.location.reload();
                    } catch (err) {
                      setDeleteGroupError("Xóa nhóm thất bại!");
                    }
                  }}
                >Xác nhận xóa nhóm</button>
                {deleteGroupError && <div style={{color: "red", marginTop: 8}}>{deleteGroupError}</div>}
                <button style={{width: '100%', marginTop: 8}} onClick={() => { setShowDeleteGroupModal(false); setDeleteGroupError(""); }}>Đóng</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TinNhan;
