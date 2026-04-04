import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { API } from '../context/AuthContext'
import Layout from '../components/Layout'
import { Bot, Send, AlertTriangle, Zap, Package, MessageSquare } from 'lucide-react'

const quickQuestions = [
  "Show today's sales summary",
  "Which products are low on stock?",
  "Top selling category this week?",
  "How many transactions were completed today?",
]

export default function AIQuery() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm NovaCart's AI assistant. Ask me anything about your store's sales, inventory, or performance." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [anomalies, setAnomalies] = useState(null)
  const [anomalyLoading, setAnomalyLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (question) => {
    const q = question || input.trim()
    if (!q) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setLoading(true)
    try {
      const res = await axios.post(`${API}/ai/query`, { question: q })
      setMessages(prev => [...prev, { role: 'bot', text: res.data.answer }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I encountered an error. Please check your GROQ_API_KEY in backend/.env', error: true }])
    } finally {
      setLoading(false)
    }
  }

  const checkAnomalies = async () => {
    setAnomalyLoading(true)
    try {
      const res = await axios.post(`${API}/ai/anomalies`)
      setAnomalies(res.data.anomalies)
    } catch {} finally { setAnomalyLoading(false) }
  }

  const severityConfig = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200',
  }

  return (
    <Layout>
      <div className="p-6 h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-accent rounded-xl"><Bot size={24} className="text-white" /></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">AI Business Assistant</h1>
            <p className="text-gray-500 text-sm">Powered by Groq · llama3-8b-8192</p>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { icon: MessageSquare, title: 'Natural Language Query', desc: 'Ask anything about your store data', color: 'text-accent' },
            { icon: Package, title: 'Product Recommendations', desc: 'See what to suggest next to customers', color: 'text-success' },
            { icon: Zap, title: 'Anomaly Detection', desc: 'Detect unusual transactions or stock movements', color: 'text-warning' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-start gap-3">
              <Icon size={20} className={color} />
              <div>
                <div className="font-medium text-gray-800 text-sm">{title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          {/* Chat */}
          <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm" style={{ height: 'calc(100vh - 340px)' }}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      <Bot size={14} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-lg px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-accent text-white rounded-tr-sm'
                      : msg.error
                        ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm'
                        : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center mr-2 flex-shrink-0">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick questions */}
            <div className="px-4 py-2 border-t border-gray-100 flex gap-2 flex-wrap">
              {quickQuestions.map(q => (
                <button key={q} onClick={() => sendMessage(q)} disabled={loading} className="text-xs bg-blue-50 text-accent px-3 py-1 rounded-full hover:bg-blue-100 transition-colors disabled:opacity-50">
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask about sales, inventory, performance..."
                disabled={loading}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="bg-accent text-white p-2.5 rounded-xl hover:bg-primary disabled:opacity-60 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>

          {/* Anomaly panel */}
          <div className="w-72 flex flex-col">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={18} className="text-warning" />
                <span className="font-semibold text-gray-800 text-sm">Anomaly Detection</span>
              </div>
              <button
                onClick={checkAnomalies}
                disabled={anomalyLoading}
                className="w-full bg-warning text-white py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 disabled:opacity-60 transition-colors mb-4"
              >
                {anomalyLoading ? 'Checking...' : 'Check Anomalies'}
              </button>

              {anomalies !== null && (
                <div className="space-y-2">
                  {anomalies.length === 0 ? (
                    <div className="text-center text-green-600 text-sm py-4">
                      <div className="text-2xl mb-1">✓</div>
                      No anomalies detected
                    </div>
                  ) : (
                    anomalies.map((a, i) => (
                      <div key={i} className={`p-3 rounded-lg border text-xs ${severityConfig[a.severity] || severityConfig.low}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold capitalize">{a.type.replace(/_/g, ' ')}</span>
                          <span className={`px-1.5 py-0.5 rounded text-xs font-bold uppercase ${
                            a.severity === 'high' ? 'bg-red-200' : a.severity === 'medium' ? 'bg-yellow-200' : 'bg-blue-200'
                          }`}>{a.severity}</span>
                        </div>
                        <p>{a.description}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
