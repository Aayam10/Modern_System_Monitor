from app.memory.store import add_note, get_notes
from app.actions.docker import check_docker
from app.actions.system import get_system_status
from app.actions.desktop import request_open_notepad, confirm_open_notepad
from app.actions.cloudops import jenkins_help, azure_adf_help, tableau_help, kubernetes_help
from app.core.approvals import get_pending, clear_pending


def route_message(message: str) -> dict:
    lower = message.strip().lower()

    # Check if user is confirming a pending approval
    if lower in ("yes", "y", "confirm", "approve"):
        pending = get_pending()
        if pending == "open_notepad":
            clear_pending()
            return confirm_open_notepad()

    if lower == "help":
        return {
            "reply": (
                "JARVIS Command Center — Available Commands:\n\n"
                "  help                    — show this list\n"
                "  check docker            — list running containers\n"
                "  system status           — OS, Python, runtime info\n"
                "  open notepad            — launch Notepad (requires approval)\n"
                "  create standup          — generate a standup update\n"
                "  remember <note>         — save a note to memory\n"
                "  show memory             — display saved notes\n"
                "  jenkins help            — Jenkins troubleshooting guide\n"
                "  azure adf help          — Azure / ADF helper\n"
                "  tableau help            — Tableau helper\n"
                "  kubernetes help         — Kubernetes helper"
            ),
            "action": "help"
        }

    if "check docker" in lower or (lower.startswith("docker") and "help" not in lower):
        return check_docker()

    if "system status" in lower or ("status" in lower and "docker" not in lower):
        return get_system_status()

    if "open notepad" in lower or "notepad" in lower:
        return request_open_notepad()

    if "create standup" in lower or "standup" in lower:
        return {
            "reply": (
                "Standup Update — JARVIS Assistant Project\n\n"
                "Yesterday:\n"
                "  • Rebuilt the OpsNexus backend with modular agent/action architecture\n"
                "  • Replaced marketing landing page with real JARVIS command center UI\n"
                "  • Wired frontend chat to FastAPI backend via /api/chat\n\n"
                "Today:\n"
                "  • Connecting all CloudOps modules (Docker, Jenkins, Azure, K8s, Tableau)\n"
                "  • Implementing memory store and approval flows\n"
                "  • Testing end-to-end desktop Electron build\n\n"
                "Blockers: None"
            ),
            "action": "standup"
        }

    if lower.startswith("remember "):
        note = message.strip()[9:].strip()
        if note:
            add_note(note)
            return {
                "reply": f"Stored in memory: \"{note}\"",
                "action": "remember"
            }
        return {"reply": "Nothing to remember. Usage: remember <your note>", "action": "remember_empty"}

    if "show memory" in lower or lower == "memory":
        notes = get_notes()
        if not notes:
            return {"reply": "Memory is empty. Use \"remember <note>\" to save something.", "action": "memory_empty"}
        lines = "\n".join(f"  [{i+1}] {n}" for i, n in enumerate(notes))
        return {"reply": f"Memory Notes ({len(notes)}):\n\n{lines}", "action": "memory_show"}

    if "jenkins" in lower:
        return jenkins_help()

    if "azure" in lower or "adf" in lower:
        return azure_adf_help()

    if "tableau" in lower:
        return tableau_help()

    if "kubernetes" in lower or "k8s" in lower:
        return kubernetes_help()

    return {
        "reply": (
            f"JARVIS received: \"{message}\"\n\n"
            "I did not recognize that command. Type \"help\" to see all available commands."
        ),
        "action": "unknown"
    }
