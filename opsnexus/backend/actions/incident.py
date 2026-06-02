"""
Incident response handler - mock/demo mode.
Generates a manager-friendly incident report draft.
"""
from datetime import datetime


def handle_incident(message: str, environment: str) -> dict:
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    response = f"""## Incident Report Draft

**Generated:** {now}
**Environment:** {environment.upper()}
**Status:** Under Investigation
**Severity:** P2 (update based on actual business impact)

---

### Impact
- Service degradation or outage detected in the **{environment.upper()}** environment
- Affected users / teams: (fill in based on monitoring alerts)
- Business impact: (fill in — e.g., delayed data pipelines, user-facing errors)
- Duration: (fill in — first alert time to current time)

### Suspected Root Cause
Based on the reported symptoms, the probable root cause is:
> (fill in after reviewing logs, metrics, and recent deployment history)

Possible contributing factors:
- Recent deployment or configuration change in the past 24 hours
- Infrastructure resource exhaustion (CPU, memory, disk, connections)
- External dependency failure (upstream API, database, message queue)
- Network or DNS resolution issue

### Actions Taken
- [ ] Incident declared and team notified at {now}
- [ ] On-call engineer assigned
- [ ] Monitoring dashboards reviewed
- [ ] Recent deployments identified and reviewed
- [ ] Relevant logs collected and preserved
- [ ] Stakeholders notified (manager, product owner)

### Next Steps
1. Continue root cause investigation with engineering team
2. Assess whether a rollback or hotfix is required
3. Prepare a go/no-go decision for any remediation actions
4. Update stakeholders every 30 minutes until resolved
5. Conduct post-incident review within 48 hours of resolution

### Escalation
If the incident is not resolved within 1 hour:
- Escalate to senior engineer and engineering manager
- Consider engaging vendor support if an external service is implicated
- Notify leadership if customer-facing impact is confirmed

---
 **All remediation actions require approval before execution.**
 *This report is a draft — update with actual findings before distributing.*"""

    return {
        "summary": f"Incident report draft generated for {environment} environment",
        "response": response,
    }
