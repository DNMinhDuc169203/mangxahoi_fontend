import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './pages/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/QuanLyNguoiDung';
import PostManagement from './pages/QuanLyBaiDang';
import ReportManagement from './pages/QuanLyBaoCao';
import PolicyManagement from './pages/QuanLyChinhSach';
import TrendManagement from './pages/QuanLyXuHuong';
import AdminProtectedRoute from './AdminProtectedRoute';

const AdminRouter = () => {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={
        <AdminProtectedRoute>
          <AdminLayout />
        </AdminProtectedRoute>
      }>
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