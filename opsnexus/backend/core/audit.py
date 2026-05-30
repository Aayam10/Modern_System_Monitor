"""
Audit log service. Writes structured audit entries to activity_log.json.
This is the central audit trail for all OpsNexus interactions.

Future: replace file storage with Azure Log Analytics or a company logging endpoint.
"""
import json
import os
from datetime import datetime
from tools.masking import mask_text

ACTIVITY_PATH = os.path.join(os.path.dirname(__file__), "..", "memory", "activity_log.json")


def write_audit(user: str, action: str, tool: str, environment: str, approval_status: str, summary: str):
    entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "user": user,
        "action": action,
        "tool": tool,
        "environment": environment,
        "approval_status": approval_status,
        "result_summary": mask_text(summary),
    }
    logs = _load()
    logs.append(entry)
    _save(logs[-200:])  # keep last 200


def read_audit() -> list:
    return list(reversed(_load()))


def _load() -> list:
    try:
        with open(ACTIVITY_PATH, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def _save(data: list):
    os.makedirs(os.path.dirname(ACTIVITY_PATH), exist_ok=True)
    with open(ACTIVITY_PATH, "w") as f:
        json.dump(data, f, indent=2)
