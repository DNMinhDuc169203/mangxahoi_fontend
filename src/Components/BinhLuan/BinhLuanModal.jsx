import React from "react";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Box,
  Image,
  Text,
  Avatar,
  Flex,
  VStack,
  IconButton,
  Input,
  Button,
  Icon,
  HStack,
} from "@chakra-ui/react";
import {
  BsBookmark,
  BsBookmarkFill,
  BsEmojiSmile,
  BsThreeDots,
} from "react-icons/bs";
import CommentCard from "./TheBinhLuan";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaRegComment, FaRegSmile } from "react-icons/fa";
import { RiSendPlaneLine } from "react-icons/ri";
import "./BinhLuanModal.css";

const CommentModal = ({
  onClose,
  isOpen,
  post,
  isSaved,
  isPostLiked,
  handlePostLike,
  handleSavePost,
}) => {
  // Dummy state cho comment input
  const [newComment, setNewComment] = React.useState("");
  // Dummy comments, bạn thay bằng API thực tế
  const comments = post?.binhLuan || [];
  const avatar = post?.anhDaiDienNguoiDung || "https://cdn.pixabay.com/photo/2025/01/08/19/02/border-collie-9319990_640.jpg";
  const username = post?.hoTenNguoiDung || "username";
  const content = post?.noiDung || "";
  const image = post?.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls[0] : "https://cdn.pixabay.com/photo/2024/01/11/12/46/pitbull-8501582_640.jpg";
  const likes = post?.soLuotThich ?? 0;
  const commentsCount = post?.soLuotBinhLuan ?? 0;

  return (
    <Modal size={"4xl"} onClose={onClose} isOpen={isOpen} isCentered>
      <ModalOverlay />
      <ModalContent maxW="900px" minH="500px" position="relative">
        <IconButton icon={<BsThreeDots />} position="absolute" top={3} right={3} variant="ghost" size="md" aria-label="Tùy chọn" onClick={onClose} />
        <ModalBody p={0} display="flex" position="relative">
          {/* Ảnh lớn bên trái */}
          <Box flex="1" bg="gray" display="flex" alignItems="center" justifyContent="center" position="relative">
            <Image src={image} alt="Ảnh bài viết" maxH="500px" maxW="100%" objectFit="contain" />
          </Box>
          {/* Thông tin bên phải */}
          <Box flex="1.2" p={6} minW="350px" display="flex" flexDirection="column" position="relative">
            <Flex align="center" mb={4} gap={3} justify="space-between">
              <Flex align="center" gap={2}>
                <Avatar size="md" src={avatar} name={username} />
                <Text fontWeight="bold">{username}</Text>
              </Flex>
            </Flex>
            <VStack align="start" spacing={4} flex={1} overflowY="auto" maxH="320px">
              <Text>{content}</Text>
              {/* Like & comment count */}
              <Flex align="center" gap={6} mt={2} mb={2}>
                <Flex align="center" gap={1}><AiFillHeart color="red" /> <span>{likes}</span></Flex>
                <Flex align="center" gap={1}><FaRegComment /> <span>{commentsCount}</span></Flex>
              </Flex>
              {/* Danh sách bình luận */}
              <Box w="full" maxH="180px" overflowY="auto">
                <Flex justify="space-between" align="center" mb={1}>
                  <Text fontWeight="bold">Bình luận</Text>
                  <Text fontSize="sm" color="gray.500">{comments.length}/{commentsCount}</Text>
                </Flex>
                {comments.length === 0 ? (
                  <Text color="gray.400" fontSize="sm" textAlign="center">Chưa có bình luận nào</Text>
                ) : (
                  comments.map((c, idx) => <CommentCard key={idx} comment={c} />)
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
                  onKeyDown={e => { if (e.key === 'Enter') {/* handleSendComment() */} }}
                />
                <Button
                  colorScheme="blue"
                  variant="ghost"
                  isDisabled={!newComment.trim()}
                  // onClick={handleSendComment}
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

export default CommentModal;
