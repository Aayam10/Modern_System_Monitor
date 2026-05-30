import { useState, useEffect } from 'react'
import { api } from '../api'

const SYSTEMS = [
  { name: 'Jenkins', status: 'mock', icon: '⚙' },
  { name: 'Azure / ADF', status: 'mock', icon: '☁' },
  { name: 'Snowflake', status: 'mock', icon: '❄' },
  { name: 'Kubernetes', status: 'mock', icon: '⎈' },
  { name: 'Tableau', status: 'mock', icon: '▦' },
  { name: 'Terraform', status: 'mock', icon: '◈' },
]

const TEAM_BENEFITS = [
  { icon: '⚡', title: 'Reduces Repetitive Troubleshooting', desc: 'Routes common issues to pre-built diagnostic workflows so engineers spend less time on the same problems.' },
  { icon: '◎', title: 'Standardizes Operational Steps', desc: 'Every response follows approved runbook patterns, ensuring consistent, documented resolutions.' },
  { icon: '◇', title: 'Supports Newer Engineers', desc: 'Provides step-by-step guidance, helping junior team members follow the same process as senior engineers.' },
  { icon: '▣', title: 'Creates Better Documentation', desc: 'Every interaction generates a record — building institutional knowledge over time.' },
  { icon: '⬡', title: 'Speeds Up Incident Response', desc: 'Instant report drafts, escalation templates, and action checklists reduce time to resolution.' },
  { icon: '⬟', title: 'Keeps Production Actions Approval-Based', desc: 'Nothing runs in production without human review — every action is gated.' },
]

export default function DashboardPage({ backendOnline }: { backendOnline: boolean }) {
  const [activity, setActivity] = useState<any[]>([])

  useEffect(() => {
    api.activity().then(data => setActivity(data.slice(0, 5))).catch(() => {})
  }, [])

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto fade-up">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text)' }}>
          Operations Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          OpsNexus v0.1.0 — CloudOps AI Assistant Overview
        </p>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatusCard label="Backend" value={backendOnline ? 'Online' : 'Offline'} ok={backendOnline} icon="◎" />
        <StatusCard label="Demo Mode" value="Enabled" ok={true} icon="⬡" />
        <StatusCard label="Approval Mode" value="Required" ok={true} icon="⬟" />
        <StatusCard label="Audit Logging" value="Enabled" ok={true} icon="▣" />
      </div>

      {/* Connected Systems */}
      <div className="nexus-card p-5">
        <SectionTitle>Mock Connected Systems</SectionTitle>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {SYSTEMS.map(sys => (
            <div
              key={sys.name}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            >
              <span style={{ fontSize: 16, color: 'var(--cyan)' }}>{sys.icon}</span>
              <div>
                <div style={{ color: 'var(--text)', fontSize: 13, fontWeight: 500 }}>{sys.name}</div>
                <div className="badge badge-amber" style={{ fontSize: 10, marginTop: 2 }}>MOCK</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity + Active Workflows */}
      <div className="grid grid-cols-2 gap-4">
        <div className="nexus-card p-5">
          <SectionTitle>Recent Assistant Activity</SectionTitle>
          {activity.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 12 }}>
              No activity yet. Start a conversation in the Assistant tab.
            </p>
          ) : (
            <div className="space-y-2 mt-3">
              {activity.map((a, i) => (
                <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <span className="badge badge-cyan" style={{ fontSize: 10 }}>{a.tool}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 8 }}>
                      {a.result_summary?.slice(0, 50) || 'Completed'}
                    </span>
                  </div>
                  <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>
                    {new Date(a.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="nexus-card p-5">
          <SectionTitle>Active Workflows</SectionTitle>
          <div className="space-y-2 mt-3">
            {['Approval gate — enabled', 'Sensitive data masking — active', 'Read-only mode — enforced', 'Audit trail — recording'].map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)', boxShadow: '0 0 5px var(--green)' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{w}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How OpsNexus Helps the Team */}
      <div className="nexus-card p-5">
        <SectionTitle>How OpsNexus Helps the Team</SectionTitle>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {TEAM_BENEFITS.map(b => (
            <div
              key={b.title}
              className="p-4 rounded-xl"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span style={{ color: 'var(--cyan)', fontSize: 16 }}>{b.icon}</span>
                <span className="font-display font-semibold" style={{ color: 'var(--text)', fontSize: 12 }}>{b.title}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.65 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatusCard({ label, value, ok, icon }: { label: string; value: string; ok: boolean; icon: string }) {
  return (
    <div className="nexus-card p-4 flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(0,200,240,0.08)', border: '1px solid rgba(0,200,240,0.15)', color: 'var(--cyan)', fontSize: 16 }}
      >
        {icon}
      </div>
      <div>
        <div style={{ color: 'var(--text-dim)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em' }}>{label.toUpperCase()}</div>
        <div style={{ color: ok ? 'var(--green)' : 'var(--red)', fontSize: 14, fontWeight: 600, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display font-semibold" style={{ color: 'var(--text)', fontSize: 14 }}>
      {children}
    </h2>
  )
}
