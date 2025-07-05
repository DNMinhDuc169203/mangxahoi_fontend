import React, { useState, useRef, useEffect } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody, Box, Image, Text, Avatar, Flex, VStack, IconButton, Input, Button, Icon, HStack } from '@chakra-ui/react';
import { AiFillHeart, AiOutlineLeft, AiOutlineRight, AiOutlineGlobal, AiFillLock } from 'react-icons/ai';
import { FaComment, FaRegSmile, FaUserFriends } from 'react-icons/fa';
import { BsThreeDots } from 'react-icons/bs';
import axios from "axios";
import EmojiPicker from 'emoji-picker-react';

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

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id;

  const [showEmoji, setShowEmoji] = useState(false);

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
      setReplyBox(prev => ({ ...prev, [rootCommentId]: false }));
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
                  <svg width="16" height="8">
                    <polygon points="0,8 8,0 16,8" fill="white" stroke="#e5e7eb" strokeWidth="1" />
                  </svg>
                </Box>
                {comment.idNguoiDung?.toString() === userId?.toString() ? (
                  <>
                    <Box
                      px={4}
                      py={2}
                      cursor="pointer"
                      textAlign="center"
                      fontSize="15px"
                      fontWeight="500"
                      _hover={{ bg: "gray.100" }}
                      transition="background 0.2s"
                      onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditContent(comment.noiDung);
                        setMenuOpenId(null);
                      }}
                    >
                      Chỉnh sửa
                    </Box>
                    <Box
                      px={4}
                      py={2}
                      cursor="pointer"
                      textAlign="center"
                      fontSize="15px"
                      fontWeight="500"
                      color="red.500"
                      _hover={{ bg: "gray.100" }}
                      transition="background 0.2s"
                      onClick={async () => {
                        console.log('Đã nhấn xóa bình luận (của mình)', comment.id);
                        if (window.confirm("Bạn có chắc muốn xóa bình luận này?")) {
                          try {
                            await axios.delete(
                              `http://localhost:8080/network/api/binh-luan/${comment.id}`,
                              { headers: { Authorization: `Bearer ${token}` } }
                            );
                            if (level === 0) {
                              const res = await axios.get(
                                `http://localhost:8080/network/api/binh-luan/bai-viet/${post.id}?page=0&size=10`,
                                token ? { headers: { Authorization: `Bearer ${token}` } } : {}
                              );
                              setComments(res.data.binhLuan || []);
                              setTotalComments(res.data.tongSoBinhLuan || 0);
                            } else {
                              const res = await axios.get(
                                `http://localhost:8080/network/api/binh-luan/bai-viet/${post.id}?page=0&size=10`,
                                token ? { headers: { Authorization: `Bearer ${token}` } } : {}
                              );
                              setComments(res.data.binhLuan || []);
                              setTotalComments(res.data.tongSoBinhLuan || 0);
                              await fetchReplies(rootCommentId, 100);
                            }
                          } catch (err) {
                            alert("Xóa thất bại!");
                            console.error(err);
                          }
                        }
                        setMenuOpenId(null);
                      }}
                    >
                      Xóa
                    </Box>
                  </>
                ) : post.idNguoiDung?.toString() === userId?.toString() ? (
                  <>
                    <Box
                      px={4}
                      py={2}
                      cursor="pointer"
                      textAlign="center"
                      fontSize="15px"
                      fontWeight="500"
                      _hover={{ bg: "gray.100" }}
                      transition="background 0.2s"
                      onClick={async () => {
                        console.log('Đã nhấn xóa bình luận (chủ bài viết)', comment.id);
                        if (window.confirm("Bạn có chắc muốn xóa bình luận này?")) {
                          try {
                            await axios.delete(
                              `http://localhost:8080/network/api/binh-luan/${comment.id}`,
                              { headers: { Authorization: `Bearer ${token}` } }
                            );
                            if (level === 0) {
                              const res = await axios.get(
                                `http://localhost:8080/network/api/binh-luan/bai-viet/${post.id}?page=0&size=10`,
                                token ? { headers: { Authorization: `Bearer ${token}` } } : {}
                              );
                              setComments(res.data.binhLuan || []);
                              setTotalComments(res.data.tongSoBinhLuan || 0);
                            } else {
                              const res = await axios.get(
                                `http://localhost:8080/network/api/binh-luan/bai-viet/${post.id}?page=0&size=10`,
                                token ? { headers: { Authorization: `Bearer ${token}` } } : {}
                              );
                              setComments(res.data.binhLuan || []);
                              setTotalComments(res.data.tongSoBinhLuan || 0);
                              await fetchReplies(rootCommentId, 100);
                            }
                          } catch (err) {
                            alert("Xóa thất bại!");
                            console.error(err);
                          }
                        }
                        setMenuOpenId(null);
                      }}
                    >
                      Xóa
                    </Box>
                    <Box
                      px={4}
                      py={2}
                      cursor="pointer"
                      textAlign="center"
                      fontSize="15px"
                      fontWeight="500"
                      _hover={{ bg: "gray.100" }}
                      transition="background 0.2s"
                      onClick={() => {
                        setComments(prev => prev.filter(c => c.id !== comment.id));
                        setMenuOpenId(null);
                      }}
                    >
                      Ẩn bình luận
                    </Box>
                    <Box
                      px={4}
                      py={2}
                      cursor="pointer"
                      textAlign="center"
                      fontSize="15px"
                      fontWeight="500"
                      color="red.500"
                      _hover={{ bg: "gray.100" }}
                      transition="background 0.2s"
                      onClick={() => {
                        alert("Đã gửi báo cáo bình luận!");
                        setMenuOpenId(null);
                      }}
                    >
                      Báo cáo bình luận
                    </Box>
                  </>
                ) : (
                  <>
                    <Box
                      px={4}
                      py={2}
                      cursor="pointer"
                      textAlign="center"
                      fontSize="15px"
                      fontWeight="500"
                      _hover={{ bg: "gray.100" }}
                      transition="background 0.2s"
                      onClick={() => {
                        setComments(prev => prev.filter(c => c.id !== comment.id));
                        setMenuOpenId(null);
                      }}
                    >
                      Ẩn bình luận
                    </Box>
                    <Box
                      px={4}
                      py={2}
                      cursor="pointer"
                      textAlign="center"
                      fontSize="15px"
                      fontWeight="500"
                      color="red.500"
                      _hover={{ bg: "gray.100" }}
                      transition="background 0.2s"
                      onClick={() => {
                        alert("Đã gửi báo cáo bình luận!");
                        setMenuOpenId(null);
                      }}
                    >
                      Báo cáo bình luận
                    </Box>
                  </>
                )}
              </Box>
            )}
          </Box>
        </Flex>
        {editingCommentId === comment.id ? (
          <Flex gap={2} mt={1} ml={level === 0 ? 10 : 8}>
            <Input
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              size="sm"
              flex={1}
            />
            <Button
              size="sm"
              colorScheme="blue"
              onClick={async () => {
                try {
                  await axios.put(
                    `http://localhost:8080/network/api/binh-luan/${comment.id}`,
                    null,
                    {
                      params: { noiDung: editContent },
                      headers: { Authorization: `Bearer ${token}` }
                    }
                  );
                  if (level === 0) {
                    // Nếu là bình luận gốc, reload danh sách bình luận gốc
                    const res = await axios.get(
                      `http://localhost:8080/network/api/binh-luan/bai-viet/${post.id}?page=0&size=10`,
                      token ? { headers: { Authorization: `Bearer ${token}` } } : {}
                    );
                    setComments(res.data.binhLuan || []);
                    setTotalComments(res.data.tongSoBinhLuan || 0);
                  } else {
                    // Nếu là reply, reload replies cho bình luận cha
                    await fetchReplies(rootCommentId, 100);
                  }
                  setEditingCommentId(null);
                } catch {
                  alert("Chỉnh sửa thất bại!");
                }
              }}
              isDisabled={!editContent.trim()}
            >
              Lưu
            </Button>
            <Button
              size="sm"
              onClick={() => setEditingCommentId(null)}
            >
              Hủy
            </Button>
          </Flex>
        ) : (
          <Box ml={level === 0 ? 10 : 8} fontSize={level === 0 ? "md" : "sm"} whiteSpace="pre-line">
            {comment.noiDung}
          </Box>
        )}
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

  const handleSelectEmoji = (emojiData) => {
    setNewComment(newComment + emojiData.emoji);
    setShowEmoji(false);
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
                <Flex align="center" gap={1}><FaComment /> <span>{totalAllComments}</span></Flex>
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
            <Box borderTop="1px solid #eee" pt={3} bg="white" w="full" style={{ marginTop: 0 }}>
              <Flex align="center" gap={2} position="relative">
                <Icon as={FaRegSmile} boxSize={6} color="gray.500" cursor="pointer" onClick={() => setShowEmoji(v => !v)} />
                {showEmoji && (
                  <Box position="absolute" bottom="40px" left={0} zIndex={20}>
                    <EmojiPicker onEmojiClick={handleSelectEmoji} theme="light" />
                  </Box>
                )}
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
