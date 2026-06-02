"""
Jenkins action handler - mock/demo mode.
Replace mock_jenkins integration with a real Jenkins API adapter when ready.
"""
from integrations.mock_jenkins import MockJenkinsAdapter

adapter = MockJenkinsAdapter()


def handle_jenkins(message: str, environment: str) -> dict:
    data = adapter.get_build_status()
    response = f"""## Jenkins Build Failure Analysis

**Environment:** {environment.upper()}
**Job:** {data['job_name']}
**Build #:** {data['build_number']}
**Status:** {data['status']}

---

### Probable Cause
{data['probable_cause']}

### Logs and Files to Check
- `console_output.txt` — full build log in Jenkins job history
- `test-results/` — JUnit XML reports under the workspace
- `Jenkinsfile` — verify stage conditions and environment variable references
- Agent node logs if the failure occurred before any stage

### Retry Steps
1. Review the console log for the first ERROR line
2. Check if the failing step is a dependency download (Maven/npm cache issue)
3. Verify environment variables are set in Jenkins credentials store
4. Trigger a manual retry: **Build Now** → monitor Stage View
5. If retry fails, escalate to the pipeline owner

### Escalation Note
If the issue persists after two retries, escalate to the DevOps team. Include:
- Job name and build number
- Relevant console log excerpt
- Time of failure and affected environment

### Manager Summary
A Jenkins pipeline failure was detected in the **{environment.upper()}** environment for job **{data['job_name']}**. The probable cause has been identified and troubleshooting steps have been documented. No production changes will be made without human approval.

---
 **approval required before any production execution.**
 *Demo mode — no real Jenkins commands have been executed.*"""

    return {
        "summary": f"Jenkins build failure analysis for {data['job_name']}",
        "response": response,
    }
