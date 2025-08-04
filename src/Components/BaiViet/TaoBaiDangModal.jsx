import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { FaPhotoVideo } from "react-icons/fa";
import "./TaoBaiDangModal.css";
import { GrEmoji } from "react-icons/gr"
import { GoLocation } from "react-icons/go"
import { AiOutlineClose } from "react-icons/ai";
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';

const CreatePostModal = ({ onClose, isOpen }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const [caption,setCaption]= useState("");
  const [privacy, setPrivacy] = useState("Công khai");
  const [hashtags, setHashtags] = useState("");
  const [user, setUser] = useState(null);
  const toast = useToast();
  const [showEmoji, setShowEmoji] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    const validFiles = droppedFiles.filter(file =>
      file.type.startsWith("image/") || file.type.startsWith("video/")
    );
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  };
  

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleOnChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file =>
      file.type.startsWith("image/") || file.type.startsWith("video/")
    );
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    } else {
      alert("please select an image or video");
    }
  };
   
  const handleCaptionChange=(e)=>{
    setCaption(e.target.value)
  }

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleShare = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("noiDung", caption);
    // Map giá trị privacy sang đúng enum backend nếu cần
    let privacyValue = "cong_khai";
    if (privacy === "Bạn bè") privacyValue = "ban_be";
    else if (privacy === "Riêng tư") privacyValue = "rieng_tu";
    formData.append("cheDoRiengTu", privacyValue);
    files.forEach(file => {
      formData.append("media", file);
    });
    if (hashtags && hashtags.trim().length > 0) {
      formData.append("hashtags", hashtags);
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8080/network/api/bai-viet", formData, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      setCaption("");
      setFiles([]);
      setHashtags("");
      toast({
        title: "Tạo bài viết thành công!",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top"
      });
      if (onClose) onClose();
      window.location.reload();
    } catch (err) {
      toast({
        title: "Có lỗi xảy ra khi tạo bài viết",
        description: err.message || "Vui lòng thử lại sau",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setCaption(prev => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:8080/network/api/nguoi-dung/thong-tin-hien-tai", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, [isOpen]);

  return (
    <div>
      <Modal size={"4xl"} onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <div className="flex justify-between py-1 px-10 items-center">
            <p>Tạo bài viết</p>
            <Button
              className=""
              variant={"ghost"}
              size="sm"
              colorScheme={"Black"}
              disabled={((!caption || caption.trim().length === 0) && files.length === 0) || isLoading}
              opacity={((!caption || caption.trim().length === 0) && files.length === 0) || isLoading ? 0.5 : 1}
              onClick={handleShare}
              isLoading={isLoading}
              loadingText="Đang tạo..."
            >
              {isLoading ? "Đang tạo..." : "Tạo"}
            </Button>
          </div>
          <hr />

          <ModalBody>
            <div className="h-[70vh] justify-between pb-5 flex">
              <div className="w-[50%] overflow-hidden">
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className="drag-drop h=full"
                >
                  <div>
                    <FaPhotoVideo className="text-3xl" />
                    <p>Kéo ảnh hoặc video vào đây</p>
                  </div>
                  <label htmlFor="file-upload" className="custom-file-upload">
                    Chọn ảnh
                  </label>
                  <input
                    className="fileInput"
                    type="file"
                    id="file-upload"
                    accept="image/*, video/*"
                    multiple
                    onChange={handleOnChange}
                  />
                  <div className="flex flex-wrap mt-2 gap-2 max-h-60 overflow-y-auto">
                    {files.map((file, idx) => (
                      <div key={idx} className="relative inline-block">
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="absolute top-0 right-0 bg-gray-800 bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center z-10 hover:bg-red-600"
                          style={{ transform: "translate(40%, -40%)" }}
                          aria-label="Remove"
                        >
                          <AiOutlineClose size={18} />
                        </button>
                        {file.type.startsWith("image/") ? (
                          <img
                            className="w-20 h-20 object-cover rounded"
                            src={URL.createObjectURL(file)}
                            alt=""
                          />
                        ) : (
                          <video
                            className="w-20 h-20 object-cover rounded"
                            src={URL.createObjectURL(file)}
                            controls
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-[1px] border h-full"></div>

              <div className="w-[50%] flex flex-col h-full">
                <div className="flex items-center px-2">
                  <img
                    className="w-9 h-9 rounded-full"
                    src={user?.anhDaiDien || "/anhbandau.jpg"}
                    alt=""
                  />
                  <p className="font-semibold ml-4">{user?.hoTen || "username"}</p>
                  <select
                    className="ml-4 px-2 py-1 rounded bg-gray-100 text-b border border-gray-600"
                    value={privacy}
                    onChange={e => setPrivacy(e.target.value)}
                  >
                    <option value="Công khai">Công khai</option>
                    <option value="Bạn bè">Bạn bè</option>
                    <option value="Riêng tư">Riêng tư</option>
                  </select>
                </div>
                <div className="flex-1 flex flex-col mt-4">
                  <textarea
                    placeholder="Nhập nội dung"
                    className="captionInput flex-1"
                    name="caption"
                    rows="8"
                    onChange={handleCaptionChange}
                    value={caption}
                  ></textarea>
                  {showEmoji && (
                    <div style={{ position: 'relative', width: '100%' }}>
                      <div style={{ position: 'absolute', left: 0, zIndex: 30 }}>
                        <EmojiPicker onEmojiClick={handleEmojiClick} theme="light" />
                      </div>
                    </div>
                  )}
                  <input
                    type="text"
                    className="hashtagInput mt-2 px-2 py-1 border rounded"
                    placeholder="Nhập hashtag, ví dụ: #abc #xyz"
                    value={hashtags}
                    onChange={e => setHashtags(e.target.value)}
                  />
                  <div className="flex justify-between px-2 mt-2 mb-1" style={{ position: 'relative' }}>
                    <span style={{ position: 'relative' }}>
                      <GrEmoji style={{ cursor: 'pointer' }} onClick={() => setShowEmoji(v => !v)} />
                      {showEmoji && (
                        <div style={{ position: 'absolute', bottom: '30px', left: 0, zIndex: 20 }}>
                          <EmojiPicker onEmojiClick={handleEmojiClick} theme="light" />
                        </div>
                      )}
                    </span>
                    <p className="opacity-70">{caption?.length} /2000</p>
                  </div>
                </div>
                <hr />
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CreatePostModal;
