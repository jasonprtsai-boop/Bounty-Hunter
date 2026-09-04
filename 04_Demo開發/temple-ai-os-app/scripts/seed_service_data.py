from __future__ import annotations

import json
import os
from pathlib import Path

import httpx


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DATA = ROOT / "backend" / "app" / "data" / "demo"
TEMPLE_PROFILE = ROOT / "backend" / "app" / "data" / "temple_profile.json"
TEMPLE_ID = "wcg_taichung_demo"


def load_json(name: str):
    return json.loads((SOURCE_DATA / name).read_text(encoding="utf-8"))


def load_temple_profile() -> dict:
    return json.loads(TEMPLE_PROFILE.read_text(encoding="utf-8"))


def temple_row(profile: dict) -> dict:
    return {
        "temple_id": profile["temple_id"],
        "name": profile["name"],
        "aliases": profile.get("aliases", []),
        "main_deity": profile["main_deity"],
        "religion": profile.get("religion"),
        "registration_status": profile.get("registration_status"),
        "tax_id": profile.get("tax_id"),
        "address": profile["address"],
        "phone": profile.get("phone"),
        "coordinates": profile.get("coordinates", {}),
        "image": profile.get("image"),
        "demo_positioning": profile["demo_positioning"],
        "sources": profile.get("sources", []),
    }


def event_row(item: dict) -> dict:
    return {
        "event_id": item["event_id"],
        "temple_id": TEMPLE_ID,
        "title": item["title"],
        "category": item["category"],
        "source_type": item["source_type"],
        "event_date": item["date"],
        "start_time": item["start_time"],
        "end_time": item["end_time"],
        "location": item["location"],
        "address": item["address"],
        "summary": item["summary"],
        "requires_registration": item["requires_registration"],
        "capacity": item.get("capacity"),
        "registered_count": item.get("registered_count", 0),
        "status": item["status"],
        "registration_fields": item.get("registration_fields", []),
        "payment_policy": item.get("payment_policy"),
        "demo_note": item["demo_note"],
    }


def member_row(user: dict) -> dict:
    return {
        "user_id": user["user_id"],
        "display_name": user["line_display_name"],
        "reminder_opt_in": True,
        "privacy_version": "demo-v1",
    }


def dashboard_row(snapshot: dict) -> dict:
    return {
        "snapshot_date": snapshot["snapshot_date"],
        "temple_id": snapshot["temple_id"],
        "notice": snapshot["notice"],
        "headline_metrics": snapshot["headline_metrics"],
        "event_metrics": snapshot["event_metrics"],
        "top_ai_intents": snapshot["top_ai_intents"],
        "knowledge_gaps": snapshot["knowledge_gaps"],
    }


def tour_spot_rows(temple: dict) -> list[dict]:
    image_url = None
    if temple.get("image"):
        image_url = temple["image"].get("url")
    return [
        {
            "code": "main-hall",
            "temple_id": TEMPLE_ID,
            "title": "主殿參拜導覽",
            "category": "參拜動線",
            "summary": "以 LIFF 呈現主殿參拜資訊、開放資料來源與現場注意事項。",
            "cultural_note": "正式導覽內容需由廟方確認；本服務提供資訊呈現與互動流程。",
            "image_url": image_url,
            "source_type": "open_data_plus_service_summary",
        },
        {
            "code": "history-wall",
            "temple_id": TEMPLE_ID,
            "title": "沿革與文化牆",
            "category": "文化導覽",
            "summary": "整理廟宇沿革、公開資料摘要與導覽卡片，供 LINE 內開啟。",
            "cultural_note": "歷史內容應以廟方正式資料為準，正式說法仍以廟方公告為準。",
            "image_url": image_url,
            "source_type": "temple_service",
        },
    ]


