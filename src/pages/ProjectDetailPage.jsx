import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axiosConfig';

function ProjectDetailPage() {
  // --- State 定义 ---
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', description: '' });
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // --- Hooks 和变量 ---
  const { id } = useParams();
  const navigate = useNavigate();

  const currentUser = useMemo(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error("Token 解码失败:", error);
      return null;
    }
  }, []);

  // --- 数据获取 Effect ---
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${id}`);
        setProject(response.data);
        setSelectedStatus(response.data.status);
        setEditData({ name: response.data.name, description: response.data.description || '' });
      } catch (err) {
        setError('获取项目详情失败。');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  // --- 权限判断 ---
  const canUpdateStatus = useMemo(() => {
    if (!currentUser || !project) return false;
    if (currentUser.role === 'ADMIN') return true;
    return project.assignedTo.some(assignment => assignment.user.id === currentUser.userId);
  }, [currentUser, project]);

  // --- 事件处理函数 ---
  const handleStatusUpdate = async () => {
    try {
      const response = await api.put(`/projects/${id}/status`, { status: selectedStatus });
      setProject(response.data);
      alert('状态更新成功！');
    } catch (err) {
      alert('状态更新失败！');
      console.error(err);
    }
  };
  
  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };
  
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/projects/${id}`, editData);
      setProject(response.data);
      setIsEditing(false);
      alert('项目信息更新成功！');
    } catch (err) {
      alert('项目信息更新失败！');
      console.error(err);
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm(`你确定要永久删除项目 "${project.name}" 吗？此操作无法撤销。`)) {
      try {
        await api.delete(`/projects/${id}`);
        alert('项目已成功删除！');
        navigate('/');
      } catch (err) {
        alert('删除项目失败！');
        console.error(err);
      }
    }
  };

  // --- 渲染逻辑 ---
  if (loading) return <div>正在加载项目详情...</div>;
  if (error) return <div>{error}</div>;
  if (!project) return <div>项目未找到。</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <Link to="/">&larr; 返回项目列表</Link>
        
        {currentUser?.role === 'ADMIN' && (
          <div>
            <button onClick={() => setIsEditing(!isEditing)} style={{ marginRight: '0.5rem' }}>
              {isEditing ? '取消编辑' : '编辑项目'}
            </button>
            <button onClick={handleDeleteProject} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '5px', cursor: 'pointer' }}>
              删除项目
            </button>
          </div>
        )}
      </div>

      <hr />

      {isEditing ? (
        <form onSubmit={handleUpdateSubmit} style={{ marginTop: '1rem' }}>
          <h2>编辑项目</h2>
          <div>
            <label>项目名称:</label>
            <input type="text" name="name" value={editData.name} onChange={handleEditChange} style={{ fontSize: '1.5em', fontWeight: 'bold', display: 'block', width: '50%', margin: '0.5rem 0' }} />
          </div>
          <div>
            <label>项目描述:</label>
            <textarea name="description" value={editData.description} onChange={handleEditChange} style={{ display: 'block', width: '100%', minHeight: '100px', margin: '0.5rem 0' }} />
          </div>
          <button type="submit">保存更改</button>
        </form>
      ) : (
        <div style={{ marginTop: '1rem' }}>
          <h1>{project.name}</h1>
          <p><strong>当前状态:</strong> {project.status}</p>
          <p><strong>描述:</strong> {project.description || '没有描述'}</p>
          {project.deadline && <p><strong>截止日期:</strong> {new Date(project.deadline).toLocaleDateString()}</p>}
        </div>
      )}
      
      {canUpdateStatus && (
        <div style={{ background: '#f4f4f4', padding: '1rem', margin: '2rem 0', borderRadius: '5px' }}>
          <h4>更新项目状态</h4>
          <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="NOT_STARTED">未开始</option>
            <option value="IN_PROGRESS">进行中</option>
            <option value="COMPLETED">已完成</option>
            <option value="PENDING_REVIEW">待审核</option>
          </select>
          <button onClick={handleStatusUpdate} style={{ marginLeft: '1rem' }}>保存状态</button>
        </div>
      )}
      
      <div style={{ marginTop: '2rem' }}>
        <h3>指派给:</h3>
        <ul>
          {project.assignedTo.map(assignment => (
            <li key={assignment.user.id}>
              {assignment.user.name} ({assignment.user.email})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ProjectDetailPage;