import platform
import os
import sys


def get_system_status() -> dict:
    try:
        import psutil
        cpu = f"{psutil.cpu_percent(interval=0.2):.1f}%"
        ram_used = psutil.virtual_memory().used // (1024 * 1024)
        ram_total = psutil.virtual_memory().total // (1024 * 1024)
        ram = f"{ram_used} MB / {ram_total} MB"
    except ImportError:
        cpu = "psutil not installed"
        ram = "psutil not installed"

    info = {
        "os": platform.system(),
        "os_version": platform.version()[:60],
        "machine": platform.machine(),
        "python_version": platform.python_version(),
        "current_directory": os.getcwd(),
        "cpu": cpu,
        "ram": ram,
    }

    reply = (
        "System Status:\n\n"
        f"  OS             : {info['os']} {info['machine']}\n"
        f"  OS Version     : {info['os_version']}\n"
        f"  Python         : {info['python_version']}\n"
        f"  CWD            : {info['current_directory']}\n"
        f"  CPU Usage      : {info['cpu']}\n"
        f"  RAM Usage      : {info['ram']}"
    )

    return {"reply": reply, "action": "system_status", "data": info}
