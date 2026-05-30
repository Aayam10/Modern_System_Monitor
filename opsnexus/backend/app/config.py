import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_mode: str = "demo"
    backend_port: int = 8000
    app_env: str = "dev"
    app_version: str = "0.1.0"
    enable_real_integrations: bool = False
    approval_required: bool = True
    audit_log_enabled: bool = True
    mask_sensitive_data: bool = True

    class Config:
        env_file = ".env"


settings = Settings()
