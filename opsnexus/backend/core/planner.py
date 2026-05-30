from actions.jenkins import handle_jenkins
from actions.snowflake import handle_snowflake
from actions.adf import handle_adf
from actions.kubernetes import handle_kubernetes
from actions.tableau import handle_tableau
from actions.terraform import handle_terraform
from actions.incident import handle_incident
from actions.standup import handle_standup


def build_plan(tool: str, message: str, environment: str) -> dict:
    """Delegates to the correct action handler. Add new handlers here as tools are added."""
    handlers = {
        "jenkins":    handle_jenkins,
        "snowflake":  handle_snowflake,
        "adf":        handle_adf,
        "kubernetes": handle_kubernetes,
        "tableau":    handle_tableau,
        "terraform":  handle_terraform,
        "incident":   handle_incident,
        "standup":    handle_standup,
    }

    handler = handlers.get(tool)
    if handler:
        return handler(message, environment)

    return {
        "summary": "General CloudOps guidance",
        "response": (
            "I can help you troubleshoot **Jenkins**, **Snowflake**, **ADF**, **Kubernetes**, "
            "**Tableau**, **Terraform**, generate **incident reports**, or draft a **standup update**.\n\n"
            "Describe your issue in more detail and I'll route it to the right module.\n\n"
            "**Examples:**\n"
            "- Jenkins build is failing on the main branch\n"
            "- Snowflake user is missing SELECT permissions\n"
            "- ADF trigger did not fire last night\n"
            "- Kubernetes pod is in CrashLoopBackOff\n"
            "- Terraform plan has unexpected resource changes\n"
            "- Generate a standup update\n\n"
            "> ⚠ All actions require human approval before production execution."
        ),
    }
