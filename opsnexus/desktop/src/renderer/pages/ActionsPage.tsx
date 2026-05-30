import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { api } from '../api'
import type { Env } from '../App'

const TOOLS = [
  { id: 'jenkins', label: 'Jenkins', icon: '⚙', desc: 'Build failure analysis, pipeline troubleshooting' },
  { id: 'snowflake', label: 'Snowflake', icon: '❄', desc: 'Permission analysis, role validation, grant SQL' },
  { id: 'adf', label: 'Azure Data Factory', icon: '☁', desc: 'Trigger checks, pipeline run diagnostics' },
  { id: 'kubernetes', label: 'Kubernetes', icon: '⎈', desc: 'Pod diagnostics, crash analysis, kubectl guidance' },
  { id: 'tableau', label: 'Tableau', icon: '▦', desc: 'Deployment validation, permission checks, extract refresh' },
  { id: 'terraform', label: 'Terraform', icon: '◈', desc: 'Plan review checklist, state checks, approval guidance' },
  { id: 'incident', label: 'Incident Response', icon: '◉', desc: 'Incident report draft, escalation template' },
]

export default function ActionsPage({ env }: { env: Env }) {
  const [selected, setSelected] = useState(TOOLS[0])
  const [input, setInput] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [approvalStep, setApprovalStep] = useState<'idle' | 'pending' | 'approved'>('idle')
  const [pending, setPending] = useState<any>(null)

  const run = async () => {
    if (!input.trim() || loading) return
    setLoading(true)
    setResult(null)
    setApprovalStep('pending')
    try {
      const res = await api.action(selected.id, input, env)
      setPending(res)
    } catch {
      setResult({ error: 'Backend unavailable. Start with: docker compose up --build' })
      setApprovalStep('idle')
    } finally {
      setLoading(false)
    }
  }

  const approve = () => {
    setResult(pending)
    setApprovalStep('approved')
  }

  const cancel = () => {
    setPending(null)
    setApprovalStep('idle')
  }

  return (
    <div className="flex h-full">
      {/* Tool picker */}
      <div
        className="flex-shrink-0 flex flex-col gap-1 p-3"
        style={{ width: 220, borderRight: '1px solid var(--border)', background: 'var(--bg-panel)' }}
      >
        <div style={{ color: 'var(--text-dim)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', padding: '4px 8px', marginBottom: 4 }}>
          TOOLS
        </div>
        {TOOLS.map(t => (
          <button
            key={t.id}
            className={`sidebar-item ${selected.id === t.id ? 'active' : ''}`}
            onClick={() => { setSelected(t); setResult(null); setApprovalStep('idle'); setInput('') }}
          >
            <span style={{ fontSize: 14 }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Main panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="fade-up">
            <div className="flex items-center gap-3 mb-1">
              <span style={{ fontSize: 22, color: 'var(--cyan)' }}>{selected.icon}</span>
              <h2 className="font-display font-bold" style={{ color: 'var(--text)', fontSize: 17 }}>{selected.label}</h2>
              <span className="badge badge-amber" style={{ fontSize: 10 }}>MOCK</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{selected.desc}</p>
          </div>

          <div className="nexus-card p-5 space-y-4">
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6 }}>
                Describe your issue
              </label>
              <textarea
                className="nexus-input"
                rows={3}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={`e.g., ${selected.id === 'jenkins' ? 'Build #247 failed on main branch' : selected.id === 'snowflake' ? 'User BI_ANALYST_ROLE missing SELECT on REPORTING schema' : 'Describe the issue...'}`}
                style={{ resize: 'none', fontFamily: 'inherit' }}
              />
            </div>
            <div className="flex gap-3 items-center">
              <button className="btn-primary" onClick={run} disabled={loading || !input.trim() || approvalStep === 'pending'}>
                {loading ? 'Analyzing...' : 'Run Analysis'}
              </button>
              <span className="badge badge-cyan" style={{ fontSize: 10 }}>ENV: {env.toUpperCase()}</span>
              {env === 'prod' && (
                <span className="badge badge-amber" style={{ fontSize: 10 }}>⚠ Approval Required</span>
              )}
            </div>
          </div>

          {/* Approval gate */}
          {approvalStep === 'pending' && pending && (
            <div
              className="nexus-card p-5 fade-up"
              style={{ borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.04)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span>⚠</span>
                <span className="font-display font-semibold" style={{ color: '#fbbf24', fontSize: 14 }}>
                  Human Approval Required — Review Before Proceeding
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 14 }}>
                OpsNexus has completed the analysis. No real systems have been accessed.
                Approve to view the full results, or cancel.
              </p>
              <div className="flex gap-3">
                <button className="btn-primary" onClick={approve}>Approve & View Results</button>
                <button className="btn-ghost" onClick={cancel}>Cancel</button>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="nexus-card p-5 fade-up">
              {result.error ? (
                <p style={{ color: 'var(--red)', fontSize: 13 }}>{result.error}</p>
              ) : (
                <div className="md-response">
                  <ReactMarkdown>{result.response}</ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
