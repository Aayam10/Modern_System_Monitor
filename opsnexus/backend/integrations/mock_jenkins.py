"""
Mock Jenkins adapter.
Returns realistic demo data for Jenkins build failures.
Replace with a real Jenkins REST API client when ENABLE_REAL_INTEGRATIONS=true.
"""
from integrations.base import BaseAdapter


class MockJenkinsAdapter(BaseAdapter):
    def get_build_status(self) -> dict:
        return {
            "job_name": "platform-api-deploy",
            "build_number": 247,
            "status": "FAILURE",
            "probable_cause": (
                "The Maven dependency resolution step failed due to a timeout connecting "
                "to the internal Nexus artifact repository. This is commonly caused by "
                "network latency, a repository outage, or a missing artifact version."
            ),
            "duration_seconds": 183,
            "triggered_by": "SCM push - main branch",
            "node": "build-agent-03",
        }
