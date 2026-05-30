"""
Mock Kubernetes adapter.
Returns realistic demo pod context for diagnostic guidance.
Replace with a real Kubernetes Python client when ENABLE_REAL_INTEGRATIONS=true.
"""
from integrations.base import BaseAdapter


class MockKubernetesAdapter(BaseAdapter):
    def get_pod_context(self) -> dict:
        return {
            "namespace": "platform-services",
            "pod_name": "api-gateway-7d9f4b6c8-xk2pv",
            "status": "CrashLoopBackOff",
            "restart_count": 8,
            "last_exit_code": 137,
            "node": "aks-nodepool1-12345678-vmss000003",
            "image": "platform/api-gateway:v1.4.2",
        }
