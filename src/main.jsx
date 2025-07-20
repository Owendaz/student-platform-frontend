import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom' // 确保这一行存在

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 关键：<App /> 组件必须被 <BrowserRouter> 完全包裹 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)