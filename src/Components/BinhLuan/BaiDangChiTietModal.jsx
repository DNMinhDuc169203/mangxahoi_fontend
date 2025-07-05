import React, { useState, useRef, useEffect } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody, Box, Image, Text, Avatar, Flex, VStack, IconButton, Input, Button, Icon, HStack } from '@chakra-ui/react';
import { AiFillHeart, AiOutlineLeft, AiOutlineRight, AiOutlineGlobal, AiFillLock } from 'react-icons/ai';
import { FaComment, FaRegSmile, FaUserFriends } from 'react-icons/fa';
import { BsThreeDots } from 'react-icons/bs';
import axios from "axios";

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

const PostDetailModal = ({ post, isOpen, onClose, onCommentAdded, onLikeChanged }) => {
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
      if (typeof onCommentAdded === "function") onCommentAdded(post.id);
    } catch (err) {
      setLoadingComments(false);
    }
  };

  // Sửa fetchReplies để nhận size
  const fetchReplies = async (binhLuanId, size = 0) => {
    setLoadingReplies(prev => ({ ...prev, [binhLuanId]: true }));
    try {
      const res = await axios.get(
        `http://localhost:8080/network/api/binh-luan/${binhLuanId}/phan-hoi?page=0&size=${size}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      setReplies(prev => ({ ...prev, [binhLuanId]: res.data.binhLuan || [] }));
      // Đồng bộ trạng thái like cho từng reply
      setCommentLikes(prev => {
        const newLikes = { ...prev };
        (res.data.binhLuan || []).forEach(r => {
          newLikes[r.id] = { liked: r.daThich || false, count: r.soLuotThich || 0 };
        });
        return newLikes;
      });
    } catch {
      setReplies(prev => ({ ...prev, [binhLuanId]: [] }));
    } finally {
      setLoadingReplies(prev => ({ ...prev, [binhLuanId]: false }));
    }
  };

  // Component ô nhập phản hồi dùng state cục bộ, React.memo
  const ReplyInput = React.memo(({ onSend }) => {
    const [value, setValue] = useState("");
    const inputRef = useRef();
    useEffect(() => { inputRef.current && inputRef.current.focus(); }, []);
    return (
      <Flex mt={2} gap={2} align="center">
        <Input
          ref={inputRef}
          size="sm"
          placeholder="Phản hồi..."
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onSend(value, setValue); }}
        />
        <Button size="sm" colorScheme="blue" isDisabled={!value.trim()} onClick={() => onSend(value, setValue)}>Gửi</Button>
      </Flex>
    );
  });

  // Hàm gửi phản hồi
  const handleSendReply = async (rootCommentId, postId, value, resetInput) => {
    const text = value?.trim();
    if (!text) return;
    try {
      await axios.post(
        `http://localhost:8080/network/api/binh-luan/bai-viet/${postId}/binh-luan/${rootCommentId}`,
        null,
        {
          params: { noiDung: text },
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      if (resetInput) resetInput("");
      fetchReplies(rootCommentId, 100);
      setShowAllReplies(prev => ({ ...prev, [rootCommentId]: true }));
      // Fetch lại tổng số bình luận để đồng bộ tuyệt đối
      try {
        const res = await axios.get(
          `http://localhost:8080/network/api/binh-luan/bai-viet/${postId}?page=0&size=1`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        );
        setTotalComments(res.data.tongSoBinhLuan || 0);
        // Cập nhật số lượng bình luận ở component cha
        if (typeof onCommentAdded === "function") onCommentAdded(postId, res.data.tongSoBinhLuan || 0);
      } catch {}
    } catch {}
  };

  // Hàm render chế độ bài viết
  const renderCheDo = (cheDo) => {
    switch (cheDo) {
      case 'cong_khai':
        return (
          <Flex align="center" gap={1} color="gray.500" fontSize="sm" px={2} py={0.5} bg="gray.100" borderRadius="md">
            <AiOutlineGlobal /> Công khai
          </Flex>
        );
      case 'ban_be':
        return (
          <Flex align="center" gap={1} color="gray.500" fontSize="sm" px={2} py={0.5} bg="gray.100" borderRadius="md">
            <FaUserFriends /> Bạn bè
          </Flex>
        );
      case 'rieng_tu':
        return (
          <Flex align="center" gap={1} color="gray.500" fontSize="sm" px={2} py={0.5} bg="gray.100" borderRadius="md">
            <AiFillLock /> Riêng tư
          </Flex>
        );
      default:
        return null;
    }
  };

  // Thêm hook usePrevious
  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => { ref.current = value; }, [value]);
    return ref.current;
  }

  // Hàm gọi API thích bài viết
  const handleLikePost = async () => {
    if (!token) return;
    try {
      await axios.post(
        `http://localhost:8080/network/api/bai-viet/${post.id}/thich`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(true);
      setLikeCount(likeCount + 1);
      if (typeof onLikeChanged === 'function') onLikeChanged(true, likeCount + 1);
    } catch (err) {
      // Xử lý lỗi nếu cần
    }
  };

  // Hàm gọi API bỏ thích bài viết
  const handleUnlikePost = async () => {
    if (!token) return;
    try {
      await axios.delete(
        `http://localhost:8080/network/api/bai-viet/${post.id}/thich`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(false);
      setLikeCount(likeCount > 0 ? likeCount - 1 : 0);
      if (typeof onLikeChanged === 'function') onLikeChanged(false, likeCount > 0 ? likeCount - 1 : 0);
    } catch (err) {
      // Xử lý lỗi nếu cần
    }
  };

  // Hàm like/unlike bình luận cập nhật state ở cha
  const handleLikeComment = async (commentId) => {
    if (!token) return;
    try {
      await axios.post(
        `http://localhost:8080/network/api/binh-luan/${commentId}/thich`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentLikes(prev => ({
        ...prev,
        [commentId]: {
          liked: true,
          count: (prev[commentId]?.count || 0) + 1
        }
      }));
    } catch {}
  };
  const handleUnlikeComment = async (commentId) => {
    if (!token) return;
    try {
      await axios.delete(
        `http://localhost:8080/network/api/binh-luan/${commentId}/thich`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentLikes(prev => ({
        ...prev,
        [commentId]: {
          liked: false,
          count: (prev[commentId]?.count || 1) - 1 < 0 ? 0 : (prev[commentId]?.count || 1) - 1
        }
      }));
    } catch {}
  };

  // Đệ quy render bình luận lồng nhiều cấp (chỉ 2 cấp: gốc và phản hồi)
  const CommentItem = ({ comment, level = 0, postId, rootCommentId, token, fetchReplies, replies, loadingReplies, showAllReplies, setShowAllReplies, replyBox, setReplyBox, handleSendReply, liked, likeCount, onLike, onUnlike }) => {
    const inputRef = useRef();
    // Focus input khi click vào nút 'Trả lời' bằng requestAnimationFrame
    const handleReplyClick = () => {
      setReplyBox({ [comment.id]: true });
      requestAnimationFrame(() => {
        if (inputRef.current) inputRef.current.focus();
      });
    };

    return (
      <Box mb={2} ml={level * 6}>
        <Flex align="center" gap={2}>
          <Avatar src={comment.anhDaiDienNguoiDung || "/anhbandau.jpg"} name={comment.hoTenNguoiDung || "Ẩn danh"} size={level === 0 ? "sm" : "xs"} />
          <Text fontWeight="bold" fontSize="sm">{comment.hoTenNguoiDung || "Ẩn danh"}</Text>
          <Box flex={1} />
          <IconButton icon={<Box as="span" fontSize="xl">...</Box>} variant="ghost" size="xs" aria-label="menu" tabIndex={-1} />
        </Flex>
        <Box ml={level === 0 ? 10 : 8} fontSize={level === 0 ? "md" : "sm"} whiteSpace="pre-line">{comment.noiDung}</Box>
        <Flex ml={level === 0 ? 10 : 8} align="center" gap={3} fontSize="xs" color="gray.500" mt={0.5}>
          <Text>{comment.ngayTao ? formatTimeAgo(comment.ngayTao) : ""}</Text>
          <Text
            fontWeight="bold"
            cursor="pointer"
            color={liked ? "red.400" : "gray.500"}
            onClick={liked ? () => onUnlike(comment.id) : () => onLike(comment.id)}
          >
            Thích {likeCount > 0 && `(${likeCount})`}
          </Text>
          <Text fontWeight="bold" cursor="pointer" onClick={handleReplyClick}>Trả lời</Text>
        </Flex>
        {/* Ô nhập phản hồi */}
        {replyBox[comment.id] && (
          <Box ml={level === 0 ? 10 : 8}>
            <ReplyInput onSend={(val, reset) => handleSendReply(rootCommentId, postId, val, reset)} />
          </Box>
        )}
        {/* Hiển thị phản hồi (chỉ 2 cấp) */}
        {level === 0 && showAllReplies[comment.id] && (
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
      <ModalOverlay />
      <ModalContent maxW="900px" minH="500px" position="relative">
        {/* Nút ba chấm thay cho nút X */}
        <IconButton
          icon={<BsThreeDots />}
          position="absolute"
          top={3}
          right={3}
          variant="ghost"
          size="md"
          aria-label="Tùy chọn"
          onClick={onClose}
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
                <Flex align="center" gap={1}><FaComment /> <span>{post?.soLuotBinhLuan || 0}</span></Flex>
              </Flex>
              {/* Danh sách bình luận */}
              <Box w="full" maxH="180px" overflowY="auto">
                <Flex justify="space-between" align="center" mb={1}>
                  <Text fontWeight="bold">Bình luận</Text>
                  <Text fontSize="sm" color="gray.500">{shownComments.length}/{totalComments}</Text>
                </Flex>
                {loadingComments ? (
                  <Text color="gray.400" fontSize="sm" textAlign="center">Đang tải bình luận...</Text>
                ) : totalComments === 0 ? (
                  <Text color="gray.400" fontSize="sm" textAlign="center">Chưa có bình luận nào</Text>
                ) : (
                  <>
                    {shownComments.map((c, idx) => (
                      <CommentItem
                        key={c.id || idx}
                        comment={c}
                        level={0}
                        postId={post.id}
                        rootCommentId={c.id}
                        token={token}
                        fetchReplies={fetchReplies}
                        replies={replies}
                        loadingReplies={loadingReplies}
                        showAllReplies={showAllReplies}
                        setShowAllReplies={setShowAllReplies}
                        replyBox={replyBox}
                        setReplyBox={setReplyBox}
                        handleSendReply={handleSendReply}
                        liked={commentLikes[c.id]?.liked || false}
                        likeCount={commentLikes[c.id]?.count || 0}
                        onLike={handleLikeComment}
                        onUnlike={handleUnlikeComment}
                      />
                    ))}
                    {!showAll && totalComments > maxShow && (
                      <Text ml={2} mt={2} color="blue.500" fontWeight="bold" cursor="pointer" onClick={() => setShowAll(true)}>
                        Xem thêm bình luận
                      </Text>
                    )}
                  </>
                )}
              </Box>
            </VStack>
            {/* Khung nhập bình luận */}
            <Box borderTop="1px solid #eee" pt={3} mt={3} bg="white" position="sticky" bottom={0} left={0} w="full">
              <Flex align="center" gap={2}>
                <Icon as={FaRegSmile} boxSize={6} color="gray.500" />
                <Input
                  variant="unstyled"
                  placeholder="Bình luận..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  flex={1}
                  onKeyDown={e => { if (e.key === 'Enter') handleSendComment(); }}
                />
                <Button
                  colorScheme="blue"
                  variant="ghost"
                  isDisabled={!newComment.trim()}
                  onClick={handleSendComment}
                  fontWeight="bold"
                  px={4}
                >
                  Đăng
                </Button>
              </Flex>
            </Box>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PostDetailModal;
