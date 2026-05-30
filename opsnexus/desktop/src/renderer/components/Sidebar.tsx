import Logo from './Logo'
import type { PageId } from '../App'

const NAV: { id: PageId; icon: string; label: string }[] = [
  { id:'assistant',  icon:'◎', label:'Assistant'    },
  { id:'actions',    icon:'⬡', label:'Actions'      },
  { id:'files',      icon:'▣', label:'File Analyzer' },
  { id:'runbooks',   icon:'◇', label:'Runbooks'     },
  { id:'memory',     icon:'⬟', label:'Memory'       },
  { id:'activity',   icon:'≡', label:'Activity Log' },
  { id:'settings',   icon:'⚙', label:'Settings'     },
]

interface Props { active: PageId; onNav: (p: PageId) => void }

export default function Sidebar({ active, onNav }: Props) {
  return (
    <div
      style={{
        width: 188,
        background: 'var(--panel)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0,
        padding: '10px 8px',
      }}
    >
      <div style={{ marginBottom:10, padding:'0 4px' }}>
        <span className="sec-label">NAVIGATION</span>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:2, flex:1 }}>
        {NAV.map(n => (
          <button
            key={n.id}
            className={`nav-item ${active === n.id ? 'active' : ''}`}
            onClick={() => onNav(n.id)}
          >
            <span style={{ fontSize:13, width:18, textAlign:'center', flexShrink:0 }}>{n.icon}</span>
            <span>{n.label}</span>
          </button>
        ))}
      </div>

      {/* Bottom system info */}
      <div style={{ borderTop:'1px solid var(--border)', paddingTop:10, marginTop:6, paddingLeft:4 }}>
        <div className="sec-label" style={{ marginBottom:5 }}>SYSTEM</div>
        <div style={{ color:'var(--dim)', fontSize:11, lineHeight:1.7 }}>
          OpsNexus v0.1.0<br/>
          Demo Mode Active<br/>
          No live systems
        </div>
      </div>
    </div>
  )
}
