import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axiosConfig.js';
import CreateProjectForm from '../components/CreateProjectForm.jsx';
import { Link } from 'react-router-dom'; // 1. 引入 Link 组件

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 使用 useMemo 缓存解码后的用户角色，避免不必要的重复计算
  const userRole = useMemo(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.role; // 从 Token 中获取角色信息
    } catch (error) {
      console.error("Token 解码失败:", error);
      return null;
    }
  }, []); // 空依赖数组意味着这个函数只在组件初次渲染时执行一次

  // 定义登出处理函数
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]); // 依赖 navigate 函数

  // 定义获取项目列表的函数，使用 useCallback 避免在子组件中引起不必要的重渲染
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (err) {
      setError('获取项目数据失败。');
      console.error(err);
      // 如果错误是 401 或 403 (通常是 Token 无效或过期)，则自动登出
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  }, [handleLogout]); // 依赖 handleLogout 函数

  // 使用 useEffect 在组件初次加载时获取数据
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]); // 依赖 fetchProjects 函数

  // 渲染加载状态
  if (loading) {
    return <div>正在加载中...</div>;
  }

  // 渲染错误状态
  if (error) {
    return <div>{error} <button onClick={handleLogout}>返回登录</button></div>;
  }

  // 成功获取数据后的主渲染逻辑
  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={handleLogout} style={{ float: 'right', padding: '0.5rem 1rem' }}>
        登出
      </button>

      <header>
        <h1>项目列表</h1>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <h1>项目列表</h1>
  {userRole === 'SUPER_ADMIN' && (
    <Link to="/admin/dashboard">进入管理员后台</Link>
  )}
</header>
      </header>
      
      <main>
        {/* 如果是管理员，就显示创建新项目的表单组件 */}
        {/* 我们将 fetchProjects 函数作为 prop 传递下去，用于创建成功后刷新列表 */}
        {userRole === 'SUPER_ADMIN' && <CreateProjectForm onProjectCreated={fetchProjects} />}

        <section style={{ marginTop: '2rem' }}>
          <h2>当前项目</h2>
          {projects.length === 0 ? (
            <p>当前没有项目。</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
  {projects.map(project => (
    <li key={project.id} style={{ background: '#f4f4f4', margin: '0.5rem 0', padding: '1rem', borderRadius: '5px' }}>
      {/* 2. 将项目名称用 Link 包裹起来 */}
      <Link to={`/project/${project.id}`} style={{ textDecoration: 'none', color: 'black', fontSize: '1.2rem', fontWeight: 'bold' }}>
        {project.name}
      </Link>
      <p>{project.description || '没有描述'}</p>
      <small>状态: {project.status}</small>
    </li>
  ))}
</ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default ProjectsPage;