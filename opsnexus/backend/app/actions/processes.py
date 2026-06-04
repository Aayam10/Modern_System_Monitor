"""
Process management with approval flow.
Uses psutil. Never kills critical system processes.
Always requires user approval before killing.
"""
from __future__ import annotations
import os
import sys
from typing import Optional

import psutil

from app.core.approvals import set_pending, get_pending, clear_pending

# Critical processes that must never be killed
_CRITICAL = {
    "system", "registry", "wininit.exe", "winlogon.exe", "csrss.exe",
    "services.exe", "lsass.exe", "smss.exe", "idle",
    "kernel_task", "launchd", "init", "systemd",
}

# The current backend process PID
_SELF_PID = os.getpid()


def list_processes(sort_by: str = "cpu", limit: int = 20) -> dict:
    try:
        procs = []
        for p in psutil.process_iter(["pid", "name", "status", "cpu_percent", "memory_percent", "username"]):
            try:
                info = p.info
                procs.append({
                    "pid":            info["pid"],
                    "name":           info["name"] or "unknown",
                    "status":         info["status"] or "unknown",
                    "cpu_percent":    round(info.get("cpu_percent") or 0.0, 1),
                    "memory_percent": round(info.get("memory_percent") or 0.0, 2),
                    "username":       (info.get("username") or "").split("\\")[-1],
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass

        key = "cpu_percent" if sort_by == "cpu" else "memory_percent"
        procs.sort(key=lambda x: x[key], reverse=True)
        procs = procs[:limit]

        lines = ["PID       NAME                    STATUS    CPU%   MEM%", "-" * 58]
        for p in procs:
            lines.append(
                f"{p['pid']:<9} {p['name'][:23]:<24} {p['status'][:9]:<10} "
                f"{p['cpu_percent']:<6} {p['memory_percent']:.1f}"
            )
        reply = "\n".join(lines)
        return {"reply": reply, "action": "process_list", "data": {"processes": procs}}

    except ImportError:
        return {"reply": "psutil not installed.", "action": "process_list_error", "data": {}}
    except Exception as e:
        return {"reply": f"Process list error: {e}", "action": "process_list_error", "data": {}}


def top_cpu(limit: int = 5) -> list[dict]:
    result = list_processes(sort_by="cpu", limit=limit)
    return result.get("data", {}).get("processes", [])


def top_memory(limit: int = 5) -> list[dict]:
    result = list_processes(sort_by="mem", limit=limit)
    return result.get("data", {}).get("processes", [])


def request_kill(pid: Optional[int] = None, name: Optional[str] = None) -> dict:
    """Request to kill a process. Always sets a pending approval — never kills immediately."""
    if not pid and not name:
        return {"reply": "Specify a PID or process name to kill.", "action": "kill_missing_args"}

    try:
        # Find matching processes
        matches = []
        for p in psutil.process_iter(["pid", "name", "status"]):
            try:
                info = p.info
                pname_lower = (info["name"] or "").lower()
                if pid and info["pid"] == pid:
                    matches.append(info)
                elif name and name.lower() in pname_lower:
                    matches.append(info)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass

        if not matches:
            what = f"PID {pid}" if pid else f"'{name}'"
            return {"reply": f"No process found matching {what}.", "action": "kill_not_found"}

        # Check for critical processes
        for m in matches:
            pname_lower = (m["name"] or "").lower()
            if pname_lower in _CRITICAL or m["pid"] == _SELF_PID:
                return {
                    "reply": (
                        f"⛔ Cannot kill {m['name']} (PID {m['pid']}) — "
                        "this is a critical or protected process."
                    ),
                    "action": "kill_blocked",
                }

        # Multiple matches → list and ask user to choose
        if len(matches) > 1:
            lines = [f"Multiple processes match '{name}':"]
            for m in matches:
                lines.append(f"  PID {m['pid']:>6}  {m['name']}")
            lines.append("\nReply with: kill pid <PID> to choose one.")
            return {"reply": "\n".join(lines), "action": "kill_ambiguous"}

        # Single match → set pending approval
        target = matches[0]
        action_key = f"kill_pid_{target['pid']}"
        set_pending(action_key)
        return {
            "reply": (
                f"⚠ Approval required to kill {target['name']} (PID {target['pid']}).\n"
                "Reply 'yes' to confirm or 'no' to cancel."
            ),
            "action":           "kill_pending",
            "requires_approval": True,
            "pending_action":    action_key,
            "data": {"pid": target["pid"], "name": target["name"]},
        }

    except ImportError:
        return {"reply": "psutil not installed.", "action": "kill_error"}
    except Exception as e:
        return {"reply": f"Kill request error: {e}", "action": "kill_error"}


def execute_approved_kill() -> dict:
    """Execute the currently pending kill after user approval."""
    pending = get_pending()
    if not pending or not pending.startswith("kill_pid_"):
        return {"reply": "No pending kill action to approve.", "action": "approve_none"}

    try:
        pid = int(pending.replace("kill_pid_", ""))
        clear_pending()
        p = psutil.Process(pid)
        name = p.name()

        # Double-check critical
        if name.lower() in _CRITICAL or pid == _SELF_PID:
            return {"reply": f"⛔ Kill of {name} (PID {pid}) blocked — critical process.", "action": "kill_blocked"}

        p.terminate()
        return {"reply": f"✓ Terminated {name} (PID {pid}).", "action": "kill_executed", "data": {"pid": pid, "name": name}}

    except psutil.NoSuchProcess:
        clear_pending()
        return {"reply": "Process no longer exists.", "action": "kill_gone"}
    except psutil.AccessDenied:
        clear_pending()
        return {"reply": "Access denied — cannot kill this process.", "action": "kill_denied"}
    except Exception as e:
        clear_pending()
        return {"reply": f"Kill failed: {e}", "action": "kill_error"}
