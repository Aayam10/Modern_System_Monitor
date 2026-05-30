import re
import json
import os
from datetime import datetime

ACTIVITY_PATH = os.path.join(os.path.dirname(__file__), "..", "memory", "activity_log.json")

# Patterns for masking sensitive data before display
MASK_PATTERNS = [
    (r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", "[EMAIL MASKED]"),
    (r"(?i)(password|pwd|secret|token|api[_-]?key)\s*[=:]\s*\S+", r"\1=[MASKED]"),
    (r"(?i)AccountKey=[^;\"'\s]+", "AccountKey=[MASKED]"),
    (r"(?i)(tenant[_-]?id|client[_-]?id|subscription[_-]?id)\s*[=:]\s*[\w-]+", r"\1=[MASKED]"),
    (r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b", "[IP MASKED]"),
]

ROLES = {
    "admin": ["read", "write", "approve", "admin"],
    "engineer": ["read", "write"],
    "viewer": ["read"],
}


def mask_sensitive(text: str) -> str:
    for pattern, replacement in MASK_PATTERNS:
        text = re.sub(pattern, replacement, text)
    return text


def check_permission(user_role: str, action: str) -> bool:
    allowed = ROLES.get(user_role, ROLES["viewer"])
    return action in allowed


def audit_log(user: str, action: str, tool: str, environment: str, status: str, summary: str):
    entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "user": user,
        "action": action,
        "tool": tool,
        "environment": environment,
        "approval_status": status,
        "result_summary": mask_sensitive(summary),
    }
    logs = _load_activity()
    logs.append(entry)
    # Keep only last 200 entries
    logs = logs[-200:]
    _save_activity(logs)


def get_activity_log() -> list:
    return list(reversed(_load_activity()))


def _load_activity() -> list:
    try:
        with open(ACTIVITY_PATH, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def _save_activity(data: list):
    os.makedirs(os.path.dirname(ACTIVITY_PATH), exist_ok=True)
    with open(ACTIVITY_PATH, "w") as f:
        json.dump(data, f, indent=2)
