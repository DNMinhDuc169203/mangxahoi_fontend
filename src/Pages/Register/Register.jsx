import React, { useState } from "react";
import "./Register.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";

const Register = () => {
  const [form, setForm] = useState({
    hoTen: "",
    email: "",
    soDienThoai: "",
    matKhau: "",
    xacNhanMatKhau: "",
    ngaySinh: "",
    gioiTinh: "",
  });
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.matKhau !== form.xacNhanMatKhau) {
      toast({
        title: "Mật khẩu xác nhận không khớp!",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    try {
      await axios.post("http://localhost:8080/network/api/nguoi-dung/dang-ky", {
        ...form,
        matKhau: form.matKhau,
      });
      toast({
        title: "Đăng ký thành công! Vui lòng kiểm tra email để xác thực.",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
      setTimeout(() => navigate("/verify", { state: { email: form.email } }), 1000);
    } catch (err) {
      toast({
        title:
          err.response?.data?.message ||
          "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  return (
    <div className="register-container">
      <form className="register-form-box" onSubmit={handleSubmit}>
        <h2 className="register-title">Đăng ký TopTrend</h2>
        <input
          type="text"
          name="hoTen"
          placeholder="Họ và tên"
          value={form.hoTen}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="soDienThoai"
          placeholder="Số điện thoại"
          value={form.soDienThoai}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="ngaySinh"
          placeholder="Ngày sinh"
          value={form.ngaySinh}
          onChange={handleChange}
          required
        />
        <select
          name="gioiTinh"
          value={form.gioiTinh}
          onChange={handleChange}
          required
        >
          <option value="">Chọn giới tính</option>
          <option value="nam">Nam</option>
          <option value="nu">Nữ</option>
          <option value="khac">Khác</option>
        </select>
        <input
          type="password"
          name="matKhau"
          placeholder="Mật khẩu"
          value={form.matKhau}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="xacNhanMatKhau"
          placeholder="Xác nhận mật khẩu"
          value={form.xacNhanMatKhau}
          onChange={handleChange}
          required
        />
        <button className="register-btn" type="submit">
          Đăng ký
        </button>
        <div className="register-link">
          Đã có tài khoản? <span onClick={() => navigate("/login")}>Đăng nhập</span>
        </div>
      </form>
    </div>
  );
};

export default Register; 