"""
Mock Snowflake adapter.
Returns realistic demo data for permission analysis.
Replace with a real Snowflake Python connector when ENABLE_REAL_INTEGRATIONS=true.
"""
from integrations.base import BaseAdapter


class MockSnowflakeAdapter(BaseAdapter):
    def get_permission_context(self) -> dict:
        return {
            "database": "ANALYTICS_DB",
            "schema": "REPORTING",
            "role": "BI_ANALYST_ROLE",
            "warehouse": "ANALYTICS_WH",
            "missing_grants": ["USAGE ON DATABASE", "SELECT ON FUTURE TABLES"],
        }
