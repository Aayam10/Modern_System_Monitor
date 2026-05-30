import { useState, useEffect } from 'react'
import { api } from '../api'

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [filter, setFilter] = useState('')

  useEffect(() => {
    api.activity().then(setLogs).catch(() => {})
  }, [])

  const filtered = logs.filter(l =>
    !filter || [l.tool,l.action,l.user].some(x => x?.toLowerCase().includes(filter.toLowerCase()))
  )

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', padding:'0 0 0 0' }}>
      {/* Toolbar */}
      <div style={{ padding:'10px 16px', borderBottom:'1px solid var(--border)', background:'var(--panel)', flexShrink:0, display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:14, color:'var(--text)' }}>Activity Log</span>
        <input
          className="nx-input" style={{ width:220 }} value={filter}
          onChange={e=>setFilter(e.target.value)} placeholder="Filter by tool, action, user..."
        />
        <span className="badge badge-dim" style={{ fontSize:9, marginLeft:'auto' }}>{logs.length} entries · data masked</span>
      </div>

      {/* Table */}
      <div style={{ flex:1, overflowY:'auto' }}>
        <div style={{
          display:'grid',
          gridTemplateColumns:'160px 80px 90px 80px 110px 1fr',
          gap:8, padding:'7px 16px',
          background:'var(--elevated)', borderBottom:'1px solid var(--border)',
          position:'sticky', top:0, zIndex:10,
        }}>
          {['Timestamp','User','Action','Tool','Status','Summary'].map(h => (
            <span key={h} className="sec-label">{h}</span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding:'40px 16px', textAlign:'center', color:'var(--dim)', fontSize:12 }}>
            {logs.length===0 ? 'No activity yet. Start a conversation in the Assistant tab.' : 'No entries match the filter.'}
          </div>
        ) : (
          filtered.map((l,i) => (
            <div
              key={i}
              style={{
                display:'grid',
                gridTemplateColumns:'160px 80px 90px 80px 110px 1fr',
                gap:8, padding:'7px 16px', alignItems:'center',
                borderBottom:'1px solid rgba(22,47,71,.5)',
                background: i%2===0 ? 'transparent' : 'rgba(255,255,255,.012)',
              }}
            >
              <span style={{ fontFamily:'var(--mono)', color:'var(--dim)', fontSize:10.5 }}>
                {new Date(l.timestamp).toLocaleString()}
              </span>
              <span style={{ color:'var(--muted)', fontSize:11.5 }}>{l.user}</span>
              <span style={{ color:'var(--muted)', fontSize:11.5 }}>{l.action}</span>
              <span className="badge badge-cyan" style={{ fontSize:9, justifySelf:'start' }}>{l.tool}</span>
              <span style={{
                color: l.approval_status==='completed' ? 'var(--green)' : 'var(--amber)',
                fontSize:10.5, fontWeight:600,
              }}>
                {l.approval_status}
              </span>
              <span style={{ color:'var(--dim)', fontSize:11.5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {l.result_summary}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
