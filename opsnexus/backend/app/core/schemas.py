from pydantic import BaseModel
from typing import Optional, Any, List


class ChatRequest(BaseModel):
    message: str
    file: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    action: Optional[str] = None
    data: Optional[dict[str, Any]] = None
    requires_approval: Optional[bool] = None
    pending_action: Optional[str] = None


class LiveStartResponse(BaseModel):
    ok: bool
    reason: str
    state: str


class LiveStopResponse(BaseModel):
    ok: bool
    state: str


class StateResponse(BaseModel):
    state: str
    is_running: bool
    is_muted: bool
    is_speaking: bool


class ProcessInfo(BaseModel):
    pid: int
    name: str
    status: str
    cpu_percent: float
    memory_percent: float
    username: str


class ProcessListResponse(BaseModel):
    processes: List[ProcessInfo]
    count: int


class ApprovalResponse(BaseModel):
    reply: str
    action: str
    data: Optional[dict[str, Any]] = None


class MemoryResponse(BaseModel):
    notes: List[str]
    count: int
    raw: Optional[dict] = None
