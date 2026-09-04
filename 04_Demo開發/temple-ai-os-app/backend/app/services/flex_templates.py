from typing import Any

from app.core.config import get_settings
from app.schemas.common import Event, FortuneSlip, Registration
from app.services.event_visibility import public_event_key

COCOA = "#6B3F2A"
RED = "#B42318"
PEACH = "#FF9D7A"
PINK = "#FF6FA4"
JADE = "#1F7A5B"
MUTED = "#8B5A45"
LINE_GREEN = "#06C755"
GOLD = "#D6A33A"
BLUE = "#245B8A"
LILAC = "#6B3A8F"
SOFT_RED = "#FFF1E7"
SOFT_GREEN = "#EEF9F2"
SOFT_BLUE = "#EEF8FB"
SOFT_LILAC = "#F8F0FF"

EVENT_THEMES: dict[str, dict[str, str]] = {
    "festival": {
        "label": "祭典公告",
        "asset": "/assets/flex/event-card-festival.png",
        "accent": RED,
        "accent2": GOLD,
        "soft": SOFT_RED,
        "paper": "#FFF8EA",
        "footer": "#FFF1E7",
        "title": "#5B2718",
        "muted": "#8B5A45",
        "aspect": "20:13",
        "mode": "image_heavy",
        "focus_title": "公開參拜",
        "focus_body": "適合放置宮慶、聖誕佳辰與節日提醒，實際安排仍以廟方公告為準。",
    },
    "ritual": {
        "label": "法會服務",
        "asset": "/assets/flex/event-card-ritual.png",
        "accent": JADE,
        "accent2": GOLD,
        "soft": SOFT_GREEN,
        "paper": "#F7FFF9",
        "footer": "#EEF9F2",
        "title": "#173B2D",
        "muted": "#4F6C5E",
        "aspect": "1:1",
        "mode": "balanced",
        "focus_title": "報名名額",
        "focus_body": "用名額、時間與提醒節奏凸顯服務流程，民眾可先看活動說明再報名。",
    },
    "guide": {
        "label": "導覽互動",
        "asset": "/assets/flex/event-card-guide.png",
        "accent": BLUE,
        "accent2": "#7EDCC2",
        "soft": SOFT_BLUE,
        "paper": "#F6FCFF",
        "footer": "#EEF8FB",
        "title": "#15364E",
        "muted": "#476172",
        "aspect": "20:11",
        "mode": "route",
        "focus_title": "現場動線",
        "focus_body": "以第一次參拜、正殿、拜殿與參拜導覽作為入口，降低新訪客的不安感。",
    },
    "culture": {
        "label": "文化講堂",
        "asset": "/assets/flex/event-card-culture.png",
        "accent": "#8A5A12",
        "accent2": LILAC,
        "soft": SOFT_LILAC,
        "paper": "#FFF9F0",
        "footer": "#F8F0FF",
        "title": "#4E3410",
        "muted": "#71522A",
        "aspect": "20:15",
        "mode": "text_heavy",
        "focus_title": "文化體驗",
        "focus_body": "用故事、書法與信仰脈絡做內容層次，讓活動不像單純表單入口。",
    },
}


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


def _soft_chip(text: str, theme: dict[str, str]) -> dict[str, Any]:
    return {
        "type": "box",
        "layout": "vertical",
        "flex": 0,
        "backgroundColor": "#FFFFFF",
        "borderColor": theme["accent2"],
        "borderWidth": "1px",
        "cornerRadius": "16px",
        "paddingTop": "4px",
        "paddingBottom": "4px",
        "paddingStart": "10px",
        "paddingEnd": "10px",
        "contents": [{"type": "text", "text": text, "size": "xxs", "weight": "bold", "color": theme["accent"]}],
    }


def _event_theme(event: Event) -> dict[str, str]:
    text = f"{event.category} {event.title}"
    if any(keyword in text for keyword in ["法會", "普度", "祈福", "服務"]):
        return EVENT_THEMES["ritual"]
    if any(keyword in text for keyword in ["導覽", "第一次", "參拜流程", "動線"]):
        return EVENT_THEMES["guide"]
    if any(keyword in text for keyword in ["文化", "講堂", "書法", "教育", "體驗"]):
        return EVENT_THEMES["culture"]
    return EVENT_THEMES["festival"]


def _event_status_label(event: Event) -> str:
    if event.requires_registration and event.status == "open":
        return "開放報名"
    if event.status == "closed":
        return "已截止"
    return "活動資訊"


