from typing import Any

from app.core.config import get_settings
from app.schemas.common import Event, FortuneSlip, Registration


def _liff_url(path: str) -> str:
    settings = get_settings()
    return f"{settings.frontend_base_url.rstrip('/')}{path}"


def event_bubble(event: Event) -> dict[str, Any]:
    status_label = "可報名" if event.requires_registration and event.status == "open" else "查看資訊"
    detail_uri = _liff_url(f"/events/{event.event_id}")
    buttons: list[dict[str, Any]] = [
        {
            "type": "button",
            "style": "primary",
            "color": "#06C755",
            "action": {"type": "uri", "label": "查看詳情", "uri": detail_uri},
        }
    ]
    if event.requires_registration:
        buttons.append(
            {
                "type": "button",
                "style": "secondary",
                "action": {
                    "type": "uri",
                    "label": "示範報名",
                    "uri": _liff_url(f"/register/{event.event_id}"),
                },
            }
        )

    return {
        "type": "bubble",
        "size": "mega",
        "body": {
            "type": "box",
            "layout": "vertical",
            "spacing": "md",
            "contents": [
                {"type": "text", "text": event.title, "weight": "bold", "size": "lg", "wrap": True},
                {"type": "text", "text": f"{event.date} {event.start_time}-{event.end_time}", "size": "sm"},
                {"type": "text", "text": event.location, "size": "sm", "color": "#536471"},
                {"type": "separator"},
                {"type": "text", "text": event.summary, "size": "sm", "wrap": True},
                {"type": "text", "text": event.demo_note, "size": "xs", "color": "#8A6A12", "wrap": True},
            ],
        },
        "footer": {"type": "box", "layout": "vertical", "spacing": "sm", "contents": buttons},
        "styles": {"footer": {"separator": True}},
        "action": {"type": "uri", "label": status_label, "uri": detail_uri},
    }


def events_carousel(events: list[Event]) -> dict[str, Any]:
    return {
        "type": "flex",
        "altText": "Temple AI OS 近期活動",
        "contents": {"type": "carousel", "contents": [event_bubble(event) for event in events[:10]]},
    }


def registration_confirmation(event: Event, registration: Registration) -> dict[str, Any]:
    return {
        "type": "flex",
        "altText": "報名成功確認",
        "contents": {
            "type": "bubble",
            "body": {
                "type": "box",
                "layout": "vertical",
                "spacing": "md",
                "contents": [
                    {"type": "text", "text": "報名成功", "weight": "bold", "size": "xl"},
                    {"type": "text", "text": event.title, "wrap": True},
                    {"type": "text", "text": f"人數：{registration.party_size}", "size": "sm"},
                    {
                        "type": "text",
                        "text": "這是 Temple AI OS Demo 確認訊息，不代表萬春宮正式報名資料。",
                        "size": "xs",
                        "wrap": True,
                        "color": "#8A6A12",
                    },
                ],
            },
        },
    }


def fortune_message(slip: FortuneSlip) -> dict[str, Any]:
    return {
        "type": "flex",
        "altText": slip.title,
        "contents": {
            "type": "bubble",
            "body": {
                "type": "box",
                "layout": "vertical",
                "spacing": "md",
                "contents": [
                    {"type": "text", "text": slip.title, "weight": "bold", "size": "xl"},
                    {"type": "text", "text": slip.poem, "wrap": True, "color": "#B42318"},
                    {"type": "text", "text": slip.plain_language, "wrap": True},
                    {"type": "separator"},
                    {"type": "text", "text": slip.reminder, "size": "xs", "wrap": True, "color": "#536471"},
                ],
            },
        },
    }

