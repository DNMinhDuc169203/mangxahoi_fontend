import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  Textarea,
  Select,
  useDisclosure,
  useToast,
  Box,
  VStack,
  Switch,
  FormControl,
  FormLabel,
  IconButton,
} from "@chakra-ui/react";
import { EditIcon, SettingsIcon } from "@chakra-ui/icons";

export const ProfileUserDetails = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isAvatarOpen, onOpen: onAvatarOpen, onClose: onAvatarClose } = useDisclosure();
  const { isOpen: isPrivacyOpen, onOpen: onPrivacyOpen, onClose: onPrivacyClose } = useDisclosure();
  const [editForm, setEditForm] = useState(null);
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [privacySettings, setPrivacySettings] = useState({
    emailCongKhai: true,
    sdtCongKhai: true,
    ngaySinhCongKhai: true,
    gioiTinhCongKhai: true,
  });
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [friendStatus, setFriendStatus] = useState(null); // null, 'friend', 'pending', 'none'

  const fetchUser = () => {
    const token = localStorage.getItem("token") || "";
    if (!token) {
      setError("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.");
      return;
    }
    let url;
    if (userId) {
      url = `http://localhost:8080/network/api/nguoi-dung/${userId}`;
    } else {
      url = "http://localhost:8080/network/api/nguoi-dung/thong-tin-hien-tai";
    }
    axios
      .get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        setEditForm(res.data);
        setPrivacySettings({
          emailCongKhai: res.data.emailCongKhai,
          sdtCongKhai: res.data.sdtCongKhai,
          ngaySinhCongKhai: res.data.ngaySinhCongKhai,
          gioiTinhCongKhai: res.data.gioiTinhCongKhai,
        });
        if (!userId || (res.data.id && res.data.id === JSON.parse(localStorage.getItem("user") || '{}').id)) {
          setIsOwnProfile(true);
        } else {
          setIsOwnProfile(false);
          // Gọi API kiểm tra trạng thái bạn bè
          axios.get(`http://localhost:8080/network/api/ket-ban/trang-thai/${res.data.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then(r => {
            // Map trạng thái backend sang FE
            let status = r.data.status;
            if (status === 'ban_be') setFriendStatus('friend');
            else if (status === 'cho_chap_nhan') setFriendStatus('pending');
            else setFriendStatus('none');
          }).catch(() => setFriendStatus(null));
        }
      })
      .catch(() => setError("Không thể tải thông tin người dùng."));
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token") || "";
    if (!token || !user?.id) return;
    try {
      await axios.put(
        `http://localhost:8080/network/api/nguoi-dung/${user.id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(editForm);
      toast({
        title: "Cập nhật thông tin thành công!",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
      onEditClose();
    } catch (err) {
      toast({
        title: err.response?.data?.message || "Cập nhật thất bại!",
        status: "error",
        duration: 2500,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("laAnhChinh", true);

    const token = localStorage.getItem("token") || "";
    if (!token || !user?.id) return;

    try {
      const res = await axios.post(
        `http://localhost:8080/network/api/nguoi-dung/anh-dai-dien`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser({ ...user, anhDaiDien: res.data.url });
      toast({
        title: "Tải ảnh đại diện thành công!",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
      onAvatarClose();
    } catch (err) {
      toast({
        title: err.response?.data?.message || "Tải ảnh lên thất bại!",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };
  
  const handleRemovePhoto = async () => {
    if (!user.anhDaiDien) {
        toast({
            title: "Bạn không có ảnh đại diện để gỡ.",
            status: "info",
            duration: 2500,
            isClosable: true,
            position: "top",
          });
        onAvatarClose();
        return;
    }
    const token = localStorage.getItem("token") || "";
    if (!token || !user?.id) return;
    try {
      const res = await axios.get(`http://localhost:8080/network/api/nguoi-dung/anh/chinh`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const mainPhoto = res.data;
      if (!mainPhoto || !mainPhoto.id) {
        throw new Error("Không tìm thấy ảnh đại diện để xóa.");
      }
      
      await axios.delete(
        `http://localhost:8080/network/api/nguoi-dung/anh/${mainPhoto.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser({ ...user, anhDaiDien: null });
      toast({
        title: "Gỡ ảnh đại diện thành công!",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
      onAvatarClose();
    } catch(err) {
        toast({
            title: err.response?.data?.message || "Gỡ ảnh thất bại!",
            status: "error",
            duration: 2500,
            isClosable: true,
            position: "top",
          });
    }
  };

  const handlePrivacyChange = (field) => {
    setPrivacySettings(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSavePrivacy = async () => {
    const token = localStorage.getItem("token") || "";
    try {
      await axios.put(
        "http://localhost:8080/network/api/nguoi-dung/privacy-settings",
        privacySettings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: "Cập nhật quyền riêng tư thành công!",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
      onPrivacyClose();
    } catch (err) {
      toast({
        title: "Lỗi khi cập nhật cài đặt riêng tư.",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;
  if (!user) return <div>Đang tải thông tin...</div>;

  return (
    <div className="py-10">
      <div className="flex items-center">
        <div className="w-[15%] cursor-pointer" onClick={onAvatarOpen}>
          <img
            className="w-32 h-32 rounded-full"
            src={user.anhDaiDien || "/anhbandau.jpg"}
            alt="Ảnh đại diện"
          />
        </div>
        <div className="space-y-5">
          <div className="flex space-x-10 items-center">
            <p className="font-bold text-xl">{user.hoTen || "Chưa cập nhật"}</p>
            {isOwnProfile ? (
              <>
                <IconButton
                  aria-label="Chỉnh sửa thông tin"
                  icon={<EditIcon />}
                  onClick={onEditOpen}
                  colorScheme="gray"
                />
                <IconButton
                  aria-label="Quản lý riêng tư"
                  icon={<SettingsIcon />}
                  onClick={onPrivacyOpen}
                  colorScheme="gray"
                />
              </>
            ) : (
              <>
                {friendStatus === 'friend' ? (
                  <Button colorScheme="gray" disabled>Đã là bạn bè</Button>
                ) : friendStatus === 'pending' ? (
                  <Button colorScheme="gray" onClick={async () => {
                    const token = localStorage.getItem("token") || "";
                    try {
                      // Lấy danh sách lời mời đã gửi
                      const res = await axios.get(`http://localhost:8080/network/api/ket-ban/danh-sach/loi-moi-gui?page=0&size=20`, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      // Tìm idLoiMoi theo idNguoiNhan
                      const loiMoi = res.data.content.find(lm => lm.idNguoiNhan === user.id);
                      if (loiMoi && loiMoi.idLoiMoi) {
                        await axios.delete(`http://localhost:8080/network/api/ket-ban/huy-loi-moi/${loiMoi.idLoiMoi}`, {
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        setFriendStatus('none');
                        toast({
                          title: 'Đã hủy lời mời kết bạn!',
                          status: 'success',
                          duration: 500,
                          isClosable: true,
                          position: 'top',
                        });
                      } else {
                        setFriendStatus('none');
                        toast({
                          title: 'Lời mời đã được hủy hoặc không tồn tại!',
                          status: 'info',
                          duration: 500,
                          isClosable: true,
                          position: 'top',
                        });
                      }
                    } catch (err) {
                      toast({
                        title: err?.response?.data?.message || 'Có lỗi xảy ra khi hủy lời mời!',
                        status: 'error',
                        duration: 500,
                        isClosable: true,
                        position: 'top',
                      });
                    }
                  }}>Hủy lời mời</Button>
                ) : (
                  <Button colorScheme="blue" onClick={async () => {
                    const token = localStorage.getItem("token") || "";
                    try {
                      await axios.post(`http://localhost:8080/network/api/ket-ban/loi-moi/${user.id}`, null, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      setFriendStatus('pending');
                      toast({
                        title: 'Đã gửi lời mời kết bạn!',
                        status: 'success',
                        duration: 500,
                        isClosable: true,
                        position: 'top',
                      });
                    } catch (err) {
                      toast({
                        title: err?.response?.data?.message || 'Có lỗi xảy ra khi gửi lời mời!',
                        status: 'error',
                        duration: 500,
                        isClosable: true,
                        position: 'top',
                      });
                    }
                  }}>Kết bạn</Button>
                )}
              </>
            )}
          </div>
          <p className="text-gray-600">{user.tieuSu || "Chưa có tiểu sử. Bạn có thể cập nhật trong phần chỉnh sửa."}</p>
          <div className="grid grid-cols-2 gap-x-10 gap-y-1 mt-2">
            {privacySettings.emailCongKhai && <div><span className="font-semibold">Email:</span> {user.email || "Chưa cập nhật"}</div>}
            {privacySettings.sdtCongKhai && <div><span className="font-semibold">Số điện thoại:</span> {user.soDienThoai || "Chưa cập nhật"}</div>}
            {privacySettings.ngaySinhCongKhai && <div><span className="font-semibold">Ngày sinh:</span> {user.ngaySinh || "Chưa cập nhật"}</div>}
            {privacySettings.gioiTinhCongKhai && <div><span className="font-semibold">Giới tính:</span> {user.gioiTinh === 'nam' ? 'Nam' : user.gioiTinh === 'nu' ? 'Nữ' : (user.gioiTinh || 'Chưa cập nhật')}</div>}
          </div>
        </div>
      </div>
      {/* Modal chỉnh sửa thông tin */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Chỉnh sửa thông tin cá nhân</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editForm && (
              <div className="space-y-3">
                <Input name="hoTen" value={editForm.hoTen || ""} onChange={handleEditChange} placeholder="Họ tên" />
                <Textarea name="tieuSu" value={editForm.tieuSu || ""} onChange={handleEditChange} placeholder="Tiểu sử" />
                <Input name="ngaySinh" type="date" value={editForm.ngaySinh || ""} onChange={handleEditChange} placeholder="Ngày sinh" />
                <Select name="gioiTinh" value={editForm.gioiTinh || ""} onChange={handleEditChange}>
                  <option value="">Chọn giới tính</option>
                  <option value="nam">Nam</option>
                  <option value="nu">Nữ</option>
                  <option value="khac">Khác</option>
                </Select>
                <Input name="diaChi" value={editForm.diaChi || ""} onChange={handleEditChange} placeholder="Địa chỉ" />
                <Select name="mucRiengTu" value={editForm.mucRiengTu || ""} onChange={handleEditChange}>
                  <option value="cong_khai">Công khai</option>
                  <option value="ban_be">Bạn bè</option>
                  <option value="rieng_tu">Riêng tư</option>
                </Select>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSave}>
              Lưu
            </Button>
            <Button onClick={onEditClose}>Hủy</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal quản lý riêng tư */}
      <Modal isOpen={isPrivacyOpen} onClose={onPrivacyClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Quản lý thông tin cá nhân</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel htmlFor="email-privacy" mb="0">
                  Hiển thị Email
                </FormLabel>
                <Switch id="email-privacy" isChecked={privacySettings.emailCongKhai} onChange={() => handlePrivacyChange('emailCongKhai')} />
              </FormControl>
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel htmlFor="phone-privacy" mb="0">
                  Hiển thị Số điện thoại
                </FormLabel>
                <Switch id="phone-privacy" isChecked={privacySettings.sdtCongKhai} onChange={() => handlePrivacyChange('sdtCongKhai')} />
              </FormControl>
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel htmlFor="dob-privacy" mb="0">
                  Hiển thị Ngày sinh
                </FormLabel>
                <Switch id="dob-privacy" isChecked={privacySettings.ngaySinhCongKhai} onChange={() => handlePrivacyChange('ngaySinhCongKhai')} />
              </FormControl>
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel htmlFor="gender-privacy" mb="0">
                  Hiển thị Giới tính
                </FormLabel>
                <Switch id="gender-privacy" isChecked={privacySettings.gioiTinhCongKhai} onChange={() => handlePrivacyChange('gioiTinhCongKhai')} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSavePrivacy}>
              Lưu thay đổi
            </Button>
            <Button onClick={onPrivacyClose}>Hủy</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

       {/* Modal thay đổi ảnh đại diện */}
       <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} accept="image/*" />
       <Modal isOpen={isAvatarOpen} onClose={onAvatarClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">Thay đổi ảnh đại diện</ModalHeader>
          <VStack spacing={0} divider={<Box h="1px" bg="gray.200" w="full" />}>
            <Button variant="ghost" colorScheme="blue" w="full" py={6} onClick={() => fileInputRef.current.click()}>
              Tải ảnh lên
            </Button>
            <Button variant="ghost" colorScheme="red" w="full" py={6} onClick={handleRemovePhoto}>
              Gỡ ảnh hiện tại
            </Button>
            <Button variant="ghost" w="full" py={6} onClick={onAvatarClose}>
              Hủy
            </Button>
          </VStack>
        </ModalContent>
      </Modal>

      {/* Hiển thị thông tin theo chế độ riêng tư */}
      {(!isOwnProfile && user.mucRiengTu === 'rieng_tu' && friendStatus !== 'friend') && (
        <div className="text-center py-10 text-lg text-gray-500">Đây là tài khoản riêng tư. Hãy kết bạn để xem thông tin chi tiết.</div>
      )}
      {(!isOwnProfile && user.mucRiengTu === 'ban_be' && friendStatus !== 'friend') && (
        <div className="text-center py-10 text-lg text-gray-500">Chỉ bạn bè mới xem được thông tin này. Hãy kết bạn để xem chi tiết.</div>
      )}
      {/* Nếu là công khai hoặc là bạn hoặc là chính mình thì hiển thị đầy đủ */}
      {((user.mucRiengTu === 'cong_khai') || isOwnProfile || friendStatus === 'friend') && (
        <div className="grid grid-cols-2 gap-x-10 gap-y-1 mt-2">
          {/* Thông tin cá nhân chỉ hiển thị 1 lần trong grid bên dưới */}
        </div>
      )}
    </div>
  );
};