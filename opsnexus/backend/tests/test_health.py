import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient
from app.main import app
from core.security import mask_sensitive
from core.router import route_to_tool

client = TestClient(app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_status():
    res = client.get("/api/status")
    assert res.status_code == 200
    data = res.json()
    assert data["integration_mode"] == "mock"
    assert data["approval_required"] is True


def test_chat_jenkins_routing():
    res = client.post("/api/chat", json={"message": "Jenkins build is failing", "environment": "dev"})
    assert res.status_code == 200
    data = res.json()
    assert data["tool"] == "jenkins"
    assert data["approval_required"] is True


def test_chat_snowflake_routing():
    res = client.post("/api/chat", json={"message": "Snowflake permission denied", "environment": "dev"})
    assert res.status_code == 200
    assert res.json()["tool"] == "snowflake"


def test_chat_generic():
    res = client.post("/api/chat", json={"message": "Hello how are you", "environment": "dev"})
    assert res.status_code == 200
    assert res.json()["tool"] == "assistant"


def test_memory_read():
    res = client.get("/api/memory")
    assert res.status_code == 200
    assert isinstance(res.json(), dict)


def test_router_keywords():
    assert route_to_tool("Jenkins build failed on main") == "jenkins"
    assert route_to_tool("Snowflake SELECT permission denied") == "snowflake"
    assert route_to_tool("ADF trigger did not fire") == "adf"
    assert route_to_tool("Kubernetes pod is crashing") == "kubernetes"
    assert route_to_tool("Tableau workbook not loading") == "tableau"
    assert route_to_tool("terraform plan review needed") == "terraform"
    assert route_to_tool("Production outage alert") == "incident"
    assert route_to_tool("What time is it") == "assistant"


def test_mask_sensitive():
    text = "password=mysecret123 and email=user@company.com"
    masked = mask_sensitive(text)
    assert "mysecret123" not in masked
    assert "user@company.com" not in masked
