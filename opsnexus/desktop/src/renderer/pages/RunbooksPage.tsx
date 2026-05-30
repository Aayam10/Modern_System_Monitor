import { useState } from 'react'

const RUNBOOKS = [
  {
    key: 'jenkins_build_failure',
    title: 'Jenkins Build Failure',
    icon: '⚙',
    steps: [
      'Open Jenkins and navigate to the failed job.',
      'Click the failing build number and open Console Output.',
      'Search for the first ERROR or FAILED line.',
      'Identify whether the failure is in a dependency step, test step, or deploy step.',
      'If dependency-related: check artifact repository connectivity.',
      'If test failure: review test reports under Workspace > test-results.',
      'Retry the build once via Build Now after confirming the root cause.',
      'If retry fails: escalate to the DevOps team with the job name, build number, and log excerpt.',
    ],
  },
  {
    key: 'snowflake_permission',
    title: 'Snowflake Permission Denied',
    icon: '❄',
    steps: [
      'Confirm the role name and database/schema in question.',
      'Run: SHOW GRANTS TO ROLE <role_name> to review current grants.',
      'Verify USAGE is granted on the target database and schema.',
      'Verify SELECT (or other required privilege) is granted on tables.',
      'Draft the required GRANT statements for DBA review.',
      'Submit for approval — do not execute GRANT in production without sign-off.',
      'After approval: apply grants in a dev/QA environment first.',
      'Confirm access is working before applying to production.',
    ],
  },
  {
    key: 'adf_pipeline_failed',
    title: 'ADF Pipeline Failed',
    icon: '☁',
    steps: [
      'Open Azure Data Factory Studio.',
      'Navigate to Monitor > Pipeline Runs.',
      'Filter by pipeline name and the relevant date/time range.',
      'Identify the failed activity in the pipeline run diagram.',
      'Click the failed activity and review the Error tab.',
      'If a linked service failed: navigate to Manage > Linked Services and test the connection.',
      'If credentials expired: update the linked service credentials (requires approval).',
      'Rerun the pipeline from the Monitor view after the fix is confirmed.',
    ],
  },
  {
    key: 'kubernetes_pod_crash',
    title: 'Kubernetes Pod CrashLoopBackOff',
    icon: '⎈',
    steps: [
      'Run: kubectl get pods -n <namespace> to identify the affected pod.',
      'Run: kubectl describe pod <pod-name> -n <namespace> to review events and last exit code.',
      'Run: kubectl logs <pod-name> -n <namespace> --previous to see the crash log.',
      'Check exit code: 137 = OOMKilled, 1 = app error, 0 = restart loop.',
      'If OOMKilled: review resource limits in the deployment spec and increase memory.',
      'If app error: check application logs for the startup error and fix the configuration.',
      'If image issue: verify the image tag and registry credentials.',
      'Escalate to platform engineering with describe output and logs before making changes.',
    ],
  },
  {
    key: 'incident_response',
    title: 'Incident Response',
    icon: '◉',
    steps: [
      'Declare the incident and notify the on-call team.',
      'Identify the severity (P1 = major outage, P2 = significant degradation).',
      'Create an incident record in your ticketing system.',
      'Assign an incident commander to coordinate communication.',
      'Collect logs, metrics, and monitoring alerts for the relevant time window.',
      'Identify any recent deployments, configuration changes, or scheduled jobs.',
      'Draft a working hypothesis for the root cause.',
      'Propose a remediation plan and get approval before executing in production.',
      'Update stakeholders every 30 minutes until resolution.',
      'After resolution: conduct a post-incident review within 48 hours.',
    ],
  },
]

export default function RunbooksPage() {
  const [selected, setSelected] = useState(RUNBOOKS[0])

  return (
    <div className="flex h-full">
      {/* Runbook list */}
      <div
        className="flex-shrink-0 p-3 flex flex-col gap-1"
        style={{ width: 220, borderRight: '1px solid var(--border)', background: 'var(--bg-panel)' }}
      >
        <div style={{ color: 'var(--text-dim)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', padding: '4px 8px', marginBottom: 4 }}>
          RUNBOOKS
        </div>
        {RUNBOOKS.map(r => (
          <button
            key={r.key}
            className={`sidebar-item ${selected.key === r.key ? 'active' : ''}`}
            onClick={() => setSelected(r)}
          >
            <span style={{ fontSize: 14 }}>{r.icon}</span>
            <span style={{ fontSize: 12 }}>{r.title}</span>
          </button>
        ))}
      </div>

      {/* Runbook content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto fade-up">
          <div className="flex items-center gap-3 mb-6">
            <span style={{ fontSize: 28, color: 'var(--cyan)' }}>{selected.icon}</span>
            <div>
              <h2 className="font-display font-bold" style={{ color: 'var(--text)', fontSize: 18 }}>{selected.title}</h2>
              <span className="badge badge-cyan" style={{ fontSize: 10, marginTop: 4 }}>STANDARD RUNBOOK</span>
            </div>
          </div>

          <div className="space-y-3">
            {selected.steps.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-bold"
                  style={{
                    background: 'rgba(0,200,240,0.1)',
                    border: '1px solid rgba(0,200,240,0.2)',
                    color: 'var(--cyan)',
                    fontSize: 12,
                  }}
                >
                  {i + 1}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.7 }}>{step}</p>
              </div>
            ))}
          </div>

          <div className="approval-banner mt-6">
            <span>⚠</span>
            <span>Always get human approval before executing steps in production environments.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
