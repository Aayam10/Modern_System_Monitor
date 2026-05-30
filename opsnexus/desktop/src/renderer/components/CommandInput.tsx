import { useState, useRef } from 'react'

interface Props {
  onSend: (text: string) => void
  disabled?: boolean
}

const CHIPS = [
  'Jenkins build failing on main branch',
  'Snowflake SELECT permission denied',
  'ADF trigger did not fire last night',
  'Kubernetes pod CrashLoopBackOff',
  'Generate incident report for P1 outage',
  'Review Terraform plan before applying',
]

export default function CommandInput({ onSend, disabled }: Props) {
  const [val, setVal] = useState('')
  const [showChips, setShowChips] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  const submit = (text: string) => {
    const t = text.trim()
    if (!t || disabled) return
    setVal('')
    setShowChips(false)
    onSend(t)
  }

  return (
    <div
      style={{
        background: 'var(--panel)',
        borderTop: '1px solid var(--border)',
        padding: '8px 14px 10px',
        flexShrink: 0,
      }}
    >
      {/* Prompt chips (only before first message) */}
      {showChips && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
          {CHIPS.map(c => (
            <button
              key={c}
              onClick={() => submit(c)}
              style={{
                padding:'4px 10px', borderRadius:6, fontSize:11.5, cursor:'pointer',
                background:'rgba(0,196,232,.06)', border:'1px solid rgba(0,196,232,.16)',
                color:'rgba(0,196,232,.75)', fontFamily:'inherit',
                transition:'all .15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background='rgba(0,196,232,.12)'; (e.currentTarget as HTMLButtonElement).style.color='var(--cyan)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background='rgba(0,196,232,.06)'; (e.currentTarget as HTMLButtonElement).style.color='rgba(0,196,232,.75)' }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <div
          style={{
            width:30, height:30, borderRadius:7, flexShrink:0,
            background:'rgba(0,196,232,.09)', border:'1px solid rgba(0,196,232,.2)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'var(--cyan)', fontSize:13,
          }}
        >
          ◎
        </div>
        <input
          ref={inputRef}
          type="text"
          className="nx-input"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit(val)}
          placeholder="Describe a CloudOps issue or ask a question..."
          disabled={disabled}
          style={{ flex:1 }}
        />
        <button
          className="btn btn-primary"
          onClick={() => submit(val)}
          disabled={disabled || !val.trim()}
          style={{ flexShrink:0, height:34, padding:'0 16px', fontSize:12 }}
        >
          Send
        </button>
      </div>

      <div style={{ marginTop:6, display:'flex', gap:12, paddingLeft:38 }}>
        <span style={{ color:'var(--dim)', fontSize:10 }}>Enter to send</span>
        <span style={{ color:'var(--dim)', fontSize:10 }}>All actions require approval</span>
        <span style={{ color:'var(--dim)', fontSize:10 }}>Demo mode — no real systems</span>
      </div>
    </div>
  )
}
