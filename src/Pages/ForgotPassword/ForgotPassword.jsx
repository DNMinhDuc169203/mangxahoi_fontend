import React, { useState } from "react";
import "./ForgotPassword.css";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [maXacThuc, setMaXacThuc] = useState("");
  const [matKhauMoi, setMatKhauMoi] = useState("");
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  // Bước 1: Gửi mã xác thực
  const handleSendCode = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:8080/network/api/quen-mat-khau/gui-ma",
        { emailHoacSoDienThoai: emailOrPhone }
      );
      toast({
        title: res.data.message || "Đã gửi mã xác thực!",
        status: "success",
        duration: 2500,
        isClosable: true,
        position: "top",
      });
      setStep(2);
    } catch (err) {
      toast({
        title:
          err.response?.data?.message || "Không gửi được mã xác thực!",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  // Bước 2: Đặt lại mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (matKhauMoi !== xacNhanMatKhau) {
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
      const res = await axios.post(
        "http://localhost:8080/network/api/quen-mat-khau/dat-lai-mat-khau",
        {
          emailHoacSoDienThoai: emailOrPhone,
          maXacThuc,
          matKhauMoi,
        }
      );
      toast({
        title: res.data.message || "Đặt lại mật khẩu thành công!",
        status: "success",
        duration: 2500,
        isClosable: true,
        position: "top",
      });
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      toast({
        title:
          err.response?.data?.message || "Đặt lại mật khẩu thất bại!",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  return (
    <div className="forgot-container">
      <form
        className="forgot-form-box"
        onSubmit={step === 1 ? handleSendCode : handleResetPassword}
      >
        <h2 className="forgot-title">Quên mật khẩu</h2>
        <input
          type="text"
          placeholder="Email hoặc số điện thoại"
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
          required
        />
        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Mã xác thực"
              value={maXacThuc}
              onChange={(e) => setMaXacThuc(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Mật khẩu mới"
              value={matKhauMoi}
              onChange={(e) => setMatKhauMoi(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              value={xacNhanMatKhau}
              onChange={(e) => setXacNhanMatKhau(e.target.value)}
              required
            />
          </>
        )}
        <button className="forgot-btn" type="submit">
          {step === 1 ? "Gửi mã xác thực" : "Đặt lại mật khẩu"}
        </button>
        <div className="forgot-link">
          <span onClick={() => navigate("/login")}>Quay lại đăng nhập</span>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword; 