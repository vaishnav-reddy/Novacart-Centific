import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const roleAccess = {
  '/dashboard': ['admin', 'supervisor', 'associate', 'warehouse', 'executive'],
  '/inventory': ['admin', 'supervisor', 'associate', 'warehouse', 'executive'],
  '/pos': ['admin', 'supervisor', 'associate'],
  '/returns': ['admin', 'supervisor', 'associate'],
  '/reports': ['admin', 'supervisor', 'executive'],
  '/ai': ['admin', 'supervisor', 'associate', 'warehouse', 'executive'],
}

export default function ProtectedRoute({ children, path }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (!user) return <Navigate to="/login" replace />

  const allowed = roleAccess[path]
  if (allowed && !allowed.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
