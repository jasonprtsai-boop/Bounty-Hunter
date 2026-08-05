from __future__ import annotations

import json
import os
from pathlib import Path

import httpx


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DATA = ROOT.parent / "data" / "temple-ai-os-demo"


def load_json(name: str):
    return json.loads((SOURCE_DATA / name).read_text(encoding="utf-8"))


def main() -> None:
    supabase_url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    events = load_json("demo_events.json")
    users = load_json("demo_users.json")
    registrations = load_json("demo_registrations.json")
    dashboard = load_json("demo_dashboard_snapshot.json")

    print(f"events={len(events)} users={len(users)} registrations={len(registrations)}")
    if not supabase_url or not service_key:
        print("Dry run only. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to insert data.")
        return

    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }
    with httpx.Client(timeout=20, headers=headers) as client:
        response = client.post(f"{supabase_url}/rest/v1/line_users", json=users)
        response.raise_for_status()
        response = client.post(f"{supabase_url}/rest/v1/events", json=events)
        response.raise_for_status()
        response = client.post(f"{supabase_url}/rest/v1/event_registrations", json=registrations)
        response.raise_for_status()
        response = client.post(f"{supabase_url}/rest/v1/dashboard_snapshots", json=[dashboard])
        response.raise_for_status()
    print("Seed complete.")


if __name__ == "__main__":
    main()

