import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";

import HomeRight from "../../Components/TrangChuPhai/TrangChuBenPhai";
import PostCard from "../../Components/BaiViet/BaiDang";
import CreatePostModal from "../../Components/BaiViet/TaoBaiDangModal";
import { useDisclosure } from "@chakra-ui/react";
import BanDangNghiGi from "../../Components/BaiViet/BanDangNghiGi";

const HomePage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewsfeed = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8080/network/api/bai-viet/newsfeed", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(res.data.baiViet || []);
      } catch (err) {
        setError("Không thể tải newsfeed.");
      } finally {
        setLoading(false);
      }
    };
    fetchNewsfeed();
  }, []);

  return (
    <div>
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
              posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
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
