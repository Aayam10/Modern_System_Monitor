import Logo from './Logo'

interface TitleBarProps {
  backendOnline: boolean
}

export default function TitleBar({ backendOnline }: TitleBarProps) {
  return (
    <div
      className="flex items-center justify-between px-4 select-none"
      style={{
        height: 44,
        background: 'var(--bg-panel)',
        borderBottom: '1px solid var(--border)',
        WebkitAppRegion: 'drag' as any,
      } as React.CSSProperties}
    >
      <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <Logo size={26} />
        <span className="font-display font-bold tracking-wide" style={{ color: 'var(--text)', fontSize: 15 }}>
          OpsNexus
        </span>
        <span className="badge badge-cyan" style={{ fontSize: 10 }}>v0.1.0</span>
        <span className="badge badge-amber" style={{ fontSize: 10 }}>DEMO MODE</span>
      </div>

      <div className="flex items-center gap-4" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full pulse"
            style={{ color: backendOnline ? 'var(--green)' : 'var(--red)', background: backendOnline ? 'var(--green)' : 'var(--red)' }}
          />
          <span style={{ fontSize: 11, color: backendOnline ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
            {backendOnline ? 'Backend Connected' : 'Backend Offline'}
          </span>
        </div>

        {/* Window controls */}
        <div className="flex items-center gap-2">
          {[
            { color: '#f59e0b', title: 'Minimize' },
            { color: '#10b981', title: 'Maximize' },
            { color: '#ef4444', title: 'Close' },
          ].map(btn => (
            <div
              key={btn.title}
              className="w-3 h-3 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
              style={{ background: btn.color }}
              title={btn.title}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
