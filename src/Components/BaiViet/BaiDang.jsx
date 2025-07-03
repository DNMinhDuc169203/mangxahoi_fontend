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
import CommentModal from "../BinhLuan/BinhLuanModal";
import { useDisclosure } from "@chakra-ui/react";
import axios from "axios";

const PostCard = ({ post }) => {
  const [showDropDown, setShowDropDown] = useState(false);
  const [isPostLiked, setIsPostLiked] = useState(post?.daThich || false);
  const [isSaved, setIsSaved] = useState(false);
  const [likes, setLikes] = useState(post?.soLuotThich ?? 10);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSavePost = () => {
    setIsSaved(!isSaved);
  };

  const handlePostLike = async () => {
    if (!post?.id) return;
    const token = localStorage.getItem("token");
    try {
      if (!isPostLiked) {
        // Thích bài viết
        setIsPostLiked(true);
        setLikes((prev) => prev + 1);
        await axios.post(
          `http://localhost:8080/network/api/bai-viet/${post.id}/thich`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Bỏ thích bài viết
        setIsPostLiked(false);
        setLikes((prev) => (prev > 0 ? prev - 1 : 0));
        await axios.delete(
          `http://localhost:8080/network/api/bai-viet/${post.id}/thich`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      // Nếu lỗi, rollback lại trạng thái
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

  // Dynamic data fallback
  const avatar = post?.anhDaiDienNguoiDung || "https://cdn.pixabay.com/photo/2025/01/08/19/02/border-collie-9319990_640.jpg";
  const username = post?.hoTenNguoiDung || "username";
  const content = post?.noiDung || "";
  const image = post?.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls[0] : "https://cdn.pixabay.com/photo/2024/01/11/12/46/pitbull-8501582_640.jpg";
  const comments = post?.soLuotBinhLuan ?? 9;

  return (
    <div>
      <div className="border rounded-md w-full">
        <div className="flex justify-between items-center w-full py-4 px-5">
          <div className="flex items-center">
            <img
              className="h-12 w-12 rounded-full"
              src={avatar}
              alt=""
            />
            <div className="pl-2">
              <p className="font-semibold text-sm ">{username}</p>
              {/* <p className="font-thin text-sm">location</p> */}
            </div>
          </div>

          <div className="dropdown">
            <BsThreeDots className="dots" onClick={handleclick} />
            <div className="dropdown-content">
              {showDropDown && (
                <p className="bg-black text-white py-1 px-4 rounded-md cursor-pointer ">
                  Delete
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="w-full">
          {post?.mediaUrls && post.mediaUrls.length > 0 ? (
            <img
              className="w-full"
              src={image}
              alt=""
            />
          ) : (
            <div className="flex items-center justify-center w-full h-64 text-center p-4 text-gray-700 text-base font-medium" style={{ minHeight: 200 }}>
              <span style={{ wordBreak: "break-word" }}>{content}</span>
            </div>
          )}
        </div>

        <div className="w-full py-2 px-5">
          <p>{likes} likes</p>
          <p className="opacity-50 py-2 cursor-pointer">view all {comments} comments</p>
          {post?.mediaUrls && post.mediaUrls.length > 0 && (
            <div className="py-2">
              <span className="font-semibold mr-2">{username}</span>
              <span>{content}</span>
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
              onClick={handleOpenCommentModal}
              className="text-xl hover:opacity-50 cursor-pointer"
            />
            <RiSendPlaneLine className="text-xl hover:opacity-50 cursor-pointer" />
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

        <div>
          <div className="flex w-full items-center px-5">
            <BsEmojiSmile />
            <input
              className="commentsInput"
              type="text"
              placeholder="Add a comment..."
            />
          </div>
        </div>
      </div>

      <CommentModal
        handlePostLike={handlePostLike}
        onClose={onClose}
        isOpen={isOpen}
        handleSavePost={handleSavePost}
        isPostLiked={isPostLiked}
        isSaved={isSaved}
      />
    </div>
  );
};

export default PostCard;
