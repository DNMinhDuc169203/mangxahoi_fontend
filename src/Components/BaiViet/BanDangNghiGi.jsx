import React, { useEffect, useState } from 'react'
import { useDisclosure } from '@chakra-ui/react';
import CreatePostModal from './TaoBaiDangModal';
import axios from 'axios';

const BanDangNghiGi = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [user, setUser] = useState(null);

  useEffect(() => {
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
  }, []);

  return (
    <>
      <div
        className="flex items-center bg-white rounded-full px-4 py-2 shadow border w-full cursor-pointer"
        onClick={onOpen}
      >
        <img
          src={user?.anhDaiDien || "anhbandau.jpg"}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <input
          type="text"
          className="ml-3 bg-transparent outline-none flex-1 text-gray-900 placeholder-gray-500 pointer-events-none"
          placeholder="Bạn đang nghĩ gì thế?"
          disabled
        />
      </div>
      <CreatePostModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}

export default BanDangNghiGi
