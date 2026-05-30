"""
Router: maps user message keywords to the correct action tool.
Add new keywords here when adding a new integration.
"""

KEYWORD_MAP = {
    "jenkins": "jenkins",
    "pipeline": "jenkins",
    "build fail": "jenkins",
    "ci/cd": "jenkins",
    "snowflake": "snowflake",
    "sql": "snowflake",
    "grant": "snowflake",
    "permission": "snowflake",
    "role": "snowflake",
    "adf": "adf",
    "data factory": "adf",
    "trigger": "adf",
    "pipeline run": "adf",
    "kubernetes": "kubernetes",
    "k8s": "kubernetes",
    "pod": "kubernetes",
    "node": "kubernetes",
    "deployment": "kubernetes",
    "tableau": "tableau",
    "workbook": "tableau",
    "datasource": "tableau",
    "extract": "tableau",
    "terraform": "terraform",
    "tfplan": "terraform",
    "tf plan": "terraform",
    "state": "terraform",
    "incident": "incident",
    "outage": "incident",
    "down": "incident",
    "alert": "incident",
    "p1": "incident",
    "p2": "incident",
}


def route_to_tool(message: str) -> str:
    lower = message.lower()
    for keyword, tool in KEYWORD_MAP.items():
        if keyword in lower:
            return tool
    return "assistant"
