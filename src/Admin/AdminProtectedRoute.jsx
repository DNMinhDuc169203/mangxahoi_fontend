import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  const adminInfo = localStorage.getItem('adminInfo');
  if (!token || !adminInfo) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

export default AdminProtectedRoute; 