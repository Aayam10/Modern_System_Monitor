import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { api } from '../api'
import type { Env } from '../App'

interface Message {
  role: 'user' | 'nexus' | 'system'
  text: string
  tool?: string
  ts: Date
}

const SUGGESTIONS = [
  'Jenkins build is failing on the main pipeline',
  'Snowflake user is missing SELECT permissions',
  'ADF trigger did not fire last night',
  'Kubernetes pod is in CrashLoopBackOff',
  'Tableau workbook deployment is failing',
  'Review my Terraform plan before applying',
  'Generate an incident report for a P1 outage',
]

export default function AssistantPage({ env }: { env: Env }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      text: 'OpsNexus is ready. All responses are demo/mock only. No real systems will be modified. Human approval is required before any production action.',
      ts: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [approvalPending, setApprovalPending] = useState<{ tool: string; response: string } | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text: string) => {
    const q = text.trim()
    if (!q || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: q, ts: new Date() }])
    setLoading(true)

    try {
      const res = await api.chat(q, env)
      // Show approval gate before revealing full response
      setApprovalPending({ tool: res.tool, response: res.response })
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'nexus',
        text: `**Error:** Could not reach the OpsNexus backend.\n\nEnsure the backend is running:\n\`\`\`\ndocker compose up --build\n\`\`\`\n\nOr: \`cd backend && uvicorn app.main:app --reload\``,
        ts: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const approve = () => {
    if (!approvalPending) return
    setMessages(prev => [...prev, {
      role: 'nexus',
      text: approvalPending.response,
      tool: approvalPending.tool,
      ts: new Date(),
    }])
    setApprovalPending(null)
  }

  const reject = () => {
    setMessages(prev => [...prev, {
      role: 'nexus',
      text: 'Action cancelled. The proposed analysis was not approved. No changes were made.',
      ts: new Date(),
    }])
    setApprovalPending(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 fade-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <Avatar role={msg.role} tool={msg.tool} />
            <div className={`max-w-3xl ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className="flex items-center gap-2 mb-0.5">
                {msg.tool && <span className="badge badge-cyan" style={{ fontSize: 10 }}>{msg.tool}</span>}
                <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>
                  {msg.ts.toLocaleTimeString()}
                </span>
              </div>
              <div
                className="rounded-xl px-4 py-3"
                style={{
                  background: msg.role === 'user'
                    ? 'rgba(0,200,240,0.08)'
                    : msg.role === 'system'
                      ? 'rgba(245,158,11,0.06)'
                      : 'var(--bg-card)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(0,200,240,0.2)' : msg.role === 'system' ? 'rgba(245,158,11,0.2)' : 'var(--border)'}`,
                  maxWidth: '700px',
                }}
              >
                {msg.role === 'user' ? (
                  <p style={{ color: 'var(--text)', fontSize: 13, lineHeight: 1.65 }}>{msg.text}</p>
                ) : (
                  <div className="md-response">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 fade-up">
            <Avatar role="nexus" />
            <div
              className="rounded-xl px-4 py-3 flex items-center gap-2"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              {[0, 1, 2].map(d => (
                <div
                  key={d}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: 'var(--cyan)',
                    animation: `blink 1.2s ease-in-out ${d * 0.25}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Approval Modal */}
        {approvalPending && (
          <div
            className="rounded-xl p-5 fade-up"
            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.3)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span style={{ fontSize: 16 }}>⚠</span>
              <span className="font-display font-semibold" style={{ color: '#fbbf24', fontSize: 14 }}>
                Human Approval Required
              </span>
              <span className="badge badge-amber" style={{ fontSize: 10 }}>{approvalPending.tool}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 14 }}>
              OpsNexus has prepared a response for this request. Review and approve to display the full analysis,
              or cancel to discard. No real systems will be affected.
            </p>
            <div className="flex gap-3">
              <button className="btn-primary" onClick={approve}>Approve & Show Response</button>
              <button className="btn-ghost" onClick={reject}>Cancel</button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-6 pb-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => send(s)}
              className="px-3 py-1.5 rounded-lg text-xs transition-all duration-150"
              style={{
                background: 'rgba(0,200,240,0.05)',
                border: '1px solid rgba(0,200,240,0.15)',
                color: 'rgba(0,200,240,0.7)',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div
        className="flex items-center gap-3 px-6 py-4 flex-shrink-0"
        style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-panel)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(0,200,240,0.1)', border: '1px solid rgba(0,200,240,0.2)', color: 'var(--cyan)', fontSize: 16 }}
        >
          ◎
        </div>
        <input
          ref={inputRef}
          type="text"
          className="nexus-input flex-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
          placeholder="Describe your CloudOps issue... (e.g., 'Jenkins build failing on main')"
          disabled={loading || !!approvalPending}
        />
        <button
          className="btn-primary flex-shrink-0"
          onClick={() => send(input)}
          disabled={loading || !!approvalPending || !input.trim()}
          style={{ opacity: (!input.trim() || loading) ? 0.5 : 1 }}
        >
          Submit
        </button>
      </div>
    </div>
  )
}

function Avatar({ role, tool }: { role: string; tool?: string }) {
  if (role === 'user') {
    return (
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-semibold"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 11 }}
      >
        YOU
      </div>
    )
  }
  if (role === 'system') {
    return (
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24', fontSize: 14 }}
      >
        ⚠
      </div>
    )
  }
  const icons: Record<string, string> = {
    jenkins: '⚙', snowflake: '❄', adf: '☁', kubernetes: '⎈',
    tableau: '▦', terraform: '◈', incident: '◉', assistant: '◎',
  }
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{
        background: 'rgba(0,200,240,0.1)',
        border: '1px solid rgba(0,200,240,0.2)',
        color: 'var(--cyan)',
        fontSize: 14,
      }}
    >
      {icons[tool || ''] ?? 'NX'}
    </div>
  )
}
