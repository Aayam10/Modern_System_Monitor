import platform
import os
import sys
import time


def get_system_status() -> dict:
    metrics = _get_metrics()

    info = {
        "os": platform.system(),
        "os_version": platform.version()[:60],
        "machine": platform.machine(),
        "python_version": platform.python_version(),
        "current_directory": os.getcwd(),
        **metrics,
    }

    reply = (
        "System Status:\n\n"
        f"  OS             : {info['os']} {info['machine']}\n"
        f"  OS Version     : {info['os_version']}\n"
        f"  Python         : {info['python_version']}\n"
        f"  CWD            : {info['current_directory']}\n"
        f"  CPU Usage      : {info.get('cpu_str', 'N/A')}\n"
        f"  RAM Usage      : {info.get('mem_str', 'N/A')}"
    )

    return {"reply": reply, "action": "system_status", "data": info}


def _get_metrics() -> dict:
    result = {}
    try:
        import psutil

        cpu = psutil.cpu_percent(interval=0.2)
        mem = psutil.virtual_memory()
        net_io = psutil.net_io_counters()

        result["cpu_percent"] = round(cpu, 1)
        result["mem_percent"] = round(mem.percent, 1)
        result["cpu_str"] = f"{cpu:.1f}%"
        result["mem_str"] = f"{mem.used // (1024*1024)} MB / {mem.total // (1024*1024)} MB"

        # Net speed (rough estimate using a short sleep)
        import time
        time.sleep(0.3)
        net_io2 = psutil.net_io_counters()
        sent = (net_io2.bytes_sent - net_io.bytes_sent) / 0.3
        recv = (net_io2.bytes_recv - net_io.bytes_recv) / 0.3
        result["net_mbps"] = round((sent + recv) / (1024 * 1024), 3)

        try:
            boot_t = psutil.boot_time()
            elapsed = time.time() - boot_t
            h = int(elapsed // 3600)
            m = int((elapsed % 3600) // 60)
            result["uptime_hm"] = f"{h:02d}:{m:02d}"
        except Exception:
            result["uptime_hm"] = "--:--"

        try:
            result["proc_count"] = len(psutil.pids())
        except Exception:
            result["proc_count"] = 0

        # GPU via nvidia-smi
        try:
            import subprocess
            r = subprocess.run(
                ["nvidia-smi", "--query-gpu=utilization.gpu", "--format=csv,noheader,nounits"],
                capture_output=True, text=True, timeout=2
            )
            if r.returncode == 0:
                vals = [float(v.strip()) for v in r.stdout.strip().split("\n") if v.strip()]
                result["gpu"] = round(sum(vals) / len(vals), 1) if vals else -1.0
        except Exception:
            result["gpu"] = -1.0

        # Temperature
        try:
            temps = psutil.sensors_temperatures()
            for name in ["coretemp", "k10temp", "cpu_thermal", "acpitz", "cpu-thermal"]:
                if name in temps and temps[name]:
                    result["tmp"] = round(temps[name][0].current, 1)
                    break
            if "tmp" not in result:
                for entries in temps.values():
                    if entries:
                        result["tmp"] = round(entries[0].current, 1)
                        break
        except Exception:
            result["tmp"] = -1.0

        if "tmp" not in result:
            result["tmp"] = -1.0
        if "gpu" not in result:
            result["gpu"] = -1.0

    except ImportError:
        result = {
            "cpu_percent": 0, "mem_percent": 0, "net_mbps": 0,
            "gpu": -1.0, "tmp": -1.0,
            "cpu_str": "psutil not installed",
            "mem_str": "psutil not installed",
            "uptime_hm": "--:--",
            "proc_count": 0,
        }

    return result
