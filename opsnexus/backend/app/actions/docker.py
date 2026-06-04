import subprocess
import shutil


def check_docker() -> dict:
    if not shutil.which("docker"):
        return {
            "reply": (
                "Docker CLI is not available in this environment.\n\n"
                "This backend is likely running inside Docker itself, where the Docker CLI\n"
                "is not installed. To use real Docker commands, run the backend locally.\n\n"
                "Mock container status:\n"
                "  • jarvis-backend   — running  :8000\n"
                "  • frontend-vite    — running  :5173"
            ),
            "action": "docker_mock",
            "data": {
                "containers": [
                    {"name": "jarvis-backend", "status": "running", "port": "8000"},
                    {"name": "frontend-vite", "status": "running", "port": "5173"},
                ]
            }
        }

    try:
        result = subprocess.run(
            ["docker", "ps", "--format", "{{.Names}}\t{{.Status}}\t{{.Ports}}"],
            capture_output=True, text=True, timeout=5
        )
        lines = result.stdout.strip().splitlines()
        if not lines:
            return {
                "reply": "Docker is available but no containers are currently running.",
                "action": "docker_empty",
                "data": {"containers": []}
            }
        containers = []
        reply_lines = ["Running containers:\n"]
        for line in lines:
            parts = line.split("\t")
            name = parts[0] if len(parts) > 0 else "unknown"
            status = parts[1] if len(parts) > 1 else "unknown"
            ports = parts[2] if len(parts) > 2 else ""
            containers.append({"name": name, "status": "running", "port": ports})
            reply_lines.append(f"  • {name} — {status}  {ports}")
        return {
            "reply": "\n".join(reply_lines),
            "action": "docker_live",
            "data": {"containers": containers}
        }
    except Exception as e:
        return {
            "reply": f"Docker check failed: {e}",
            "action": "docker_error"
        }
