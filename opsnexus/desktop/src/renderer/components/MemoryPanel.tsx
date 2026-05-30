import { useState, useEffect } from 'react'
import { api } from '../api'

export default function MemoryPanel() {
  const [mem, setMem] = useState<Record<string,any>>({})

  useEffect(() => {
    api.memory().then(setMem).catch(() => {})
    const id = setInterval(() => api.memory().then(setMem).catch(() => {}), 30000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      style={{
        width: 220,
        borderLeft: '1px solid var(--border)',
        background: 'var(--panel)',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding:'10px 12px 6px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ color:'var(--cyan)', fontSize:12 }}>⬟</span>
          <span className="sec-label">MEMORY / CONTEXT</span>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'8px 10px' }}>
        {Object.entries(mem).length === 0 ? (
          <p style={{ color:'var(--dim)', fontSize:11, padding:'6px 2px' }}>
            No context loaded. Start a conversation or check backend.
          </p>
        ) : (
          Object.entries(mem).map(([k, v]) => (
            <div
              key={k}
              style={{
                marginBottom:8, padding:'7px 9px', borderRadius:7,
                background:'var(--card)', border:'1px solid var(--border)',
              }}
            >
              <div style={{ color:'var(--dim)', fontSize:10, fontWeight:700, letterSpacing:'.06em', marginBottom:2 }}>
                {k.replace(/_/g,' ').toUpperCase()}
              </div>
              <div style={{ color:'var(--muted)', fontSize:11.5, lineHeight:1.55, wordBreak:'break-word' }}>
                {typeof v === 'object' ? JSON.stringify(v) : String(v)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Active rules */}
      <div style={{ borderTop:'1px solid var(--border)', padding:'8px 10px' }}>
        <div className="sec-label" style={{ marginBottom:6 }}>ACTIVE RULES</div>
        {[
          ['Approval gate',    'on',  'var(--green)'],
          ['Read-only mode',   'on',  'var(--green)'],
          ['Demo integrations','on',  'var(--cyan)' ],
          ['Data masking',     'on',  'var(--green)'],
        ].map(([label, val, c]) => (
          <div key={label as string} style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
            <span style={{ color:'var(--dim)', fontSize:11 }}>{label}</span>
            <span style={{ color: c as string, fontSize:11, fontWeight:600 }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
