// src/components/ProtectedRoute.jsx

import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  // 从 localStorage 获取 token
  const token = localStorage.getItem('token');

  // 检查 token 是否存在
  if (!token) {
    // 如果 token 不存在，就重定向到登录页面
    // `replace` 选项可以防止用户通过浏览器的“后退”按钮回到这个页面
    return <Navigate to="/login" replace />;
  }

  // 如果 token 存在，就正常渲染子组件
  // `children` 在这里就代表被 <ProtectedRoute> 包裹的组件
  return children;
}

export default ProtectedRoute;