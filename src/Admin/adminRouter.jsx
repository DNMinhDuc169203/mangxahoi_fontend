import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './pages/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/QuanLyNguoiDung';
import PostManagement from './pages/QuanLyBaiDang';
import ReportManagement from './pages/ReportManagement';
import PolicyManagement from './pages/PolicyManagement';
import TrendManagement from './pages/TrendManagement';

const AdminRouter = () => {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="posts" element={<PostManagement />} />
        <Route path="reports" element={<ReportManagement />} />
        <Route path="policies" element={<PolicyManagement />} />
        <Route path="trends" element={<TrendManagement />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRouter; 