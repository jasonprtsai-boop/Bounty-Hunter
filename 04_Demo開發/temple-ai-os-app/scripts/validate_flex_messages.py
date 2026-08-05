from __future__ import annotations

import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "backend"
sys.path.insert(0, str(BACKEND))

from app.db.supabase import get_repository  # noqa: E402
from app.services.flex_templates import events_carousel, fortune_message  # noqa: E402


def assert_message_shape(message: dict) -> None:
    assert message["type"] == "flex"
    assert "altText" in message
    assert "contents" in message


def main() -> None:
    repo = get_repository()
    assert_message_shape(events_carousel(repo.list_events()))
    assert_message_shape(fortune_message(repo.draw_fortune()))
    print("Flex messages are structurally valid for demo use.")


if __name__ == "__main__":
    main()

