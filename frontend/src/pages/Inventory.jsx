import { useState, useEffect } from 'react'
import axios from 'axios'
import { API, useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { showToast } from '../components/Toast'
import { Search, SlidersHorizontal, X } from 'lucide-react'

const statusConfig = {
  ok: { label: 'In Stock', cls: 'bg-green-100 text-green-800' },
  low: { label: 'Low Stock', cls: 'bg-yellow-100 text-yellow-800' },
  critical: { label: 'Critical', cls: 'bg-orange-100 text-orange-800' },
  out: { label: 'Out of Stock', cls: 'bg-red-100 text-red-800' },
}

function AdjustModal({ item, onClose, onSuccess }) {
  const [change, setChange] = useState(0)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason.trim()) return setError('Reason is required')
    if (change === 0) return setError('Quantity change cannot be 0')
    setLoading(true)
    try {
      await axios.post(`${API}/inventory/adjust`, {
        product_id: item.product_id,
        store_id: item.store_id,
        quantity_change: parseInt(change),
        reason
      })
      showToast('Stock adjusted successfully')
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to adjust stock')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Adjust Stock</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="font-medium text-gray-700">{item.product_name}</div>
          <div className="text-sm text-gray-500">{item.store_name} · Current qty: {item.quantity}</div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Change</label>
            <input
              type="number"
              value={change}
              onChange={e => setChange(e.target.value)}
              placeholder="e.g. +10 or -5"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="text-xs text-gray-400 mt-1">Use negative values to reduce stock</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Stock received, Damaged goods..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-accent text-white py-2 rounded-lg text-sm hover:bg-primary disabled:opacity-60">
              {loading ? 'Saving...' : 'Adjust Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Inventory() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [adjustItem, setAdjustItem] = useState(null)

  const canAdjust = ['admin', 'supervisor'].includes(user?.role)

  const categories = [...new Set(items.map(i => i.category).filter(Boolean))]

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (category) params.category = category
      const res = await axios.get(`${API}/inventory`, { params })
      setItems(res.data)
    } catch (e) {
      showToast('Failed to load inventory', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInventory() }, [search, category])

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
          <span className="text-sm text-gray-500">{items.length} items</span>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Product</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Category</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Barcode</th>
                    <th className="text-right px-4 py-3 text-gray-600 font-medium">Price</th>
                    <th className="text-right px-4 py-3 text-gray-600 font-medium">Stock</th>
                    <th className="text-center px-4 py-3 text-gray-600 font-medium">Status</th>
                    <th className="text-center px-4 py-3 text-gray-600 font-medium">Store</th>
                    {canAdjust && <th className="text-center px-4 py-3 text-gray-600 font-medium">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => {
                    const cfg = statusConfig[item.status] || statusConfig.ok
                    return (
                      <tr
                        key={item.inventory_id}
                        className={`border-b border-gray-50 ${
                          item.status === 'out' ? 'bg-red-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        } hover:bg-blue-50/30 transition-colors`}
                      >
                        <td className="px-4 py-3 font-medium text-gray-800">{item.product_name}</td>
                        <td className="px-4 py-3 text-gray-600">{item.category}</td>
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{item.barcode}</td>
                        <td className="px-4 py-3 text-right text-gray-700">₹{Number(item.price).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-800">{item.quantity}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${cfg.cls}`}>{cfg.label}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600 text-xs">{item.store_name}</td>
                        {canAdjust && (
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setAdjustItem(item)}
                              className="text-xs bg-accent text-white px-3 py-1 rounded-lg hover:bg-primary transition-colors"
                            >
                              Adjust
                            </button>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {items.length === 0 && (
                <div className="text-center py-12 text-gray-400">No inventory records found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {adjustItem && (
        <AdjustModal
          item={adjustItem}
          onClose={() => setAdjustItem(null)}
          onSuccess={fetchInventory}
        />
      )}
    </Layout>
  )
}
