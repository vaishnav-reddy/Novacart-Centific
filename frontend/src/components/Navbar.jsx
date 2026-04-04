import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API, useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [alertCount, setAlertCount] = useState(0)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get(`${API}/alerts`)
        const d = res.data
        setAlertCount(
          (d.out_of_stock?.length || 0) +
          (d.critical_stock?.length || 0) +
          (d.low_stock?.length || 0)
        )
      } catch {}
    }
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 60000)
    return () => clearInterval(interval)
  }, [])

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  })

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 left-60 right-0 z-30">
      <div className="text-sm text-gray-500">{today}</div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/inventory')}
          className="relative p-2 text-gray-500 hover:text-primary transition-colors"
        >
          <Bell size={20} />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>
        <div className="text-sm text-gray-600 font-medium">{user?.name}</div>
      </div>
    </div>
  )
}
