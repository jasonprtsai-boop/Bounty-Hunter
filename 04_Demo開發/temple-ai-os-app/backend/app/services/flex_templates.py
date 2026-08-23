from typing import Any

from app.core.config import get_settings
from app.schemas.common import Event, FortuneSlip, Registration

COCOA = "#6B3F2A"
CREAM = "#FFF7E8"
BLUSH = "#FFE8F0"
RED = "#B42318"
PEACH = "#FF9D7A"
PINK = "#FF6FA4"
JADE = "#1F7A5B"
MUTED = "#8B5A45"
LINE_GREEN = "#06C755"


def _liff_url(path: str) -> str:
    settings = get_settings()
    return f"{settings.frontend_base_url.rstrip('/')}{path}"


def _asset_url(path: str) -> str:
    settings = get_settings()
    return f"{settings.frontend_base_url.rstrip('/')}{path}"


def _shorten(text: str, limit: int = 72) -> str:
    text = text.strip()
    return text if len(text) <= limit else f"{text[: limit - 1]}…"


def _field_row(label: str, value: str, *, value_color: str = COCOA) -> dict[str, Any]:
    return {
        "type": "box",
        "layout": "baseline",
        "spacing": "md",
        "contents": [
            {"type": "text", "text": label, "color": "#9A8A7A", "size": "sm", "flex": 3},
            {"type": "text", "text": value, "color": value_color, "size": "sm", "weight": "bold", "wrap": True, "flex": 5},
        ],
    }


def _pill(text: str, color: str) -> dict[str, Any]:
    return {
        "type": "box",
        "layout": "vertical",
        "flex": 0,
        "backgroundColor": color,
        "cornerRadius": "20px",
        "paddingTop": "5px",
        "paddingBottom": "5px",
        "paddingStart": "12px",
        "paddingEnd": "12px",
        "contents": [{"type": "text", "text": text, "size": "xs", "weight": "bold", "color": "#FFFFFF"}],
    }


def _event_status_label(event: Event) -> str:
    if event.requires_registration and event.status == "open":
        return "開放報名"
    if event.status == "closed":
        return "已截止"
    return "活動資訊"


def _capacity_text(event: Event) -> str:
    if not event.requires_registration:
        return "免報名"
    if event.capacity:
        remaining = max(0, event.capacity - event.registered_count)
        return f"剩 {remaining} 名｜{event.registered_count}/{event.capacity}"
    return "名額依現場公告"


def _registration_footer(primary_label: str, primary_uri: str, secondary_uri: str) -> dict[str, Any]:
    return {
        "type": "box",
        "layout": "vertical",
        "spacing": "sm",
        "paddingAll": "16px",
        "contents": [
            {
                "type": "button",
                "style": "primary",
                "color": LINE_GREEN,
                "action": {"type": "uri", "label": primary_label, "uri": primary_uri},
            },
            {
                "type": "button",
                "style": "secondary",
                "action": {"type": "uri", "label": "查看活動資訊", "uri": secondary_uri},
            },
        ],
    }


def _registration_notice_bubble(
    *,
    header_title: str,
    header_subtitle: str,
    header_color: str,
    event: Event,
    rows: list[dict[str, Any]],
    notice: str,
    primary_label: str,
    primary_uri: str,
) -> dict[str, Any]:
    detail_uri = _liff_url(f"/events/{event.event_id}")
    return {
        "type": "bubble",
        "size": "mega",
        "styles": {
            "header": {"backgroundColor": header_color},
            "body": {"backgroundColor": "#FFFFFF"},
            "footer": {"backgroundColor": "#FFFFFF", "separator": True, "separatorColor": "#E5E0DA"},
        },
        "header": {
            "type": "box",
            "layout": "vertical",
            "paddingAll": "18px",
            "contents": [
                {"type": "text", "text": header_title, "size": "xl", "weight": "bold", "color": "#FFFFFF"},
                {"type": "text", "text": header_subtitle, "size": "sm", "color": "#FFE8D8", "margin": "xs"},
            ],
        },
        "body": {
            "type": "box",
            "layout": "vertical",
            "spacing": "md",
            "paddingAll": "22px",
            "contents": [
                {
                    "type": "text",
                    "text": event.title,
                    "weight": "bold",
                    "size": "xl",
                    "color": COCOA,
                    "wrap": True,
                },
                {"type": "separator", "margin": "md", "color": "#E5E0DA"},
                *rows,
                {
                    "type": "text",
                    "text": notice,
                    "size": "xs",
                    "wrap": True,
                    "color": "#9A7254",
                    "margin": "lg",
                },
            ],
        },
        "footer": _registration_footer(primary_label, primary_uri, detail_uri),
    }


