from actions.jenkins import handle_jenkins
from actions.snowflake import handle_snowflake
from actions.adf import handle_adf
from actions.kubernetes import handle_kubernetes
from actions.tableau import handle_tableau
from actions.terraform import handle_terraform
from actions.incident import handle_incident


def build_plan(tool: str, message: str, environment: str) -> dict:
    """
    Delegates to the correct action handler based on routing result.
    Returns a standardized plan dict with summary and response.
    """
    handlers = {
        "jenkins": handle_jenkins,
        "snowflake": handle_snowflake,
        "adf": handle_adf,
        "kubernetes": handle_kubernetes,
        "tableau": handle_tableau,
        "terraform": handle_terraform,
        "incident": handle_incident,
    }

    handler = handlers.get(tool)
    if handler:
        return handler(message, environment)

    return {
        "summary": "General CloudOps guidance",
        "response": (
            "I can help you troubleshoot Jenkins, Snowflake, ADF, Kubernetes, Tableau, Terraform, "
            "or manage incident reports. Please describe your issue in more detail and I'll route it "
            "to the appropriate operations module.\n\n"
            "**Examples:**\n"
            "- 'Jenkins build is failing on the main branch'\n"
            "- 'Snowflake user is missing SELECT permissions'\n"
            "- 'ADF trigger did not fire last night'\n"
            "- 'Kubernetes pod is in CrashLoopBackOff'\n"
            "- 'Terraform plan has unexpected resource changes'\n"
            "- 'Production incident: API is returning 503'\n\n"
            "⚠️ All actions require human approval before production execution."
        ),
    }
