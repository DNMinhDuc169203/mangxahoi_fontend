import React, { useState, useEffect } from "react";
import { IoReorderThreeOutline } from "react-icons/io5";
import { menu } from "./SidebarConfig";
import { useNavigate } from "react-router-dom";
import { useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Spinner, useToast } from "@chakra-ui/react";
import CreatePostModal from "../BaiViet/TaoBaiDangModal";
import NotificationPanel from "../ThongBao/NotificationPanel";
import { useNotificationContext } from '../../contexts/NotificationContext';
import BaiDangChiTietModal from "../BinhLuan/BaiDangChiTietModal";
import { Menu, MenuButton, MenuList, MenuItem, Button, Icon } from "@chakra-ui/react";
import { FiSettings } from "react-icons/fi";
import { getPolicies } from '../../Admin/services/ChinhSachService';
import axios from "axios";

// Thêm import useState, useEffect nếu chưa có
// import { useState, useEffect } from 'react';

// Hàm lấy tổng số tin nhắn chưa đọc từ localStorage (giả sử conversations lưu ở local hoặc có thể truyền prop)
function getTotalUnreadMessages() {
  try {
    const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    return conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
  } catch {
    return 0;
  }
}

const Sidebar = ({ isSearchVisible, setIsSearchVisible }) => {
  const [activeTab, setActiveTab] = useState();
  const navigate = useNavigate();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { 
    isOpen: isNotificationOpen, 
    onClose: onNotificationClose, 
    onOpen: onNotificationOpen 
  } = useDisclosure();
  const { unreadCount } = useNotificationContext();
  const [showPostModal, setShowPostModal] = useState(false);
  const [postDetail, setPostDetail] = useState(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(getTotalUnreadMessages());
  // Cập nhật lại khi conversations thay đổi trong localStorage (polling đơn giản)
  useEffect(() => {
    const interval = setInterval(() => {
      setUnreadMessageCount(getTotalUnreadMessages());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Khi search đóng, activeTab không còn là 'Search'
  useEffect(() => {
    if (!isSearchVisible && activeTab === "Search") {
      setActiveTab(undefined);
    }
  }, [isSearchVisible]);

  const handleTabClick = (title) => {
    setActiveTab(title);
    const item = menu.find(m => m.title === title);
    if (item && item.path) {
      navigate(item.path);
      return;
    }
    if (title === "Hồ Sơ") {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user && user.id) {
        navigate(`/profile/${user.id}`);
      }
      return;
    }
    else if (title === "Trang Chủ") {
      navigate("/");
    }
    else if (title === "Tạo") {
      onOpen();
    }
    else if (title === "Thông Báo") {
      onNotificationOpen();
    }
    if (title === "Tìm Kiếm") {
      setIsSearchVisible(true);
    }
    else {
      setIsSearchVisible(false);
    }
  };

  const handleShowPolicy = async () => {
    setPolicyLoading(true);
    onPolicyOpen();
    try {
      const data = await getPolicies();
      if (Array.isArray(data) && data.length > 0) {
        // Sắp xếp theo ngày cập nhật mới nhất
        const sorted = [...data].sort((a, b) => new Date(b.ngayCapNhat) - new Date(a.ngayCapNhat));
        setLatestPolicy(sorted[0]);
      } else {
        setLatestPolicy(null);
      }
    } catch {
      setLatestPolicy(null);
    }
    setPolicyLoading(false);
  };
  const { isOpen: isPolicyOpen, onOpen: onPolicyOpen, onClose: onPolicyClose } = useDisclosure();
  const [policyLoading, setPolicyLoading] = useState(false);
  const [latestPolicy, setLatestPolicy] = useState(null);

  const { isOpen: isBlockedOpen, onOpen: onBlockedOpen, onClose: onBlockedClose } = useDisclosure();
  const [blockedList, setBlockedList] = useState([]);
  const [blockedLoading, setBlockedLoading] = useState(false);
  const [blockedPage, setBlockedPage] = useState(0);
  const [blockedTotal, setBlockedTotal] = useState(0);
  const [blockedRefreshing, setBlockedRefreshing] = useState(false);
  const toast = useToast();

  const fetchBlockedList = async (page = 0) => {
    setBlockedLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:8080/network/api/ket-ban/danh-sach/chan?page=${page}&size=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlockedList(res.data.content || []);
      setBlockedTotal(res.data.totalElements || 0);
      setBlockedPage(page);
    } catch {
      setBlockedList([]);
      setBlockedTotal(0);
    }
    setBlockedLoading(false);
  };

  const handleShowBlocked = () => {
    fetchBlockedList(0);
    onBlockedOpen();
  };

  const handleUnblock = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/network/api/ket-ban/bo-chan/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "Đã bỏ chặn!", status: "success", duration: 1200, isClosable: true, position: "top" });
      setBlockedRefreshing(true);
      fetchBlockedList(blockedPage);
    } catch {
      toast({ title: "Bỏ chặn thất bại!", status: "error", duration: 1200, isClosable: true, position: "top" });
    }
    setBlockedRefreshing(false);
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="sticky top-0 h-[100vh] flex">
      <div className={`flex flex-col justify-between h-full ${activeTab === "Search" ? "px-2" : "px-10"} w-[250px]`}>
        {<div>
          {activeTab !== "Search" && <div className="pt-10">
            <img
              className="w-40"
              src="/toptrend.png"
              alt=""
            />
          </div>}
          <div className="mt-10">
            {menu.map((item) => (
              <div key={item.title} onClick={() => handleTabClick(item.title)} className="flex items-center mb-5 cursor-pointer text-lg relative whitespace-nowrap gap-x-2">
                {activeTab === item.title ? item.activeIcon : item.icon}
                {activeTab !== "Search" && <p className={`${activeTab === item.title ? "font-bold text-red-500" : "font-semyibold"}`}>{item.title}</p>}
                {item.title === "Tin Nhắn" && unreadMessageCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center notification-badge">
                    {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                  </div>
                )}
                {item.title === "Thông Báo" && unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center notification-badge">
                    {unreadCount}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>}
        <div className="flex items-center cursor-pointer pb-10">
          <Menu>
            <MenuButton as={Button} leftIcon={<FiSettings />} variant="ghost" width="100%" justifyContent="flex-start">
              Cài Đặt
            </MenuButton>
            <MenuList>
              <MenuItem onClick={handleShowPolicy}>Xem chính sách</MenuItem>
              <MenuItem onClick={handleShowBlocked}>Đã chặn</MenuItem>
              <MenuItem onClick={handleLogout} style={{ color: 'red' }}>Đăng xuất</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </div>
      {/* Modal hiển thị chính sách mới nhất */}
      <Modal isOpen={isPolicyOpen} onClose={onPolicyClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Chính sách mới nhất</ModalHeader>
          <ModalCloseButton />
          <ModalBody maxH="70vh" overflowY="auto">
            {policyLoading ? (
              <div className="flex justify-center items-center py-8"><Spinner /></div>
            ) : latestPolicy ? (
              <div>
                <h2 className="text-lg font-bold mb-2">{latestPolicy.tieuDe}</h2>
                <div className="whitespace-pre-line border rounded p-2 bg-gray-50 mb-2">{latestPolicy.noiDung}</div>
                <div className="text-xs text-gray-500">Cập nhật: {latestPolicy.ngayCapNhat ? new Date(latestPolicy.ngayCapNhat).toLocaleString() : ''}</div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">Không tìm thấy chính sách nào.</div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      {/* Modal hiển thị danh sách đã chặn */}
      <Modal isOpen={isBlockedOpen} onClose={onBlockedClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Danh sách đã chặn</ModalHeader>
          <ModalCloseButton />
          <ModalBody maxH="70vh" overflowY="auto">
            {blockedLoading ? (
              <div className="flex justify-center items-center py-8"><Spinner /></div>
            ) : blockedList.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Bạn chưa chặn ai.</div>
            ) : (
              <div className="space-y-3">
                {blockedList.map(user => (
                  <div key={user.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                    <img
                      className="w-10 h-10 rounded-full object-cover"
                      src={user.anhDaiDien || "/anhbandau.jpg"}
                      alt={user.hoTen || "User"}
                    />
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-900">{user.hoTen || "Username"}</p>
                      <p className="text-sm text-gray-500">{user.email || "email@example.com"}</p>
                    </div>
                    <Button colorScheme="blue" size="sm" onClick={() => handleUnblock(user.id)} isLoading={blockedRefreshing}>
                      Bỏ chặn
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      <CreatePostModal onClose={onClose} isOpen={isOpen} />
      <NotificationPanel 
        onClose={onNotificationClose} 
        isOpen={isNotificationOpen} 
        userId={JSON.parse(localStorage.getItem('user') || '{}').id}
        onShowPostModal={(post) => {
          setPostDetail(post);
          setShowPostModal(true);
          onNotificationClose();
        }}
      />
      {showPostModal && postDetail && (
        <BaiDangChiTietModal
          post={postDetail}
          isOpen={showPostModal}
          onClose={() => setShowPostModal(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;
