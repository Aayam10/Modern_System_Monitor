"""
Command router — maps text commands to actions.
Handles all commands listed in requirements.
"""
from __future__ import annotations

from app.memory.store import add_note, get_notes
from app.memory.memory_manager import load_memory, update_memory, get_all_notes, format_memory_for_prompt
from app.actions.docker import check_docker
from app.actions.system import get_system_status
from app.actions.processes import list_processes, request_kill, execute_approved_kill
from app.actions.cloudops import jenkins_help, azure_adf_help, tableau_help, kubernetes_help
from app.core.approvals import get_pending, clear_pending, set_pending


def route_message(message: str) -> dict:
    raw   = message.strip()
    lower = raw.lower()

    # ── Approval flow ──────────────────────────────────────────────────────────
    if lower in ("yes", "y", "confirm", "approve"):
        pending = get_pending()
        if pending:
            if pending.startswith("kill_pid_"):
                return execute_approved_kill()
            if pending == "open_notepad":
                clear_pending()
                return {"reply": "Opening Notepad... (requires local Windows backend)", "action": "open_notepad"}
        return {"reply": "No pending action to approve.", "action": "no_pending"}

    if lower in ("no", "n", "cancel", "deny"):
        pending = get_pending()
        if pending:
            clear_pending()
            return {"reply": "Action cancelled.", "action": "cancelled"}
        return {"reply": "Nothing to cancel.", "action": "no_pending"}

    # ── Help ───────────────────────────────────────────────────────────────────
    if lower == "help":
        return {
            "reply": (
                "JARVIS — Available Commands\n\n"
                "  help                     show this list\n"
                "  check system             OS, CPU, memory, disk\n"
                "  check docker             Docker container status\n"
                "  list processes           show top processes by CPU\n"
                "  top cpu                  top 5 CPU processes\n"
                "  top memory               top 5 memory processes\n"
                "  kill pid <PID>           request to kill a process by PID\n"
                "  kill <name>              request to kill a process by name\n"
                "  remember <note>          save a note to memory\n"
                "  show memory              display saved memory\n"
                "  what tasks are open      show all memory notes\n"
                "  jenkins help             Jenkins troubleshooting\n"
                "  azure adf help           Azure Data Factory help\n"
                "  kubernetes help          Kubernetes help\n"
                "  tableau help             Tableau help\n"
                "  voice help               voice/mic instructions\n"
                "  screen help              screen capture info"
            ),
            "action": "help",
        }

    # ── System ─────────────────────────────────────────────────────────────────
    if any(x in lower for x in ("check system", "system status", "check check", "show system")):
        return get_system_status()

    if "what is using most cpu" in lower or "top cpu" in lower:
        result = list_processes(sort_by="cpu", limit=5)
        return {"reply": "Top 5 CPU processes:\n\n" + result["reply"], "action": "top_cpu", "data": result.get("data")}

    if "what is using most memory" in lower or "top memory" in lower:
        result = list_processes(sort_by="memory", limit=5)
        return {"reply": "Top 5 memory processes:\n\n" + result["reply"], "action": "top_memory", "data": result.get("data")}

    # ── Processes ──────────────────────────────────────────────────────────────
    if "list processes" in lower or "show processes" in lower or "show tasks" in lower:
        return list_processes(sort_by="cpu", limit=20)

    if "what tasks are open" in lower:
        result = list_processes(sort_by="cpu", limit=15)
        return {"reply": "Currently running tasks:\n\n" + result["reply"], "action": "process_list", "data": result.get("data")}

    # kill pid <PID>
    if lower.startswith("kill pid "):
        try:
            pid = int(lower.replace("kill pid ", "").strip())
            return request_kill(pid=pid)
        except ValueError:
            return {"reply": "Invalid PID. Usage: kill pid 1234", "action": "kill_invalid"}

    # kill <process name>
    if lower.startswith("kill ") and not lower.startswith("kill pid"):
        pname = raw[5:].strip()
        if pname:
            return request_kill(name=pname)

    # ── Docker ─────────────────────────────────────────────────────────────────
    if "check docker" in lower or (lower.startswith("docker") and "help" not in lower):
        return check_docker()

    # ── Memory ─────────────────────────────────────────────────────────────────
    if lower.startswith("remember "):
        note = raw[9:].strip()
        if note:
            add_note(note)
            update_memory({"notes": {"note_" + str(len(get_notes())): note}})
            return {"reply": f'Stored in memory: "{note}"', "action": "remember"}
        return {"reply": "Nothing to remember. Usage: remember <your note>", "action": "remember_empty"}

    if "show memory" in lower or lower == "memory" or "what do you know" in lower:
        notes = get_all_notes()
        simple = get_notes()
        all_notes = notes + simple
        if not all_notes:
            return {"reply": "Memory is empty. Use 'remember <note>' to save something.", "action": "memory_empty"}
        lines = "\n".join(f"  [{i+1}] {n}" for i, n in enumerate(all_notes))
        return {"reply": f"Memory ({len(all_notes)} items):\n\n{lines}", "action": "memory_show"}

    # ── CloudOps ───────────────────────────────────────────────────────────────
    if "jenkins" in lower:
        return jenkins_help()
    if "azure" in lower or "adf" in lower:
        return azure_adf_help()
    if "tableau" in lower:
        return tableau_help()
    if "kubernetes" in lower or "k8s" in lower:
        return kubernetes_help()

    # ── Voice help ─────────────────────────────────────────────────────────────
    if "voice help" in lower or "mic help" in lower:
        return {
            "reply": (
                "Voice / Microphone Help\n\n"
                "Live voice requires:\n"
                "  1. A valid Gemini API key in config/api_keys.json\n"
                "  2. sounddevice installed: pip install sounddevice\n"
                "  3. google-genai installed: pip install google-genai\n"
                "  4. Backend running locally on Windows (not Docker)\n\n"
                "Click 'Start Live Voice' in the interface to begin.\n"
                "Use F4 or the Mute button to mute/unmute the microphone."
            ),
            "action": "voice_help",
        }

    # ── Screen help ────────────────────────────────────────────────────────────
    if "screen help" in lower:
        return {
            "reply": (
                "Screen / Vision Help\n\n"
                "Screen capture requires the local Windows backend with:\n"
                "  - Pillow: pip install Pillow\n"
                "  - mss: pip install mss\n\n"
                "Once installed, JARVIS can capture and analyze your screen."
            ),
            "action": "screen_help",
        }

    # ── Standup ────────────────────────────────────────────────────────────────
    if "create standup" in lower or "standup" in lower:
        return {
            "reply": (
                "Standup Update — AAYAM JARVIS\n\n"
                "Yesterday:\n"
                "  • Built live voice engine with Gemini Live API\n"
                "  • Implemented process management with approval flow\n"
                "  • Connected React frontend to FastAPI backend\n\n"
                "Today:\n"
                "  • Testing end-to-end voice flow\n"
                "  • Connecting all CloudOps modules\n"
                "  • Implementing memory extraction\n\n"
                "Blockers: None"
            ),
            "action": "standup",
        }

    # ── Default ────────────────────────────────────────────────────────────────
    return {
        "reply": (
            f'JARVIS received: "{message}"\n\n'
            "Command not recognized. Type 'help' to see available commands."
        ),
        "action": "unknown",
    }
