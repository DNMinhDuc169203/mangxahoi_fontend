import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody, Box, Image, Text, Avatar, Flex, VStack, IconButton, Input, Button, Icon, HStack } from '@chakra-ui/react';
import { AiFillHeart, AiOutlineLeft, AiOutlineRight, AiOutlineGlobal, AiFillLock } from 'react-icons/ai';
import { FaComment, FaRegSmile, FaUserFriends } from 'react-icons/fa';
import { BsThreeDots } from 'react-icons/bs';
import axios from "axios";

const PostDetailModal = ({ post, isOpen, onClose }) => {
  const [currentImg, setCurrentImg] = useState(0);
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showAll, setShowAll] = useState(false);
  const maxShow = 2;
  const shownComments = showAll ? comments : comments.slice(0, maxShow);

  React.useEffect(() => {
    setCurrentImg(0);
  }, [post]);

  // Lấy bình luận động từ API khi post thay đổi
  React.useEffect(() => {
    if (!post?.id) return;
    setLoadingComments(true);
    axios
      .get(`http://localhost:8080/api/binh-luan/bai-viet/${post.id}?page=0&size=100`)
      .then(res => {
        setComments(res.data.binhLuan || []);
        setTotalComments(res.data.tongSoBinhLuan || 0);
      })
      .catch(() => {
        setComments([]);
        setTotalComments(0);
      })
      .finally(() => setLoadingComments(false));
  }, [post]);

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

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    setComments([...comments, { userName: 'Bạn', text: newComment }]);
    setNewComment("");
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
              <Flex align="center" gap={2}>
                <Avatar size="md" src={post.anhDaiDienNguoiDung} name={post.hoTenNguoiDung} />
                <Text fontWeight="bold">{post.hoTenNguoiDung}</Text>
                {renderCheDo(post.cheDoRiengTu)}
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
                <Flex align="center" gap={1}><AiFillHeart color="red" /> <span>{post.soLuotThich || 0}</span></Flex>
                <Flex align="center" gap={1}><FaComment /> <span>{post.soLuotBinhLuan || 0}</span></Flex>
              </Flex>
              {/* Danh sách bình luận */}
              <Box w="full" maxH="180px" overflowY="auto">
                <Flex justify="space-between" align="center" mb={1}>
                  <Text fontWeight="bold">Bình luận</Text>
                  <Text fontSize="sm" color="gray.500">{shownComments.length}/{totalComments}</Text>
                </Flex>
                {loadingComments ? (
                  <Text color="gray.400" fontSize="sm" textAlign="center">Đang tải bình luận...</Text>
                ) : (
                  <>
                    {shownComments.map((c, idx) => (
                      <Box key={c.id || idx} mb={2}>
                        <Flex align="center" gap={2}>
                          <Avatar src={c.nguoiDung?.anhDaiDien || "/anhbandau.jpg"} name={c.nguoiDung?.hoTen || "Ẩn danh"} size="sm" />
                          <Text fontWeight="bold" fontSize="sm">{c.nguoiDung?.hoTen || "Ẩn danh"}</Text>
                          <Box flex={1} />
                          <IconButton icon={<Box as="span" fontSize="xl">...</Box>} variant="ghost" size="xs" aria-label="menu" />
                        </Flex>
                        <Box ml={10} fontSize="md" whiteSpace="pre-line">{c.noiDung}</Box>
                        <Flex ml={10} align="center" gap={3} fontSize="xs" color="gray.500" mt={0.5}>
                          <Text>{c.ngayTao ? new Date(c.ngayTao).toLocaleDateString() : ""}</Text>
                          <Text fontWeight="bold" cursor="pointer">Thích</Text>
                          <Text fontWeight="bold" cursor="pointer">Trả lời</Text>
                        </Flex>
                      </Box>
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
