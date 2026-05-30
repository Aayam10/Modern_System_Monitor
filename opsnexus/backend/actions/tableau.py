"""
Tableau action handler - mock/demo mode.
Replace mock adapter with a real Tableau Server Client (TSC) adapter when ready.
"""


def handle_tableau(message: str, environment: str) -> dict:
    response = f"""## Tableau Deployment Analysis

**Environment:** {environment.upper()}

---

### Deployment Validation Checklist
- [ ] Confirm the workbook or data source was published to the correct project
- [ ] Verify the Tableau Server site and project path match the target environment
- [ ] Confirm the published version matches the expected file version
- [ ] Check that any embedded data source credentials are still valid

### Project and Group Permission Checks
- [ ] Confirm the target project permissions allow the expected users/groups to view
- [ ] Verify no conflicting deny permissions exist at the workbook level
- [ ] Check if the workbook has row-level security that depends on user attributes
- [ ] Confirm content owner is a valid active account

### Workbook and Data Source Checks
- [ ] Verify all data source connections are pointing to the correct database/server
- [ ] Confirm no broken field references exist in calculated fields
- [ ] Check if any filters reference fields that no longer exist

### Extract Refresh Checks
- [ ] Navigate to **Admin > Tasks > Extract Refreshes** in Tableau Server
- [ ] Confirm the extract refresh schedule is active and assigned
- [ ] Review the last refresh time and status for errors
- [ ] If refresh failed, check the Tableau Server log:
  `tabadmin status` or Server Management > Background Tasks for Extracts

### Escalation
If the deployment issue persists after the above checks, escalate to the BI platform team with:
- Workbook name, site, and project
- Deployment timestamp
- Error message from Tableau Server logs

---
⚠️ **Human approval required before any production Tableau changes.**
🔒 *Demo mode — no real Tableau Server commands have been executed.*"""

    return {
        "summary": "Tableau deployment validation and troubleshooting guidance",
        "response": response,
    }
