"""
Tool executor — routes tool calls from JarvisLive to action modules.
Mirrors _execute_tool() in reference main.py.
"""
from __future__ import annotations
import asyncio
import traceback
from typing import Any


async def execute_tool(fc: Any, loop: asyncio.AbstractEventLoop) -> Any:
    """Execute a tool function call and return a FunctionResponse."""
    from google.genai import types
    from app.core.approvals import set_pending

    name = fc.name
    args = dict(fc.args or {})

    print(f"[JARVIS] Tool: {name}  args={args}")
    result = "Done."

    try:
        if name == "save_memory":
            from app.memory.memory_manager import update_memory
            category = args.get("category", "notes")
            key      = args.get("key", "")
            value    = args.get("value", "")
            if key and value:
                update_memory({category: {key: value}})
            return types.FunctionResponse(
                id=fc.id, name=name, response={"result": "Saved.", "silent": True}
            )

        if name == "system_status":
            from app.actions.system import get_system_status
            r = await loop.run_in_executor(None, get_system_status)
            result = r.get("reply", "System status retrieved.")

        elif name == "process_list":
            from app.actions.processes import list_processes
            sort_by = args.get("sort_by", "cpu")
            limit   = int(args.get("limit", 20))
            r = await loop.run_in_executor(None, lambda: list_processes(sort_by=sort_by, limit=limit))
            result = r.get("reply", "Process list retrieved.")

        elif name == "process_kill_request":
            pid  = args.get("pid")
            pname = args.get("name", "")
            from app.actions.processes import request_kill
            r = await loop.run_in_executor(None, lambda: request_kill(pid=pid, name=pname))
            if r.get("requires_approval"):
                set_pending(r.get("pending_action", ""))
            result = r.get("reply", "Kill request submitted.")

        elif name == "docker_status":
            from app.actions.docker import check_docker
            r = await loop.run_in_executor(None, check_docker)
            result = r.get("reply", "Docker status retrieved.")

        elif name == "open_app":
            app_name = args.get("app_name", "")
            result = f"Opening {app_name}. Note: full desktop control requires local Windows backend."

        elif name == "web_search":
            query = args.get("query", "")
            result = f"Web search for '{query}' — install local backend for full web search capability."

        elif name == "code_helper":
            action = args.get("action", "write")
            desc   = args.get("description", "")
            lang   = args.get("language", "python")
            code   = args.get("code", "")
            if action == "explain" and code:
                result = f"Code explanation requires OpenRouter. Install or_client to enable this feature."
            else:
                result = f"Code helper ({action}) for {lang}: {desc}. Install local backend for full code execution."

        elif name == "shutdown_jarvis":
            result = "Shutdown acknowledged. Goodbye."

        else:
            result = f"Tool '{name}' is not yet implemented in this backend. Install local backend for full functionality."

    except Exception as e:
        result = f"Tool '{name}' failed: {str(e)[:120]}"
        traceback.print_exc()

    print(f"[JARVIS] Tool result: {name} → {str(result)[:80]}")
    return types.FunctionResponse(id=fc.id, name=name, response={"result": result})
