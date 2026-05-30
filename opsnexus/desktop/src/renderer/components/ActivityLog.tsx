import { useState, useEffect } from 'react'
import { api } from '../api'

export default function ActivityLog() {
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    const load = () => api.activity().then(d => setLogs(d.slice(0,8))).catch(()=>{})
    load()
    const id = setInterval(load, 20000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--panel)',
        flexShrink: 0,
        maxHeight: 140,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ padding:'6px 14px 4px', display:'flex', alignItems:'center', gap:7, borderBottom:'1px solid var(--border)' }}>
        <span style={{ color:'var(--cyan)', fontSize:12 }}>≡</span>
        <span className="sec-label">ACTIVITY LOG</span>
        <span className="badge badge-dim" style={{ fontSize:9 }}>{logs.length} entries</span>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'4px 0' }}>
        {logs.length === 0 ? (
          <div style={{ color:'var(--dim)', fontSize:11, padding:'6px 14px' }}>No activity yet.</div>
        ) : (
          logs.map((l,i) => (
            <div
              key={i}
              style={{
                display:'grid',
                gridTemplateColumns:'130px 70px 70px 80px 1fr',
                gap:8, padding:'4px 14px',
                borderBottom: i < logs.length-1 ? '1px solid rgba(22,47,71,.5)' : 'none',
                alignItems:'center',
              }}
            >
              <span style={{ fontFamily:'var(--mono)', color:'var(--dim)', fontSize:10 }}>
                {new Date(l.timestamp).toLocaleTimeString()}
              </span>
              <span className="badge badge-cyan" style={{ fontSize:9, justifySelf:'start' }}>{l.tool}</span>
              <span style={{ color:'var(--muted)', fontSize:11 }}>{l.action}</span>
              <span style={{ color: l.approval_status==='completed'?'var(--green)':'var(--amber)', fontSize:10, fontWeight:600 }}>
                {l.approval_status}
              </span>
              <span style={{ color:'var(--dim)', fontSize:11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {l.result_summary}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
