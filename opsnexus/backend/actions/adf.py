"""
Azure Data Factory action handler - mock/demo mode.
Replace mock_azure integration with a real ADF REST API adapter when ready.
"""
from integrations.mock_azure import MockAzureAdapter

adapter = MockAzureAdapter()


def handle_adf(message: str, environment: str) -> dict:
    data = adapter.get_adf_context()
    response = f"""## Azure Data Factory Pipeline Analysis

**Environment:** {environment.upper()}
**Factory:** {data['factory_name']}
**Pipeline:** {data['pipeline_name']}
**Last Run Status:** {data['last_run_status']}
**Trigger:** {data['trigger_name']}

---

### Trigger Checklist
- [ ] Confirm trigger `{data['trigger_name']}` is in **Started** state in ADF Studio
- [ ] Verify trigger schedule (timezone, recurrence, and start date)
- [ ] Check if the trigger was manually stopped or paused
- [ ] Confirm the trigger is assigned to the correct pipeline

### Failed Pipeline / Activity Checks
- [ ] Navigate to **Monitor > Pipeline Runs** in ADF Studio
- [ ] Filter by pipeline name and date range
- [ ] Identify the failed activity in the pipeline run view
- [ ] Click the failed activity and review the **Error** tab
- [ ] Check input/output JSON for the failing activity

### Log Analytics Query Placeholder
```kusto
-- Paste this into your Log Analytics workspace (future integration)
AzureDiagnostics
| where ResourceType == "FACTORIES"
| where OperationName contains "{data['pipeline_name']}"
| where TimeGenerated > ago(24h)
| project TimeGenerated, OperationName, ResultType, ResultDescription
| order by TimeGenerated desc
```

### Rerun Validation Steps
1. Resolve the root cause identified in the activity error tab
2. If a linked service connection failed, test the connection in ADF Studio
3. Re-trigger the pipeline manually in Monitor view using **Rerun**
4. Confirm the pipeline reaches the previously failing activity
5. Verify downstream dependencies after successful completion

---
 **approval required before production execution.**
 *Demo mode — no real ADF commands have been executed.*"""

    return {
        "summary": f"ADF pipeline analysis for {data['pipeline_name']}",
        "response": response,
    }
