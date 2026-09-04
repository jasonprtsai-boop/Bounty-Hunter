from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "backend"
sys.path.insert(0, str(BACKEND))

from app.db.supabase import get_repository  # noqa: E402
from app.services.flex_templates import (  # noqa: E402
    events_carousel,
    fortune_message,
    registration_cancellation,
    registration_confirmation,
    registration_reminder,
    registration_waitlist_notice,
)


GENERIC_ACTION_LABELS = {"查看資訊", "查看詳情", "詳情與報名", "查看", "點我", "這裡"}
LINE_USER_ID_RE = re.compile(r"\bU[a-fA-F0-9]{32}\b")


def _texts(node: object) -> list[str]:
    if isinstance(node, dict):
        own = [node["text"]] if node.get("type") == "text" and isinstance(node.get("text"), str) else []
        return own + [text for value in node.values() for text in _texts(value)]
    if isinstance(node, list):
        return [text for value in node for text in _texts(value)]
    return []


def _actions(node: object) -> list[dict]:
    if isinstance(node, dict):
        own = [node["action"]] if isinstance(node.get("action"), dict) else []
        return own + [action for value in node.values() for action in _actions(value)]
    if isinstance(node, list):
        return [action for value in node for action in _actions(value)]
    return []


def assert_message_shape(message: dict) -> None:
    assert message["type"] == "flex"
    alt_text = message.get("altText")
    assert isinstance(alt_text, str)
    assert 8 <= len(alt_text) <= 1500
    assert "contents" in message


def assert_chatroom_copy(message: dict) -> None:
    visible_texts = _texts(message)
    assert not any("line_user_" in text for text in visible_texts)
    assert not any(LINE_USER_ID_RE.search(text) for text in visible_texts)
    for action in _actions(message):
        label = action.get("label")
        if label is not None:
            assert label not in GENERIC_ACTION_LABELS
            assert len(label) <= 20
        if action.get("type") == "uri":
            uri = action.get("uri", "")
            assert uri.startswith(("https://", "http://localhost"))


def assert_bubble_hero_image(bubble: dict) -> None:
    hero = bubble["hero"]
    assert hero["type"] == "image"
    assert hero["url"].startswith(("https://", "http://localhost"))
    assert hero["aspectRatio"] == "1:1"
    assert hero["aspectMode"] == "cover"


def main() -> None:
    repo = get_repository()
    event_message = events_carousel(repo.list_events())
    fortune = fortune_message(repo.draw_fortune())
    registration = repo.list_registrations()[0]
    registration_event = repo.get_event(registration.event_id)
    assert registration_event is not None
    registration_notice = registration_confirmation(registration_event, registration)
    reminder_notice = registration_reminder(registration_event, registration, reminder_type="day_before")
    day_of_notice = registration_reminder(registration_event, registration, reminder_type="day_of")
    waitlist_notice = registration_waitlist_notice(
        registration_event,
        user_id=registration.user_id,
        party_size=registration.party_size,
    )
    cancellation_notice = registration_cancellation(registration_event, registration)
    assert_message_shape(event_message)
    assert_message_shape(fortune)
    assert_message_shape(registration_notice)
    assert_message_shape(reminder_notice)
    assert_message_shape(day_of_notice)
    assert_message_shape(waitlist_notice)
    assert_message_shape(cancellation_notice)
    for message in [
        event_message,
        fortune,
        registration_notice,
        reminder_notice,
        day_of_notice,
        waitlist_notice,
        cancellation_notice,
    ]:
        assert_chatroom_copy(message)
    assert_bubble_hero_image(event_message["contents"]["contents"][0])
    assert_bubble_hero_image(fortune["contents"])
    print("Flex messages are structurally valid for service use.")


if __name__ == "__main__":
    main()
