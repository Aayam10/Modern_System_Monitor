"""
Tool declarations for AAYAM JARVIS — matches reference main.py TOOL_DECLARATIONS.
Safe subset adapted for the FastAPI backend environment.
"""

TOOL_DECLARATIONS = [
    {
        "name": "open_app",
        "description": "Opens any application on the computer.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "app_name": {"type": "STRING", "description": "Name of the application to open"}
            },
            "required": ["app_name"],
        },
    },
    {
        "name": "web_search",
        "description": "Searches the web for any information.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "query": {"type": "STRING", "description": "Search query"},
                "mode":  {"type": "STRING", "description": "search (default) or compare"},
            },
            "required": ["query"],
        },
    },
    {
        "name": "system_status",
        "description": "Returns current system status: CPU, memory, disk, processes.",
        "parameters": {"type": "OBJECT", "properties": {}, "required": []},
    },
    {
        "name": "process_list",
        "description": "Lists running processes with PID, name, CPU, and memory usage.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "sort_by": {"type": "STRING", "description": "cpu or memory (default: cpu)"},
                "limit":   {"type": "INTEGER", "description": "Number of results (default: 20)"},
            },
            "required": [],
        },
    },
    {
        "name": "process_kill_request",
        "description": "Requests to kill a process. Always requires user approval first.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "pid":  {"type": "INTEGER", "description": "Process ID to kill"},
                "name": {"type": "STRING",  "description": "Process name to kill"},
            },
            "required": [],
        },
    },
    {
        "name": "docker_status",
        "description": "Returns Docker container status.",
        "parameters": {"type": "OBJECT", "properties": {}, "required": []},
    },
    {
        "name": "save_memory",
        "description": "Saves an important fact to long-term memory.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "category": {"type": "STRING", "description": "Category: identity | preferences | projects | notes"},
                "key":      {"type": "STRING", "description": "Short key e.g. name, favorite_food"},
                "value":    {"type": "STRING", "description": "Value to remember"},
            },
            "required": ["category", "key", "value"],
        },
    },
    {
        "name": "code_helper",
        "description": "Writes, explains, or reviews code.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "action":      {"type": "STRING", "description": "write | explain | review | fix"},
                "description": {"type": "STRING", "description": "What the code should do"},
                "language":    {"type": "STRING", "description": "Programming language (default: python)"},
                "code":        {"type": "STRING", "description": "Existing code for explain/review/fix"},
            },
            "required": ["action"],
        },
    },
    {
        "name": "shutdown_jarvis",
        "description": "Shuts down the JARVIS assistant.",
        "parameters": {"type": "OBJECT", "properties": {}, "required": []},
    },
]
