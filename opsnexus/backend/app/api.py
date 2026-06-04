"""
AAYAM JARVIS — FastAPI routes.
All endpoints required by the spec.
"""
from __future__ import annotations

from fastapi import APIRouter
from app.core.schemas import (
    ChatRequest, ChatResponse, LiveStartResponse, LiveStopResponse,
    StateResponse, ApprovalResponse, MemoryResponse,
)
from app.agent.router import route_message
from app.actions.system import get_system_status
from app.actions.processes import list_processes, execute_approved_kill
from app.actions.docker import check_docker
from app.memory.memory_manager import get_all_notes, load_memory
from app.memory.store import get_notes
from app.core.approvals import get_pending, clear_pending
from app.core.tool_declarations import TOOL_DECLARATIONS

router = APIRouter(prefix="/api", tags=["JARVIS"])


# ── Health / Status ───────────────────────────────────────────────────────────

@router.get("/ping")
def ping():
    return {"status": "ok", "message": "JARVIS API is reachable"}


@router.get("/status")
def status():
    from app.live.jarvis_live import get_jarvis
    j = get_jarvis()
    return {
        "status":       "running",
        "state":        j.state,
        "live_running": j.is_running,
        "is_muted":     j.is_muted,
        "is_speaking":  j.is_speaking,
        "pending":      get_pending(),
        "app_mode":     "JARVIS",
        "version":      "1.0.0",
    }


# ── Chat ──────────────────────────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    # Try to send via live session if running
    from app.live.jarvis_live import get_jarvis
    j = get_jarvis()
    if j.is_running and j.session:
        sent = j.send_text_command(req.message)
        if sent:
            return ChatResponse(reply="Sent to JARVIS live session.", action="live_forwarded")

    # Fallback to text router
    result = route_message(req.message)
    return ChatResponse(**result)


# ── Live Voice ────────────────────────────────────────────────────────────────

@router.post("/live/start", response_model=LiveStartResponse)
def live_start():
    from app.live.jarvis_live import get_jarvis
    j      = get_jarvis()
    result = j.start()
    return LiveStartResponse(ok=result["ok"], reason=result["reason"], state=j.state)


@router.post("/live/stop", response_model=LiveStopResponse)
def live_stop():
    from app.live.jarvis_live import get_jarvis
    j = get_jarvis()
    j.stop()
    return LiveStopResponse(ok=True, state=j.state)


@router.post("/mute")
def mute():
    from app.live.jarvis_live import get_jarvis
    get_jarvis().mute()
    return {"ok": True, "state": "MUTED"}


@router.post("/unmute")
def unmute():
    from app.live.jarvis_live import get_jarvis
    get_jarvis().unmute()
    return {"ok": True, "state": "LISTENING"}


@router.get("/live/state", response_model=StateResponse)
def live_state():
    from app.live.jarvis_live import get_jarvis
    j = get_jarvis()
    return StateResponse(state=j.state, is_running=j.is_running, is_muted=j.is_muted, is_speaking=j.is_speaking)


@router.get("/live/logs")
def live_logs():
    from app.live.jarvis_live import pop_logs, pop_states
    return {"logs": pop_logs(), "states": pop_states()}


# ── Approval ──────────────────────────────────────────────────────────────────

@router.post("/approve", response_model=ApprovalResponse)
def approve():
    pending = get_pending()
    if not pending:
        return ApprovalResponse(reply="No pending action.", action="no_pending")
    if pending.startswith("kill_pid_"):
        result = execute_approved_kill()
        return ApprovalResponse(**result)
    clear_pending()
    return ApprovalResponse(reply="Action approved.", action="approved")


@router.post("/cancel-approval", response_model=ApprovalResponse)
def cancel_approval():
    pending = get_pending()
    if pending:
        clear_pending()
        return ApprovalResponse(reply="Action cancelled.", action="cancelled")
    return ApprovalResponse(reply="Nothing to cancel.", action="no_pending")


# ── System ────────────────────────────────────────────────────────────────────

@router.get("/system/info")
def system_info():
    result = get_system_status()
    data = result.get("data", {})
    return {
        "os":           data.get("os", "unknown"),
        "cpu_percent":  data.get("cpu_percent", 0),
        "mem_percent":  data.get("mem_percent", 0),
        "net_mbps":     data.get("net_mbps", 0),
        "gpu":          data.get("gpu", -1),
        "tmp":          data.get("tmp", -1),
        "uptime_hm":    data.get("uptime_hm", "--:--"),
        "proc_count":   data.get("proc_count", 0),
    }


@router.get("/system/metrics")
def system_metrics():
    result = get_system_status()
    data   = result.get("data", {})
    from app.actions.processes import top_cpu, top_memory
    return {
        "cpu_percent":    data.get("cpu_percent", 0),
        "mem_percent":    data.get("mem_percent", 0),
        "net_mbps":       data.get("net_mbps", 0),
        "top_cpu_proc":   top_cpu(1)[0] if top_cpu(1) else {},
        "top_mem_proc":   top_memory(1)[0] if top_memory(1) else {},
    }


# ── Processes ─────────────────────────────────────────────────────────────────

@router.get("/processes")
def processes(sort_by: str = "cpu", limit: int = 30):
    result = list_processes(sort_by=sort_by, limit=limit)
    return result.get("data", {"processes": []})


# ── Memory ────────────────────────────────────────────────────────────────────

@router.get("/memory", response_model=MemoryResponse)
def memory():
    notes  = get_notes()
    mnotes = get_all_notes()
    all_n  = list(dict.fromkeys(mnotes + notes))  # dedup
    return MemoryResponse(notes=all_n, count=len(all_n), raw=load_memory())


# ── Tools ─────────────────────────────────────────────────────────────────────

@router.get("/tools")
def tools():
    return {"tools": TOOL_DECLARATIONS, "count": len(TOOL_DECLARATIONS)}


# ── Docker ────────────────────────────────────────────────────────────────────

@router.get("/docker/containers")
def docker_containers():
    result = check_docker()
    return result.get("data", {"containers": []})
