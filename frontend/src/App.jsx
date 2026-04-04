import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import POS from './pages/POS'
import Returns from './pages/Returns'
import Reports from './pages/Reports'
import AIQuery from './pages/AIQuery'
import ToastContainer from './components/Toast'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute path="/dashboard"><Dashboard /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute path="/inventory"><Inventory /></ProtectedRoute>} />
          <Route path="/pos" element={<ProtectedRoute path="/pos"><POS /></ProtectedRoute>} />
          <Route path="/returns" element={<ProtectedRoute path="/returns"><Returns /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute path="/reports"><Reports /></ProtectedRoute>} />
          <Route path="/ai" element={<ProtectedRoute path="/ai"><AIQuery /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </AuthProvider>
  )
}
