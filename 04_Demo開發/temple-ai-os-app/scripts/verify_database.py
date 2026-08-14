from __future__ import annotations

import os
import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

import httpx


ROOT = Path(__file__).resolve().parents[1]
TEMPLE_ID = "wcg_taichung_demo"
REQUIRED_TABLES = [
    "temples",
    "line_users",
    "events",
    "event_registrations",
    "messages",
    "support_tickets",
    "notification_jobs",
    "faq_rules",
    "dashboard_snapshots",
    "audit_logs",
    "line_webhook_events",
]


def load_env_file() -> None:
    env_path = ROOT / ".env"
    if not env_path.exists():
        return
    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def request(
    client: httpx.Client,
    method: str,
    url: str,
    *,
    ok: set[int] | None = None,
    **kwargs: Any,
) -> httpx.Response:
    response = client.request(method, url, **kwargs)
    expected = ok or {200, 201, 204}
    if response.status_code not in expected:
        raise RuntimeError(f"{method} {url} returned {response.status_code}: {response.text[:300]}")
    return response


def require_rows(client: httpx.Client, supabase_url: str, table: str) -> None:
    response = request(
        client,
        "GET",
        f"{supabase_url}/rest/v1/{table}",
        params={"select": "*", "limit": "1"},
    )
    data = response.json()
    if not isinstance(data, list):
        raise RuntimeError(f"{table} returned an unexpected payload")


def insert_minimal(client: httpx.Client, supabase_url: str, table: str, row: dict[str, Any]) -> None:
    request(
        client,
        "POST",
        f"{supabase_url}/rest/v1/{table}",
        params={"on_conflict": next(iter(row.keys()))},
        json=[row],
        headers={"Prefer": "resolution=merge-duplicates,return=minimal"},
    )


def delete_where(client: httpx.Client, supabase_url: str, table: str, column: str, value: str) -> None:
    request(
        client,
        "DELETE",
        f"{supabase_url}/rest/v1/{table}",
        params={column: f"eq.{value}"},
        ok={200, 204},
    )


def main() -> None:
    load_env_file()
    supabase_url = os.getenv("SUPABASE_URL", "").rstrip("/")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not service_key:
        raise SystemExit("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this check.")

    now = datetime.now(UTC)
    suffix = now.strftime("%Y%m%d%H%M%S")
    user_id = f"db_verify_user_{suffix}"
    event_id = f"evt_db_verify_{suffix}"

    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
    }
    with httpx.Client(timeout=20, headers=headers) as client:
        for table in REQUIRED_TABLES:
            require_rows(client, supabase_url, table)

        insert_minimal(
            client,
            supabase_url,
            "line_users",
            {
                "user_id": user_id,
                "line_display_name": "DB Verify User",
                "segment": "db_check",
            },
        )
        insert_minimal(
            client,
            supabase_url,
            "events",
            {
                "event_id": event_id,
                "temple_id": TEMPLE_ID,
                "title": "DB verification event",
                "category": "system_check",
                "source_type": "system_check",
                "event_date": (now + timedelta(days=7)).date().isoformat(),
                "start_time": "10:00",
                "end_time": "11:00",
                "location": "Main hall",
                "address": "Taichung",
                "summary": "Temporary event for database write verification.",
                "requires_registration": True,
                "capacity": 2,
                "registered_count": 0,
                "status": "open",
                "registration_fields": ["name", "party_size"],
                "demo_note": "Temporary row. Safe to delete.",
            },
        )
        request(
            client,
            "POST",
            f"{supabase_url}/rest/v1/rpc/register_for_event",
            json={
                "p_event_id": event_id,
                "p_user_id": user_id,
                "p_contact_name": "DB Verify User",
                "p_phone": None,
                "p_party_size": 1,
                "p_reminder_opt_in": False,
                "p_note": "database verification",
            },
        )
        request(
            client,
            "POST",
            f"{supabase_url}/rest/v1/messages",
            json={
                "user_id": user_id,
                "channel": "system_check",
                "user_text": "database verification",
                "intent": "system_check",
                "ai_reply": "ok",
                "source_refs": [],
                "demo_notice": "temporary verification row",
            },
            headers={"Prefer": "return=minimal"},
        )
        delete_where(client, supabase_url, "messages", "user_id", user_id)
        delete_where(client, supabase_url, "events", "event_id", event_id)
        delete_where(client, supabase_url, "line_users", "user_id", user_id)

    print("Database verification OK.")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Database verification failed: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc
