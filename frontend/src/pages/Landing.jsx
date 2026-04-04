import { useNavigate } from 'react-router-dom'
import {
  ShoppingBag, BarChart2, Package, Bot, ShoppingCart,
  RotateCcw, ArrowRight, Zap, Shield, TrendingUp,
  Store, Users, Activity, ChevronRight
} from 'lucide-react'

const features = [
  {
    icon: BarChart2,
    title: 'Real-Time Analytics',
    desc: 'Live revenue dashboards, daily trends, and category breakdowns. Every metric updates the moment a sale happens.',
    color: 'from-blue-500 to-blue-600',
    light: 'bg-blue-50 text-blue-600',
  },
  {
    icon: ShoppingCart,
    title: 'Point of Sale',
    desc: 'GST-compliant billing with instant receipt generation, multi-payment support, and automatic inventory deduction.',
    color: 'from-green-500 to-green-600',
    light: 'bg-green-50 text-green-600',
  },
  {
    icon: Package,
    title: 'Inventory Control',
    desc: 'Real-time stock tracking across all stores. Automated low-stock alerts and full audit logs on every adjustment.',
    color: 'from-orange-500 to-orange-600',
    light: 'bg-orange-50 text-orange-600',
  },
  {
    icon: RotateCcw,
    title: 'Returns Management',
    desc: 'Streamlined return workflows with supervisor approval gates. Stock auto-restocked on approval.',
    color: 'from-purple-500 to-purple-600',
    light: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Bot,
    title: 'AI Business Assistant',
    desc: 'Ask anything in plain English. Powered by Groq LLaMA 3.1 with live store context and anomaly detection.',
    color: 'from-pink-500 to-pink-600',
    light: 'bg-pink-50 text-pink-600',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    desc: 'Five distinct roles — Admin, Supervisor, Associate, Warehouse, Executive. Each sees exactly what they need.',
    color: 'from-teal-500 to-teal-600',
    light: 'bg-teal-50 text-teal-600',
  },
]

const stats = [
  { value: '74', label: 'Stores', icon: Store },
  { value: '5', label: 'User Roles', icon: Users },
  { value: '15+', label: 'Product SKUs', icon: Package },
  { value: 'AI', label: 'Powered', icon: Zap },
]

const roles = [
  { role: 'Admin', color: 'bg-red-500', desc: 'Full access · All stores' },
  { role: 'Supervisor', color: 'bg-blue-500', desc: 'Own store · Approve returns' },
  { role: 'Associate', color: 'bg-green-500', desc: 'POS billing · Submit returns' },
  { role: 'Warehouse', color: 'bg-yellow-500', desc: 'Inventory view' },
  { role: 'Executive', color: 'bg-purple-500', desc: 'Reports · All stores' },
]

