from __future__ import annotations

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


def assert_message_shape(message: dict) -> None:
    assert message["type"] == "flex"
    assert "altText" in message
    assert "contents" in message


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
    assert_bubble_hero_image(event_message["contents"]["contents"][0])
    assert_bubble_hero_image(fortune["contents"])
    print("Flex messages are structurally valid for demo use.")


if __name__ == "__main__":
    main()
