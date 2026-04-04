import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Package, ShoppingCart, RotateCcw,
  BarChart2, Bot, LogOut
} from 'lucide-react'

const roleBadgeColor = {
  admin: 'bg-red-500',
  supervisor: 'bg-blue-500',
  associate: 'bg-green-500',
  warehouse: 'bg-yellow-500',
  executive: 'bg-purple-500',
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin','supervisor','associate','warehouse','executive'] },
    { to: '/inventory', icon: Package, label: 'Inventory', roles: ['admin','supervisor','associate','warehouse','executive'] },
    { to: '/pos', icon: ShoppingCart, label: 'POS / Billing', roles: ['admin','supervisor','associate'] },
    { to: '/returns', icon: RotateCcw, label: 'Returns', roles: ['admin','supervisor','associate'] },
    { to: '/reports', icon: BarChart2, label: 'Reports', roles: ['admin','supervisor','executive'] },
    { to: '/ai', icon: Bot, label: 'AI Assistant', roles: ['admin','supervisor','associate','warehouse','executive'] },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="w-60 min-h-screen bg-sidebar flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-blue-800">
        <div className="text-white font-bold text-xl tracking-wide">NovaCart</div>
        <div className="text-blue-300 text-xs mt-0.5">Omni-Channel Retail</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.filter(item => item.roles.includes(user?.role)).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent text-white'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-blue-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">{user?.name}</div>
            <span className={`text-xs px-1.5 py-0.5 rounded text-white ${roleBadgeColor[user?.role] || 'bg-gray-500'}`}>
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-blue-300 hover:text-white text-sm w-full px-2 py-1.5 rounded hover:bg-blue-800 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  )
}
