// src/components/AdminRoute.jsx

import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function AdminRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    // 1. 如果没登录，直接跳转到登录页
    return <Navigate to="/login" replace />;
  }

  try {
    const decodedToken = jwtDecode(token);
    // 2. 如果角色不是超级管理员，跳转到主页（或一个“无权限”页面）
    if (decodedToken.role !== 'SUPER_ADMIN') {
      return <Navigate to="/" replace />;
    }
  } catch (error) {
    // Token 解析失败，也跳转到登录页
    console.error("Invalid token:", error);
    return <Navigate to="/login" replace />;
  }

  // 3. 验证通过，正常渲染子组件
  return children;
}

export default AdminRoute;