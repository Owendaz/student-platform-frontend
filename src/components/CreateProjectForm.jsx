// src/components/CreateProjectForm.jsx

import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Form, Input, Select, Button, message } from 'antd'; // 引入 antd 组件

function CreateProjectForm({ onProjectCreated }) {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        // 核心修正点：筛选出所有角色为学生干部或部门负责人的用户
        const assignableUsers = response.data.filter(
          user => ['STUDENT_CADRE', 'DEPARTMENT_HEAD'].includes(user.role)
        );
        setAllUsers(assignableUsers);
      } catch (err) {
        console.error("获取用户列表失败", err);
        message.error("无法加载可指派的用户列表");
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await api.post('/projects', {
        name: values.name,
        description: values.description,
        assignedUserIds: values.assignedUserIds,
      });
      message.success('项目创建成功！');
      form.resetFields();
      onProjectCreated(); // 通知父组件刷新列表
    } catch (err) {
      message.error(err.response?.data?.error || '创建项目失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="创建新项目" style={{ marginBottom: '2rem' }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="name" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="项目描述">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item name="assignedUserIds" label="指派给" rules={[{ required: true, message: '请至少选择一个负责人' }]}>
          <Select
            mode="multiple" // 允许多选
            placeholder="请选择负责人"
            allowClear
          >
            {allUsers.map(user => (
              <Select.Option key={user.id} value={user.id}>{user.name} ({user.studentId})</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            创建项目
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

// 我们顺便也用 antd 的 Card 和 Form 来美化一下这个组件
import { Card } from 'antd';
export default CreateProjectForm;