import React, { useState } from "react";
import "./Verify.css";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@chakra-ui/react";

const Verify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const emailFromState = location.state?.email || "";
  const [form, setForm] = useState({
    email: emailFromState,
    token: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/network/api/nguoi-dung/xac-thuc", form);
      toast({
        title: "Xác thực thành công! Bạn sẽ được chuyển sang trang đăng nhập.",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      toast({
        title:
          err.response?.data?.message ||
          "Xác thực thất bại. Vui lòng kiểm tra lại thông tin.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  return (
    <div className="verify-container">
      <form className="verify-form-box" onSubmit={handleSubmit}>
        <h2 className="verify-title">Xác thực tài khoản</h2>
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
          name="token"
          placeholder="Mã xác thực"
          value={form.token}
          onChange={handleChange}
          required
        />
        <button className="verify-btn" type="submit">
          Xác thực
        </button>
        <div className="verify-link">
          <span onClick={() => navigate("/login")}>Quay lại đăng nhập</span>
        </div>
      </form>
    </div>
  );
};

export default Verify; 