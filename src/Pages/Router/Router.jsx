import React from "react";
import Sidebar from "../../Components/SideBar/Sidebar";
import HomePage from "../HomePage/HomePage";
import { Route, Routes, useLocation } from "react-router-dom";
import Profile from "../Profile/Profile";

import Login from "../Login/Login";
import Register from "../Register/Register";
import Verify from "../Verify/Verify";
import ForgotPassword from "../ForgotPassword/ForgotPassword";

const Router = () => {
  const location = useLocation();
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
        <div className="w-[20%] border-l-slate-500 ">
          <Sidebar />
        </div>
        <div className="w-full">
          <Routes>
            <Route path="/" element={<HomePage />} > </Route>
            <Route path="/username" element={<Profile />} > </Route>
          
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
