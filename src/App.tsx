/**
 * 应用根组件：负责路由结构与基础布局
 * 路由:
 * - "/" 学生端投票页
 * - "/admin" 管理端页面
 */

import { Link, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import StudentVotePage from './pages/StudentVotePage'
import AdminPage from './pages/AdminPage'

/* 简单的导航栏（占位） */
function NavBar() {
  const location = useLocation()
  const isActive = (path: string) =>
    location.pathname === path ? 'text-blue-600 font-semibold' : 'text-gray-600'
  return (
    <nav className="border-b bg-white">
      <div className="container-responsive flex items-center gap-6 h-14">
        <span className="text-sm font-bold">试卷讲解反馈</span>
        <Link to="/" className={`text-sm hover:text-blue-500 ${isActive('/')}`}>
          投票
        </Link>
        <span className="ml-auto text-xs text-gray-400">
          基础版本 · 占位 UI
        </span>
      </div>
    </nav>
  )
}

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<StudentVotePage />} />
            {/* 后续可增加动态投票 id: /poll/:id */}
          <Route path="/admin" element={<AdminPage />} />
          {/* 未匹配时重定向到首页 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <footer className="py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} 试卷讲解反馈收集系统
      </footer>
    </div>
  )
}

export default App
