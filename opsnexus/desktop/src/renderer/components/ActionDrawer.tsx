interface Props {
  tool: string
  icon: string
  desc: string
  active: boolean
  onClick: () => void
}

export default function ActionDrawer({ tool, icon, desc, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        display:'flex', alignItems:'flex-start', gap:10,
        padding:'10px 12px', borderRadius:9, cursor:'pointer',
        background: active ? 'rgba(0,196,232,.08)' : 'var(--card)',
        border: `1px solid ${active ? 'rgba(0,196,232,.25)' : 'var(--border)'}`,
        textAlign:'left', width:'100%', fontFamily:'inherit',
        transition:'all .15s',
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.borderColor='rgba(0,196,232,.15)' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.borderColor='var(--border)' }}
    >
      <span style={{ fontSize:16, color:'var(--cyan)', marginTop:1 }}>{icon}</span>
      <div>
        <div style={{ color:'var(--text)', fontSize:12.5, fontWeight:600 }}>{tool}</div>
        <div style={{ color:'var(--dim)', fontSize:11, lineHeight:1.5, marginTop:1 }}>{desc}</div>
      </div>
    </button>
  )
}
