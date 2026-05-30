import json
import os

MEMORY_PATH = os.path.join(os.path.dirname(__file__), "..", "memory", "context_store.json")


def _load() -> dict:
    try:
        with open(MEMORY_PATH, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def _save(data: dict):
    os.makedirs(os.path.dirname(MEMORY_PATH), exist_ok=True)
    with open(MEMORY_PATH, "w") as f:
        json.dump(data, f, indent=2)


def get_memory() -> dict:
    return _load()


def update_memory(key: str, value: str) -> dict:
    data = _load()
    data[key] = value
    _save(data)
    return {"updated": True, "key": key, "value": value}
