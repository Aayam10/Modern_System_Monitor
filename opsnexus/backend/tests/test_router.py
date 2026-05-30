import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from core.router import route_to_tool
from tools.masking import mask_text


def test_route_jenkins():
    assert route_to_tool("Jenkins build failed") == "jenkins"

def test_route_snowflake():
    assert route_to_tool("Snowflake SELECT permission denied") == "snowflake"

def test_route_adf():
    assert route_to_tool("ADF trigger did not fire") == "adf"

def test_route_kubernetes():
    assert route_to_tool("Kubernetes pod is in crashloop") == "kubernetes"

def test_route_tableau():
    assert route_to_tool("Tableau workbook not loading") == "tableau"

def test_route_terraform():
    assert route_to_tool("terraform plan review") == "terraform"

def test_route_incident():
    assert route_to_tool("Production outage alert") == "incident"

def test_route_standup():
    assert route_to_tool("Generate my standup") == "standup"

def test_route_fallback():
    assert route_to_tool("How is the weather today") == "assistant"

def test_mask_email():
    result = mask_text("Contact admin@company.com for help")
    assert "admin@company.com" not in result
    assert "[EMAIL MASKED]" in result

def test_mask_secret():
    result = mask_text("token=abc123secret")
    assert "abc123secret" not in result

def test_mask_ip():
    result = mask_text("Server at 192.168.1.100")
    assert "192.168.1.100" not in result
    assert "[IP MASKED]" in result