def event_bubble(event: Event) -> dict[str, Any]:
    status_label = "可報名" if event.requires_registration and event.status == "open" else "查看資訊"
    detail_uri = _liff_url(f"/events/{event.event_id}")
    buttons: list[dict[str, Any]] = [
        {
            "type": "button",
            "style": "primary",
            "color": LINE_GREEN,
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
        "styles": {
            "body": {"backgroundColor": CREAM},
            "footer": {"backgroundColor": CREAM, "separator": True, "separatorColor": "#EFD6BE"},
        },
        "hero": {
            "type": "image",
            "url": _asset_url("/assets/flex/event-card.png"),
            "size": "full",
            "aspectRatio": "1:1",
            "aspectMode": "cover",
            "action": {"type": "uri", "label": status_label, "uri": detail_uri},
        },
        "body": {
            "type": "box",
            "layout": "vertical",
            "spacing": "md",
            "paddingAll": "20px",
            "contents": [
                {
                    "type": "box",
                    "layout": "horizontal",
                    "spacing": "sm",
                    "contents": [_pill(event.category, PEACH), _pill(_event_status_label(event), PINK)],
                },
                {
                    "type": "text",
                    "text": event.title,
                    "weight": "bold",
                    "size": "xl",
                    "color": COCOA,
                    "wrap": True,
                    "maxLines": 2,
                },
                _field_row("日期", event.date),
                _field_row("時間", f"{event.start_time}-{event.end_time}"),
                _field_row("地點", event.location),
                _field_row("名額", _capacity_text(event), value_color=JADE if event.requires_registration else MUTED),
                {"type": "separator", "margin": "md", "color": "#EFD6BE"},
                {
                    "type": "text",
                    "text": _shorten(event.summary),
                    "size": "sm",
                    "wrap": True,
                    "maxLines": 3,
                    "color": MUTED,
                },
            ],
        },
        "footer": {
            "type": "box",
            "layout": "vertical",
            "spacing": "sm",
            "paddingAll": "16px",
            "contents": buttons,
        },
        "action": {"type": "uri", "label": status_label, "uri": detail_uri},
    }


def events_carousel(events: list[Event]) -> dict[str, Any]:
    return {
        "type": "flex",
        "altText": "萬春宮近期活動，左右滑動查看活動說明",
        "contents": {"type": "carousel", "contents": [event_bubble(event) for event in events[:12]]},
    }


def registration_confirmation(event: Event, registration: Registration) -> dict[str, Any]:
    member_uri = _liff_url("/member")
    attendee_name = registration.contact_name or "信眾"
    status_text = "已成功建立" if registration.status == "confirmed" else registration.status
    return {
        "type": "flex",
        "altText": f"報名成功通知：{event.title}",
        "contents": _registration_notice_bubble(
            header_title="報名成功通知",
            header_subtitle=f"{attendee_name} 您好，已收到你的活動報名",
            header_color=RED,
            event=event,
            rows=[
                _field_row("活動日期", event.date),
                _field_row("活動時間", f"{event.start_time}-{event.end_time}"),
                _field_row("活動地點", event.location),
                _field_row("報名人數", f"{registration.party_size} 人"),
                _field_row("報名編號", registration.registration_id),
                _field_row("報名狀態", status_text, value_color=JADE),
            ],
            notice="此為 Demo 報名通知；正式活動與候補規則仍以廟方公告為準。",
            primary_label="查看報名紀錄",
            primary_uri=member_uri,
        ),
    }


def registration_reminder(
    event: Event,
    registration: Registration,
    *,
    reminder_type: str = "day_before",
) -> dict[str, Any]:
    member_uri = _liff_url("/member")
    is_day_of = reminder_type == "day_of"
    header_title = "活動今日提醒" if is_day_of else "活動前一天提醒"
    header_subtitle = "今天記得依現場公告準時到場" if is_day_of else "明天活動即將開始，先確認時間地點"
    alt = f"{header_title}：{event.title}"
    return {
        "type": "flex",
        "altText": alt,
        "contents": _registration_notice_bubble(
            header_title=header_title,
            header_subtitle=header_subtitle,
            header_color=JADE if is_day_of else PEACH,
            event=event,
            rows=[
                _field_row("活動日期", event.date),
                _field_row("活動時間", f"{event.start_time}-{event.end_time}"),
                _field_row("活動地點", event.location),
                _field_row("報名人數", f"{registration.party_size} 人"),
                _field_row("報名編號", registration.registration_id),
            ],
            notice="提醒訊息依使用者同意設定發送；正式服務需遵守 LINE 訊息用量與廟方公告規則。",
            primary_label="查看報名紀錄",
            primary_uri=member_uri,
        ),
    }


def registration_waitlist_notice(
    event: Event,
    *,
    user_id: str,
    party_size: int = 1,
) -> dict[str, Any]:
    support_uri = _liff_url("/support")
    return {
        "type": "flex",
        "altText": f"候補通知：{event.title}",
        "contents": _registration_notice_bubble(
            header_title="名額已滿通知",
            header_subtitle="目前名額已滿，可留下問題由人工確認",
            header_color=PINK,
            event=event,
            rows=[
                _field_row("活動日期", event.date),
                _field_row("活動時間", f"{event.start_time}-{event.end_time}"),
                _field_row("活動地點", event.location),
                _field_row("詢問人數", f"{party_size} 人"),
                _field_row("使用者", user_id),
                _field_row("目前名額", _capacity_text(event), value_color=RED),
            ],
            notice="Demo 先以通知卡呈現候補狀態；正式候補順序需由廟方規則與後台狀態流程確認。",
            primary_label="聯絡客服",
            primary_uri=support_uri,
        ),
    }


def registration_cancellation(event: Event, registration: Registration) -> dict[str, Any]:
    member_uri = _liff_url("/member")
    return {
        "type": "flex",
        "altText": f"取消報名通知：{event.title}",
        "contents": _registration_notice_bubble(
            header_title="取消報名通知",
            header_subtitle="已收到取消或狀態異動通知",
            header_color=MUTED,
            event=event,
            rows=[
                _field_row("活動日期", event.date),
                _field_row("活動時間", f"{event.start_time}-{event.end_time}"),
                _field_row("活動地點", event.location),
                _field_row("報名人數", f"{registration.party_size} 人"),
                _field_row("報名編號", registration.registration_id),
            ],
            notice="目前 Demo 未開放使用者自助取消；正式取消流程需同步更新報名狀態與名額。",
            primary_label="查看報名紀錄",
            primary_uri=member_uri,
        ),
    }


def fortune_message(slip: FortuneSlip) -> dict[str, Any]:
    return {
        "type": "flex",
        "altText": slip.title,
        "contents": {
            "type": "bubble",
            "hero": {
                "type": "image",
                "url": _asset_url("/assets/flex/fortune-card.png"),
                "size": "full",
                "aspectRatio": "1:1",
                "aspectMode": "cover",
            },
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
