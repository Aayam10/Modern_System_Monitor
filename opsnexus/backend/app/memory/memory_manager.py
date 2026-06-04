"""
Memory manager for AAYAM JARVIS.
Stores personal facts in a local JSON file.
"""
from __future__ import annotations
import json
import os
from pathlib import Path
from typing import Any

_MEMORY_DIR  = Path(os.environ.get("JARVIS_DATA_DIR", "/tmp/jarvis_data"))
_MEMORY_FILE = _MEMORY_DIR / "memory.json"


def _ensure_dir() -> None:
    _MEMORY_DIR.mkdir(parents=True, exist_ok=True)


def load_memory() -> dict:
    _ensure_dir()
    if _MEMORY_FILE.exists():
        try:
            return json.loads(_MEMORY_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}


def save_memory(data: dict) -> None:
    _ensure_dir()
    _MEMORY_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def update_memory(new_data: dict) -> None:
    memory = load_memory()
    for category, items in new_data.items():
        if category not in memory:
            memory[category] = {}
        if isinstance(items, dict):
            memory[category].update(items)
        else:
            memory[category] = items
    save_memory(memory)


def format_memory_for_prompt(memory: dict) -> str:
    if not memory:
        return ""
    lines = ["[WHAT I KNOW ABOUT THE USER]"]
    for category, items in memory.items():
        if isinstance(items, dict):
            for k, v in items.items():
                lines.append(f"  {category}/{k}: {v}")
        else:
            lines.append(f"  {category}: {items}")
    return "\n".join(lines)


def get_all_notes() -> list[str]:
    """Return flat list of all memory values for display."""
    memory = load_memory()
    notes = []
    for category, items in memory.items():
        if isinstance(items, dict):
            for k, v in items.items():
                notes.append(f"[{category}] {k}: {v}")
        else:
            notes.append(f"[{category}]: {items}")
    return notes


def should_extract_memory(user_text: str, _jarvis_text: str, _api_key: str = "") -> bool:
    """Placeholder: returns True if text looks like a personal fact."""
    keywords = ["my name", "i am", "i live", "i work", "i like", "i love", "i hate",
                "remember", "i'm", "my favourite", "my favorite"]
    lower = user_text.lower()
    return any(kw in lower for kw in keywords)


def extract_memory(_user_text: str, _jarvis_text: str, _api_key: str = "") -> dict:
    """Placeholder — in production, use LLM to extract structured memory."""
    return {}
