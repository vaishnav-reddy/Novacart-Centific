import { useState, useEffect } from 'react'
import axios from 'axios'
import { API, useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { showToast } from '../components/Toast'
import { Search, Plus, Minus, Trash2, ShoppingCart, X, Printer } from 'lucide-react'

function ReceiptModal({ receipt, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4 no-print">
          <h3 className="font-bold text-gray-800 text-lg">Sale Complete</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="border-t border-b border-dashed border-gray-300 py-4 my-4">
          <div className="text-center mb-3">
            <div className="font-bold text-xl text-primary">NovaCart</div>
            <div className="text-xs text-gray-500">Transaction Receipt</div>
            <div className="text-xs text-gray-400 mt-1">#{receipt.txn_id?.slice(-8).toUpperCase()}</div>
          </div>
          <div className="space-y-2">
            {receipt.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.product_name} x{item.qty}</span>
                <span className="font-medium">₹{Number(item.line_total).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 mt-3 pt-3 space-y-1">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span><span>₹{Number(receipt.subtotal).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>GST (18%)</span><span>₹{Number(receipt.tax).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-2">
              <span>Total</span><span>₹{Number(receipt.total).toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="mt-3 text-center text-xs text-gray-500">
            <div>Payment: {receipt.payment_type?.toUpperCase()}</div>
            <div>{new Date(receipt.created_at).toLocaleString('en-IN')}</div>
          </div>
        </div>
        <div className="flex gap-3 no-print">
          <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">
            <Printer size={16} /> Print
          </button>
          <button onClick={onClose} className="flex-1 bg-success text-white py-2 rounded-lg text-sm hover:bg-green-700">Done</button>
        </div>
      </div>
    </div>
  )
}

export default function POS() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [discount, setDiscount] = useState(0)
  const [paymentType, setPaymentType] = useState('cash')
  const [loading, setLoading] = useState(false)
  const [receipt, setReceipt] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = {}
        if (search) params.search = search
        if (user?.store_id) params.store_id = user.store_id
        const res = await axios.get(`${API}/inventory`, { params })
        setProducts(res.data)
      } catch {}
    }
    fetch()
  }, [search, user])

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.product_id)
      if (existing) {
        return prev.map(i => i.product_id === product.product_id
          ? { ...i, qty: Math.min(i.qty + 1, product.quantity) }
          : i)
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const updateQty = (product_id, delta) => {
    setCart(prev => prev.map(i => i.product_id === product_id
      ? { ...i, qty: Math.max(1, i.qty + delta) }
      : i).filter(i => i.qty > 0))
  }

  const removeFromCart = (product_id) => setCart(prev => prev.filter(i => i.product_id !== product_id))

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const discountAmt = subtotal * (discount / 100)
  const afterDiscount = subtotal - discountAmt
  const tax = afterDiscount * 0.18
  const total = afterDiscount + tax

  const handleCheckout = async () => {
    if (cart.length === 0) return showToast('Cart is empty', 'error')
    if (!user?.store_id) return showToast('No store assigned', 'error')
    setLoading(true)
    try {
      const res = await axios.post(`${API}/billing/checkout`, {
        store_id: user.store_id,
        items: cart.map(i => ({ product_id: i.product_id, qty: i.qty, unit_price: i.price })),
        payment_type: paymentType,
        discount_percent: parseFloat(discount) || 0
      })
      setReceipt(res.data)
      setCart([])
      setDiscount(0)
      showToast('Sale completed successfully')
    } catch (err) {
      showToast(err.response?.data?.detail || 'Checkout failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="p-6 h-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">POS / Billing</h1>
        <div className="flex gap-4 h-full">
          {/* Left: Product Search */}
          <div className="flex-1 flex flex-col">
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product name or barcode..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto max-h-[calc(100vh-220px)]">
              {products.map(p => (
                <div key={p.inventory_id} className={`bg-white rounded-xl p-4 border shadow-sm ${p.status === 'out' ? 'opacity-60' : 'hover:border-accent hover:shadow-md'} transition-all`}>
                  <div className="font-medium text-gray-800 text-sm leading-tight mb-1">{p.product_name}</div>
                  <div className="text-xs text-gray-500 mb-2">{p.category}</div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-primary">₹{Number(p.price).toLocaleString('en-IN')}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${p.status === 'out' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {p.quantity} left
                    </span>
                  </div>
                  <button
                    onClick={() => addToCart(p)}
                    disabled={p.status === 'out'}
                    className="w-full flex items-center justify-center gap-1.5 bg-accent text-white py-1.5 rounded-lg text-xs font-medium hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={14} /> Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Cart */}
          <div className="w-80 xl:w-96 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <ShoppingCart size={18} className="text-accent" />
              <span className="font-semibold text-gray-800">Cart ({cart.length})</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 && (
                <div className="text-center text-gray-400 py-12 text-sm">Cart is empty</div>
              )}
              {cart.map(item => (
                <div key={item.product_id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{item.product_name}</div>
                    <div className="text-xs text-gray-500">₹{Number(item.price).toLocaleString('en-IN')} each</div>
                    <div className="text-sm font-bold text-primary mt-1">
                      ₹{(item.price * item.qty).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(item.product_id, -1)} className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
                      <Minus size={12} />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                    <button onClick={() => updateQty(item.product_id, 1)} className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
                      <Plus size={12} />
                    </button>
                    <button onClick={() => removeFromCart(item.product_id)} className="w-6 h-6 rounded bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center ml-1">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="p-4 border-t border-gray-100 space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Discount %</label>
                <input
                  type="number"
                  min="0" max="20"
                  value={discount}
                  onChange={e => setDiscount(Math.min(20, Math.max(0, e.target.value)))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN', {maximumFractionDigits:2})}</span></div>
                {discount > 0 && <div className="flex justify-between text-success"><span>Discount ({discount}%)</span><span>-₹{discountAmt.toLocaleString('en-IN', {maximumFractionDigits:2})}</span></div>}
                <div className="flex justify-between text-gray-600"><span>GST (18%)</span><span>₹{tax.toLocaleString('en-IN', {maximumFractionDigits:2})}</span></div>
                <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-2"><span>Total</span><span>₹{total.toLocaleString('en-IN', {maximumFractionDigits:2})}</span></div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium">Payment Method</label>
                <div className="flex gap-2 mt-1">
                  {['cash', 'upi', 'card'].map(m => (
                    <button
                      key={m}
                      onClick={() => setPaymentType(m)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        paymentType === m ? 'bg-accent text-white border-accent' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {m.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading || cart.length === 0}
                className="w-full bg-success hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Processing...' : `Complete Sale · ₹${total.toLocaleString('en-IN', {maximumFractionDigits:2})}`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {receipt && <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />}
    </Layout>
  )
}
