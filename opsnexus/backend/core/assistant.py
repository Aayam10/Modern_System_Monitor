from core.router import route_to_tool
from core.planner import build_plan


async def handle_chat(message: str, environment: str, user: str) -> dict:
    """
    Main chat handler. Routes the user message to the appropriate tool
    based on keyword detection, then builds a structured response.
    """
    tool = route_to_tool(message)
    plan = build_plan(tool, message, environment)

    return {
        "tool": tool,
        "environment": environment,
        "summary": plan["summary"],
        "response": plan["response"],
        "approval_required": True,
        "demo_mode": True,
    }
