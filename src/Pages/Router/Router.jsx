import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/SideBar/Sidebar";
import HomePage from "../TrangChu/TrangChu";
import { Route, Routes, useLocation } from "react-router-dom";
import Profile from "../HoSo/HoSo";
import { useParams } from "react-router-dom";

import Login from "../DangNhap/DangNhap";
import Register from "../DangKy/DangKy";
import Verify from "../XacThuc/XacThuc";
import ForgotPassword from "../QuenMatKhau/QuenMatKhau";
import SearchComponents from "../../Components/TimKiem/TimKiem";
import FriendsPage from "../BanBe/Banbe";

const ProfileWithId = () => {
  const { id } = useParams();
  return <Profile userId={id} />;
};

// Backdrop component để tắt search khi click ra ngoài
const Backdrop = ({ onClick }) => (
  <div
    style={{
      position: 'fixed',
      left: 0,
      top: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.08)',
      zIndex: 29,
    }}
    onClick={onClick}
  />
);

const Router = () => {
  const location = useLocation();
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Đóng search khi chuyển route
  useEffect(() => {
    setIsSearchVisible(false);
  }, [location.pathname]);

  if (location.pathname === "/login") {
    return <Login />;
  }
  if (location.pathname === "/register") {
    return <Register />;
  }
  if (location.pathname === "/verify") {
    return <Verify />;
  }
  if (location.pathname === "/forgot-password") {
    return <ForgotPassword />;
  }
  return (
    <div>
      <div className="flex">
        {/* Sidebar luôn hiển thị */}
        <div style={{ width: 88, minWidth: 88 }}>
          <Sidebar isSearchVisible={isSearchVisible} setIsSearchVisible={setIsSearchVisible} />
        </div>
        {/* Panel search là panel cố định, không che sidebar */}
        {isSearchVisible && (
          <div style={{
            position: 'fixed',
            left: 88,
            top: 0,
            zIndex: 1000,
            height: '100vh',
            width: 400,
            background: 'transparent',
          }}>
            <SearchComponents setIsSearchVisible={setIsSearchVisible} />
          </div>
        )}
        {isSearchVisible && <Backdrop onClick={() => setIsSearchVisible(false)} />}
        {/* Main content */}
        <div style={{ flex: 1, marginLeft: 120 }}>
          <Routes>
            <Route path="/" element={<HomePage />} > </Route>
            <Route path="/profile/:id" element={<ProfileWithId />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/login" element={<Login />} > </Route>
            <Route path="/register" element={<Register />} > </Route>
            <Route path="/verify" element={<Verify />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Router;
