import Logo from './Logo'

interface Props { backendOnline: boolean }

export default function TopStatusBar({ backendOnline }: Props) {
  return (
    <div
      className="flex-row"
      style={{
        height: 44,
        background: 'var(--panel)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        padding: '0 14px',
        flexShrink: 0,
        WebkitAppRegion: 'drag',
      } as React.CSSProperties}
    >
      {/* Left: logo + name */}
      <div
        className="flex-row"
        style={{ display:'flex', alignItems:'center', gap:9, WebkitAppRegion:'no-drag' } as React.CSSProperties}
      >
        <Logo size={24} />
        <span style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:14, color:'var(--text)', letterSpacing:'.02em' }}>
          Ops<span style={{ color:'var(--cyan)' }}>Nexus</span>
        </span>
        <span className="badge badge-dim" style={{ fontSize:9 }}>v0.1.0</span>
        <span className="badge badge-amber" style={{ fontSize:9 }}>DEMO</span>
      </div>

      {/* Center: status chips */}
      <div
        style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:20, WebkitAppRegion:'no-drag' } as React.CSSProperties}
      >
        <Chip label="Demo Mode"     on />
        <Chip label="Approval Gate" on />
        <Chip label="Audit Log"     on />
        <Chip label="Data Masking"  on />
        <Chip label={backendOnline ? 'Backend' : 'Backend Offline'} on={backendOnline} warn={!backendOnline} />
      </div>

      {/* Right: window controls */}
      <div style={{ display:'flex', alignItems:'center', gap:7, WebkitAppRegion:'no-drag' } as React.CSSProperties}>
        {[['#f0920e','Minimize'],['#00d97a','Maximize'],['#e84040','Close']].map(([c,t]) => (
          <div
            key={t}
            title={t}
            style={{ width:12, height:12, borderRadius:'50%', background:c, cursor:'pointer', transition:'opacity .15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = '.7'}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = '1'}
          />
        ))}
      </div>
    </div>
  )
}

function Chip({ label, on, warn }: { label:string; on:boolean; warn?:boolean }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
      <div
        className="dot"
        style={{
          background: on ? (warn ? 'var(--red)' : 'var(--green)') : 'var(--dim)',
          boxShadow: on && !warn ? '0 0 5px var(--green)' : on && warn ? '0 0 5px var(--red)' : 'none',
          animation: on && !warn ? 'pulse-dot 2s infinite' : 'none',
        }}
      />
      <span style={{ fontSize:11, color: on && !warn ? 'var(--muted)' : warn ? 'var(--red)' : 'var(--dim)', fontWeight:500 }}>
        {label}
      </span>
    </div>
  )
}
