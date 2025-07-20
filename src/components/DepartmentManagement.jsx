// src/components/DepartmentManagement.jsx

import { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';

function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the creation form
  const [newName, setNewName] = useState('');
  const [newParentId, setNewParentId] = useState('');

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/departments');
      setDepartments(response.data);
    } catch (err) {
      setError('获取部门列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/departments', { name: newName, parentId: newParentId || null });
      alert('部门创建成功！');
      setNewName('');
      setNewParentId('');
      fetchDepartments(); // Re-fetch to show the new department
    } catch (err) {
      alert(err.response?.data?.error || '创建失败！');
    }
  };

  const handleDelete = async (depId, depName) => {
    if (window.confirm(`确定要删除部门 "${depName}" 吗？`)) {
      try {
        await api.delete(`/departments/${depId}`);
        alert('删除成功！');
        fetchDepartments(); // Re-fetch to remove the deleted department
      } catch (err) {
        alert(err.response?.data?.error || '删除失败！');
      }
    }
  };

  if (loading) return <div>正在加载部门列表...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>部门管理</h2>
      {/* Create Department Form */}
      <form onSubmit={handleCreate} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <input 
          value={newName} 
          onChange={e => setNewName(e.target.value)} 
          placeholder="新部门名称" 
          required 
        />
        <select value={newParentId} onChange={e => setNewParentId(e.target.value)}>
          <option value="">设为顶级部门</option>
          {departments.map(dep => <option key={dep.id} value={dep.id}>{dep.name}</option>)}
        </select>
        <button type="submit">创建</button>
      </form>

      {/* Departments List */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th>部门名称</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {departments.map(dep => (
            <tr key={dep.id}>
              <td>{dep.name}</td>
              <td>
                <button onClick={() => handleDelete(dep.id, dep.name)} className="delete-btn">删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`td, th { padding: 0.8rem; border: 1px solid #ddd; text-align: left; } .delete-btn { background: #dc3545; color: white; border: none; cursor: pointer; padding: 0.5rem; border-radius: 4px; }`}</style>
    </div>
  );
}

export default DepartmentManagement;