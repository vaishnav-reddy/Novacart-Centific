import { useState, useEffect } from 'react'
import axios from 'axios'
import { API, useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { showToast } from '../components/Toast'
import { CheckSquare, Square } from 'lucide-react'

const statusConfig = {
  pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', cls: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-800' },
}

const reasons = ['Defective', 'Wrong item', 'Customer changed mind', 'Other']

function NewReturnTab() {
  const [txnId, setTxnId] = useState('')
  const [txn, setTxn] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])   // which products to return
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchTxn = async () => {
    if (!txnId.trim()) return setError('Enter a transaction ID')
    setFetchLoading(true)
    setError('')
    try {
      const input = txnId.trim().replace(/^#/, '')
      const res = await axios.get(`${API}/billing/transactions/lookup`, { params: { txn_id: input } })
      setTxn(res.data)
      // Default: no items selected
      setSelectedItems([])
    } catch {
      setError('Transaction not found. Enter the 8-character ID from your receipt (e.g. A3D9C123)')
      setTxn(null)
    } finally {
      setFetchLoading(false)
    }
  }

  const toggleItem = (idx) => {
    setSelectedItems(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    )
  }

  // Calculate refund based on selected items
  const refundAmount = txn
    ? selectedItems.reduce((sum, idx) => {
        const item = txn.items[idx]
        const line = item.unit_price * item.qty
        const afterDiscount = line * (1 - (item.discount || 0) / 100)
        return sum + afterDiscount * 1.18  // include GST
      }, 0)
    : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!txn) return setError('Fetch a transaction first')
    if (selectedItems.length === 0) return setError('Select at least one product to return')
    if (!reason) return setError('Select a reason')
    setLoading(true)
    try {
      const returnedProducts = selectedItems.map(idx => txn.items[idx].product_name).join(', ')
      await axios.post(`${API}/returns`, {
        txn_id: txn.txn_id,
        reason: `${reason} — Items: ${returnedProducts}`,
        refund_amount: parseFloat(refundAmount.toFixed(2))
      })
      showToast('Return submitted successfully')
      setTxnId(''); setTxn(null); setReason(''); setSelectedItems([])
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to submit return', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-1">Submit New Return</h3>
        <p className="text-xs text-gray-400 mb-4">Enter the transaction ID from the receipt, then select which items to return.</p>

        {/* Step 1: Fetch transaction */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Step 1 — Transaction ID</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. A3D9C123 or paste full ID"
              value={txnId}
              onChange={e => { setTxnId(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && fetchTxn()}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              onClick={fetchTxn}
              disabled={fetchLoading}
              className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary disabled:opacity-60 whitespace-nowrap"
            >
              {fetchLoading ? 'Fetching...' : 'Fetch'}
            </button>
          </div>
          {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
        </div>

        {/* Step 2: Select items */}
        {txn && (
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Step 2 — Select Items to Return
            </label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 text-xs text-gray-500 border-b border-gray-200">
                Transaction #{txn.txn_id.slice(-8).toUpperCase()} · {txn.payment_type?.toUpperCase()} · ₹{Number(txn.total).toLocaleString('en-IN')}
              </div>
              {txn.items?.map((item, idx) => {
                const selected = selectedItems.includes(idx)
                const lineTotal = (item.unit_price * item.qty * (1 - (item.discount || 0) / 100) * 1.18)
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleItem(idx)}
                    className={`w-full flex items-center gap-3 px-3 py-3 text-left border-b border-gray-100 last:border-0 transition-colors ${
                      selected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    {selected
                      ? <CheckSquare size={18} className="text-accent flex-shrink-0" />
                      : <Square size={18} className="text-gray-300 flex-shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{item.product_name}</div>
                      <div className="text-xs text-gray-500">Qty: {item.qty} × ₹{Number(item.unit_price).toLocaleString('en-IN')}</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-700">
                      ₹{lineTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                  </button>
                )
              })}
            </div>
            {selectedItems.length === 0 && (
              <p className="text-xs text-amber-600 mt-1.5">Tap items above to select what to return</p>
            )}
          </div>
        )}

        {/* Step 3: Reason + submit */}
        {txn && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide -mb-2">Step 3 — Reason & Confirm</label>
            <div>
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-white"
              >
                <option value="">Select return reason...</option>
                {reasons.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {selectedItems.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-green-700 font-medium">{selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected</div>
                  <div className="text-xs text-green-600">Refund amount (incl. GST)</div>
                </div>
                <div className="text-lg font-bold text-green-700">
                  ₹{refundAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || selectedItems.length === 0 || !reason}
              className="w-full bg-accent text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Return Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function ManageReturnsTab() {
  const { user } = useAuth()
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')  // default to pending so supervisor sees them immediately
  const canApprove = ['admin', 'supervisor'].includes(user?.role)

  const fetchReturns = async () => {
    setLoading(true)
    try {
      // Admin/supervisor fetch ALL returns (no store filter) so cross-store returns are visible
      const params = {}
      if (filter) params.status = filter
      if (!canApprove && user?.store_id) params.store_id = user.store_id
      const res = await axios.get(`${API}/returns`, { params })
      setReturns(res.data)
    } catch {
      showToast('Failed to load returns', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReturns() }, [filter])

  const handleAction = async (return_id, action) => {
    try {
      await axios.patch(`${API}/returns/${return_id}/${action}`)
      showToast(`Return ${action}d successfully`)
      fetchReturns()
    } catch (err) {
      showToast(err.response?.data?.detail || `Failed to ${action}`, 'error')
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {[['pending', 'Pending'], ['', 'All'], ['approved', 'Approved'], ['rejected', 'Rejected']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              filter === val ? 'bg-accent text-white border-accent' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
        <button onClick={fetchReturns} className="ml-auto px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Return ID</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Items / Reason</th>
                  <th className="text-right px-4 py-3 text-gray-600 font-medium">Refund</th>
                  <th className="text-center px-4 py-3 text-gray-600 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Date</th>
                  {canApprove && <th className="text-center px-4 py-3 text-gray-600 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {returns.map((r, i) => {
                  const cfg = statusConfig[r.status] || statusConfig.pending
                  // Parse reason — format is "Reason — Items: product1, product2"
                  const reasonParts = r.reason?.split(' — Items: ')
                  const reasonText = reasonParts?.[0] || r.reason
                  const itemsText = reasonParts?.[1] || ''
                  return (
                    <tr key={r.return_id} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">#{r.return_id.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-3">
                        <div className="text-gray-700 font-medium text-xs">{reasonText}</div>
                        {itemsText && <div className="text-gray-400 text-xs mt-0.5 truncate max-w-48">{itemsText}</div>}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">
                        ₹{Number(r.refund_amount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${cfg.cls}`}>{cfg.label}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(r.created_at).toLocaleDateString('en-IN')}
                      </td>
                      {canApprove && (
                        <td className="px-4 py-3 text-center">
                          {r.status === 'pending' && (
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleAction(r.return_id, 'approve')}
                                className="text-xs bg-success text-white px-3 py-1.5 rounded-lg hover:bg-green-700 font-medium"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleAction(r.return_id, 'reject')}
                                className="text-xs bg-danger text-white px-3 py-1.5 rounded-lg hover:bg-red-700 font-medium"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {returns.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">📋</div>
            No {filter || ''} returns found
          </div>
        )}
      </div>
    </div>
  )
}

export default function Returns() {
  const [tab, setTab] = useState('new')
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Returns</h1>
        <div className="flex gap-2 mb-6">
          {[['new', 'New Return'], ['manage', 'Manage Returns']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === key ? 'bg-accent text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === 'new' ? <NewReturnTab /> : <ManageReturnsTab />}
      </div>
    </Layout>
  )
}
