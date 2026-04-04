import { useState, useEffect } from 'react'
import axios from 'axios'
import { API, useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { TrendingUp, ShoppingCart, AlertTriangle, RotateCcw, Package } from 'lucide-react'

const COLORS = ['#2E86C1', '#1E8449', '#F39C12', '#C0392B', '#8E44AD', '#16A085']

function KPICard({ title, value, icon: Icon, color, badge }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500 font-medium">{title}</span>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-gray-800">{value}</span>
        {badge}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const params = { period }
        if (user?.store_id && !['admin', 'executive'].includes(user.role)) {
          params.store_id = user.store_id
        }
        const res = await axios.get(`${API}/reports/dashboard`, { params })
        setData(res.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [period, user])

  const formatCurrency = (v) => `₹${Number(v).toLocaleString('en-IN')}`

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Welcome back, {user?.name}
              {['admin','executive'].includes(user?.role)
                ? <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">All Stores</span>
                : data?.store_name
                  ? <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{data.store_name}</span>
                  : null
              }
            </p>
          </div>
          <div className="flex gap-2">
            {['7d', '30d', '90d'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  period === p ? 'bg-accent text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            title="Total Revenue"
            value={formatCurrency(data?.total_revenue || 0)}
            icon={TrendingUp}
            color="bg-accent"
          />
          <KPICard
            title="Transactions"
            value={data?.total_transactions || 0}
            icon={ShoppingCart}
            color="bg-success"
          />
          <KPICard
            title="Low Stock Alerts"
            value={data?.low_stock_count || 0}
            icon={AlertTriangle}
            color={data?.low_stock_count > 0 ? 'bg-danger' : 'bg-gray-400'}
            badge={data?.low_stock_count > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Action needed</span>
            )}
          />
          <KPICard
            title="Pending Returns"
            value={data?.pending_returns_count || 0}
            icon={RotateCcw}
            color="bg-warning"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Line chart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-4">Daily Revenue</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data?.daily_revenue || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d?.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => formatCurrency(v)} labelFormatter={l => `Date: ${l}`} />
                <Line type="monotone" dataKey="revenue" stroke="#2E86C1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-4">Revenue by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data?.category_breakdown || []}
                  dataKey="revenue"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={35}
                >
                  {(data?.category_breakdown || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={v => formatCurrency(v)} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top products */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Package size={16} /> Top Selling Products
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b">
                  <th className="text-left pb-2">Product</th>
                  <th className="text-right pb-2">Units</th>
                  <th className="text-right pb-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(data?.top_products || []).map((p, i) => (
                  <tr key={i} className={`${i % 2 === 0 ? 'bg-gray-50' : ''} border-b border-gray-50`}>
                    <td className="py-2 text-gray-700 truncate max-w-32">{p.name}</td>
                    <td className="py-2 text-right text-gray-600">{p.qty_sold}</td>
                    <td className="py-2 text-right font-medium text-gray-800">{formatCurrency(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Category breakdown */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {(data?.category_breakdown || []).slice(0, 6).map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{c.category}</span>
                    <span className="font-medium text-gray-800">{c.percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${c.percentage}%`, backgroundColor: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
