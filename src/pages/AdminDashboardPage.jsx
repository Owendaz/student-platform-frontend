import { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import { Link } from 'react-router-dom';
import { Tabs, Table, Button, Space, Select, Popconfirm, Modal, Form, Input, message } from 'antd';

// --- 子组件 1: 待审批用户 (已完成) ---
function PendingUsers() {
    // ... 代码和上一步完全一样 ...
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
  
    const fetchPendingUsers = useCallback(async () => {
      try {
        setLoading(true);
        const response = await api.get('/users/pending');
        setPendingUsers(response.data);
      } catch (err) {
        message.error('获取待审批用户列表失败');
      } finally {
        setLoading(false);
      }
    }, []);
    
    useEffect(() => {
      fetchPendingUsers();
    }, [fetchPendingUsers]);
  
    const handleApprove = async (userId) => {
        try {
            await api.put(`/users/${userId}/approve`);
            message.success('用户批准成功！');
            fetchPendingUsers();
        } catch (err) {
            message.error('批准用户失败！');
        }
    };
  
    const handleReject = async (userId) => {
        try {
            await api.delete(`/users/${userId}`);
            message.success('已拒绝该用户的申请。');
            fetchPendingUsers();
        } catch (err) {
            message.error('拒绝用户失败！');
        }
    };
  
    const columns = [
        { title: '姓名', dataIndex: 'name', key: 'name' },
        { title: '学号', dataIndex: 'studentId', key: 'studentId' },
        { title: '部门', key: 'department', render: (_, record) => (
            record.department?.parent?.name ? `${record.department.parent.name} - ${record.department.name}` : record.department?.name || '未分配'
        )},
        { title: '操作', key: 'action', render: (_, record) => (
          <Space size="middle">
            <Button type="primary" onClick={() => handleApprove(record.id)}>批准</Button>
            <Popconfirm title="拒绝申请" description="确定要拒绝该用户的申请吗？" onConfirm={() => handleReject(record.id)} okText="确定" cancelText="取消">
              <Button danger>拒绝</Button>
            </Popconfirm>
          </Space>
        )},
    ];
  
    return <Table columns={columns} dataSource={pendingUsers} rowKey="id" loading={loading} />;
}


// --- 子组件 2: 用户管理 (已完成) ---
function UserManagement() {
    // ... 代码和上一步完全一样 ...
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
  
    const fetchUsers = useCallback(async () => {
      try {
        setLoading(true);
        const response = await api.get('/users');
        setUsers(response.data);
      } catch (err) {
        message.error('获取用户列表失败');
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
        message.success('用户角色更新成功！');
        fetchUsers();
      } catch (err) {
        message.error('更新角色失败！');
      }
    };
  
    const handleDeleteUser = async (userId) => {
      try {
        await api.delete(`/users/${userId}`);
        message.success('用户删除成功！');
        fetchUsers();
      } catch (err) {
        message.error('删除失败！');
      }
    };
  
    const columns = [
        { title: '姓名', dataIndex: 'name', key: 'name' },
        { title: '学号', dataIndex: 'studentId', key: 'studentId' },
        { title: '部门', key: 'department', render: (_, record) => (
            record.department?.parent?.name ? `${record.department.parent.name} - ${record.department.name}` : record.department?.name || '未分配'
        )},
        { title: '角色', key: 'role', render: (_, record) => (
          <Select defaultValue={record.role} style={{ width: 120 }} onChange={(value) => handleRoleChange(record.id, value)}>
            <Select.Option value="STUDENT_CADRE">学生干部</Select.Option>
            <Select.Option value="DEPARTMENT_HEAD">部门负责人</Select.Option>
            <Select.Option value="SUPER_ADMIN">超级管理员</Select.Option>
            <Select.Option value="VISITOR">游客</Select.Option>
          </Select>
        )},
        { title: '操作', key: 'action', render: (_, record) => (
          <Popconfirm title="删除用户" description={`确定要删除用户 "${record.name}" 吗？`} onConfirm={() => handleDeleteUser(record.id)} okText="确定" cancelText="取消">
            <Button danger>删除</Button>
          </Popconfirm>
        )},
    ];
  
    return <Table columns={columns} dataSource={users} rowKey="id" loading={loading} />;
}


// --- 子组件 3: 部门管理 (全新实现) ---
function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [form] = Form.useForm(); // antd 的 Form hook

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/departments');
      setDepartments(response.data);
    } catch (error) {
      message.error('获取部门列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const showModal = (department = null) => {
    setEditingDepartment(department);
    form.setFieldsValue(department ? { name: department.name, parentId: department.parentId } : { name: '', parentId: null });
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingDepartment(null);
    form.resetFields();
  };

  const handleFormSubmit = async (values) => {
    try {
      if (editingDepartment) {
        await api.put(`/departments/${editingDepartment.id}`, values);
        message.success('部门更新成功！');
      } else {
        await api.post('/departments', values);
        message.success('部门创建成功！');
      }
      handleCancel();
      fetchDepartments();
    } catch (err) {
      message.error(err.response?.data?.error || '操作失败！');
    }
  };

  const handleDelete = async (depId) => {
    try {
      await api.delete(`/departments/${depId}`);
      message.success('删除成功！');
      fetchDepartments();
    } catch (err) {
      message.error(err.response?.data?.error || '删除失败！');
    }
  };

  const columns = [
    { title: '部门名称', dataIndex: 'name', key: 'name' },
    { title: '上级部门', key: 'parent', render: (_, record) => {
        const parent = departments.find(d => d.id === record.parentId);
        return parent ? parent.name : '—';
      }},
    { title: '操作', key: 'action', render: (_, record) => (
      <Space size="middle">
        <Button onClick={() => showModal(record)}>编辑</Button>
        <Popconfirm title="删除部门" description="确定要删除这个部门吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
          <Button danger>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <Button type="primary" onClick={() => showModal()} style={{ marginBottom: 16 }}>
        创建新部门
      </Button>
      <Table columns={columns} dataSource={departments} rowKey="id" loading={loading} />
      <Modal
        title={editingDepartment ? '编辑部门' : '创建新部门'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical" name="departmentForm" onFinish={handleFormSubmit}>
          <Form.Item name="name" label="部门名称" rules={[{ required: true, message: '请输入部门名称!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="parentId" label="上级部门">
            <Select placeholder="不选择则为顶级部门">
              <Select.Option value={null}>— 设为顶级部门 —</Select.Option>
              {departments.map(dep => <Select.Option key={dep.id} value={dep.id}>{dep.name}</Select.Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// --- 父组件: 管理员后台主页面 ---
function AdminDashboardPage() {
  const items = [
    { key: '1', label: '用户审批', children: <PendingUsers /> },
    { key: '2', label: '用户管理', children: <UserManagement /> },
    { key: '3', label: '部门管理', children: <DepartmentManagement /> },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>管理员后台</h1>
        <Link to="/">&larr; 返回主页</Link>
      </div>
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
}

export default AdminDashboardPage;