const demoAccounts = [
  { email: 'admin@novacart.com', role: 'Admin', store: 'All Stores', color: 'border-red-200 bg-red-50' },
  { email: 'supervisor@novacart.com', role: 'Supervisor', store: 'Hyderabad Central', color: 'border-blue-200 bg-blue-50' },
  { email: 'associate@novacart.com', role: 'Associate', store: 'Mumbai West', color: 'border-green-200 bg-green-50' },
  { email: 'warehouse@novacart.com', role: 'Warehouse', store: 'Bangalore North', color: 'border-yellow-200 bg-yellow-50' },
  { email: 'executive@novacart.com', role: 'Executive', store: 'All Stores', color: 'border-purple-200 bg-purple-50' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-primary leading-none block">NovaCart</span>
              <span className="text-xs text-gray-400 leading-none">Retail Platform</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="#features" className="text-sm text-gray-500 hover:text-primary transition-colors hidden md:block">Features</a>
            <a href="#demo" className="text-sm text-gray-500 hover:text-primary transition-colors hidden md:block">Demo</a>
            <button
              onClick={() => navigate('/login')}
              className="bg-primary hover:bg-accent text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              Launch App <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#1B4F72] to-[#1B3A5C]">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* Glow blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-4 py-1.5 rounded-full text-sm text-blue-200 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Demo Live · No setup required
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            Omni-Channel Retail<br />
            <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
              Operations Platform
            </span>
          </h1>

          <p className="text-blue-200 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            One unified platform for 74 stores — real-time inventory, AI-powered insights,
            GST-compliant billing, and role-based access from cashier to executive.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-primary font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-base"
            >
              Launch Demo <ArrowRight size={18} />
            </button>
            <button
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              className="border border-white/30 text-white px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all text-base"
            >
              Explore Features
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 text-center">
                <Icon size={20} className="text-blue-300 mx-auto mb-2" />
                <div className="text-3xl font-extrabold text-white">{value}</div>
                <div className="text-blue-300 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-accent text-sm font-semibold uppercase tracking-widest">Platform Features</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">Everything your chain needs</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Built for consumer electronics retail at scale — from a single cashier to the CEO.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color, light }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${light}`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                <div className="mt-4 flex items-center gap-1 text-accent text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role-based access visual ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-accent text-sm font-semibold uppercase tracking-widest">Access Control</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">Right data for the right person</h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                Five distinct roles with granular permissions. Associates see their store's POS.
                Executives see cross-store analytics. Admins control everything.
              </p>
              <div className="space-y-3">
                {roles.map(({ role, color, desc }) => (
                  <div key={role} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                    <span className="font-semibold text-gray-800 w-24">{role}</span>
                    <span className="text-gray-500 text-sm">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary to-sidebar rounded-3xl p-8 text-white shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Activity size={20} className="text-blue-300" />
                <span className="font-semibold text-blue-100">Live Store Activity</span>
              </div>
              {[
                { store: 'Hyderabad Central', rev: '₹4,82,340', txns: 14, trend: '+12%' },
                { store: 'Mumbai West', rev: '₹3,21,890', txns: 10, trend: '+8%' },
                { store: 'Bangalore North', rev: '₹1,94,560', txns: 6, trend: '+5%' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                  <div>
                    <div className="font-medium text-white text-sm">{s.store}</div>
                    <div className="text-blue-300 text-xs">{s.txns} transactions</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">{s.rev}</div>
                    <div className="text-green-400 text-xs">{s.trend}</div>
                  </div>
                </div>
              ))}
              <div className="mt-4 flex items-center gap-2 text-blue-300 text-xs">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Updated in real-time
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI section ── */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-900 to-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20">
            <Bot size={32} className="text-blue-300" />
          </div>
          <h2 className="text-4xl font-bold mb-4">AI-Powered Business Intelligence</h2>
          <p className="text-blue-200 text-lg mb-10 max-w-xl mx-auto">
            Ask questions in plain English. Get instant answers about sales, inventory, and store performance — no SQL, no dashboards to dig through.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {[
              '"What are my top selling products this week?"',
              '"Which stores are running low on stock?"',
              '"Show me today\'s revenue vs yesterday"',
            ].map((q) => (
              <div key={q} className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4 text-blue-100 text-sm italic">
                {q}
              </div>
            ))}
          </div>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm text-blue-200">
            <Zap size={14} className="text-yellow-400" />
            Powered by Groq · LLaMA 3.1 · Sub-second responses
          </div>
        </div>
      </section>

      {/* ── Demo CTA ── */}
      <section id="demo" className="py-20 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-accent text-sm font-semibold uppercase tracking-widest">Try It Now</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">Live Demo Accounts</h2>
            <p className="text-gray-500 mt-3">All accounts use password <span className="font-mono font-bold text-primary bg-blue-50 px-2 py-0.5 rounded">Demo@123</span></p>
          </div>

          <div className="space-y-3 mb-8">
            {demoAccounts.map(({ email, role, store, color }) => (
              <div key={email} className={`flex items-center justify-between p-4 rounded-xl border ${color}`}>
                <div>
                  <div className="font-mono text-sm font-medium text-gray-800">{email}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{store}</div>
                </div>
                <span className="text-xs font-bold text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">{role}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/login')}
            className="w-full bg-primary hover:bg-accent text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            Launch NovaCart Demo <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0a1628] text-gray-400 py-8 px-6 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <ShoppingBag size={12} className="text-white" />
          </div>
          <span className="text-white font-semibold">NovaCart</span>
        </div>
        <p>Omni-Channel Retail Operations Platform · FastAPI + React + PostgreSQL + Groq AI</p>
      </footer>

    </div>
  )
}
