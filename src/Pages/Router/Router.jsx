import React from "react";
import Sidebar from "../../Components/SideBar/Sidebar";
import HomePage from "../HomePage/HomePage";
import { Route, Routes } from "react-router-dom";
import Profile from "../Profile/Profile";
import Story from "../Story/Story";

const Router = () => {
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
            <Route path="/story" element={<Story />} > </Route>
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Router;
