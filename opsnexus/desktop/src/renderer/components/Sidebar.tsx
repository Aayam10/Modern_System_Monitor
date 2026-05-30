import type { PageId } from '../App'
import Logo from './Logo'

const NAV: { id: PageId; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '◈' },
  { id: 'assistant', label: 'Assistant', icon: '◎' },
  { id: 'actions', label: 'Actions', icon: '⬡' },
  { id: 'files', label: 'File Analyzer', icon: '▣' },
  { id: 'runbooks', label: 'Runbooks', icon: '◇' },
  { id: 'memory', label: 'Memory', icon: '⬟' },
  { id: 'activity', label: 'Activity Log', icon: '≡' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

interface SidebarProps {
  activePage: PageId
  onNavigate: (p: PageId) => void
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <div
      className="flex flex-col flex-shrink-0"
      style={{
        width: 200,
        background: 'var(--bg-panel)',
        borderRight: '1px solid var(--border)',
        padding: '12px 10px',
      }}
    >
      <div className="flex-1 flex flex-col gap-1 mt-1">
        {NAV.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span style={{ fontSize: 14, width: 20, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div
        className="mt-4 pt-4 px-2"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div style={{ color: 'var(--text-dim)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', marginBottom: 6 }}>
          SYSTEM
        </div>
        <div style={{ color: 'var(--text-dim)', fontSize: 11, lineHeight: 1.6 }}>
          OpsNexus v0.1.0<br />
          Demo Mode Active<br />
          No real systems connected
        </div>
      </div>
    </div>
  )
}
