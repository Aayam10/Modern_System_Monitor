"""
Kubernetes action handler - mock/demo mode.
Replace mock_kubernetes integration with a real kubectl/API adapter when ready.
All commands shown are read-only diagnostics only.
"""
from integrations.mock_kubernetes import MockKubernetesAdapter

adapter = MockKubernetesAdapter()


def handle_kubernetes(message: str, environment: str) -> dict:
    data = adapter.get_pod_context()
    response = f"""## Kubernetes Pod Diagnostic

**Environment:** {environment.upper()}
**Namespace:** {data['namespace']}
**Pod:** {data['pod_name']}
**Status:** {data['status']}
**Restart Count:** {data['restart_count']}

---

### Read-Only Diagnostic Commands
Run these commands to gather information. No changes will be made.

```bash
# List pods in the namespace
kubectl get pods -n {data['namespace']}

# Get pod details
kubectl describe pod {data['pod_name']} -n {data['namespace']}

# View recent logs
kubectl logs {data['pod_name']} -n {data['namespace']} --tail=100

# View previous container logs (if restarted)
kubectl logs {data['pod_name']} -n {data['namespace']} --previous --tail=100

# Check events in namespace
kubectl get events -n {data['namespace']} --sort-by='.lastTimestamp'
```

### Restart Reason Checklist
Review `kubectl describe pod` output for:
- [ ] **OOMKilled** — container exceeded memory limit; review resource requests
- [ ] **CrashLoopBackOff** — application is crashing on startup; check app logs
- [ ] **ImagePullBackOff** — image not found or registry credentials expired
- [ ] **Liveness/Readiness probe failing** — service may not be starting in time
- [ ] **ConfigMap or Secret missing** — check mounted volumes in the pod spec

### Safe Read-Only Troubleshooting
- Do NOT exec into pods in production without approval
- Do NOT delete pods manually in production
- Document findings and escalate to the platform engineering team with the describe output and recent logs

 **approval required before any pod restart or configuration change.**
 *Demo mode — no real kubectl commands have been executed.*"""

    return {
        "summary": f"Kubernetes pod diagnostic for {data['pod_name']} in {data['namespace']}",
        "response": response,
    }
