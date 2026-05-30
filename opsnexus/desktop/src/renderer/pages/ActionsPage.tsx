import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import ActionDrawer from '../components/ActionDrawer'
import ApprovalModal from '../components/ApprovalModal'
import TerminalOutput, { type Line } from '../components/TerminalOutput'
import { api } from '../api'
import type { Env } from '../App'

const TOOLS = [
  { id:'jenkins',   icon:'⚙', label:'Jenkins',           desc:'Build failure, pipeline troubleshooting' },
  { id:'snowflake', icon:'❄', label:'Snowflake',          desc:'Permission analysis, grant SQL' },
  { id:'adf',       icon:'☁', label:'Azure Data Factory', desc:'Trigger checks, pipeline diagnostics' },
  { id:'kubernetes',icon:'⎈', label:'Kubernetes',         desc:'Pod diagnostics, crash analysis' },
  { id:'tableau',   icon:'▦', label:'Tableau',            desc:'Deployment validation, extract checks' },
  { id:'terraform', icon:'◈', label:'Terraform',          desc:'Plan review, state checks' },
  { id:'incident',  icon:'◉', label:'Incident Response',  desc:'Incident report draft, escalation' },
  { id:'standup',   icon:'◇', label:'Standup Update',     desc:'Yesterday / today / blockers format' },
]

function inferRisk(id: string): 'low'|'medium'|'high' {
  if (['terraform','incident'].includes(id)) return 'high'
  if (['kubernetes','adf','jenkins'].includes(id)) return 'medium'
  return 'low'
}

export default function ActionsPage({ env }: { env: Env }) {
  const [selected, setSelected] = useState(TOOLS[0])
  const [input, setInput] = useState('')
  const [approval, setApproval] = useState(false)
  const [pendingRes, setPendingRes] = useState<any>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [termLines, setTermLines] = useState<Line[]>([])

  const addLine = (l: Line) => setTermLines(p => [...p.slice(-30), l])

  const run = async () => {
    if (!input.trim() || loading) return
    setResult(null)
    setLoading(true)
    addLine({ type:'cmd', text:`${selected.id} "${input.slice(0,50)}..."` })
    try {
      const res = await api.action(selected.id, input, env)
      setPendingRes(res)
      setApproval(true)
      addLine({ type:'warn', text:'Waiting for approval...' })
    } catch {
      addLine({ type:'err', text:'Backend unavailable' })
    } finally {
      setLoading(false)
    }
  }

  const approve = () => {
    setResult(pendingRes)
    addLine({ type:'ok', text:`${selected.id}: output approved` })
    setApproval(false)
  }

  const cancel = () => {
    addLine({ type:'warn', text:'Action cancelled' })
    setApproval(false)
  }

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>
      {/* Tool list */}
      <div style={{
        width:220, background:'var(--panel)', borderRight:'1px solid var(--border)',
        padding:'10px 8px', flexShrink:0, overflowY:'auto',
        display:'flex', flexDirection:'column', gap:4,
      }}>
        <div className="sec-label" style={{ padding:'2px 4px', marginBottom:4 }}>ACTION TOOLS</div>
        {TOOLS.map(t => (
          <ActionDrawer
            key={t.id}
            tool={t.label} icon={t.icon} desc={t.desc}
            active={selected.id === t.id}
            onClick={() => { setSelected(t); setResult(null); setInput(''); setTermLines([]) }}
          />
        ))}
      </div>

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Tool header */}
        <div style={{
          padding:'12px 16px', borderBottom:'1px solid var(--border)',
          background:'var(--panel)', flexShrink:0,
          display:'flex', alignItems:'center', gap:12,
        }}>
          <span style={{ fontSize:22, color:'var(--cyan)' }}>{selected.icon}</span>
          <div>
            <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:15, color:'var(--text)' }}>
              {selected.label}
            </div>
            <div style={{ color:'var(--dim)', fontSize:12 }}>
              {selected.desc} — Demo mode · No real systems accessed
            </div>
          </div>
          <span className="badge badge-amber" style={{ marginLeft:'auto', fontSize:9 }}>MOCK</span>
          <span className="badge badge-cyan"  style={{ fontSize:9 }}>ENV: {env.toUpperCase()}</span>
        </div>

        {/* Input */}
        <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <label style={{ color:'var(--muted)', fontSize:11, display:'block', marginBottom:6 }}>
            DESCRIBE THE ISSUE
          </label>
          <textarea
            className="nx-input"
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`e.g., ${selected.id==='jenkins'?'Build #247 failed on main branch':selected.id==='snowflake'?'BI_ANALYST_ROLE missing SELECT on REPORTING':'Describe the issue...'}`}
            style={{ resize:'none', fontFamily:'inherit' }}
          />
          <div style={{ display:'flex', gap:8, marginTop:8, alignItems:'center' }}>
            <button className="btn btn-primary" onClick={run} disabled={loading || !input.trim() || approval}>
              {loading ? 'Analyzing...' : 'Run Analysis'}
            </button>
            {env==='prod' && <span className="badge badge-amber" style={{ fontSize:9 }}>⚠ Production — Approval Required</span>}
          </div>
        </div>

        {/* Output */}
        <div style={{ flex:1, overflowY:'auto', padding:'12px 16px' }}>
          {termLines.length > 0 && <TerminalOutput lines={termLines} />}
          {result && (
            <div
              className="anim-in"
              style={{ marginTop:14, padding:'16px', borderRadius:10, background:'var(--card)', border:'1px solid var(--border)' }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <span style={{ color:'var(--cyan)', fontSize:14 }}>{selected.icon}</span>
                <span style={{ fontFamily:'var(--display)', fontWeight:700, color:'var(--text)', fontSize:13.5 }}>
                  {selected.label} — Analysis Result
                </span>
                <span className="badge badge-green" style={{ marginLeft:'auto', fontSize:9 }}>APPROVED</span>
              </div>
              <div className="md">
                <ReactMarkdown>{result.response}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>

      {approval && (
        <ApprovalModal
          tool={selected.label} input={input} env={env}
          riskLevel={inferRisk(selected.id)}
          onApprove={approve} onCancel={cancel}
        />
      )}
    </div>
  )
}
