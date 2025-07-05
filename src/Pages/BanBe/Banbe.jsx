import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, TabList, TabPanels, Tab, TabPanel, Avatar, Button, Box, Spinner, useToast } from "@chakra-ui/react";

const FriendCard = ({ user, actions }) => (
  <Box className="flex items-center justify-between p-4 border rounded-lg shadow-sm mb-3 bg-white hover:shadow-md transition">
    <div className="flex items-center">
      <Avatar src={user.anhDaiDien || "/anhbandau.jpg"} name={user.hoTen} size="lg" />
      <div className="ml-4">
        <div className="font-semibold text-lg">{user.hoTen}</div>
        <div className="text-gray-500 text-sm">{user.email}</div>
      </div>
    </div>
    <div className="flex space-x-2">{actions}</div>
  </Box>
);

const FriendsPage = () => {
  const [tab, setTab] = useState(0);
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const token = localStorage.getItem("token");

  // Fetch data
  useEffect(() => {
    setLoading(true);
    const fetchAll = async () => {
      try {
        const [sentRes, receivedRes, friendsRes] = await Promise.all([
          axios.get("http://localhost:8080/network/api/ket-ban/danh-sach/loi-moi-gui", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:8080/network/api/ket-ban/danh-sach/loi-moi-nhan", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:8080/network/api/ket-ban/danh-sach/ban-be", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setSent(sentRes.data.content || []);
        setReceived(receivedRes.data.content || []);
        setFriends(friendsRes.data.content || []);
      } catch {
        toast({ title: "Không thể tải dữ liệu bạn bè.", status: "error", duration: 2000, isClosable: true, position: "top" });
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [token]);

  // Actions
  const handleCancelSent = async (idLoiMoi) => {
    try {
      await axios.delete(`http://localhost:8080/network/api/ket-ban/huy-loi-moi/${idLoiMoi}`, { headers: { Authorization: `Bearer ${token}` } });
      setSent(sent.filter(u => u.idLoiMoi !== idLoiMoi));
      toast({ title: "Đã hủy lời mời.", status: "success", duration: 1200, isClosable: true, position: "top" });
    } catch {
      toast({ title: "Hủy lời mời thất bại.", status: "error", duration: 1200, isClosable: true, position: "top" });
    }
  };

  const handleAccept = async (idLoiMoi) => {
    try {
      await axios.post(`http://localhost:8080/network/api/ket-ban/chap-nhan/${idLoiMoi}`, null, { headers: { Authorization: `Bearer ${token}` } });
      setReceived(received.filter(u => u.idLoiMoi !== idLoiMoi));
      toast({ title: "Đã chấp nhận kết bạn.", status: "success", duration: 1200, isClosable: true, position: "top" });
    } catch {
      toast({ title: "Chấp nhận thất bại.", status: "error", duration: 1200, isClosable: true, position: "top" });
    }
  };

  const handleDecline = async (idLoiMoi) => {
    try {
      await axios.delete(`http://localhost:8080/network/api/ket-ban/tu-choi/${idLoiMoi}`, { headers: { Authorization: `Bearer ${token}` } });
      setReceived(received.filter(u => u.idLoiMoi !== idLoiMoi));
      toast({ title: "Đã từ chối lời mời.", status: "info", duration: 1200, isClosable: true, position: "top" });
    } catch {
      toast({ title: "Từ chối thất bại.", status: "error", duration: 1200, isClosable: true, position: "top" });
    }
  };

  const handleUnfriend = async (idBanBe) => {
    try {
      await axios.delete(`http://localhost:8080/network/api/ket-ban/ban-be/${idBanBe}`, { headers: { Authorization: `Bearer ${token}` } });
      setFriends(friends.filter(u => u.id !== idBanBe));
      toast({ title: "Đã hủy kết bạn.", status: "info", duration: 1200, isClosable: true, position: "top" });
    } catch {
      toast({ title: "Hủy kết bạn thất bại.", status: "error", duration: 1200, isClosable: true, position: "top" });
    }
  };

  return (
    <Box className="max-w-2xl mx-auto mt-10 bg-gray-50 p-6 rounded-xl shadow-lg min-h-[70vh]">
      <h1 className="text-3xl font-bold mb-6 text-center">Bạn bè</h1>
      <Tabs index={tab} onChange={setTab} variant="enclosed">
        <TabList>
          <Tab>Lời mời đã gửi</Tab>
          <Tab>Lời mời đã nhận</Tab>
          <Tab>Bạn bè của tôi</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {loading ? <Spinner /> : sent.length === 0 ? <div className="text-gray-500 text-center py-6">Không có lời mời nào.</div> :
              sent.map(user => (
                <FriendCard
                  key={user.idLoiMoi}
                  user={{ hoTen: user.hoTenNguoiNhan, anhDaiDien: user.anhDaiDienNguoiNhan, email: user.emailNguoiNhan }}
                  actions={[
                    <Button colorScheme="red" size="sm" onClick={() => handleCancelSent(user.idLoiMoi)}>Hủy lời mời</Button>
                  ]}
                />
              ))
            }
          </TabPanel>
          <TabPanel>
            {loading ? <Spinner /> : received.length === 0 ? <div className="text-gray-500 text-center py-6">Không có lời mời nào.</div> :
              received.map(user => (
                <FriendCard
                  key={user.idLoiMoi}
                  user={{ hoTen: user.hoTenNguoiGui, anhDaiDien: user.anhDaiDienNguoiGui, email: user.emailNguoiGui }}
                  actions={[
                    <Button colorScheme="blue" size="sm" onClick={() => handleAccept(user.idLoiMoi)}>Chấp nhận</Button>,
                    <Button colorScheme="gray" size="sm" onClick={() => handleDecline(user.idLoiMoi)}>Từ chối</Button>
                  ]}
                />
              ))
            }
          </TabPanel>
          <TabPanel>
            {loading ? <Spinner /> : friends.length === 0 ? <div className="text-gray-500 text-center py-6">Bạn chưa có bạn bè nào.</div> :
              friends.map(user => (
                <FriendCard
                  key={user.id}
                  user={user}
                  actions={[
                    <Button colorScheme="gray" size="sm" onClick={() => handleUnfriend(user.id)}>Hủy kết bạn</Button>
                  ]}
                />
              ))
            }
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default FriendsPage; 