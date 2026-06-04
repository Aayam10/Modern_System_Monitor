import platform
import subprocess
from app.core.approvals import set_pending, get_pending


def request_open_notepad() -> dict:
    set_pending("open_notepad")
    return {
        "reply": (
            "Approval required to open Notepad.\n\n"
            "Note: This action only works when the backend is running LOCALLY on Windows.\n"
            "If the backend is running inside Docker, desktop app launching is not possible.\n\n"
            "Reply \"yes\" to confirm, or type anything else to cancel."
        ),
        "action": "approval_required",
        "requires_approval": True,
        "pending_action": "Open Notepad on Windows"
    }


def confirm_open_notepad() -> dict:
    if platform.system() != "Windows":
        return {
            "reply": (
                "Cannot launch Notepad: the backend is not running on Windows.\n\n"
                "Desktop app launching requires the FastAPI backend to run locally on Windows,\n"
                "not inside Docker or on Linux/macOS.\n\n"
                "To enable this:\n"
                "  1. Install Python locally on Windows\n"
                "  2. Run: pip install -r requirements.txt\n"
                "  3. Run: uvicorn app.main:app --host 0.0.0.0 --port 8000"
            ),
            "action": "notepad_not_windows"
        }

    try:
        subprocess.Popen(["notepad.exe"])
        return {
            "reply": "Notepad launched successfully on Windows.",
            "action": "notepad_launched"
        }
    except Exception as e:
        return {
            "reply": f"Failed to launch Notepad: {e}",
            "action": "notepad_error"
        }
