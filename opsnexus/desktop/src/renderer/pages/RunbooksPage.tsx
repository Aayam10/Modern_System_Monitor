import { useState } from 'react'

const RUNBOOKS = [
  {
    key:'jenkins',
    title:'Jenkins Build Failure',
    icon:'⚙',
    steps:[
      'Navigate to the failed job in Jenkins and click the build number.',
      'Open Console Output and locate the first ERROR or FAILED line.',
      'Identify whether the failure is in a dependency, test, or deploy stage.',
      'If dependency-related: check artifact repository connectivity and credentials.',
      'If test failure: review test reports under Workspace > test-results.',
      'Retry the build once via Build Now after confirming the root cause.',
      'If retry fails: escalate to DevOps team with job name, build number, and log excerpt.',
    ],
  },
  {
    key:'snowflake',
    title:'Snowflake Permission Denied',
    icon:'❄',
    steps:[
      'Confirm the role name and target database/schema.',
      'Run SHOW GRANTS TO ROLE <role_name> to review current privileges.',
      'Verify USAGE is granted at both database and schema level.',
      'Verify SELECT (or required privilege) is granted on the target tables.',
      'Draft the required GRANT statements for DBA review.',
      'Get approval — do not execute GRANT in production without written sign-off.',
      'Apply grants in dev/QA first. Confirm access works before applying to production.',
    ],
  },
  {
    key:'adf',
    title:'ADF Pipeline Failed',
    icon:'☁',
    steps:[
      'Open ADF Studio and navigate to Monitor > Pipeline Runs.',
      'Filter by pipeline name and the relevant date/time range.',
      'Identify the failed activity in the pipeline run diagram.',
      'Click the failed activity and review the Error tab.',
      'If a linked service failed: navigate to Manage > Linked Services and test the connection.',
      'If credentials expired: update linked service credentials (requires approval).',
      'Rerun the pipeline from the Monitor view after the fix is confirmed.',
    ],
  },
  {
    key:'kubernetes',
    title:'Kubernetes Pod CrashLoopBackOff',
    icon:'⎈',
    steps:[
      'Run: kubectl get pods -n <namespace> to identify affected pods.',
      'Run: kubectl describe pod <pod-name> -n <namespace> to review events and exit code.',
      'Run: kubectl logs <pod-name> -n <namespace> --previous to see the crash log.',
      'Check exit code: 137=OOMKilled, 1=app error, 0=restart loop.',
      'If OOMKilled: review resource limits in the deployment spec and increase memory.',
      'If app error: check application logs for startup failures.',
      'Escalate to platform engineering with describe output and logs before making changes.',
    ],
  },
  {
    key:'incident',
    title:'Incident Response',
    icon:'◉',
    steps:[
      'Declare the incident and notify the on-call team.',
      'Identify the severity: P1=major outage, P2=significant degradation.',
      'Create an incident record in your ticketing system.',
      'Assign an incident commander for communication coordination.',
      'Collect logs, metrics, and alerts for the relevant time window.',
      'Identify any recent deployments or configuration changes.',
      'Propose a remediation plan and get approval before executing in production.',
      'Update stakeholders every 30 minutes until resolution.',
      'Conduct a post-incident review within 48 hours of resolution.',
    ],
  },
]

export default function RunbooksPage() {
  const [active, setActive] = useState(RUNBOOKS[0])

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>
      {/* List */}
      <div style={{
        width:220, background:'var(--panel)', borderRight:'1px solid var(--border)',
        padding:'10px 8px', flexShrink:0,
        display:'flex', flexDirection:'column', gap:4,
      }}>
        <div className="sec-label" style={{ padding:'2px 4px', marginBottom:4 }}>RUNBOOKS</div>
        {RUNBOOKS.map(r => (
          <button
            key={r.key}
            className={`nav-item ${active.key===r.key ? 'active' : ''}`}
            onClick={() => setActive(r)}
          >
            <span style={{ fontSize:13 }}>{r.icon}</span>
            <span style={{ fontSize:12 }}>{r.title}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
          <span style={{ fontSize:24, color:'var(--cyan)' }}>{active.icon}</span>
          <div>
            <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:17, color:'var(--text)' }}>{active.title}</div>
            <span className="badge badge-cyan" style={{ fontSize:9, marginTop:4, display:'inline-flex' }}>STANDARD RUNBOOK</span>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {active.steps.map((step, i) => (
            <div
              key={i}
              style={{
                display:'flex', alignItems:'flex-start', gap:12,
                padding:'11px 14px', borderRadius:9,
                background:'var(--card)', border:'1px solid var(--border)',
              }}
            >
              <div style={{
                width:24, height:24, borderRadius:6, flexShrink:0,
                background:'rgba(0,196,232,.1)', border:'1px solid rgba(0,196,232,.2)',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'var(--cyan)', fontSize:11, fontWeight:700,
              }}>{i+1}</div>
              <span style={{ color:'var(--muted)', fontSize:12.5, lineHeight:1.7 }}>{step}</span>
            </div>
          ))}
        </div>

        <div style={{
          display:'flex', gap:8, alignItems:'center', marginTop:16,
          padding:'9px 14px', borderRadius:8,
          background:'rgba(240,146,14,.06)', border:'1px solid rgba(240,146,14,.2)',
          color:'var(--amber)', fontSize:12,
        }}>
          <span>⚠</span> Always get human approval before executing any step in production.
        </div>
      </div>
    </div>
  )
}
