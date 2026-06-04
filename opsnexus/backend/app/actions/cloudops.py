def jenkins_help() -> dict:
    return {
        "reply": (
            "Jenkins Help — CloudOps Module\n\n"
            "Common troubleshooting steps:\n\n"
            "  1. Build Failure\n"
            "     • Check console output for the failing stage\n"
            "     • Validate Jenkinsfile syntax: pipeline { stages { stage(...) { steps { } } } }\n"
            "     • Check credentials: Jenkins > Manage > Credentials\n\n"
            "  2. Pipeline Stuck / Timeout\n"
            "     • Check agent availability: Jenkins > Manage Nodes\n"
            "     • Review executor count and queue depth\n"
            "     • Look for lock/resource contention plugins\n\n"
            "  3. SCM / Git Errors\n"
            "     • Validate SSH keys or PAT tokens in credentials store\n"
            "     • Check branch name and webhook configuration\n\n"
            "  4. Common Commands\n"
            "     • Trigger build via CLI: java -jar jenkins-cli.jar -s http://jenkins build JOB_NAME\n"
            "     • Check logs: curl http://jenkins/job/JOB/lastBuild/consoleText\n\n"
            "Ask me about a specific error message for targeted help."
        ),
        "action": "jenkins_help"
    }


def azure_adf_help() -> dict:
    return {
        "reply": (
            "Azure / ADF Help — CloudOps Module\n\n"
            "Azure Data Factory:\n\n"
            "  1. Pipeline Failures\n"
            "     • Check activity run details in ADF Monitor\n"
            "     • Validate Linked Service connections (test connection)\n"
            "     • Check Key Vault secret name spelling — ADF is case-sensitive\n\n"
            "  2. Trigger Issues\n"
            "     • Verify trigger is active: ADF > Manage > Triggers\n"
            "     • Check time zone on schedule triggers\n"
            "     • Tumbling window: check dependency chain and concurrency\n\n"
            "  3. Deployment\n"
            "     • Export ARM template from dev, import to prod\n"
            "     • Use ADF CI/CD with Azure DevOps for parameterized deployments\n"
            "     • Global parameters must be set per-environment\n\n"
            "  4. Common CLI\n"
            "     • az datafactory pipeline run create --factory-name <name> --pipeline-name <p>\n"
            "     • az datafactory trigger start --resource-group <rg> --factory-name <f> --name <t>\n\n"
            "Ask me about a specific ADF error code or pipeline for targeted help."
        ),
        "action": "azure_adf_help"
    }


def tableau_help() -> dict:
    return {
        "reply": (
            "Tableau Help — CloudOps Module\n\n"
            "  1. Workbook Publish Errors\n"
            "     • Check datasource credentials: Edit Connection in Tableau Desktop\n"
            "     • Validate server URL and site name (case-sensitive)\n"
            "     • Ensure content URL has no spaces\n\n"
            "  2. Extract / Refresh Failures\n"
            "     • Check Extract schedule in Tableau Server / Cloud\n"
            "     • Validate Linked Service / OAuth token hasn't expired\n"
            "     • For Virtual Connections: check VConn permissions and publishing rights\n\n"
            "  3. Permissions\n"
            "     • Project permissions override workbook-level permissions\n"
            "     • Use Group-based permissions for scalability\n"
            "     • Row-Level Security: check user filter or entitlements table\n\n"
            "  4. Common REST API\n"
            "     • POST /api/{version}/auth/signin\n"
            "     • GET  /api/{version}/sites/{siteId}/workbooks\n"
            "     • POST /api/{version}/sites/{siteId}/workbooks/{id}/refresh\n\n"
            "Ask me about a specific Tableau error for targeted help."
        ),
        "action": "tableau_help"
    }


def kubernetes_help() -> dict:
    return {
        "reply": (
            "Kubernetes Help — CloudOps Module\n\n"
            "  1. Pod Issues\n"
            "     • CrashLoopBackOff: kubectl logs <pod> --previous\n"
            "     • ImagePullBackOff: check image name, tag, and registry credentials\n"
            "     • Pending: kubectl describe pod <pod> — check node resources/taints\n\n"
            "  2. Node Issues\n"
            "     • NotReady: kubectl describe node <node> — check conditions\n"
            "     • Disk pressure: kubectl top nodes — consider eviction policies\n\n"
            "  3. Networking\n"
            "     • Service not reachable: check selector labels match pod labels\n"
            "     • Ingress 502/504: check backend pod health and readiness probe\n\n"
            "  4. Common Commands\n"
            "     • kubectl get pods -n <namespace> -o wide\n"
            "     • kubectl rollout status deployment/<name>\n"
            "     • kubectl rollout undo deployment/<name>\n"
            "     • kubectl exec -it <pod> -- /bin/sh\n\n"
            "Ask me about a specific Kubernetes error for targeted help."
        ),
        "action": "kubernetes_help"
    }
