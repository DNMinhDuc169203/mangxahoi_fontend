import React, { useState, useEffect } from "react";
import { IoReorderThreeOutline } from "react-icons/io5";
import { menu } from "./SidebarConfig";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@chakra-ui/react";
import CreatePostModal from "../BaiViet/TaoBaiDangModal";
import NotificationPanel from "../ThongBao/NotificationPanel";

const Sidebar = ({ isSearchVisible, setIsSearchVisible }) => {
  const [activeTab, setActiveTab] = useState();
  const navigate = useNavigate();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { 
    isOpen: isNotificationOpen, 
    onClose: onNotificationClose, 
    onOpen: onNotificationOpen 
  } = useDisclosure();

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
    if (title === "Profile") {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user && user.id) {
        navigate(`/profile/${user.id}`);
      }
      return;
    }
    else if (title === "Home") {
      navigate("/");
    }
    else if (title === "Create") {
      onOpen();
    }
    else if (title === "Notification") {
      onNotificationOpen();
    }
    if (title === "Search") {
      setIsSearchVisible(true);
    }
    else {
      setIsSearchVisible(false);
    }
  };

  return (
    <div className="sticky top-0 h-[100vh] flex">
      <div className={`flex flex-col justify-between h-full ${activeTab === "Search" ? "px-2" : "px-10"}`}>
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
              <div key={item.title} onClick={() => handleTabClick(item.title)} className="flex items-center mb-5 cursor-pointer text-lg relative">
                {activeTab === item.title ? item.activeIcon : item.icon}
                {activeTab !== "Search" && <p className={`${activeTab === item.title ? "font-bold text-red-500" : "font-semyibold"}`}>{item.title}</p>}
                {item.title === "Notification" && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center notification-badge">
                    3
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>}
        <div className="flex items-center cursor-pointer pb-10">
          <IoReorderThreeOutline className="text-2xl" />
          {activeTab !== "Search" && <p className="ml-5">More</p>}
        </div>
      </div>
      <CreatePostModal onClose={onClose} isOpen={isOpen} />
      <NotificationPanel 
        onClose={onNotificationClose} 
        isOpen={isNotificationOpen} 
        userId={JSON.parse(localStorage.getItem('user') || '{}').id}
      />
    </div>
  );
};

export default Sidebar;
