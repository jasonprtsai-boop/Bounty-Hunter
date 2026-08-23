from typing import Any

from app.db.supabase import DemoRepository
from app.schemas.common import Registration
from app.services.flex_templates import (
    events_carousel,
    registration_cancellation,
    registration_confirmation,
    registration_reminder,
    registration_waitlist_notice,
)


def _texts(node: Any) -> list[str]:
    if isinstance(node, dict):
        own = [node["text"]] if node.get("type") == "text" and isinstance(node.get("text"), str) else []
        return own + [text for value in node.values() for text in _texts(value)]
    if isinstance(node, list):
        return [text for value in node for text in _texts(value)]
    return []


def test_events_carousel_uses_swipeable_flex_cards() -> None:
    repo = DemoRepository()

    message = events_carousel(repo.list_events())
    carousel = message["contents"]
    first_bubble = carousel["contents"][0]
    first_texts = _texts(first_bubble)

    assert message["type"] == "flex"
    assert "左右滑動" in message["altText"]
    assert carousel["type"] == "carousel"
    assert 1 <= len(carousel["contents"]) <= 12
    assert {bubble["size"] for bubble in carousel["contents"]} == {"mega"}
    assert first_bubble["hero"]["url"].endswith("/assets/flex/event-card.png")
    assert "日期" in first_texts
    assert "地點" in first_texts
    assert first_bubble["footer"]["contents"][0]["action"]["label"] == "查看詳情"


def test_registration_confirmation_is_notice_card_with_detail_actions() -> None:
    repo = DemoRepository()
    event = repo.get_event("evt_demo_worship_intro")
    assert event is not None
    registration = Registration(
        registration_id="reg_notice_test",
        event_id=event.event_id,
        user_id="line_user_notice",
        contact_name="小安",
        party_size=2,
    )

    message = registration_confirmation(event, registration)
    bubble = message["contents"]
    texts = _texts(bubble)
    footer_actions = [item["action"] for item in bubble["footer"]["contents"]]

    assert message["type"] == "flex"
    assert "報名成功通知" in message["altText"]
    assert bubble["type"] == "bubble"
    assert bubble["header"]["contents"][0]["text"] == "報名成功通知"
    assert any("小安 您好" in text for text in texts)
    assert event.title in texts
    assert "報名編號" in texts
    assert "reg_notice_test" in texts
    assert footer_actions[0]["label"] == "查看報名紀錄"
    assert footer_actions[0]["uri"].endswith("/member")
    assert footer_actions[1]["label"] == "查看活動資訊"


def test_registration_reminder_waitlist_and_cancellation_cards() -> None:
    repo = DemoRepository()
    event = repo.get_event("evt_demo_worship_intro")
    assert event is not None
    registration = Registration(
        registration_id="reg_notice_test",
        event_id=event.event_id,
        user_id="line_user_notice",
        contact_name="小安",
        party_size=2,
    )

    day_before = registration_reminder(event, registration, reminder_type="day_before")
    day_of = registration_reminder(event, registration, reminder_type="day_of")
    waitlist = registration_waitlist_notice(event, user_id=registration.user_id, party_size=2)
    cancellation = registration_cancellation(event, registration)

    assert day_before["contents"]["header"]["contents"][0]["text"] == "活動前一天提醒"
    assert day_of["contents"]["header"]["contents"][0]["text"] == "活動今日提醒"
    assert waitlist["contents"]["header"]["contents"][0]["text"] == "名額已滿通知"
    assert cancellation["contents"]["header"]["contents"][0]["text"] == "取消報名通知"
    assert "候補通知" in waitlist["altText"]
    assert "取消報名通知" in cancellation["altText"]