def _event_action_label(event: Event) -> str:
    if event.requires_registration and event.status == "open":
        return "前往活動報名"
    return "查看活動詳情"


def _capacity_text(event: Event) -> str:
    if not event.requires_registration:
        return "免報名"
    if event.capacity:
        remaining = max(0, event.capacity - event.registered_count)
        return f"剩 {remaining} 名｜{event.registered_count}/{event.capacity}"
    return "名額依現場公告"


def _capacity_ratio(event: Event) -> int:
    if not event.capacity:
        return 0
    return min(100, max(0, round((event.registered_count / event.capacity) * 100)))


def _accent_bar(theme: dict[str, str]) -> dict[str, Any]:
    return {
        "type": "box",
        "layout": "horizontal",
        "height": "6px",
        "cornerRadius": "8px",
        "contents": [
            {
                "type": "box",
                "layout": "vertical",
                "flex": 3,
                "backgroundColor": theme["accent"],
                "contents": [{"type": "filler"}],
            },
            {
                "type": "box",
                "layout": "vertical",
                "flex": 1,
                "backgroundColor": theme["accent2"],
                "contents": [{"type": "filler"}],
            },
        ],
    }


def _capacity_meter(event: Event, theme: dict[str, str]) -> dict[str, Any]:
    if not event.capacity:
        return _field_row("名額", _capacity_text(event), value_color=theme["muted"])
    ratio = _capacity_ratio(event)
    visible_ratio = max(5, ratio) if ratio else 0
    return {
        "type": "box",
        "layout": "vertical",
        "spacing": "xs",
        "contents": [
            _field_row("名額", _capacity_text(event), value_color=theme["accent"]),
            {
                "type": "box",
                "layout": "horizontal",
                "height": "7px",
                "cornerRadius": "8px",
                "backgroundColor": "#E5E0DA",
                "contents": [
                    {
                        "type": "box",
                        "layout": "vertical",
                        "width": f"{visible_ratio}%",
                        "cornerRadius": "8px",
                        "backgroundColor": theme["accent"],
                        "contents": [{"type": "filler"}],
                    }
                ],
            },
        ],
    }


def _event_focus_box(event: Event, theme: dict[str, str]) -> dict[str, Any]:
    chips = {
        "祭典公告": ["宮慶", "參拜", "公告"],
        "法會服務": ["名額", "提醒", "報名"],
        "導覽互動": ["正殿", "拜殿", "導覽"],
        "文化講堂": ["故事", "書法", "信仰"],
    }.get(theme["label"], ["活動", "說明"])
    return {
        "type": "box",
        "layout": "vertical",
        "spacing": "sm",
        "paddingAll": "13px",
        "cornerRadius": "14px",
        "backgroundColor": theme["soft"],
        "borderColor": theme["accent2"],
        "borderWidth": "1px",
        "contents": [
            {"type": "text", "text": theme["focus_title"], "size": "sm", "weight": "bold", "color": theme["accent"]},
            {"type": "text", "text": theme["focus_body"], "size": "xs", "wrap": True, "maxLines": 3, "color": theme["muted"]},
            {
                "type": "box",
                "layout": "horizontal",
                "spacing": "xs",
                "contents": [_soft_chip(chip, theme) for chip in chips],
            },
        ],
    }


def _event_primary_button(event: Event, theme: dict[str, str], detail_uri: str) -> dict[str, Any]:
    return {
        "type": "button",
        "style": "primary",
        "color": theme["accent"],
        "action": {"type": "uri", "label": _event_action_label(event), "uri": detail_uri},
    }


def _event_footer(event: Event, theme: dict[str, str], detail_uri: str, *, compact: bool = False) -> dict[str, Any]:
    return {
        "type": "box",
        "layout": "vertical",
        "spacing": "sm",
        "paddingAll": "12px" if compact else "16px",
        "contents": [_event_primary_button(event, theme, detail_uri)],
    }


