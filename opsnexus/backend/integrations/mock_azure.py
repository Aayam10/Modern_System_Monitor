"""
Mock Azure adapter (ADF, Azure Monitor, etc.).
Returns realistic demo data for ADF pipeline diagnostics.
Replace with a real Azure SDK client when ENABLE_REAL_INTEGRATIONS=true.

Future: also use for Azure Monitor / Log Analytics integration.
"""
from integrations.base import BaseAdapter


class MockAzureAdapter(BaseAdapter):
    def get_adf_context(self) -> dict:
        return {
            "factory_name": "adf-platform-eastus",
            "pipeline_name": "pl_ingest_salesforce_daily",
            "trigger_name": "tr_daily_midnight_utc",
            "last_run_status": "Failed",
            "failed_activity": "CopyActivity_SalesforceToBlob",
            "error_code": "2200",
            "error_message": "Linked service connection test failed — credentials may have expired.",
            "subscription": "[SUBSCRIPTION MASKED]",
            "resource_group": "rg-data-platform-prod",
        }
