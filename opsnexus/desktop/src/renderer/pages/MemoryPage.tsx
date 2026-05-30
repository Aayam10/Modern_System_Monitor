import { useState, useEffect } from 'react'
import { api } from '../api'

export default function MemoryPage() {
  const [mem, setMem] = useState<Record<string,any>>({})
  const [key, setKey] = useState('')
  const [val, setVal] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.memory().then(setMem).catch(() => {})
  }, [])

  const save = async () => {
    if (!key.trim() || !val.trim()) return
    await api.updateMemory(key.trim(), val.trim()).catch(() => {})
    setMem(p => ({ ...p, [key.trim()]: val.trim() }))
    setSaved(true); setKey(''); setVal('')
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', maxWidth:860, margin:'0 auto', width:'100%' }}>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:15, color:'var(--text)', marginBottom:4 }}>Memory & Context</div>
        <div style={{ color:'var(--dim)', fontSize:12 }}>
          OpsNexus stores operational preferences in context_store.json. This context informs routing and responses.
        </div>
      </div>

      {/* Context table */}
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:10, marginBottom:14, overflow:'hidden' }}>
        <div style={{ padding:'8px 14px', borderBottom:'1px solid var(--border)', background:'var(--elevated)' }}>
          <span className="sec-label">STORED CONTEXT</span>
        </div>
        {Object.entries(mem).map(([k,v],i,arr) => (
          <div
            key={k}
            style={{
              display:'grid', gridTemplateColumns:'1fr 2fr', gap:12,
              padding:'9px 14px', alignItems:'start',
              borderBottom: i<arr.length-1 ? '1px solid rgba(22,47,71,.6)' : 'none',
            }}
          >
            <span style={{ fontFamily:'var(--mono)', color:'var(--cyan)', fontSize:11.5 }}>{k}</span>
            <span style={{ color:'var(--muted)', fontSize:12.5 }}>
              {typeof v==='object' ? JSON.stringify(v) : String(v)}
            </span>
          </div>
        ))}
      </div>

      {/* Update */}
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:10, padding:'14px' }}>
        <div className="sec-label" style={{ marginBottom:10 }}>UPDATE CONTEXT</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:10, marginBottom:10 }}>
          <input className="nx-input" value={key} onChange={e=>setKey(e.target.value)} placeholder="Key (e.g. preferred_environment)" />
          <input className="nx-input" value={val} onChange={e=>setVal(e.target.value)} placeholder="Value (e.g. Azure East US)" />
        </div>
        <button className="btn btn-primary" onClick={save} disabled={!key.trim()||!val.trim()}>
          {saved ? 'Saved!' : 'Save Context'}
        </button>
      </div>
    </div>
  )
}
