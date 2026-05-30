export default function SettingsPage() {
  const config = [
    { label:'App Mode',                value:'demo',                  locked:true,  note:'Change to live only after full security review' },
    { label:'Backend URL',             value:'http://localhost:8000',  locked:false, note:'Set via BACKEND_URL env variable' },
    { label:'Enable Real Integrations',value:'false',                 locked:true,  note:'Enable only after connecting approved real systems' },
    { label:'Approval Required',       value:'true',                  locked:true,  note:'Approval gate always enabled' },
    { label:'Audit Logging',           value:'true',                  locked:true,  note:'All interactions are recorded' },
    { label:'Sensitive Data Masking',  value:'true',                  locked:true,  note:'Emails, tokens, IDs masked in logs' },
    { label:'User Role',               value:'engineer',              locked:true,  note:'Future: connect to Azure AD/SSO for RBAC' },
    { label:'App Version',             value:'v0.1.0',                locked:true,  note:'' },
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
    'Key Vault / secret manager',
    'RBAC with audit logging to Log Analytics',
  ]

  const checklist = [
    'Connect company-approved authentication (Azure AD / SSO)',
    'Enable RBAC with role-based action permissions',
    'Enable real audit logging to Log Analytics',
    'Configure secret management (Key Vault)',
    'Validate read-only permissions on all integration accounts',
    'Security review with IT/InfoSec leadership',
    'Approval workflow meets change management policy',
    'Test all integrations in dev environment first',
    'Document rollback process for each integration',
  ]

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', maxWidth:900, margin:'0 auto', width:'100%' }}>
      <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:15, color:'var(--text)', marginBottom:16 }}>Settings</div>

      {/* Config */}
      <Section title="Current Configuration">
        {config.map(s => (
          <div
            key={s.label}
            style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'9px 14px', borderRadius:8, background:'var(--elevated)', border:'1px solid var(--border)', marginBottom:7,
            }}
          >
            <div>
              <div style={{ color:'var(--text)', fontSize:12.5, fontWeight:500 }}>{s.label}</div>
              {s.note && <div style={{ color:'var(--dim)', fontSize:11, marginTop:1 }}>{s.note}</div>}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{
                fontFamily:'var(--mono)', fontSize:11.5, padding:'2px 9px', borderRadius:5,
                background:'rgba(0,196,232,.07)', border:'1px solid rgba(0,196,232,.15)', color:'var(--cyan)',
              }}>{s.value}</span>
              {s.locked && <span style={{ color:'var(--dim)', fontSize:10 }}>locked</span>}
            </div>
          </div>
        ))}
      </Section>

      {/* Future integrations */}
      <Section title="Future Integration Plan">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
          {future.map(f => (
            <div key={f} style={{ display:'flex', gap:8, padding:'7px 10px', borderRadius:7, background:'var(--elevated)' }}>
              <span style={{ color:'var(--dim)', fontSize:11 }}>○</span>
              <span style={{ color:'var(--muted)', fontSize:12 }}>{f}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Production checklist */}
      <Section title="Production Readiness Checklist" accent="red">
        <p style={{ color:'var(--muted)', fontSize:12, marginBottom:10 }}>
          Complete all items before enabling real integrations:
        </p>
        {checklist.map(item => (
          <div key={item} style={{ display:'flex', gap:8, marginBottom:6 }}>
            <span style={{ color:'var(--amber)', marginTop:1 }}>□</span>
            <span style={{ color:'var(--muted)', fontSize:12 }}>{item}</span>
          </div>
        ))}
      </Section>
    </div>
  )
}

function Section({ title, children, accent }: { title:string; children:React.ReactNode; accent?:'red' }) {
  return (
    <div
      style={{
        marginBottom:16, borderRadius:10, overflow:'hidden',
        border: `1px solid ${accent==='red' ? 'rgba(232,64,64,.2)' : 'var(--border)'}`,
        background:'var(--card)',
      }}
    >
      <div style={{ padding:'8px 14px', borderBottom:'1px solid var(--border)', background:'var(--elevated)' }}>
        <span style={{
          fontSize:12, fontWeight:700, fontFamily:'var(--display)',
          color: accent==='red' ? 'var(--red)' : 'var(--text)',
        }}>{title}</span>
      </div>
      <div style={{ padding:'12px 14px' }}>{children}</div>
    </div>
  )
}
