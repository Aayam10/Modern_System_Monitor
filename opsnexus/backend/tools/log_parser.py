"""
Log parser utility.
Extracts error patterns and key events from log text.
"""
import re


def parse_log(text: str) -> dict:
    lines = text.splitlines()
    errors = [l for l in lines if re.search(r"\b(error|fatal|exception|failed)\b", l, re.IGNORECASE)]
    warnings = [l for l in lines if re.search(r"\b(warn|warning)\b", l, re.IGNORECASE)]

    return {
        "total_lines": len(lines),
        "error_count": len(errors),
        "warning_count": len(warnings),
        "top_errors": errors[:10],
        "top_warnings": warnings[:5],
    }
