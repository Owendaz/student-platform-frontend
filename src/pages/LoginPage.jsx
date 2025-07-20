// src/pages/LoginPage.jsx

import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
// 1. 从 antd 引入我们需要的组件
import { Button, Form, Input, Card, Typography, Alert } from 'antd';

const { Title } = Typography;

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 2. antd 的 Form 组件会自动处理表单数据
  const onFinish = async (values) => {
    setError(null);
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        studentId: values.studentId,
        password: values.password,
      });
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || '登录失败，请检查你的凭据。');
    } finally {
      setLoading(false);
    }
  };

  return (
    // 3. 使用 Card 组件来创建一个漂亮的居中卡片布局
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card title={<Title level={3} style={{ textAlign: 'center', margin: 0 }}>用户登录</Title>} style={{ width: 400 }}>
        {/* antd 的 Form 组件，自带强大的布局和验证功能 */}
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}

          <Form.Item
            label="学号"
            name="studentId"
            rules={[{ required: true, message: '请输入你的学号!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入你的密码!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            {/* antd 的 Button 组件，可以设置 loading 状态 */}
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            还没有账户？ <Link to="/register">立即注册</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default LoginPage;