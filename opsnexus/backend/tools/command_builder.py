"""
Command builder utility.
Generates safe, read-only diagnostic command strings for display purposes only.
These are never executed by the backend.
"""


def build_kubectl_commands(namespace: str, pod_name: str) -> list:
    return [
        f"kubectl get pods -n {namespace}",
        f"kubectl describe pod {pod_name} -n {namespace}",
        f"kubectl logs {pod_name} -n {namespace} --tail=100",
        f"kubectl logs {pod_name} -n {namespace} --previous --tail=100",
        f"kubectl get events -n {namespace} --sort-by='.lastTimestamp'",
    ]


def build_terraform_commands(workspace: str = "default") -> list:
    return [
        f"terraform workspace select {workspace}",
        "terraform init",
        "terraform plan -out=tfplan.binary",
        "terraform show tfplan.binary",
    ]
