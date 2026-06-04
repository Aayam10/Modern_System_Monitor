from fastapi import APIRouter
from app.core.schemas import ChatRequest, ChatResponse
from app.agent.router import route_message
from app.actions.system import get_system_status
from app.actions.docker import check_docker
from app.memory.store import get_notes

router = APIRouter(prefix="/api", tags=["JARVIS"])


@router.get("/ping")
def ping():
    return {"status": "ok", "message": "JARVIS API is reachable"}


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    result = route_message(request.message)
    return ChatResponse(**result)


@router.get("/system/info")
def system_info():
    result = get_system_status()
    return result.get("data", {})


@router.get("/docker/containers")
def docker_containers():
    result = check_docker()
    return result.get("data", {"containers": []})


@router.get("/memory")
def memory():
    notes = get_notes()
    return {"notes": notes, "count": len(notes)}
