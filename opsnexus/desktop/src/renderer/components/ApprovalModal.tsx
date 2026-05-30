interface Props {
  tool: string
  input: string
  env: string
  riskLevel: 'low' | 'medium' | 'high'
  onApprove: () => void
  onCancel: () => void
}

const RISK_CONFIG = {
  low:    { label:'LOW',    color:'var(--green)',  bg:'rgba(0,217,122,.08)',  border:'rgba(0,217,122,.25)'  },
  medium: { label:'MEDIUM', color:'var(--cyan)',   bg:'rgba(0,196,232,.08)',  border:'rgba(0,196,232,.25)'  },
  high:   { label:'HIGH',   color:'var(--amber)',  bg:'rgba(240,146,14,.08)', border:'rgba(240,146,14,.25)' },
}

export default function ApprovalModal({ tool, input, env, riskLevel, onApprove, onCancel }: Props) {
  const risk = RISK_CONFIG[riskLevel]

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="modal-box anim-in">

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
          <div style={{
            width:36, height:36, borderRadius:9, flexShrink:0,
            background:'rgba(240,146,14,.1)', border:'1px solid rgba(240,146,14,.3)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'var(--amber)', fontSize:16,
          }}>⚠</div>
          <div>
            <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:15, color:'var(--text)' }}>
              Approval Required
            </div>
            <div style={{ color:'var(--muted)', fontSize:11.5, marginTop:1 }}>
              Review the proposed action before proceeding
            </div>
          </div>
        </div>

        {/* Proposed action details */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
          <Row label="Tool"       value={tool.toUpperCase()} accent />
          <Row label="Environment" value={env.toUpperCase()} />
          <Row label="Request"    value={input} />
          <Row label="Mode"       value="Demo / Mock — No real systems will be accessed" />
          <div style={{
            display:'flex', alignItems:'center', gap:8,
            padding:'8px 14px', borderRadius:8,
            background: risk.bg, border:`1px solid ${risk.border}`,
          }}>
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:'.06em', color:'var(--muted)' }}>
              RISK LEVEL
            </span>
            <span style={{ fontWeight:700, fontSize:12, color:risk.color }}>{risk.label}</span>
          </div>
        </div>

        {/* Approval notice */}
        <div style={{
          padding:'10px 14px', borderRadius:8, marginBottom:20,
          background:'rgba(240,146,14,.05)', border:'1px solid rgba(240,146,14,.2)',
          color:'var(--amber)', fontSize:12, lineHeight:1.65,
        }}>
          ⚠ This is a demo environment. OpsNexus will generate a mock diagnostic response.
          No commands will be executed. No real systems will be read or modified.
          Human approval is required before any production action.
        </div>

        {/* Actions */}
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={onApprove}>
            Approve Demo Output
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
      <span style={{
        fontSize:10, fontWeight:700, letterSpacing:'.08em',
        color:'var(--dim)', minWidth:90, paddingTop:2,
      }}>
        {label.toUpperCase()}
      </span>
      <span style={{ color: accent ? 'var(--cyan)' : 'var(--muted)', fontSize:12.5, lineHeight:1.55 }}>
        {value}
      </span>
    </div>
  )
}
