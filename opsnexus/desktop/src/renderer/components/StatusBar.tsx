import type { Env } from '../App'

const ENVS: { id: Env; label: string; color: string }[] = [
  { id: 'dev', label: 'Dev', color: 'var(--green)' },
  { id: 'qa', label: 'QA', color: 'var(--cyan)' },
  { id: 'prod', label: 'Prod', color: 'var(--amber)' },
]

interface StatusBarProps {
  env: Env
  onEnvChange: (e: Env) => void
  backendOnline: boolean
}

export default function StatusBar({ env, onEnvChange, backendOnline }: StatusBarProps) {
  return (
    <div
      className="flex items-center justify-between px-5 py-2 select-none flex-shrink-0"
      style={{
        background: 'var(--bg-panel)',
        borderBottom: '1px solid var(--border)',
        height: 38,
      }}
    >
      <div className="flex items-center gap-3">
        <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>ENVIRONMENT</span>
        <div className="flex items-center gap-1">
          {ENVS.map(e => (
            <button
              key={e.id}
              onClick={() => onEnvChange(e.id)}
              className="px-3 py-0.5 rounded-md text-xs font-semibold transition-all duration-150"
              style={{
                background: env === e.id ? `${e.color}18` : 'transparent',
                border: `1px solid ${env === e.id ? e.color + '50' : 'transparent'}`,
                color: env === e.id ? e.color : 'var(--text-dim)',
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
        {env === 'prod' && (
          <div className="approval-banner py-1 px-3" style={{ fontSize: 11 }}>
            ⚠ Human Approval Required for Production Actions
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <StatusChip label="Demo Mode" on />
        <StatusChip label="Approval Mode" on />
        <StatusChip label="Audit Logging" on />
        <StatusChip label="Data Masking" on />
        <StatusChip label="Backend" on={backendOnline} offLabel="Offline" />
      </div>
    </div>
  )
}

function StatusChip({ label, on, offLabel }: { label: string; on: boolean; offLabel?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: on ? 'var(--green)' : 'var(--red)', boxShadow: on ? '0 0 5px var(--green)' : 'none' }}
      />
      <span style={{ fontSize: 11, color: on ? 'var(--text-muted)' : 'var(--red)' }}>
        {on ? label : (offLabel ?? label)}
      </span>
    </div>
  )
}
