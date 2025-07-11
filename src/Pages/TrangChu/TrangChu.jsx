import React from "react";
import axios from "axios";
import { useEffect, useState, useRef } from "react";

import HomeRight from "../../Components/TrangChuPhai/TrangChuBenPhai";
import PostCard from "../../Components/BaiViet/BaiDang";
import CreatePostModal from "../../Components/BaiViet/TaoBaiDangModal";
import { useDisclosure } from "@chakra-ui/react";
import BanDangNghiGi from "../../Components/BaiViet/BanDangNghiGi";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@chakra-ui/react';

const HomePage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const size = 10;
  const loadingMoreRef = useRef(false);
  const [modalPost, setModalPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const policyModal = useDisclosure();
  const [policy, setPolicy] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('showPolicyModal') && !localStorage.getItem('hasSeenPolicy')) {
      axios.get('http://localhost:8080/network/api/chinh-sach/moi-nhat', { headers: {} })
        .then(res => {
          setPolicy(res.data);
          policyModal.onOpen();
          localStorage.removeItem('showPolicyModal');
        })
        .catch(() => {
          localStorage.removeItem('showPolicyModal');
        });
    }
  }, []);

  const handleClosePolicyModal = () => {
    localStorage.setItem('hasSeenPolicy', 'true');
    localStorage.removeItem('showPolicyModal');
    policyModal.onClose();
  };

  useEffect(() => {
    const fetchNewsfeed = async () => {
      loadingMoreRef.current = true;
      if (page === 0) setLoading(true);
      else setLoadingMore(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:8080/network/api/bai-viet/newsfeed?page=${page}&size=${size}`,
          { headers: { Authorization: `Bearer ${token}` } });
        const newPosts = res.data.baiViet || [];
        if (page === 0) {
          setPosts(newPosts);
          if (newPosts.length === 0) setError("Không có bài viết nào.");
        } else {
          setPosts(prev => [...prev, ...newPosts]);
        }
        setHasMore(newPosts.length === size);
      } catch (err) {
        setError("Không thể tải newsfeed.");
      } finally {
        if (page === 0) setLoading(false);
        else setLoadingMore(false);
        loadingMoreRef.current = false;
      }
    };
    fetchNewsfeed();
    // eslint-disable-next-line
  }, [page]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMoreRef.current || !hasMore) return;
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      if (scrollY + windowHeight >= docHeight - 200) {
        setPage(prev => prev + 1);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore]);

  const handleLikePost = (postId, liked) => {
    setPosts(prevPosts => prevPosts.map(p =>
      p.id === postId ? { ...p, daThich: liked, soLuotThich: p.soLuotThich + (liked ? 1 : -1) } : p
    ));
  };

  const handleCommentAdded = (postId) => {
    setPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId ? { ...p, soLuotBinhLuan: (p.soLuotBinhLuan || 0) + 1 } : p
      )
    );
  };

  const handlePostDeleted = (postId) => {
    setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(prevPosts => prevPosts.map(p => p.id === updatedPost.id ? updatedPost : p));
    setModalPost(prev => (prev && prev.id === updatedPost.id ? updatedPost : prev));
  };

  return (
    <div>
      {/* Modal chính sách */}
      <Modal isOpen={policyModal.isOpen} onClose={handleClosePolicyModal} isCentered size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Chính sách sử dụng TopTrend</ModalHeader>
          <ModalBody>
            {policy ? (
              <>
                <div className="font-bold mb-2">{policy.tieuDe}</div>
                <div style={{ whiteSpace: 'pre-line' }}>{policy.noiDung}</div>
              </>
            ) : 'Đang tải...'}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleClosePolicyModal}>Tôi đã đọc và đồng ý</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <div className="mt-10 flex w-[100%] justify-center">
        <div className="w-[44%] px-10">
          <div className="storyDiv flex space-x-2 border p-4 rounded-md justify-start w-full">
          
            <BanDangNghiGi/>
          </div>

          <div className="space-y-10 w-full mt-10">
            {loading ? (
              <div>Đang tải bài viết...</div>
            ) : error ? (
              <div>{error}</div>
            ) : posts.length === 0 ? (
              <div>Không có bài viết nào.</div>
            ) : (
              posts.filter(post => !post.biAn && post.biAn !== 1).map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLikePost={handleLikePost}
                  onCommentAdded={handleCommentAdded}
                  onPostDeleted={handlePostDeleted}
                  onPostUpdated={handlePostUpdated}
                />
              ))
            )}
            {loadingMore && <div className="text-center py-4">Đang tải thêm...</div>}
          </div>
        </div>
        <div className="w-[35%]">
          <HomeRight/>
        </div>
      </div>

 
    </div>
  );
};

export default HomePage;