def fortune_slip_rows() -> list[dict]:
    return [
        {
            "slip_id": "fortune_culture_001",
            "temple_id": TEMPLE_ID,
            "title": "平安守正",
            "poem": "一步一心香，平安在日常。",
            "plain_language": "先把眼前能做的事做好，保持穩定與耐心。",
            "cultural_note": "此為文化體驗內容，不代表神意判斷或命運預測。",
            "reminder": "重大決定仍應回到現實資訊、專業建議與自身判斷。",
            "status": "published",
        },
        {
            "slip_id": "fortune_culture_002",
            "temple_id": TEMPLE_ID,
            "title": "明燈指路",
            "poem": "雲開見月明，問路慢慢行。",
            "plain_language": "事情尚未完全明朗，適合先蒐集資訊再行動。",
            "cultural_note": "本服務僅提供文化化、保守的文字解讀，不做斷言。",
            "reminder": "若涉及醫療、法律、財務或安全，請尋求專業協助。",
            "status": "published",
        },
        {
            "slip_id": "fortune_culture_003",
            "temple_id": TEMPLE_ID,
            "title": "心定事成",
            "poem": "心定風波小，行穩路自長。",
            "plain_language": "先穩住節奏，避免被短期情緒帶著走。",
            "cultural_note": "此籤詩是文化互動內容，用於整理心情與提供平安提醒。",
            "reminder": "線上服務不應被視為神明代言或命運判斷工具。",
            "status": "published",
        },
    ]


def faq_rule_row(item: dict) -> dict:
    return {**item, "temple_id": TEMPLE_ID}


def upsert(client: httpx.Client, supabase_url: str, table: str, rows: list[dict], conflict: str) -> None:
    if not rows:
        return
    response = client.post(
        f"{supabase_url}/rest/v1/{table}",
        params={"on_conflict": conflict},
        json=rows,
    )
    response.raise_for_status()


def main() -> None:
    supabase_url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    temple = temple_row(load_temple_profile())
    events = [event_row(item) for item in load_json("demo_events.json")]
    users = load_json("demo_users.json")
    members = [member_row(user) for user in users]
    registrations = load_json("demo_registrations.json")
    support_tickets = load_json("demo_support_tickets.json")
    notification_jobs = load_json("demo_notification_jobs.json")
    dashboard = dashboard_row(load_json("demo_dashboard_snapshot.json"))
    tour_spots = tour_spot_rows(temple)
    fortune_slips = fortune_slip_rows()
    faq_rules = [faq_rule_row(item) for item in load_json("demo_faq_rules.json")]

    print(
        " ".join(
            [
                f"temples=1",
                f"events={len(events)}",
                f"users={len(users)}",
                f"members={len(members)}",
                f"registrations={len(registrations)}",
                f"support_tickets={len(support_tickets)}",
                f"notification_jobs={len(notification_jobs)}",
                f"tour_spots={len(tour_spots)}",
                f"fortune_slips={len(fortune_slips)}",
                f"faq_rules={len(faq_rules)}",
            ]
        )
    )
    if not supabase_url or not service_key:
        print("Dry run only. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to insert data.")
        return

    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    with httpx.Client(timeout=20, headers=headers) as client:
        upsert(client, supabase_url, "temples", [temple], "temple_id")
        upsert(client, supabase_url, "line_users", users, "user_id")
        upsert(client, supabase_url, "members", members, "user_id")
        upsert(client, supabase_url, "events", events, "event_id")
        upsert(client, supabase_url, "event_registrations", registrations, "registration_id")
        upsert(client, supabase_url, "support_tickets", support_tickets, "ticket_id")
        upsert(client, supabase_url, "notification_jobs", notification_jobs, "job_id")
        upsert(client, supabase_url, "tour_spots", tour_spots, "code")
        upsert(client, supabase_url, "fortune_slips", fortune_slips, "slip_id")
        upsert(client, supabase_url, "faq_rules", faq_rules, "rule_id")
        upsert(client, supabase_url, "dashboard_snapshots", [dashboard], "snapshot_date")
    print("Seed complete.")


if __name__ == "__main__":
    main()
