"""
File analyzer tool - mock/demo mode.
Analyzes uploaded file metadata and content patterns.
"""
from core.security import mask_sensitive


def analyze_file(filename: str, content: bytes) -> dict:
    file_size = len(content)
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "unknown"
    text_preview = ""

    try:
        raw_text = content.decode("utf-8", errors="ignore")
        text_preview = mask_sensitive(raw_text[:500])
    except Exception:
        text_preview = "(binary file — text preview not available)"

    detected_system, summary, risks, next_steps = _classify(filename, ext, text_preview)

    return {
        "filename": filename,
        "file_type": ext.upper(),
        "file_size_bytes": file_size,
        "detected_system": detected_system,
        "summary": summary,
        "preview": text_preview,
        "risks": risks,
        "recommended_next_steps": next_steps,
        "demo_mode": True,
        "approval_required": True,
    }


def _classify(filename: str, ext: str, preview: str):
    name_lower = filename.lower()
    preview_lower = preview.lower()

    if ext in ("tf", "tfvars") or "terraform" in name_lower:
        return (
            "Terraform",
            "Terraform configuration file detected. Contains infrastructure-as-code definitions.",
            ["Ensure no hardcoded secrets or connection strings", "Review for unexpected resource deletions"],
            ["Run `terraform validate` to check syntax", "Submit for peer review before applying"],
        )
    if ext in ("yaml", "yml") and ("kind:" in preview_lower or "apiversion:" in preview_lower):
        return (
            "Kubernetes",
            "Kubernetes manifest file detected. Contains cluster resource definitions.",
            ["Verify resource limits and requests are set", "Check image tags are not 'latest' in production"],
            ["Run `kubectl apply --dry-run=client` to validate", "Review with platform engineering team"],
        )
    if "jenkinsfile" in name_lower or ext == "jenkinsfile":
        return (
            "Jenkins",
            "Jenkinsfile pipeline definition detected.",
            ["Verify credentials references use Jenkins credentials store", "Check for hardcoded environment URLs"],
            ["Lint with Jenkins pipeline linter", "Review stage conditions for production guard"],
        )
    if ext == "json" and ("pipeline" in name_lower or "adf" in name_lower):
        return (
            "Azure Data Factory",
            "ADF pipeline definition JSON detected.",
            ["Verify linked service references are environment-appropriate", "Check trigger schedules"],
            ["Validate in ADF Studio before publishing", "Confirm approver reviews before production publish"],
        )
    if ext in ("sql",) or "snowflake" in name_lower:
        return (
            "Snowflake / SQL",
            "SQL script detected. May contain DML/DDL statements.",
            ["Review for DROP or DELETE statements that could cause data loss", "Confirm target schema"],
            ["Run in dev environment first", "Get DBA approval before running in production"],
        )
    if ext == "log" or "log" in name_lower:
        return (
            "Log File",
            "Application or system log file detected.",
            ["Log may contain sensitive connection strings, IPs, or credentials — review before sharing"],
            ["Search for ERROR and FATAL lines", "Cross-reference with incident timeline"],
        )

    return (
        "General",
        f"File uploaded: {filename} ({ext.upper()}, {len(preview)} chars preview).",
        ["Review file contents for sensitive data before sharing"],
        ["Identify the target system and consult the relevant runbook"],
    )
