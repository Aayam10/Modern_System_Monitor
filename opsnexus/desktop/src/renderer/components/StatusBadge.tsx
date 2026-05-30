import type { Env } from '../App'

const ENVS: { id: Env; label: string; c: string }[] = [
  { id:'dev',  label:'Dev',  c:'var(--green)' },
  { id:'qa',   label:'QA',   c:'var(--cyan)'  },
  { id:'prod', label:'Prod', c:'var(--amber)' },
]

interface Props {
  env: Env
  onEnv: (e: Env) => void
  backendOnline: boolean
}

export default function StatusBadge({ env, onEnv, backendOnline }: Props) {
  return (
    <div
      style={{
        height: 34,
        background: 'var(--panel)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', flexShrink: 0,
      }}
    >
      {/* Env selector */}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span className="sec-label">ENV</span>
        <div style={{ display:'flex', gap:2 }}>
          {ENVS.map(e => (
            <button
              key={e.id}
              onClick={() => onEnv(e.id)}
              style={{
                padding:'2px 10px', borderRadius:5, fontSize:11, fontWeight:700, cursor:'pointer',
                background: env===e.id ? `${e.c}18` : 'transparent',
                border: `1px solid ${env===e.id ? e.c+'50' : 'transparent'}`,
                color: env===e.id ? e.c : 'var(--dim)',
                fontFamily:'inherit', transition:'all .15s',
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
        {env === 'prod' && (
          <div
            style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'2px 10px', borderRadius:5,
              background:'rgba(240,146,14,.08)', border:'1px solid rgba(240,146,14,.25)',
              color:'var(--amber)', fontSize:11, fontWeight:600,
            }}
          >
            <span>⚠</span> Production — Approval Required
          </div>
        )}
      </div>

      {/* Right info */}
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <span style={{ color:'var(--dim)', fontSize:11 }}>
          Integration: <span style={{ color:'var(--cyan)' }}>Mock / Demo</span>
        </span>
        <span style={{ color:'var(--dim)', fontSize:11 }}>
          Read-only: <span style={{ color:'var(--green)' }}>Yes</span>
        </span>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div
            className="dot"
            style={{
              background: backendOnline ? 'var(--green)' : 'var(--red)',
              animation: backendOnline ? 'pulse-dot 2s infinite' : 'none',
            }}
          />
          <span style={{ color: backendOnline ? 'var(--green)' : 'var(--red)', fontSize:11, fontWeight:600 }}>
            {backendOnline ? 'API Connected' : 'API Offline'}
          </span>
        </div>
      </div>
    </div>
  )
}
