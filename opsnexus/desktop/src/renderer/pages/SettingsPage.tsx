export default function SettingsPage() {
  const settings = [
    { label: 'App Mode', value: 'demo', editable: false, note: 'Change to live only after full security review' },
    { label: 'Backend URL', value: 'http://localhost:8000', editable: true, note: 'URL of the OpsNexus backend API' },
    { label: 'Enable Real Integrations', value: 'false', editable: false, note: 'Set to true only after connecting approved real systems' },
    { label: 'Approval Required', value: 'true', editable: false, note: 'Human approval gate — always enabled in current version' },
    { label: 'Audit Logging', value: 'true', editable: false, note: 'Activity log is always enabled' },
    { label: 'Sensitive Data Masking', value: 'true', editable: false, note: 'Emails, tokens, IDs, and secrets are masked' },
    { label: 'User Role', value: 'engineer', editable: false, note: 'Future: connect to Azure AD / SSO for RBAC' },
    { label: 'App Version', value: 'v0.1.0', editable: false, note: '' },
  ]

  const future = [
    'Azure AD / SSO authentication',
    'Real Jenkins API integration',
    'Azure Monitor and Log Analytics',
    'Snowflake Python connector',
    'Tableau Server Client (TSC)',
    'Azure Data Factory REST API',
    'Kubernetes Python client',
    'Terraform plan output parser',
    'Company-approved LLM gateway',
    'Key Vault or secret manager integration',
    'RBAC with audit logging to Log Analytics',
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 fade-up">
      <div>
        <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text)' }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          OpsNexus configuration. Most settings are controlled via backend .env file.
        </p>
      </div>

      <div className="nexus-card p-5">
        <h2 className="font-display font-semibold mb-4" style={{ color: 'var(--text)', fontSize: 14 }}>Current Configuration</h2>
        <div className="space-y-3">
          {settings.map(s => (
            <div
              key={s.label}
              className="flex items-center justify-between py-3 px-4 rounded-xl"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            >
              <div>
                <div style={{ color: 'var(--text)', fontSize: 13, fontWeight: 500 }}>{s.label}</div>
                {s.note && <div style={{ color: 'var(--text-dim)', fontSize: 11, marginTop: 2 }}>{s.note}</div>}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="font-mono px-3 py-1 rounded-lg"
                  style={{ background: 'rgba(0,200,240,0.07)', border: '1px solid rgba(0,200,240,0.15)', color: 'var(--cyan)', fontSize: 12 }}
                >
                  {s.value}
                </span>
                {!s.editable && (
                  <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>locked</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="nexus-card p-5">
        <h2 className="font-display font-semibold mb-2" style={{ color: 'var(--text)', fontSize: 14 }}>Future Integration Plan</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 14 }}>
          The following integrations are planned. Each requires security review and company approval before enabling.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {future.map(f => (
            <div key={f} className="flex items-center gap-2 py-2 px-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
              <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>○</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="nexus-card p-5" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
        <h2 className="font-display font-semibold mb-3" style={{ color: 'var(--red)', fontSize: 14 }}>
          Production Readiness Checklist
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 12 }}>
          Complete these steps before enabling real integrations:
        </p>
        <div className="space-y-2">
          {[
            'Connect company-approved authentication (Azure AD / SSO)',
            'Enable RBAC with role-based action permissions',
            'Enable real audit logging to Log Analytics',
            'Configure secret management (Key Vault or equivalent)',
            'Validate read-only permissions on all integration accounts',
            'Security review with IT/InfoSec leadership',
            'Confirm approval workflow meets change management policy',
            'Test all integrations in dev environment first',
            'Document rollback process for each integration',
          ].map(item => (
            <div key={item} className="flex items-start gap-2">
              <span style={{ color: 'var(--amber)', marginTop: 1 }}>□</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
