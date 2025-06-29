import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@chakra-ui/react";

const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    emailHoacSoDienThoai: "",
    matKhau: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/network/api/nguoi-dung/dang-nhap", form);
      // Lưu token vào localStorage
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      if (res.data.email) {
        localStorage.setItem("email", res.data.email);
      } else {
        localStorage.setItem("email", form.emailHoacSoDienThoai);
      }
      toast({
        title: "Đăng nhập thành công!",
        status: "success",
        duration: 1500,
        isClosable: true,
        position: "top",
      });
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      const msg = err.response?.data?.message || "";
      if (msg.toLowerCase().includes("xác thực") || msg.toLowerCase().includes("xac thuc")) {
        toast({
          title: msg,
          status: "warning",
          duration: 2500,
          isClosable: true,
          position: "top",
        });
        navigate("/verify", { state: { email: form.emailHoacSoDienThoai } });
        return;
      }
      toast({
        title: msg || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
        status: "error",
        duration: 2500,
        isClosable: true,
        position: "top",
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-section">
        <form className="login-form-box" onSubmit={handleSubmit}>
          <input
            type="text"
            name="emailHoacSoDienThoai"
            placeholder="Email hoặc số điện thoại"
            value={form.emailHoacSoDienThoai}
            onChange={handleChange}
            required
          />
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              name="matKhau"
              placeholder="Mật khẩu"
              value={form.matKhau}
              onChange={handleChange}
              required
              style={{ width: '100%' }}
            />
            <span
              onClick={() => setShowPassword((v) => !v)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#888',
                fontSize: 18
              }}
            >
              {showPassword ? 'Ẩn' : 'Hiện'}
            </span>
          </div>
          <button className="login-btn" type="submit">Đăng nhập</button>
          <div className="forgot-link" style={{cursor: 'pointer'}} onClick={() => navigate("/forgot-password")}>Quên mật khẩu?</div>
          <hr />
          <button className="create-account-btn" type="button" onClick={() => navigate("/register")}>Tạo tài khoản mới</button>
        </form>
        <div className="create-page-text">
          <b>Tạo Trang</b> dành cho người nổi tiếng, thương hiệu hoặc doanh nghiệp.
        </div>
      </div>
      <div className="login-info-section">
        <h1 className="toptrend-logo">TopTrend</h1>
        <p className="toptrend-desc">
          TopTrend giúp bạn kết nối và chia sẻ với mọi người trong cuộc sống của bạn.
        </p>
      </div>
    </div>
  );
};

export default Login; 