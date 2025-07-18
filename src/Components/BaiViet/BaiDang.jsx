import React, { useState } from "react";
import {
  BsBookmark,
  BsBookmarkFill,
  BsEmojiSmile,
  BsThreeDots,
} from "react-icons/bs";
import "./BaiDang.css";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import { RiSendPlaneLine } from "react-icons/ri";
import { useDisclosure, useToast } from "@chakra-ui/react";
import axios from "axios";
import { FaGlobeAsia, FaUserFriends, FaLock } from "react-icons/fa";
import moment from "moment";
import "moment/locale/vi";
import PostDetailModal from "../BinhLuan/BaiDangChiTietModal";
import DanhSachNguoiThichModal from "./DanhSachNguoiThichModal";
import EmojiPicker from 'emoji-picker-react';
import ModalTuyChonBaiViet from './ModalTuyChonBaiViet';
import ModalBaoCaoBaiViet from './ModalBaoCaoBaiViet';
import ModalChinhSuaBaiViet from './ModalChinhSuaBaiViet';
import ModalChonQuyenRiengTu from './ModalChonQuyenRiengTu';
import { useNavigate } from "react-router-dom";

const PostCard = ({ post, onLikePost, onCommentAdded, onPostDeleted, onPostUpdated, isSaved: isSavedProp, refreshSavedPosts }) => {
  const [showDropDown, setShowDropDown] = useState(false);
  const [isPostLiked, setIsPostLiked] = useState(post?.daThich || false);
  const [isSaved, setIsSaved] = useState(!!isSavedProp);
  const [likes, setLikes] = useState(post?.soLuotThich ?? 0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailPost, setDetailPost] = useState(null);
  const [commentCount, setCommentCount] = useState(post?.soLuotBinhLuan ?? 0);
  const [isLikeModalOpen, setIsLikeModalOpen] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const toast = useToast();
  const [showEmoji, setShowEmoji] = useState(false);
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  
  // States cho các modal mới
  const [isBaoCaoModalOpen, setIsBaoCaoModalOpen] = useState(false);
  const [isChinhSuaModalOpen, setIsChinhSuaModalOpen] = useState(false);
  const [isQuyenRiengTuModalOpen, setIsQuyenRiengTuModalOpen] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwnPost = post.idNguoiDung === user.id;
  const navigate = useNavigate();

  // Đồng bộ commentCount khi post thay đổi
  React.useEffect(() => {
    setCommentCount(post?.soLuotBinhLuan ?? 0);
  }, [post?.soLuotBinhLuan]);

  // Đồng bộ commentCount khi detailPost thay đổi
  React.useEffect(() => {
    if (detailPost) {
      setCommentCount(detailPost?.soLuotBinhLuan ?? 0);
    }
  }, [detailPost?.soLuotBinhLuan]);

  React.useEffect(() => {
    setIsSaved(!!isSavedProp);
    console.log('Render PostCard:', post.id, 'isSaved:', isSavedProp);
  }, [isSavedProp]);

  const handleSavePost = async () => {
    const token = localStorage.getItem('token');
    try {
      if (!isSaved) {
        await axios.post(
          `http://localhost:8080/network/api/saved-posts/save`,
          {},
          {
            params: { userId: user.id, postId: post.id },
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setIsSaved(true);
        toast({ title: 'Đã lưu bài viết!', status: 'success', duration: 1200, isClosable: true, position: 'top' });
        if (refreshSavedPosts) refreshSavedPosts();
      } else {
        await axios.delete(
          `http://localhost:8080/network/api/saved-posts/unsave`,
          {
            params: { userId: user.id, postId: post.id },
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setIsSaved(false);
        toast({ title: 'Đã bỏ lưu bài viết!', status: 'info', duration: 1200, isClosable: true, position: 'top' });
        if (refreshSavedPosts) refreshSavedPosts();
      }
    } catch (err) {
      toast({ title: 'Có lỗi khi lưu/bỏ lưu bài viết!', status: 'error', duration: 1200, isClosable: true, position: 'top' });
    }
  };

  
  const handlePostLike = async () => {
    if (!post?.id) return;
    const token = localStorage.getItem("token");
    try {
      if (!isPostLiked) {
        setIsPostLiked(true);
        setLikes((prev) => prev + 1);
        if (onLikePost) onLikePost(post.id, true);
        await axios.post(
          `http://localhost:8080/network/api/bai-viet/${post.id}/thich`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        setIsPostLiked(false);
        setLikes((prev) => (prev > 0 ? prev - 1 : 0));
        if (onLikePost) onLikePost(post.id, false);
        await axios.delete(
          `http://localhost:8080/network/api/bai-viet/${post.id}/thich`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      setIsPostLiked((prev) => !prev);
      setLikes(post?.soLuotThich ?? 10);
      alert("Có lỗi khi thực hiện thao tác thích/bỏ thích bài viết.");
    }
  };

  const handleclick = () => {
    setShowDropDown(!showDropDown);
  };

  const handleOpenCommentModal = () => {
    onOpen();
  };

  const handleOpenDetailModal = () => {
    setDetailPost(post);
    setIsDetailOpen(true);
    // Đồng bộ commentCount khi mở modal
    setCommentCount(post?.soLuotBinhLuan ?? 0);
  };

  const handleCloseDetailModal = () => {
    setIsDetailOpen(false);
    setDetailPost(null);
  };

  const handleOpenLikeModal = () => {
    setIsLikeModalOpen(true);
  };

  const handleCloseLikeModal = () => {
    setIsLikeModalOpen(false);
  };

  const handleAddComment = async (e) => {
    if (e.key === 'Enter' && commentInput.trim()) {
      const token = localStorage.getItem('token');
      try {
        await axios.post(
          `http://localhost:8080/network/api/binh-luan/bai-viet/${post.id}`,
          null,
          {
            params: { noiDung: commentInput },
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setCommentInput("");
        setCommentCount((prev) => prev + 1);
        toast({ title: 'Đã thêm bình luận!', status: 'success', duration: 1200, isClosable: true, position: 'top' });
        if (onCommentAdded) onCommentAdded(post.id);
      } catch (err) {
        toast({ title: 'Thêm bình luận thất bại!', status: 'error', duration: 1200, isClosable: true, position: 'top' });
      }
    }
  };

  const handleSelectEmoji = (emojiData) => {
    setCommentInput(commentInput + emojiData.emoji);
    setShowEmoji(false);
  };

  // Dynamic data fallback
  const avatar = post?.anhDaiDienNguoiDung || "./anhbandau.jpg";
  const username = post?.hoTenNguoiDung || "username";
  const content = post?.noiDung || "";
  const image = post?.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls[0] : "https://cdn.pixabay.com/photo/2024/01/11/12/46/pitbull-8501582_640.jpg";

  moment.locale("vi");

  // Sửa lại locale để luôn hiển thị số thay vì chữ "một"
  if (moment.locale() === "vi") {
    moment.updateLocale("vi", {
      relativeTime: {
        future: "trong %s",
        past: "%s trước",
        s: "vài giây",
        ss: "%d giây",
        m: "1 phút",
        mm: "%d phút",
        h: "1 giờ",
        hh: "%d giờ",
        d: "1 ngày",
        dd: "%d ngày",
        M: "1 tháng",
        MM: "%d tháng",
        y: "1 năm",
        yy: "%d năm"
      }
    });
  }

  const renderCheDo = (cheDo) => {
    switch (cheDo) {
      case 'cong_khai':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-gray-500 text-xs">
            <FaGlobeAsia /> Công khai
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
            <FaLock /> Riêng tư
          </span>
        );
      default:
        return null;
    }
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

      toast({
        title: 'Đã xóa bài viết thành công',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top'
      });

      if (onPostDeleted) {
        onPostDeleted(post.id);
      }
    } catch (error) {
      console.error('Lỗi khi xóa bài viết:', error);
      toast({
        title: 'Xóa bài viết thất bại',
        description: 'Vui lòng thử lại sau',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
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
    // Cập nhật local state nếu cần
    if (detailPost && detailPost.id === updatedPost.id) {
      setDetailPost(updatedPost);
    }
  };

  return (
    <div>
      <div className="border rounded-md w-full">
        <div className="flex justify-between items-center w-full py-4 px-5">
          <div className="flex items-center">
            <img
              className="h-12 w-12 rounded-full cursor-pointer"
              src={avatar}
              alt=""
              onClick={() => post.idNguoiDung && navigate(`/profile/${post.idNguoiDung}`)}
            />
            <div className="pl-2">
              <p className="font-semibold text-sm cursor-pointer" onClick={() => post.idNguoiDung && navigate(`/profile/${post.idNguoiDung}`)}>{username}</p>
              <div className="flex items-center space-x-2 mt-1">
                {renderCheDo(post?.cheDoRiengTu)}
                {post?.ngayTao && (
                  <span className="text-xs text-gray-500">· {moment(post.ngayTao).fromNow()}</span>
                )}
              </div>
            </div>
          </div>

          <div className="dropdown">
            <BsThreeDots className="dots" onClick={() => setIsOptionModalOpen(true)} />
            <ModalTuyChonBaiViet
              isOpen={isOptionModalOpen}
              onClose={() => setIsOptionModalOpen(false)}
              isOwnPost={isOwnPost}
              onEdit={handleEdit}
              onPrivacy={handlePrivacy}
              onDelete={handleDelete}
              onReport={handleReport}
            />
          </div>
        </div>

        <div className="w-full">
          {post?.mediaUrls && post.mediaUrls.length > 0 ? (
            post.mediaUrls.length === 1 ? (
              <img
                className="w-full object-cover rounded-md"
                src={post.mediaUrls[0]}
                alt=""
                style={{ maxHeight: 400 }}
              />
            ) : (
              <div className="grid grid-cols-2 gap-1 rounded-md overflow-hidden" style={{ maxHeight: 400 }}>
                {post.mediaUrls.slice(0, 4).map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt=""
                    className="object-cover w-full h-40"
                    style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                  />
                ))}
                {post.mediaUrls.length > 4 && (
                  <div className="flex items-center justify-center bg-black bg-opacity-60 text-white text-lg font-bold absolute w-full h-full top-0 left-0">
                    +{post.mediaUrls.length - 4}
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="flex items-center justify-center w-full h-64 text-center p-4 text-gray-700 text-base font-medium" style={{ minHeight: 200 }}>
              <span style={{ wordBreak: "break-word" }}>{content}</span>
            </div>
          )}
        </div>


        <div className="flex justify-between items-center w-full px-5 py-4">
          <div className="flex items-center space-x-2">
            {isPostLiked ? (
              <AiFillHeart
                className="text-2xl hover:opacity-50 cursor-pointer text-red-700"
                onClick={handlePostLike}
              />
            ) : (
              <AiOutlineHeart
                className="text-2xl hover:opacity-50 cursor-pointer"
                onClick={handlePostLike}
              />
            )}

            <FaRegComment
              onClick={handleOpenDetailModal}
              className="text-xl hover:opacity-50 cursor-pointer"
            />
            {/* <RiSendPlaneLine className="text-xl hover:opacity-50 cursor-pointer" /> */}
          </div>
          <div className="cursor-pointer">
            {isSaved ? (
              <BsBookmarkFill
                onClick={handleSavePost}
                className="text-xl hover:opacity-50 cursor-pointer"
              />
            ) : (
              <BsBookmark
                onClick={handleSavePost}
                className="text-xl hover:opacity-50 cursor-pointer"
              />
            )}
          </div>
        </div>
        <div className="w-full py-2 px-5">
          <p 
            className="cursor-pointer hover:underline font-medium" 
            onClick={handleOpenLikeModal}
          >
            {likes} người thích
          </p>
          <p className="opacity-50 py-2 cursor-pointer" onClick={handleOpenDetailModal}>Xem tất cả {commentCount} bình luận</p>
          {post?.mediaUrls && post.mediaUrls.length > 0 && (
            <div className="py-2">
              <span className="font-semibold mr-2">{username}</span>
              <span>{content}</span>
            </div>
          )}
        </div>
        <div>
          <div className="flex w-full items-center px-5" style={{ position: 'relative' }}>
            <BsEmojiSmile style={{ cursor: 'pointer' }} onClick={() => setShowEmoji(v => !v)} />
            {showEmoji && (
              <div style={{ position: 'absolute', bottom: '40px', left: 0, zIndex: 20 }}>
                <EmojiPicker onEmojiClick={handleSelectEmoji} theme="light" />
              </div>
            )}
            <input
              className="commentsInput"
              type="text"
              placeholder="Add a comment..."
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              onKeyDown={handleAddComment}
            />
          </div>
        </div>
      </div>

      <PostDetailModal
        post={detailPost}
        isOpen={isDetailOpen}
        onClose={handleCloseDetailModal}
        onCommentAdded={() => {
          setCommentCount((prev) => prev + 1);
          if (onCommentAdded) onCommentAdded(post.id);
        }}
        onLikeChanged={(liked, likeCount) => {
          setIsPostLiked(liked);
          setLikes(likeCount);
          if (onLikePost) onLikePost(post.id, liked);
        }}
        onPostUpdated={handlePostUpdated}
        onPostDeleted={onPostDeleted}
      />

      <DanhSachNguoiThichModal
        isOpen={isLikeModalOpen}
        onClose={handleCloseLikeModal}
        baiVietId={post?.id}
        soLuotThich={likes}
      />

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
    </div>
  );
};

export default PostCard;
