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