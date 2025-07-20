// src/api/axiosConfig.js

import axios from 'axios';

// 创建一个 axios 实例
const api = axios.create({
  // 设置基础 URL，这样我们请求时就不用每次都写 http://localhost:3000
  baseURL: 'http://localhost:3000/api',
});

// 添加一个请求拦截器 (Request Interceptor)
// 这是 axios 的一个超能力，它允许我们在请求被发送出去之前，对请求进行修改
api.interceptors.request.use(
  (config) => {
    // 从 localStorage 中获取 token
    const token = localStorage.getItem('token');

    // 如果 token 存在，就添加到请求的 Authorization 头中
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // 返回修改后的配置
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

export default api;