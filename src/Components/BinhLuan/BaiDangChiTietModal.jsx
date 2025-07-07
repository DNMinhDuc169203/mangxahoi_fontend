import React, { useState, useRef, useEffect } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody, Box, Image, Text, Avatar, Flex, VStack, IconButton, Input, Button, Icon, HStack } from '@chakra-ui/react';
import { AiFillHeart, AiOutlineLeft, AiOutlineRight, AiOutlineGlobal, AiFillLock } from 'react-icons/ai';
import { FaComment, FaRegSmile, FaUserFriends } from 'react-icons/fa';
import { BsThreeDots } from 'react-icons/bs';
import axios from "axios";
import EmojiPicker from 'emoji-picker-react';
import ModalTuyChonBaiViet from '../BaiViet/ModalTuyChonBaiViet';
import ModalBaoCaoBaiViet from '../BaiViet/ModalBaoCaoBaiViet';
import ModalChinhSuaBaiViet from '../BaiViet/ModalChinhSuaBaiViet';
import ModalChonQuyenRiengTu from '../BaiViet/ModalChonQuyenRiengTu';

function formatTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay >= 1) {
    return `${diffDay} ngày trước`;
  } else if (diffHour >= 1) {
    return `${diffHour} giờ trước`;
  } else if (diffMin >= 1) {
    return `${diffMin} phút trước`;
  } else {
    return `Vừa xong`;
  }
}

