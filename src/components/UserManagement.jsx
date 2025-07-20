// src/components/UserManagement.jsx

import { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      setError('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers(currentUsers =>
        currentUsers.map(user => user.id === userId ? { ...user, role: newRole } : user)
      );
      alert('用户角色更新成功！');
    } catch (err) {
      alert('更新失败！');
      // 可以在这里选择是否重新获取数据以回滚UI
      // fetchUsers(); 
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`确定要删除用户 "${userName}" 吗？此操作不可逆！`)) {
      try {
        await api.delete(`/users/${userId}`);
        setUsers(currentUsers => currentUsers.filter(user => user.id !== userId));
        alert('用户删除成功！');
      } catch (err) {
        alert('删除失败！');
      }
    }
  };

  if (loading) return <div>正在加载用户列表...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>用户管理</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th>姓名</th>
            <th>学号</th>
            <th>部门</th>
            <th>角色</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.studentId}</td>
              <td>{user.department?.name || '未分配'}</td>
              <td>
                <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)}>
                  <option value="STUDENT_CADRE">学生干部</option>
                  <option value="DEPARTMENT_HEAD">部门负责人</option>
                  <option value="SUPER_ADMIN">超级管理员</option>
                  <option value="VISITOR">游客</option>
                </select>
              </td>
              <td>
                <button onClick={() => handleDeleteUser(user.id, user.name)} className="delete-btn">
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`
        th, td { padding: 0.8rem; border: 1px solid #ddd; text-align: left; }
        .delete-btn { background: #dc3545; color: white; border: none; cursor: pointer; padding: 0.5rem; border-radius: 4px; }
      `}</style>
    </div>
  );
}

export default UserManagement;