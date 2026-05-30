"""
Base integration adapter interface.
All mock and real adapters should extend this class.

To add a new real integration:
1. Create real_<service>.py in this folder
2. Extend BaseAdapter
3. Implement the required methods
4. Swap out the mock adapter in the action handler file
"""


class BaseAdapter:
    def is_mock(self) -> bool:
        return True
