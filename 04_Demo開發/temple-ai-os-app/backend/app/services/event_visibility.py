from datetime import datetime, timezone

from app.schemas.common import Event

PUBLIC_EVENT_STATUSES = {"open", "published", "upcoming", "closed", "cancelled"}
REGISTRATION_OPEN_STATUSES = {"open", "published"}


def is_public_event(event: Event) -> bool:
    return event.status in PUBLIC_EVENT_STATUSES


def public_events(events: list[Event]) -> list[Event]:
    return [event for event in events if is_public_event(event)]


def public_event_key(event: Event) -> str:
    """Return a reader-facing event key without internal seed prefixes."""
    if event.event_id.startswith("evt_demo_"):
        return event.event_id.removeprefix("evt_demo_").replace("_", "-")
    return event.event_id


def resolve_public_event(repository, event_key: str) -> Event | None:
    """Resolve either a canonical event ID or its reader-facing URL key."""
    event = repository.get_event(event_key)
    if event:
        return event

    normalized = event_key.strip().replace("-", "_")
    if normalized.startswith("evt_"):
        candidates = (normalized, f"evt_demo_{normalized.removeprefix('evt_')}")
    else:
        candidates = (f"evt_{normalized}", f"evt_demo_{normalized}")
    events = repository.list_events()
    return next((item for item in events if item.event_id in candidates), None)


def is_registration_open(event: Event) -> bool:
    if not event.requires_registration or event.status not in REGISTRATION_OPEN_STATUSES:
        return False

    now = datetime.now(timezone.utc)
    if event.registration_open_at:
        open_at = _parse_control_time(event.registration_open_at)
        if open_at is None or now < open_at:
            return False
    if event.registration_close_at:
        close_at = _parse_control_time(event.registration_close_at)
        if close_at is None or now >= close_at:
            return False
    return True


def _parse_control_time(value: str) -> datetime | None:
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    return parsed.replace(tzinfo=timezone.utc) if parsed.tzinfo is None else parsed.astimezone(timezone.utc)
