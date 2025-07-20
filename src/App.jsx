// src/App.jsx

import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage.jsx';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'; // <-- 确认引入了这一行
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute'; // <-- 确认引入了这一行

function App() {
  return (
    <div>
      <Routes>
        {/* 公开路由 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* 普通登录用户路由 */}
        <Route 
          path="/" 
          element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} 
        />
        <Route 
          path="/project/:id"
          element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} 
        />

        {/* 管理员专属路由 */}
        <Route 
          path="/admin/dashboard"
          element={
            <AdminRoute>
              {/* 确认这里的拼写正确 */}
              <AdminDashboardPage />
            </AdminRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;