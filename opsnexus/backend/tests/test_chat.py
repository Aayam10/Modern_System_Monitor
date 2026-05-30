import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_chat_returns_response():
    r = client.post("/api/chat", json={"message": "Jenkins build failing", "environment": "dev"})
    assert r.status_code == 200
    data = r.json()
    assert "response" in data
    assert "tool" in data
    assert data["approval_required"] is True


def test_chat_includes_demo_flag():
    r = client.post("/api/chat", json={"message": "Snowflake permission denied", "environment": "qa"})
    assert r.status_code == 200
    assert r.json()["demo_mode"] is True


def test_action_jenkins():
    r = client.post("/api/actions/jenkins", json={"input": "Build #10 failed", "environment": "dev"})
    assert r.status_code == 200
    assert "response" in r.json()


def test_action_standup():
    r = client.post("/api/actions/standup", json={"input": "Worked on ADF pipeline", "environment": "dev"})
    assert r.status_code == 200
    assert "Standup" in r.json()["response"]
