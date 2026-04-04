const statusConfig = {
  ok: { label: 'In Stock', cls: 'bg-green-100 text-green-800' },
  low: { label: 'Low Stock', cls: 'bg-yellow-100 text-yellow-800' },
  critical: { label: 'Critical', cls: 'bg-orange-100 text-orange-800' },
  out: { label: 'Out of Stock', cls: 'bg-red-100 text-red-800' },
}

export default function StockCard({ product }) {
  const cfg = statusConfig[product.status] || statusConfig.ok
  return (
    <div className={`p-3 rounded-lg border ${product.status === 'out' ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}>
      <div className="font-medium text-sm text-gray-800 truncate">{product.product_name}</div>
      <div className="text-xs text-gray-500 mt-0.5">{product.category}</div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm font-bold text-gray-700">Qty: {product.quantity}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>{cfg.label}</span>
      </div>
    </div>
  )
}
