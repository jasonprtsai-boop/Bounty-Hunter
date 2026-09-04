from typing import Any

from app.db.supabase import LocalRepository
from app.schemas.common import Registration
from app.services.flex_templates import (
    events_carousel,
    fortune_message,
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


def _actions(node: Any) -> list[dict[str, Any]]:
    if isinstance(node, dict):
        own = [node["action"]] if isinstance(node.get("action"), dict) else []
        return own + [action for value in node.values() for action in _actions(value)]
    if isinstance(node, list):
        return [action for value in node for action in _actions(value)]
    return []


def test_events_carousel_uses_swipeable_flex_cards() -> None:
    repo = LocalRepository()
    events = repo.list_events()

    message = events_carousel(events)
    carousel = message["contents"]
    first_bubble = carousel["contents"][0]
    first_texts = _texts(first_bubble)
    actions = _actions(carousel)
    registerable_index = next(index for index, event in enumerate(events[:12]) if event.requires_registration)
    registerable_bubble = carousel["contents"][registerable_index]
    hero_urls = [bubble["hero"]["url"] for bubble in carousel["contents"] if "hero" in bubble]
    body_colors = [
        bubble["styles"]["body"]["backgroundColor"]
        for bubble in carousel["contents"]
        if bubble.get("styles", {}).get("body")
    ]

    assert message["type"] == "flex"
    assert "左右滑動" in message["altText"]
    assert carousel["type"] == "carousel"
    assert 1 <= len(carousel["contents"]) <= 12
    assert {bubble["size"] for bubble in carousel["contents"]} == {"mega"}
    assert "body" not in first_bubble
    assert first_bubble["hero"]["url"].endswith("/assets/flex/event-card-festival.png")
    assert any(url.endswith("/assets/flex/event-card-ritual.png") for url in hero_urls)
    assert any(url.endswith("/assets/flex/event-card-guide.png") for url in hero_urls)
    assert any("hero" not in bubble for bubble in carousel["contents"])
    assert len(set(hero_urls)) >= 3
    assert len(set(body_colors)) >= 3
    assert any("日期" in text for text in first_texts)
    assert any("地點" in text for text in first_texts)
    assert registerable_bubble["footer"]["contents"][0]["action"]["label"] == "前往活動報名"
    assert not any(action.get("label") in {"查看資訊", "查看詳情", "詳情與報名"} for action in actions)
    assert all("/events/" in action["uri"] for action in actions if action.get("type") == "uri")
    assert not any("/register/" in action["uri"] for action in actions if action.get("type") == "uri")


def test_registration_confirmation_is_notice_card_with_detail_actions() -> None:
    repo = LocalRepository()
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
    assert footer_actions[0]["label"] == "查詢報名進度"
    assert footer_actions[0]["uri"].endswith("/events?lookup=1")
    assert footer_actions[1]["label"] == "查看活動詳情"


def test_registration_reminder_waitlist_and_cancellation_cards() -> None:
    repo = LocalRepository()
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
    waitlist_texts = _texts(waitlist)
    assert not any("line_user_notice" in text for text in waitlist_texts)
    assert "提醒方式" in waitlist_texts
    assert "LINE 訊息通知" in waitlist_texts


def test_fortune_message_has_specific_chatroom_actions() -> None:
    repo = LocalRepository()
    slip = repo.draw_fortune()

    message = fortune_message(slip)
    actions = _actions(message)

    assert message["type"] == "flex"
    assert message["altText"].startswith("文化抽籤結果")
    assert message["contents"]["size"] == "mega"
    assert [action["label"] for action in actions] == ["再抽一支文化籤", "前往客服詢問"]
    assert actions[0]["uri"].endswith("/fortune")
    assert actions[1]["uri"].endswith("/support")
