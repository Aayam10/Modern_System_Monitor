from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from typing import Optional
from core.assistant import handle_chat
from core.memory import get_memory, update_memory
from core.security import audit_log, get_activity_log
from tools.file_analyzer import analyze_file
from actions.jenkins import handle_jenkins
from actions.snowflake import handle_snowflake
from actions.adf import handle_adf
from actions.kubernetes import handle_kubernetes
from actions.tableau import handle_tableau
from actions.terraform import handle_terraform
from actions.incident import handle_incident

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
    audit_log(user=req.user, action="chat", tool=result.get("tool", "assistant"),
               environment=req.environment, status="completed", summary=result.get("summary", ""))
    return result


@router.post("/api/file/analyze")
async def file_analyze(file: UploadFile = File(...)):
    content = await file.read()
    result = analyze_file(file.filename or "unknown", content)
    audit_log(user="engineer", action="file_analyze", tool="file_analyzer",
               environment="n/a", status="completed", summary=result.get("summary", ""))
    return result


@router.post("/api/actions/jenkins")
async def action_jenkins(req: ActionRequest):
    result = handle_jenkins(req.input, req.environment)
    audit_log(user=req.user, action="action", tool="jenkins",
               environment=req.environment, status="approval_required", summary=result.get("summary", ""))
    return result


@router.post("/api/actions/snowflake")
async def action_snowflake(req: ActionRequest):
    result = handle_snowflake(req.input, req.environment)
    audit_log(user=req.user, action="action", tool="snowflake",
               environment=req.environment, status="approval_required", summary=result.get("summary", ""))
    return result


@router.post("/api/actions/adf")
async def action_adf(req: ActionRequest):
    result = handle_adf(req.input, req.environment)
    audit_log(user=req.user, action="action", tool="adf",
               environment=req.environment, status="approval_required", summary=result.get("summary", ""))
    return result


@router.post("/api/actions/kubernetes")
async def action_kubernetes(req: ActionRequest):
    result = handle_kubernetes(req.input, req.environment)
    audit_log(user=req.user, action="action", tool="kubernetes",
               environment=req.environment, status="approval_required", summary=result.get("summary", ""))
    return result


@router.post("/api/actions/tableau")
async def action_tableau(req: ActionRequest):
    result = handle_tableau(req.input, req.environment)
    audit_log(user=req.user, action="action", tool="tableau",
               environment=req.environment, status="approval_required", summary=result.get("summary", ""))
    return result


@router.post("/api/actions/terraform")
async def action_terraform(req: ActionRequest):
    result = handle_terraform(req.input, req.environment)
    audit_log(user=req.user, action="action", tool="terraform",
               environment=req.environment, status="approval_required", summary=result.get("summary", ""))
    return result


@router.post("/api/actions/incident")
async def action_incident(req: ActionRequest):
    result = handle_incident(req.input, req.environment)
    audit_log(user=req.user, action="action", tool="incident",
               environment=req.environment, status="completed", summary=result.get("summary", ""))
    return result


@router.get("/api/memory")
def memory_get():
    return get_memory()


@router.post("/api/memory/update")
def memory_post(update: MemoryUpdate):
    return update_memory(update.key, update.value)


@router.get("/api/activity")
def activity():
    return get_activity_log()
