from pydantic import BaseModel
from typing import Optional, Any


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
    action: Optional[str] = None
    data: Optional[dict[str, Any]] = None
    requires_approval: Optional[bool] = None
    pending_action: Optional[str] = None
