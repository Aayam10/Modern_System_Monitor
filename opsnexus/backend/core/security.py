"""
Security module — masking, RBAC placeholder, and legacy audit shim.

Future: connect ROLES to Azure AD / SSO for real RBAC.
"""
from tools.masking import mask_text
from core.audit import write_audit, read_audit

# Re-export for backward compat
mask_sensitive = mask_text
audit_log = write_audit
get_activity_log = read_audit

ROLES = {
    "admin":    ["read", "write", "approve", "admin"],
    "engineer": ["read", "write"],
    "viewer":   ["read"],
}


def check_permission(user_role: str, action: str) -> bool:
    allowed = ROLES.get(user_role, ROLES["viewer"])
    return action in allowed
