"""
Runbook loader utility.
Loads runbook templates from local JSON store.
Future: replace with an internal knowledge base or SharePoint integration.
"""
import json
import os

RUNBOOKS_PATH = os.path.join(os.path.dirname(__file__), "..", "memory", "runbooks.json")

DEFAULT_RUNBOOKS = {
    "jenkins_build_failure": "Review console output, check agent connectivity, validate credentials, retry once.",
    "snowflake_permission_denied": "Confirm role exists, verify grants at database/schema level, get DBA approval.",
    "adf_pipeline_failed": "Check activity error in Monitor, test linked service connection, rerun after fix.",
    "kubernetes_crashloopbackoff": "Run kubectl describe and logs, identify exit code, check resource limits.",
    "tableau_extract_failed": "Check Server background tasks, validate data source credentials, rerun extract.",
    "terraform_plan_review": "Review plan output, confirm no unexpected destroy operations, get team approval.",
    "incident_response": "Declare incident, notify team, collect logs, identify root cause, draft report.",
}


def load_runbook(key: str) -> str:
    try:
        with open(RUNBOOKS_PATH, "r") as f:
            runbooks = json.load(f)
        return runbooks.get(key, DEFAULT_RUNBOOKS.get(key, "No runbook found for this topic."))
    except (FileNotFoundError, json.JSONDecodeError):
        return DEFAULT_RUNBOOKS.get(key, "No runbook found for this topic.")


def list_runbooks() -> list:
    return list(DEFAULT_RUNBOOKS.keys())
