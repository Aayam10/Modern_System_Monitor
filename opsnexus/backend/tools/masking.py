"""
Sensitive data masking utility.
Used before storing or displaying logs, file analysis output, and audit entries.

Future: extend pattern list based on company data classification policy.
"""
import re

_PATTERNS = [
    (r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+",           "[EMAIL MASKED]"),
    (r"(?i)(password|pwd|secret|token|api[_-]?key)\s*[=:]\s*\S+",  r"\1=[MASKED]"),
    (r"(?i)AccountKey=[^;\"'\s]+",                                   "AccountKey=[MASKED]"),
    (r"(?i)(tenant[_-]?id|client[_-]?id|subscription[_-]?id)\s*[=:]\s*[\w-]+", r"\1=[MASKED]"),
    (r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b",                    "[IP MASKED]"),
    (r"(?i)(server|host)\s*[=:]\s*[\w.\-]+\.[\w]{2,6}",             r"\1=[SERVER MASKED]"),
]


def mask_text(text: str) -> str:
    """Apply all masking patterns to a string and return the sanitized result."""
    for pattern, replacement in _PATTERNS:
        text = re.sub(pattern, replacement, text)
    return text
