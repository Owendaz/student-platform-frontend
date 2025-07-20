// src/pages/RegisterPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // 这里我们用原始 axios，因为注册不需要 Token

function RegisterPage() {
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    password: '',
    college: '',
    major: '',
    grade: '',
    position: '',
    departmentId: '',
    email: '',
  });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 组件加载时获取部门列表
    const fetchDepartments = async () => {
      try {
        // 注意：我们在这里没有用我们配置的 api 实例，因为获取部门列表是公开的
        const response = await axios.get('http://localhost:3000/api/departments');
        setDepartments(response.data);
      } catch (err) {
        setError('无法加载部门列表，请联系管理员。');
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await axios.post('http://localhost:3000/api/auth/register', formData);
      setSuccess('注册成功！正在跳转到登录页面...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || '注册失败，请检查填写的信息。');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '10px' }}>
      <h2>用户注册</h2>
      <form onSubmit={handleSubmit}>
        {/* 遍历所有需要输入的字段来生成表单 */}
        <input name="studentId" value={formData.studentId} onChange={handleChange} placeholder="学号 (用于登录)" required />
        <input name="name" value={formData.name} onChange={handleChange} placeholder="真实姓名" required />
        <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="密码" required />
        <input name="college" value={formData.college} onChange={handleChange} placeholder="学院" required />
        <input name="major" value={formData.major} onChange={handleChange} placeholder="专业" required />
        <input name="grade" value={formData.grade} onChange={handleChange} placeholder="年级 (例如: 2023级)" required />
        <input name="position" value={formData.position} onChange={handleChange} placeholder="身份/职位 (例如: 主席/部长/干事)" required />
        <select name="departmentId" value={formData.departmentId} onChange={handleChange} required>
          <option value="">-- 请选择部门 --</option>
          {departments.map(dep => <option key={dep.id} value={dep.id}>{dep.name}</option>)}
        </select>
        <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="邮箱 (选填)" />

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}

        <button type="submit">注册</button>
      </form>
      <p>已有账户？ <Link to="/login">点此登录</Link></p>
      <style>{`
        input, select, button { display: block; width: 100%; padding: 0.8rem; margin-bottom: 1rem; border-radius: 5px; border: 1px solid #ccc; box-sizing: border-box; }
        button { background: #007bff; color: white; cursor: pointer; }
      `}</style>
    </div>
  );
}

export default RegisterPage;