def _event_image_heavy_bubble(event: Event, theme: dict[str, str]) -> dict[str, Any]:
    action_label = _event_action_label(event)
    detail_uri = _liff_url(f"/events/{public_event_key(event)}")
    return {
        "type": "bubble",
        "size": "mega",
        "styles": {"footer": {"backgroundColor": theme["footer"], "separator": True, "separatorColor": "#EFD6BE"}},
        "hero": {
            "type": "image",
            "url": _asset_url(theme["asset"]),
            "size": "full",
            "aspectRatio": "1:1",
            "aspectMode": "cover",
            "action": {"type": "uri", "label": action_label, "uri": detail_uri},
        },
        "footer": {
            "type": "box",
            "layout": "vertical",
            "spacing": "xs",
            "paddingAll": "12px",
            "contents": [
                {"type": "text", "text": event.title, "size": "md", "weight": "bold", "color": theme["title"], "wrap": True, "maxLines": 1},
                {"type": "text", "text": f"日期 {event.date}｜地點 {event.location}", "size": "xs", "color": theme["muted"], "wrap": True, "maxLines": 1},
                {"type": "text", "text": "點卡片查看完整活動說明", "size": "xxs", "color": theme["accent"], "weight": "bold"},
            ],
        },
        "action": {"type": "uri", "label": action_label, "uri": detail_uri},
    }


def _event_text_heavy_bubble(event: Event, theme: dict[str, str]) -> dict[str, Any]:
    action_label = _event_action_label(event)
    detail_uri = _liff_url(f"/events/{public_event_key(event)}")
    return {
        "type": "bubble",
        "size": "mega",
        "styles": {
            "header": {"backgroundColor": theme["accent"]},
            "body": {"backgroundColor": theme["paper"]},
            "footer": {"backgroundColor": theme["footer"], "separator": True, "separatorColor": "#EFD6BE"},
        },
        "header": {
            "type": "box",
            "layout": "vertical",
            "spacing": "xs",
            "paddingAll": "18px",
            "contents": [
                {"type": "text", "text": theme["label"], "size": "sm", "weight": "bold", "color": "#FFF4D6"},
                {"type": "text", "text": event.title, "size": "xxl", "weight": "bold", "color": "#FFFFFF", "wrap": True, "maxLines": 2},
            ],
        },
        "body": {
            "type": "box",
            "layout": "vertical",
            "spacing": "md",
            "paddingAll": "20px",
            "contents": [
                _accent_bar(theme),
                {
                    "type": "text",
                    "text": _shorten(event.summary, 118),
                    "size": "md",
                    "weight": "bold",
                    "wrap": True,
                    "maxLines": 5,
                    "color": theme["title"],
                },
                _event_focus_box(event, theme),
                {"type": "separator", "margin": "sm", "color": "#EFD6BE"},
                _field_row("日期", event.date, value_color=theme["title"]),
                _field_row("時間", f"{event.start_time}-{event.end_time}", value_color=theme["title"]),
                _field_row("地點", event.location, value_color=theme["title"]),
                _capacity_meter(event, theme),
            ],
        },
        "footer": _event_footer(event, theme, detail_uri),
        "action": {"type": "uri", "label": action_label, "uri": detail_uri},
    }


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
                "action": {"type": "uri", "label": "查看活動詳情", "uri": secondary_uri},
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
    detail_uri = _liff_url(f"/events/{public_event_key(event)}")
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
    theme = _event_theme(event)
    action_label = _event_action_label(event)
    detail_uri = _liff_url(f"/events/{public_event_key(event)}")
    if theme["mode"] == "image_heavy":
        return _event_image_heavy_bubble(event, theme)
    if theme["mode"] == "text_heavy":
        return _event_text_heavy_bubble(event, theme)

    return {
        "type": "bubble",
        "size": "mega",
        "styles": {
            "body": {"backgroundColor": theme["paper"]},
            "footer": {"backgroundColor": theme["footer"], "separator": True, "separatorColor": "#EFD6BE"},
        },
        "hero": {
            "type": "image",
            "url": _asset_url(theme["asset"]),
            "size": "full",
            "aspectRatio": theme["aspect"],
            "aspectMode": "cover",
            "action": {"type": "uri", "label": action_label, "uri": detail_uri},
        },
        "body": {
            "type": "box",
            "layout": "vertical",
            "spacing": "md",
            "paddingAll": "19px",
            "contents": [
                _accent_bar(theme),
                {
                    "type": "box",
                    "layout": "horizontal",
                    "spacing": "sm",
                    "contents": [_pill(theme["label"], theme["accent"]), _soft_chip(_event_status_label(event), theme)],
                },
                {
                    "type": "text",
                    "text": event.title,
                    "weight": "bold",
                    "size": "xl",
                    "color": theme["title"],
                    "wrap": True,
                    "maxLines": 2,
                },
                {
                    "type": "text",
                    "text": _shorten(event.summary),
                    "size": "sm",
                    "wrap": True,
                    "maxLines": 2,
                    "color": theme["muted"],
                },
                _event_focus_box(event, theme),
                {"type": "separator", "margin": "sm", "color": "#EFD6BE"},
                _field_row("日期", event.date, value_color=theme["title"]),
                _field_row("時間", f"{event.start_time}-{event.end_time}", value_color=theme["title"]),
                _field_row("地點", event.location, value_color=theme["title"]),
                _capacity_meter(event, theme),
            ],
        },
        "footer": _event_footer(event, theme, detail_uri),
        "action": {"type": "uri", "label": action_label, "uri": detail_uri},
    }


