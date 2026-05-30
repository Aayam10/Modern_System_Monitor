from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from typing import Optional
from core.assistant import handle_chat
from core.memory import get_memory, update_memory
from core.audit import write_audit, read_audit
from tools.file_analyzer import analyze_file
from actions.jenkins import handle_jenkins
from actions.snowflake import handle_snowflake
from actions.adf import handle_adf
from actions.kubernetes import handle_kubernetes
from actions.tableau import handle_tableau
from actions.terraform import handle_terraform
from actions.incident import handle_incident
from actions.standup import handle_standup

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    environment: Optional[str] = "dev"
    user: Optional[str] = "engineer"


class ActionRequest(BaseModel):
    input: str
    environment: Optional[str] = "dev"
    user: Optional[str] = "engineer"


class MemoryUpdate(BaseModel):
    key: str
    value: str


@router.post("/api/chat")
async def chat(req: ChatRequest):
    result = await handle_chat(req.message, req.environment, req.user)
    write_audit(user=req.user, action="chat", tool=result.get("tool", "assistant"),
                environment=req.environment, approval_status="completed",
                summary=result.get("summary", ""))
    return result


@router.post("/api/file/analyze")
async def file_analyze(file: UploadFile = File(...)):
    content = await file.read()
    result = analyze_file(file.filename or "unknown", content)
    write_audit(user="engineer", action="file_analyze", tool="file_analyzer",
                environment="n/a", approval_status="completed",
                summary=result.get("summary", ""))
    return result


def _action_route(handler, tool: str, req: ActionRequest):
    result = handler(req.input, req.environment)
    write_audit(user=req.user, action="action", tool=tool,
                environment=req.environment, approval_status="approval_required",
                summary=result.get("summary", ""))
    return result


@router.post("/api/actions/jenkins")
async def action_jenkins(req: ActionRequest):
    return _action_route(handle_jenkins, "jenkins", req)

@router.post("/api/actions/snowflake")
async def action_snowflake(req: ActionRequest):
    return _action_route(handle_snowflake, "snowflake", req)

@router.post("/api/actions/adf")
async def action_adf(req: ActionRequest):
    return _action_route(handle_adf, "adf", req)

@router.post("/api/actions/kubernetes")
async def action_kubernetes(req: ActionRequest):
    return _action_route(handle_kubernetes, "kubernetes", req)

@router.post("/api/actions/tableau")
async def action_tableau(req: ActionRequest):
    return _action_route(handle_tableau, "tableau", req)

@router.post("/api/actions/terraform")
async def action_terraform(req: ActionRequest):
    return _action_route(handle_terraform, "terraform", req)

@router.post("/api/actions/incident")
async def action_incident(req: ActionRequest):
    return _action_route(handle_incident, "incident", req)

@router.post("/api/actions/standup")
async def action_standup(req: ActionRequest):
    return _action_route(handle_standup, "standup", req)


@router.get("/api/memory")
def memory_get():
    return get_memory()

@router.post("/api/memory/update")
def memory_post(update: MemoryUpdate):
    return update_memory(update.key, update.value)

@router.get("/api/activity")
def activity():
    return read_audit()
