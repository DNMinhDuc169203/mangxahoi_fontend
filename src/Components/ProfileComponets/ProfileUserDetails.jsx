import React, { useEffect, useState } from "react";
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
  useToast
} from "@chakra-ui/react";

export const ProfileUserDetails = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editForm, setEditForm] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    if (!token) {
      setError("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.");
      return;
    }
    axios
      .get("http://localhost:8080/network/api/nguoi-dung/thong-tin-hien-tai", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        setEditForm(res.data);
      })
      .catch(() => setError("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn."));
  }, []);

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
      onClose();
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

  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;
  if (!user) return <div>Đang tải thông tin...</div>;

  return (
    <div className="py-10">
      <div className="flex items-center">
        <div className="w-[15%]">
          <img
            className="w-32 h-32 rounded-full"
            src={user.anhDaiDien || "/anhbandau.jpg"}
            alt="Ảnh đại diện"
          />
        </div>
        <div className="space-y-5">
          <div className="flex space-x-10 items-center">
            <p className="font-bold text-xl">{user.hoTen || "Chưa cập nhật"}</p>
            <Button className="px-4 py-1 bg-gray-200 rounded" onClick={onOpen} colorScheme="gray">Chỉnh sửa thông tin</Button>
          </div>
          <div className="grid grid-cols-2 gap-x-10 gap-y-1 mt-2">
            <div><span className="font-semibold">Email:</span> {user.email || "Chưa cập nhật"}</div>
            <div><span className="font-semibold">Số điện thoại:</span> {user.soDienThoai || "Chưa cập nhật"}</div>
            <div><span className="font-semibold">Ngày sinh:</span> {user.ngaySinh || "Chưa cập nhật"}</div>
            <div><span className="font-semibold">Giới tính:</span> {user.gioiTinh === 'nam' ? 'Nam' : user.gioiTinh === 'nu' ? 'Nữ' : (user.gioiTinh || 'Chưa cập nhật')}</div>
          </div>
        </div>
      </div>
      {/* Modal chỉnh sửa thông tin */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
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
                <Input name="anhDaiDien" value={editForm.anhDaiDien || ""} onChange={handleEditChange} placeholder="Link ảnh đại diện" />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSave}>
              Lưu
            </Button>
            <Button onClick={onClose}>Hủy</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
