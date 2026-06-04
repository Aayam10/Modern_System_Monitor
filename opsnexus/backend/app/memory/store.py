import json
import os

_STORE_FILE = "/tmp/jarvis_memory.json"


def _load() -> list:
    if os.path.exists(_STORE_FILE):
        try:
            with open(_STORE_FILE, "r") as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data
        except Exception:
            pass
    return []


def _save(notes: list) -> None:
    try:
        with open(_STORE_FILE, "w") as f:
            json.dump(notes, f, indent=2)
    except Exception:
        pass


def add_note(note: str) -> None:
    notes = _load()
    notes.append(note)
    _save(notes)


def get_notes() -> list:
    return _load()
