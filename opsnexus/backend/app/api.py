from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
import platform
import os
import subprocess

router = APIRouter(prefix="/api", tags=["OpsNexus"])


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
    action: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


@router.get("/ping")
def ping():
    return {
        "status": "ok",
        "message": "OpsNexus API is reachable"
    }
@router.get("/docker/containers")
def docker_containers():
    return {
        "containers": [
            {
                "name": "jarvis-backend",
                "image": "jarvis-backend",
                "status": "running",
                "ports": "8000:8000"
            },
            {
                "name": "frontend-vite",
                "image": "node/vite",
                "status": "running",
                "ports": "5173:5173"
            }
        ]
    }


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    message = request.message.strip()
    lower_message = message.lower()

    if not message:
        return ChatResponse(
            reply="Please enter a command.",
            action="empty_message"
        )

    if "docker" in lower_message:
        return ChatResponse(
            reply=(
                "Docker status checked:\n\n"
                "• jarvis-backend — running on port 8000\n"
                "• frontend-vite — running on port 5173\n\n"
                "Next available commands:\n"
                "• docker ps\n"
                "• docker images\n"
                "• docker logs jarvis-backend"
            ),
            action="docker_status",
            data={
                "containers": [
                    {
                        "name": "jarvis-backend",
                        "status": "running",
                        "port": "8000"
                    },
                    {
                        "name": "frontend-vite",
                        "status": "running",
                        "port": "5173"
                    }
                ]
            }
        )

    if "jenkins" in lower_message:
        return ChatResponse(
            reply=(
                "Jenkins module ready. I can help you prepare Jenkins parameters, "
                "debug failed builds, and generate pipeline run steps."
            ),
            action="jenkins_help",
            data={
                "examples": [
                    "Check build logs",
                    "Validate Jenkins parameters",
                    "Generate deployment notes",
                    "Create standup update"
                ]
            }
        )

    if "azure" in lower_message or "adf" in lower_message:
        return ChatResponse(
            reply=(
                "Azure module ready. I can help with ADF, Key Vault, Storage, "
                "Resource Groups, pipelines, triggers, and deployment troubleshooting."
            ),
            action="azure_help",
            data={
                "examples": [
                    "Check ADF pipeline deployment",
                    "Validate Key Vault secret names",
                    "Generate Azure CLI command",
                    "Explain Azure error"
                ]
            }
        )

    if "tableau" in lower_message:
        return ChatResponse(
            reply=(
                "Tableau module ready. I can help with workbooks, datasources, "
                "virtual connections, permissions, extracts, and deployment issues."
            ),
            action="tableau_help",
            data={
                "examples": [
                    "Validate Tableau permissions",
                    "Debug workbook publish error",
                    "Generate deployment summary",
                    "Check VC extract workflow"
                ]
            }
        )

    if "status" in lower_message or "health" in lower_message:
        return ChatResponse(
            reply="System status is available. Backend is online and responding.",
            action="system_status",
            data={
                "backend": "online",
                "api": "reachable",
                "mode": "demo"
            }
        )

    if "standup" in lower_message:
        return ChatResponse(
            reply=(
                "Standup draft: Yesterday I worked on the OpsNexus/JARVIS backend "
                "and frontend connection. Today I am wiring the UI to backend APIs "
                "and turning the landing page into a working CloudOps assistant. "
                "No blockers right now."
            ),
            action="standup"
        )

    return ChatResponse(
        reply=(
            f"JARVIS received: '{message}'. "
            "I am online. Try asking about Docker, Jenkins, Azure, ADF, Tableau, "
            "status, or standup."
        ),
        action="general_reply"
    )


@router.get("/system/info")
def system_info():
    return {
        "os": platform.system(),
        "os_version": platform.version(),
        "machine": platform.machine(),
        "processor": platform.processor(),
        "python_version": platform.python_version(),
        "current_directory": os.getcwd()
    }


@router.get("/docker/help")
def docker_help():
    return {
        "commands": {
            "list_containers": "docker ps",
            "list_all_containers": "docker ps -a",
            "list_images": "docker images",
            "build_backend": "docker build -t jarvis-backend .",
            "run_backend": "docker run --rm -p 8000:8000 jarvis-backend",
            "compose_up": "docker compose up --build"
        }
    }


@router.get("/actions/standup")
def generate_standup():
    return {
        "standup": [
            "Worked on OpsNexus/JARVIS backend Docker setup.",
            "Confirmed FastAPI backend is running on port 8000.",
            "Confirmed Vite frontend is running on port 5173.",
            "Next step is connecting frontend chat UI to backend /api/chat.",
            "No blockers right now."
        ]
    }
