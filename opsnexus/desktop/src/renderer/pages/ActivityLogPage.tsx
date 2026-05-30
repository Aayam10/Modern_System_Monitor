import { useState, useEffect } from 'react'
import { api } from '../api'

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    api.activity()
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = logs.filter(l =>
    !filter ||
    l.tool?.includes(filter.toLowerCase()) ||
    l.action?.includes(filter.toLowerCase()) ||
    l.user?.includes(filter.toLowerCase())
  )

  const statusColor = (s: string) => {
    if (s === 'completed') return 'var(--green)'
    if (s === 'approval_required') return 'var(--amber)'
    return 'var(--text-dim)'
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5 fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text)' }}>Activity Log</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            Audit trail of all OpsNexus interactions. Sensitive data is masked before storage.
          </p>
        </div>
        <input
          className="nexus-input"
          style={{ width: 220 }}
          placeholder="Filter by tool, action, user..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      <div className="nexus-card overflow-hidden">
        {/* Table header */}
        <div
          className="grid gap-3 px-5 py-3"
          style={{
            gridTemplateColumns: '180px 80px 100px 80px 120px 1fr',
            background: 'var(--bg-elevated)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {['Timestamp', 'User', 'Action', 'Tool', 'Status', 'Summary'].map(h => (
            <span key={h} style={{ color: 'var(--text-dim)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em' }}>
              {h.toUpperCase()}
            </span>
          ))}
        </div>

        {loading ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-dim)', fontSize: 13 }}>Loading audit log...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-dim)', fontSize: 13 }}>
            {logs.length === 0
              ? 'No activity recorded yet. Start a conversation in the Assistant tab.'
              : 'No entries match the filter.'}
          </div>
        ) : (
          filtered.map((entry, i) => (
            <div
              key={i}
              className="grid gap-3 px-5 py-3 items-center hover:bg-opacity-50"
              style={{
                gridTemplateColumns: '180px 80px 100px 80px 120px 1fr',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)',
              }}
            >
              <span className="font-mono" style={{ color: 'var(--text-dim)', fontSize: 11 }}>
                {new Date(entry.timestamp).toLocaleString()}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{entry.user}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{entry.action}</span>
              <span className="badge badge-cyan" style={{ fontSize: 10, justifySelf: 'start' }}>{entry.tool}</span>
              <span style={{ color: statusColor(entry.approval_status), fontSize: 11, fontWeight: 500 }}>
                {entry.approval_status}
              </span>
              <span style={{ color: 'var(--text-dim)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {entry.result_summary}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
