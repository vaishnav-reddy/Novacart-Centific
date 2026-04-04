import { useState, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API } from '../context/AuthContext'

export default function AlertBanner() {
  const [alerts, setAlerts] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API}/alerts`)
        setAlerts(res.data)
        setDismissed(false)
      } catch {}
    }
    fetch()
    const interval = setInterval(fetch, 60000)
    return () => clearInterval(interval)
  }, [])

  if (dismissed || !alerts) return null

  const outCount = alerts.out_of_stock?.length || 0
  const critCount = alerts.critical_stock?.length || 0

  if (outCount === 0 && critCount === 0) return null

  return (
    <div className="bg-danger text-white px-4 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} />
        <span>
          {outCount > 0 && `${outCount} product${outCount > 1 ? 's' : ''} out of stock`}
          {outCount > 0 && critCount > 0 && ' · '}
          {critCount > 0 && `${critCount} critically low`}
        </span>
        <button
          onClick={() => navigate('/inventory')}
          className="underline ml-2 hover:no-underline"
        >
          View Inventory
        </button>
      </div>
      <button onClick={() => setDismissed(true)}><X size={16} /></button>
    </div>
  )
}
