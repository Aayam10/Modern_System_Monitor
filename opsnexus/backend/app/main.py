from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import router

app = FastAPI(
    title="OpsNexus Backend",
    version=settings.app_version,
    description="OpsNexus CloudOps AI Operations Assistant - Demo Mode",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok", "version": settings.app_version, "mode": settings.app_mode}


@app.get("/api/status")
def status():
    return {
        "status": "running",
        "app_mode": settings.app_mode,
        "app_version": settings.app_version,
        "integration_mode": "mock" if not settings.enable_real_integrations else "live",
        "approval_required": settings.approval_required,
        "audit_logging": settings.audit_log_enabled,
        "sensitive_data_masking": settings.mask_sensitive_data,
        "environment": settings.app_env,
    }
