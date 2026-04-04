import { useState, useEffect } from 'react'
import axios from 'axios'
import { API, useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { TrendingUp, ShoppingCart, RotateCcw, Package } from 'lucide-react'

const COLORS = ['#2E86C1', '#1E8449', '#F39C12', '#C0392B', '#8E44AD', '#16A085']

export default function Reports() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [storeComp, setStoreComp] = useState([])
  const [period, setPeriod] = useState('30d')
  const [loading, setLoading] = useState(true)

  const isAdminOrExec = ['admin', 'executive'].includes(user?.role)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const params = { period }
        if (!isAdminOrExec && user?.store_id) params.store_id = user.store_id
        const res = await axios.get(`${API}/reports/dashboard`, { params })
        setData(res.data)
        if (isAdminOrExec) {
          const sc = await axios.get(`${API}/reports/store-comparison`)
          setStoreComp(sc.data)
        }
      } catch {} finally { setLoading(false) }
    }
    fetch()
  }, [period])

  const fmt = v => `₹${Number(v).toLocaleString('en-IN')}`

  if (loading) return <Layout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div></div></Layout>

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <div className="flex gap-2">
            {['7d', '30d', '90d'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${period === p ? 'bg-accent text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { title: 'Revenue', value: fmt(data?.total_revenue || 0), icon: TrendingUp, color: 'bg-accent' },
            { title: 'Transactions', value: data?.total_transactions || 0, icon: ShoppingCart, color: 'bg-success' },
            { title: 'Avg Basket', value: fmt(data?.avg_basket_size || 0), icon: Package, color: 'bg-warning' },
            { title: 'Pending Returns', value: data?.pending_returns_count || 0, icon: RotateCcw, color: 'bg-danger' },
          ].map(({ title, value, icon: Icon, color }) => (
            <div key={title} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{title}</span>
                <div className={`p-2 rounded-lg ${color}`}><Icon size={16} className="text-white" /></div>
              </div>
              <div className="text-xl font-bold text-gray-800">{value}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-4">Revenue by Day</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.daily_revenue || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d?.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => fmt(v)} />
                <Bar dataKey="revenue" fill="#2E86C1" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-4">Category Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data?.category_breakdown || []} dataKey="revenue" nameKey="category" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                  {(data?.category_breakdown || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => fmt(v)} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Store Comparison */}
        {isAdminOrExec && storeComp.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-4">Store Comparison</h3>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Store</th>
                  <th className="text-right px-4 py-3 text-gray-600 font-medium">Revenue</th>
                  <th className="text-right px-4 py-3 text-gray-600 font-medium">Transactions</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Top Category</th>
                </tr>
              </thead>
              <tbody>
                {storeComp.map((s, i) => (
                  <tr key={s.store_id} className={`border-b ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-4 py-3 font-medium text-gray-800">{s.store_name}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmt(s.revenue)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{s.transactions}</td>
                    <td className="px-4 py-3 text-gray-600">{s.top_category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