const PostDetailModal = ({ post, isOpen, onClose, onCommentAdded, onLikeChanged, onPostDeleted, onPostUpdated }) => {
  const [currentImg, setCurrentImg] = useState(0);
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showAll, setShowAll] = useState(false);
  const maxShow = 2;
  const shownComments = showAll ? comments : comments.slice(0, maxShow);

  // Lấy token từ localStorage (hoặc context nếu bạn dùng context)
  const token = localStorage.getItem('token');

  // State cho phản hồi từng bình luận
  const [replyBox, setReplyBox] = useState({}); // { [binhLuanId]: true/false }
  const [replies, setReplies] = useState({}); // { [binhLuanId]: [replyList] }
  const [loadingReplies, setLoadingReplies] = useState({}); // { [binhLuanId]: true/false }
  const [showAllReplies, setShowAllReplies] = useState({}); // { [binhLuanId]: true/false }

  // State cho like bài viết
  const [liked, setLiked] = useState(post?.daThich || false);
  const [likeCount, setLikeCount] = useState(post?.soLuotThich || 0);

  // Thêm state quản lý like và likeCount cho từng bình luận
  const [commentLikes, setCommentLikes] = useState({}); // { [binhLuanId]: { liked: bool, count: number } }

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id;

  const [showEmoji, setShowEmoji] = useState(false);

  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const isOwnPost = post && (post.idNguoiDung === user.id);

  // States cho các modal mới
  const [isBaoCaoModalOpen, setIsBaoCaoModalOpen] = useState(false);
  const [isChinhSuaModalOpen, setIsChinhSuaModalOpen] = useState(false);
  const [isQuyenRiengTuModalOpen, setIsQuyenRiengTuModalOpen] = useState(false);

  React.useEffect(() => {
    setCurrentImg(0);
  }, [post]);

  // Lấy bình luận động từ API khi post thay đổi
  React.useEffect(() => {
    if (!post?.id) return;
    setLoadingComments(true);
    axios
      .get(`http://localhost:8080/network/api/binh-luan/bai-viet/${post.id}?page=0&size=10`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      )
      .then(res => {
        setComments(res.data.binhLuan || []);
        setTotalComments(res.data.tongSoBinhLuan || 0);
        // Đồng bộ trạng thái like cho từng bình luận
        const likeMap = {};
        (res.data.binhLuan || []).forEach(c => {
          likeMap[c.id] = { liked: c.daThich || false, count: c.soLuotThich || 0 };
        });
        setCommentLikes(likeMap);
      })
      .catch(() => {
        setComments([]);
        setTotalComments(0);
        setCommentLikes({});
      })
      .finally(() => setLoadingComments(false));
  }, [post, token]);

  useEffect(() => {
    setLikeCount(post?.soLuotThich || 0);
    setLiked(post?.daThich || false); // Nếu backend trả về trường này
  }, [post]);

  // Tự động fetch phản hồi cho mỗi bình luận cha có phản hồi khi render
  React.useEffect(() => {
    comments.forEach(c => {
      if (c.soLuotPhanHoi > 0 && !replies[c.id]) {
        fetchReplies(c.id, 1);
      }
    });
    // eslint-disable-next-line
  }, [comments]);

  // Reset state khi modal đóng
  useEffect(() => {
    if (!isOpen) {
      setComments([]);
      setReplies({});
      setReplyBox({});
      setShowAllReplies({});
      setLoadingReplies({});
      setNewComment("");
      setCurrentImg(0);
      setShowAll(false);
      setLoadingComments(false);
      // Nếu có thêm state nào liên quan, reset ở đây
    }
  }, [isOpen]);

  // Khi props post thay đổi, đồng bộ lại totalComments
  useEffect(() => {
    setTotalComments(post?.soLuotBinhLuan || 0);
  }, [post?.soLuotBinhLuan]);

  useEffect(() => {
    const handleClick = () => setMenuOpenId(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // Fetch toàn bộ replies cho tất cả bình luận gốc để tính tổng số bình luận (bao gồm cả reply)
  useEffect(() => {
    if (!comments || comments.length === 0) return;
    const fetchAllReplies = async () => {
      const replyData = {};
      await Promise.all(
        comments.map(async (c) => {
          try {
            const res = await axios.get(
              `http://localhost:8080/network/api/binh-luan/${c.id}/phan-hoi?page=0&size=1000`,
              token ? { headers: { Authorization: `Bearer ${token}` } } : {}
            );
            replyData[c.id] = res.data.binhLuan || [];
          } catch {
            replyData[c.id] = [];
          }
        })
      );
      setReplies(replyData);
    };
    fetchAllReplies();
    // eslint-disable-next-line
  }, [comments]);

  // Tính tổng số bình luận (bao gồm cả reply)
  const totalAllComments = (comments || []).reduce(
    (sum, c) => sum + 1 + (replies[c.id]?.length || 0),
    0
  );

  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  const prevPost = usePrevious(post);

  if (!post) return null;

  const images = post.mediaUrls || [];
  const hasImages = images.length > 0;

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentImg((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentImg((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Sửa lại hàm gửi bình luận
  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    try {
      await axios.post(
        `http://localhost:8080/network/api/binh-luan/bai-viet/${post.id}`,
        null,
        {
          params: { noiDung: newComment },
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      setNewComment("");
      setLoadingComments(true);
      const res = await axios.get(
        `http://localhost:8080/network/api/binh-luan/bai-viet/${post.id}?page=0&size=10`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      setComments(res.data.binhLuan || []);
      setTotalComments(res.data.tongSoBinhLuan || 0);
      setLoadingComments(false);
      if (onCommentAdded) onCommentAdded();
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
      setLoadingComments(false);
    }
  };

  const fetchReplies = async (binhLuanId, size = 0) => {
    if (loadingReplies[binhLuanId]) return;
    
    setLoadingReplies(prev => ({ ...prev, [binhLuanId]: true }));
    
    try {
      const res = await axios.get(
        `http://localhost:8080/network/api/binh-luan/${binhLuanId}/phan-hoi?page=0&size=${size || 1000}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      
      setReplies(prev => ({
        ...prev,
        [binhLuanId]: res.data.binhLuan || []
      }));
      
      // Cập nhật trạng thái like cho replies
      const likeMap = { ...commentLikes };
      (res.data.binhLuan || []).forEach(r => {
        likeMap[r.id] = { liked: r.daThich || false, count: r.soLuotThich || 0 };
      });
      setCommentLikes(likeMap);
      
    } catch (error) {
      console.error("Lỗi khi fetch replies:", error);
      setReplies(prev => ({ ...prev, [binhLuanId]: [] }));
    } finally {
      setLoadingReplies(prev => ({ ...prev, [binhLuanId]: false }));
    }
  };

  const handleSendReply = async (rootCommentId, postId, value, resetInput) => {
    if (!value.trim()) return;
    
    try {
      await axios.post(
        `http://localhost:8080/network/api/binh-luan/bai-viet/${postId}/binh-luan/${rootCommentId}`,
        null,
        {
          params: { noiDung: value },
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      
      resetInput();
      await fetchReplies(rootCommentId, 1000);
      
      // Cập nhật tổng số bình luận
      const res = await axios.get(
        `http://localhost:8080/network/api/binh-luan/bai-viet/${post.id}?page=0&size=10`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      setTotalComments(res.data.tongSoBinhLuan || 0);
      
    } catch (error) {
      console.error("Lỗi khi gửi reply:", error);
    }
  };

  const renderCheDo = (cheDo) => {
    switch (cheDo) {
      case 'cong_khai':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-gray-500 text-xs">
            <AiOutlineGlobal /> Công khai
          </span>
        );
      case 'ban_be':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-gray-500 text-xs">
            <FaUserFriends /> Bạn bè
          </span>
        );
      case 'rieng_tu':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-gray-500 text-xs">
            <AiFillLock /> Riêng tư
          </span>
        );
      default:
        return null;
    }
  };

  const handleLikePost = async () => {
    if (!post?.id) return;
    try {
      setLiked(true);
      setLikeCount(prev => prev + 1);
      if (onLikeChanged) onLikeChanged(true, likeCount + 1);
      await axios.post(
        `http://localhost:8080/network/api/bai-viet/${post.id}/thich`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      setLiked(false);
      setLikeCount(prev => prev - 1);
      if (onLikeChanged) onLikeChanged(false, likeCount - 1);
      console.error("Lỗi khi thích bài viết:", error);
    }
  };

  const handleUnlikePost = async () => {
    if (!post?.id) return;
    try {
      setLiked(false);
      setLikeCount(prev => Math.max(0, prev - 1));
      if (onLikeChanged) onLikeChanged(false, Math.max(0, likeCount - 1));
      await axios.delete(
        `http://localhost:8080/network/api/bai-viet/${post.id}/thich`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      setLiked(true);
      setLikeCount(prev => prev + 1);
      if (onLikeChanged) onLikeChanged(true, likeCount + 1);
      console.error("Lỗi khi bỏ thích bài viết:", error);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      setCommentLikes(prev => ({
        ...prev,
        [commentId]: {
          ...prev[commentId],
          liked: true,
          count: (prev[commentId]?.count || 0) + 1
        }
      }));
      
      await axios.post(
        `http://localhost:8080/network/api/binh-luan/${commentId}/thich`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      setCommentLikes(prev => ({
        ...prev,
        [commentId]: {
          ...prev[commentId],
          liked: false,
          count: Math.max(0, (prev[commentId]?.count || 0) - 1)
        }
      }));
      console.error("Lỗi khi thích bình luận:", error);
    }
  };

  const handleUnlikeComment = async (commentId) => {
    try {
      setCommentLikes(prev => ({
        ...prev,
        [commentId]: {
          ...prev[commentId],
          liked: false,
          count: Math.max(0, (prev[commentId]?.count || 0) - 1)
        }
      }));
      
      await axios.delete(
        `http://localhost:8080/network/api/binh-luan/${commentId}/thich`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      setCommentLikes(prev => ({
        ...prev,
        [commentId]: {
          ...prev[commentId],
          liked: true,
          count: (prev[commentId]?.count || 0) + 1
        }
      }));
      console.error("Lỗi khi bỏ thích bình luận:", error);
    }
  };

  const CommentItem = ({ comment, level = 0, postId, rootCommentId, token, fetchReplies, replies, loadingReplies, showAllReplies, setShowAllReplies, replyBox, setReplyBox, handleSendReply, liked, likeCount, onLike, onUnlike }) => {
    const [replyText, setReplyText] = useState("");
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleReplyClick = () => {
      setShowReplyInput(!showReplyInput);
      setReplyText("");
    };

    const handleSendReplyClick = async () => {
      if (!replyText.trim()) return;
      
      const resetInput = () => {
        setReplyText("");
        setShowReplyInput(false);
      };
      
      await handleSendReply(rootCommentId || comment.id, postId, replyText, resetInput);
    };

    const handleSelectEmoji = (emojiData) => {
      setReplyText(replyText + emojiData.emoji);
      setShowEmojiPicker(false);
    };

    return (

      <Box mb={2} ml={level * 6}>
        <Flex align="center" gap={2}>
          <Avatar src={comment.anhDaiDienNguoiDung || "/anhbandau.jpg"}  size={level === 0 ? "sm" : "xs"} />
          <Text fontWeight="bold" fontSize="sm">{comment.hoTenNguoiDung || "Ẩn danh"}</Text>
          <Box flex={1} />
          <Box position="relative">
            <IconButton
              icon={<Box as="span" fontSize="xl">...</Box>}
              variant="ghost"
              size="xs"
              aria-label="menu"
              tabIndex={-1}
              onClick={e => {
                e.stopPropagation();
                setMenuOpenId(comment.id === menuOpenId ? null : comment.id);
              }}
            />
            {menuOpenId === comment.id && (
              <Box
                position="absolute"
                top="calc(100% + 8px)"
                right={0}
                bg="white"
                borderRadius="xl"
                boxShadow="0 4px 16px rgba(0,0,0,0.15)"
                minW="180px"
                py={1}
                zIndex={20}
                overflow="hidden"
                onClick={e => e.stopPropagation()}
              >
                {/* Mũi tên tam giác */}
                <Box
                  position="absolute"
                  top="-8px"
                  right="18px"
                  width="16px"
                  height="8px"
                  zIndex={21}
                  style={{ pointerEvents: 'none' }}

                >
                  {likeCount}
                </Button>
                {level === 0 && (
                  <Button size="xs" variant="ghost" onClick={handleReplyClick}>
                    Trả lời
                  </Button>
                )}
                <Text fontSize="xs" color="gray.500">
                  {formatTimeAgo(comment.ngayTao)}
                </Text>
              </Flex>
            </Box>
          </Flex>
        </Flex>

        {/* Reply input */}
        {showReplyInput && (
          <Box mt={3} ml={8}>
            <Flex gap={2} align="center">
              <IconButton
                size="sm"
                icon={<FaRegSmile />}
                variant="ghost"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              />
              {showEmojiPicker && (
                <Box position="absolute" bottom="40px" left="0" zIndex={20}>
                  <EmojiPicker onEmojiClick={handleSelectEmoji} theme="light" />
                </Box>
              )}
              <Input
                size="sm"
                placeholder="Viết phản hồi..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendReplyClick();
                  }
                }}
                flex={1}
              />
              <Button size="sm" colorScheme="blue" onClick={handleSendReplyClick}>
                Gửi
              </Button>
            </Flex>
          </Box>
        )}

        {/* Show replies */}
        {level === 0 && comment.soLuotPhanHoi > 0 && (
          <Box ml={4} mt={2}>
            {loadingReplies[comment.id] ? (
              <Text color="gray.400" fontSize="sm">Đang tải phản hồi...</Text>
            ) : (
              <>
                {replies[comment.id] && replies[comment.id].map((r, ridx) => (
                  <CommentItem
                    key={r.id || ridx}
                    comment={r}
                    level={1}
                    postId={postId}
                    rootCommentId={comment.id}
                    token={token}
                    fetchReplies={fetchReplies}
                    replies={replies}
                    loadingReplies={loadingReplies}
                    showAllReplies={showAllReplies}
                    setShowAllReplies={setShowAllReplies}
                    replyBox={replyBox}
                    setReplyBox={setReplyBox}
                    handleSendReply={handleSendReply}
                    liked={commentLikes[r.id]?.liked || false}
                    likeCount={commentLikes[r.id]?.count || 0}
                    onLike={handleLikeComment}
                    onUnlike={handleUnlikeComment}
                  />
                ))}
                <Text color="gray.500" fontWeight="bold" cursor="pointer" ml={2} onClick={async () => {
                  setShowAllReplies(prev => ({ ...prev, [comment.id]: false }));
                }}>
                  Ẩn bớt phản hồi
                </Text>
              </>
            )}
          </Box>
        )}
        {/* Nút xem tất cả phản hồi */}
        {level === 0 && !showAllReplies[comment.id] && comment.soLuotPhanHoi > 0 && (
          <Text color="blue.500" fontWeight="bold" cursor="pointer" ml={2} onClick={async () => {
            setShowAllReplies(prev => ({ ...prev, [comment.id]: true }));
            await fetchReplies(comment.id, 100);
          }}>
            Xem tất cả {comment.soLuotPhanHoi} phản hồi
          </Text>
        )}
      </Box>
    );
  };

  const handleSelectEmoji = (emojiData) => {
    setNewComment(newComment + emojiData.emoji);
    setShowEmoji(false);
  };

  // Các hàm xử lý API thực sự
  const handleEdit = () => {
    setIsOptionModalOpen(false);
    setIsChinhSuaModalOpen(true);
  };

  const handlePrivacy = () => {
    setIsOptionModalOpen(false);
    setIsQuyenRiengTuModalOpen(true);
  };

  const handleDelete = async () => {
    setIsOptionModalOpen(false);
    
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      await axios.delete(
        `http://localhost:8080/network/api/bai-viet/${post.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (onPostDeleted) {
        onPostDeleted(post.id);
      }
      
      onClose();
    } catch (error) {
      console.error('Lỗi khi xóa bài viết:', error);
    }
  };

  const handleReport = () => {
    setIsOptionModalOpen(false);
    setIsBaoCaoModalOpen(true);
  };

  const handlePostUpdated = (updatedPost) => {
    if (onPostUpdated) {
      onPostUpdated(updatedPost);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
      <ModalOverlay />
      <ModalContent maxW="900px" minH="500px" position="relative">
        {/* Nút ba chấm luôn nổi trên cùng */}
        <IconButton
          icon={<BsThreeDots />}
          position="absolute"
          top={3}
          right={3}
          zIndex={100}
          variant="ghost"
          size="md"
          aria-label="Tùy chọn"
          onClick={() => { console.log('Clicked 3 dots'); setIsOptionModalOpen(true); }}
          style={{ background: 'white' }}
        />
        <ModalTuyChonBaiViet
          isOpen={isOptionModalOpen}
          onClose={() => setIsOptionModalOpen(false)}
          isOwnPost={isOwnPost}
          onEdit={handleEdit}
          onPrivacy={handlePrivacy}
          onDelete={handleDelete}
          onReport={handleReport}
        />
        <ModalBody p={0} display="flex" position="relative">
          {/* Ảnh lớn bên trái */}
          <Box flex="1" bg="gray" display="flex" alignItems="center" justifyContent="center" position="relative">
            {hasImages ? (
              <>
                <Image src={images[currentImg]} alt="Ảnh bài viết" maxH="500px" maxW="100%" objectFit="contain" />
                {/* Carousel dots */}
                <HStack position="absolute" bottom={3} left="50%" transform="translateX(-50%)" spacing={1} zIndex={2}>
                  {images.map((_, idx) => (
                    <Box
                      key={idx}
                      w={idx === currentImg ? 3 : 2}
                      h={idx === currentImg ? 3 : 2}
                      borderRadius="full"
                      bg={idx === currentImg ? "blue.500" : "gray.300"}
                      transition="all 0.2s"
                    />
                  ))}
                </HStack>
                {images.length > 1 && (
                  <>
                    <IconButton
                      aria-label="Trước"
                      icon={<AiOutlineLeft />}
                      position="absolute"
                      left={2}
                      top="50%"
                      transform="translateY(-50%)"
                      onClick={handlePrev}
                      bg="white"
                      color="black"
                      borderRadius="full"
                      boxShadow="md"
                      _hover={{ bg: 'gray.200' }}
                      zIndex={2}
                    />
                    <IconButton
                      aria-label="Sau"
                      icon={<AiOutlineRight />}
                      position="absolute"
                      right={2}
                      top="50%"
                      transform="translateY(-50%)"
                      onClick={handleNext}
                      bg="white"
                      color="black"
                      borderRadius="full"
                      boxShadow="md"
                      _hover={{ bg: 'gray.200' }}
                      zIndex={2}
                    />
                  </>
                )}
              </>
            ) : (
              <Box color="white" textAlign="center" w="full">Không có ảnh</Box>
            )}
          </Box>
          {/* Thông tin bên phải */}
          <Box flex="1.2" p={6} minW="350px" display="flex" flexDirection="column" position="relative">
            <Flex align="center" mb={4} gap={3} justify="space-between">
              <Flex direction="column" align="flex-start" gap={0}>
                <Flex align="center" gap={2}>
                  <Avatar size="md" src={post.anhDaiDienNguoiDung || "/anhbandau.jpg"}  />
                  <Text fontWeight="bold">{post.hoTenNguoiDung}</Text>
                  {renderCheDo(post.cheDoRiengTu)}
                  <Text fontSize="sm" color="gray.500" ml={2}>
                    {post.ngayTao ? formatTimeAgo(post.ngayTao) : ""}
                  </Text>
                  
                </Flex>
              </Flex>
              {/* Nút ba chấm đã có ở góc phải */}
            </Flex>
            <VStack align="start" spacing={4} flex={1} overflowY="auto" maxH="320px">
              <Text>{post.noiDung}</Text>
              {post.hashtags && post.hashtags.length > 0 && (
                <Flex gap={2} flexWrap="wrap" mt={1}>
                  {post.hashtags.map((tag, idx) => (
                    <Box
                      key={idx}
                      px={2}
                      py={0.5}
                      bg="blue.50"
                      color="blue.600"
                      borderRadius="md"
                      fontSize="sm"
                      fontWeight="bold"
                    >
                      {tag.startsWith('#') ? tag : `#${tag}`}
                    </Box>
                  ))}
                </Flex>
              )}
              {/* Like & comment count */}
              <Flex align="center" gap={6} mt={2} mb={2}>
                <Button
                  leftIcon={<AiFillHeart color={liked ? "red" : "gray"} />}
                  colorScheme={liked ? "red" : "gray"}
                  variant="ghost"
                  onClick={liked ? handleUnlikePost : handleLikePost}
                  size="sm"
                  fontWeight="bold"
                  px={2}
                >
                  {likeCount}
                </Button>
                <Flex align="center" gap={1}><FaComment /> <span>{totalAllComments}</span></Flex>
              </Flex>
              {/* Danh sách bình luận */}
              <Box w="full" maxH="180px" overflowY="auto">
                <Flex justify="space-between" align="center" mb={1}>
                  <Text fontWeight="bold">Bình luận</Text>
                  <Text fontSize="sm" color="gray.500">{shownComments.length}/{totalComments}</Text>
                </Flex>
                {loadingComments ? (
                  <Text color="gray.400" fontSize="sm">Đang tải bình luận...</Text>
                ) : (
                  <>
                    {shownComments.map((comment) => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        level={0}
                        postId={post.id}
                        token={token}
                        fetchReplies={fetchReplies}
                        replies={replies}
                        loadingReplies={loadingReplies}
                        showAllReplies={showAllReplies}
                        setShowAllReplies={setShowAllReplies}
                        replyBox={replyBox}
                        setReplyBox={setReplyBox}
                        handleSendReply={handleSendReply}
                        liked={commentLikes[comment.id]?.liked || false}
                        likeCount={commentLikes[comment.id]?.count || 0}
                        onLike={handleLikeComment}
                        onUnlike={handleUnlikeComment}
                      />
                    ))}
                    {totalComments > maxShow && !showAll && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAll(true)}
                        color="blue.500"
                        fontWeight="bold"
                      >
                        Xem tất cả {totalComments} bình luận
                      </Button>
                    )}
                    {showAll && totalComments > maxShow && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAll(false)}
                        color="gray.500"
                        fontWeight="bold"
                      >
                        Ẩn bớt bình luận
                      </Button>
                    )}
                  </>
                )}
              </Box>
            </VStack>
            {/* Input bình luận */}
            <Box mt={4} pt={4} borderTop="1px" borderColor="gray.200">
              <Flex gap={2} align="center">
                <IconButton
                  size="sm"
                  icon={<FaRegSmile />}
                  variant="ghost"
                  onClick={() => setShowEmoji(!showEmoji)}
                />
                {showEmoji && (
                  <Box position="absolute" bottom="40px" left="0" zIndex={20}>
                    <EmojiPicker onEmojiClick={handleSelectEmoji} theme="light" />
                  </Box>
                )}
                <Input
                  placeholder="Thêm bình luận..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendComment();
                    }
                  }}
                  flex={1}
                />
                <Button
                  colorScheme="blue"
                  size="sm"
                  onClick={handleSendComment}
                  isDisabled={!newComment.trim()}
                >
                  Gửi
                </Button>
              </Flex>
            </Box>
          </Box>
        </ModalBody>
      </ModalContent>

      {/* Các modal mới */}
      <ModalBaoCaoBaiViet
        isOpen={isBaoCaoModalOpen}
        onClose={() => setIsBaoCaoModalOpen(false)}
        postId={post?.id}
        postTitle={post?.noiDung}
      />

      <ModalChinhSuaBaiViet
        isOpen={isChinhSuaModalOpen}
        onClose={() => setIsChinhSuaModalOpen(false)}
        post={post}
        onPostUpdated={handlePostUpdated}
      />

      <ModalChonQuyenRiengTu
        isOpen={isQuyenRiengTuModalOpen}
        onClose={() => setIsQuyenRiengTuModalOpen(false)}
        post={post}
        onPostUpdated={handlePostUpdated}
      />
    </Modal>
  );
};

export default PostDetailModal;
