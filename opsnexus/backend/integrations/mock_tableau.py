"""
Mock Tableau integration adapter.
Returns realistic demo data for Tableau deployment and permission diagnostics.
Replace with real Tableau Server Client (TSC) when ENABLE_REAL_INTEGRATIONS=true.
"""
from integrations.base import BaseAdapter


class MockTableauAdapter(BaseAdapter):
    def get_deployment_context(self) -> dict:
        return {
            "site": "Default",
            "project": "Finance Analytics",
            "workbook": "Revenue_Dashboard_Q4",
            "owner": "analyst_team",
            "last_published": "2024-05-28 14:22 UTC",
            "extract_status": "Failed",
            "extract_schedule": "Daily 06:00 UTC",
        }
