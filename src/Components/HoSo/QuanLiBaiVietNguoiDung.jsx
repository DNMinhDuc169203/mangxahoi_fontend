import React, { useState, useEffect } from "react";
import { AiOutlineTable, AiOutlineUser } from "react-icons/ai";
import { BiBookmark } from "react-icons/bi";
import { RiVideoAddLine } from "react-icons/ri";
import ReqUserPostCard from "./ChiTietBaiVietNguoiDung";
import axios from "axios";
import PostDetailModal from "../BinhLuan/BaiDangChiTietModal";

const ReqUserPostPart = ({ userId }) => {
  const [activeTab, setActiveTab] = useState("Post");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalPost, setModalPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabs = [
    { tab: "Post", icon: <AiOutlineTable></AiOutlineTable> },
    { tab: "Reels", icon: <RiVideoAddLine></RiVideoAddLine> },
    { tab: "Saved", icon: <BiBookmark /> },
    { tab: "Tagged", icon: <AiOutlineUser></AiOutlineUser> },
  ];

  useEffect(() => {
    if (activeTab === "Post") {
      const fetchPosts = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem("token");
          if (!userId) return;
          const res = await axios.get(
            `http://localhost:8080/network/api/bai-viet/nguoi-dung/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setPosts(res.data.baiViet || []);
        } catch {
          setPosts([]);
        } finally {
          setLoading(false);
        }
      };
      fetchPosts();
    }
  }, [activeTab, userId]);

  const handleOpenModal = (post) => {
    setModalPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalPost(null);
  };

  return (
    <div>
      <div className="flex space-x-14 border-t relative">
        {tabs.map((item) => (
          <div
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={` ${
              activeTab === item.tab ? "border-t border-black" : "opacity-60"
            } flex items-center cursor-pointer py-2 text-sm`}
          >
            <p>{item.icon}</p>
            <p className="ml-1">{item.tab}</p>
          </div>
        ))}
      </div>
      <div>
        {activeTab === "Post" && (
          <div className="flex flex-wrap">
            {loading ? (
              <div>Đang tải bài viết...</div>
            ) : posts.length === 0 ? (
              <div>Chưa có bài viết nào.</div>
            ) : (
              posts.map((post) => (
                <ReqUserPostCard key={post.id} post={post} onClick={() => handleOpenModal(post)} />
              ))
            )}
          </div>
        )}
        <PostDetailModal 
          post={modalPost} 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          onCommentAdded={() => {
            if (!modalPost) return;
            setPosts(prev => prev.map(p => p.id === modalPost.id ? { ...p, soLuotBinhLuan: (p.soLuotBinhLuan || 0) + 1 } : p));
            setModalPost(prev => prev ? { ...prev, soLuotBinhLuan: (prev.soLuotBinhLuan || 0) + 1 } : prev);
          }}
        />
        {/* Các tab khác giữ nguyên hoặc render nội dung khác nếu muốn */}
      </div>
    </div>
  );
};

export default ReqUserPostPart;