def events_carousel(events: list[Event]) -> dict[str, Any]:
    visible_count = min(len(events), 12)
    return {
        "type": "flex",
        "altText": f"萬春宮近期活動，共 {visible_count} 筆。左右滑動查看時間、地點與報名狀態。",
        "contents": {"type": "carousel", "contents": [event_bubble(event) for event in events[:12]]},
    }


def registration_confirmation(event: Event, registration: Registration) -> dict[str, Any]:
    lookup_uri = _liff_url("/events?lookup=1")
    attendee_name = registration.contact_name or "信眾"
    status_text = "已成功建立" if registration.status == "confirmed" else registration.status
    return {
        "type": "flex",
        "altText": f"報名成功通知：{event.title}，報名編號 {registration.registration_id}。可查詢報名進度。",
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
            notice="此為報名通知；正式活動與候補規則仍以廟方公告為準。",
            primary_label="查詢報名進度",
            primary_uri=lookup_uri,
        ),
    }


def registration_reminder(
    event: Event,
    registration: Registration,
    *,
    reminder_type: str = "day_before",
) -> dict[str, Any]:
    lookup_uri = _liff_url("/events?lookup=1")
    is_day_of = reminder_type == "day_of"
    header_title = "活動今日提醒" if is_day_of else "活動前一天提醒"
    header_subtitle = "今天記得依現場公告準時到場" if is_day_of else "明天活動即將開始，先確認時間地點"
    alt = f"{header_title}：{event.title}，{event.date} {event.start_time} 於 {event.location}。"
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
            primary_label="查詢報名進度",
            primary_uri=lookup_uri,
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
        "altText": f"候補通知：{event.title} 目前名額已滿，可聯絡客服確認。",
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
                _field_row("提醒方式", "LINE 訊息通知"),
                _field_row("目前名額", _capacity_text(event), value_color=RED),
            ],
            notice="目前先以通知卡呈現候補狀態；正式候補順序需由廟方規則與後台狀態流程確認。",
            primary_label="聯絡客服",
            primary_uri=support_uri,
        ),
    }


def registration_cancellation(event: Event, registration: Registration) -> dict[str, Any]:
    lookup_uri = _liff_url("/events?lookup=1")
    return {
        "type": "flex",
        "altText": f"取消報名通知：{event.title}，報名編號 {registration.registration_id}。可查詢最新狀態。",
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
            notice="目前未開放使用者自助取消；正式取消流程需同步更新報名狀態與名額。",
            primary_label="查詢報名進度",
            primary_uri=lookup_uri,
        ),
    }


def fortune_message(slip: FortuneSlip) -> dict[str, Any]:
    return {
        "type": "flex",
        "altText": f"文化抽籤結果：{slip.title}。可查看籤詩解讀與再次抽籤。",
        "contents": {
            "type": "bubble",
            "size": "mega",
            "styles": {
                "body": {"backgroundColor": "#FFF8EA"},
                "footer": {"backgroundColor": "#FFF8EA", "separator": True, "separatorColor": "#E5E0DA"},
            },
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
                "paddingAll": "22px",
                "contents": [
                    {"type": "text", "text": slip.title, "weight": "bold", "size": "xl", "color": COCOA},
                    {"type": "text", "text": slip.poem, "wrap": True, "color": RED, "weight": "bold"},
                    {"type": "text", "text": slip.plain_language, "wrap": True, "color": "#34221B"},
                    {"type": "separator"},
                    {"type": "text", "text": slip.reminder, "size": "xs", "wrap": True, "color": "#536471"},
                ],
            },
            "footer": {
                "type": "box",
                "layout": "vertical",
                "spacing": "sm",
                "paddingAll": "16px",
                "contents": [
                    {
                        "type": "button",
                        "style": "primary",
                        "color": RED,
                        "action": {"type": "uri", "label": "再抽一支文化籤", "uri": _liff_url("/fortune")},
                    },
                    {
                        "type": "button",
                        "style": "secondary",
                        "action": {"type": "uri", "label": "前往客服詢問", "uri": _liff_url("/support")},
                    },
                ],
            },
        },
    }
