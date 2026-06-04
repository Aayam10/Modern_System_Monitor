_pending: str | None = None


def set_pending(action: str) -> None:
    global _pending
    _pending = action


def get_pending() -> str | None:
    return _pending


def clear_pending() -> None:
    global _pending
    _pending = None
