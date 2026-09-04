from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import httpx


ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "backend"
sys.path.insert(0, str(BACKEND))

from app.services.rich_menu_service import build_main_menu_payload  # noqa: E402

IMAGE_PATH = ROOT / "assets" / "rich-menu" / "main-2500x1686.png"


def rich_menu_payload(frontend_base_url: str) -> dict:
    return build_main_menu_payload(frontend_base_url)


def main() -> None:
    token = os.getenv("LINE_CHANNEL_ACCESS_TOKEN")
    frontend_base_url = os.getenv("FRONTEND_BASE_URL", "https://example.com")
    payload = rich_menu_payload(frontend_base_url)
    if not token:
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        print("Dry run only. Set LINE_CHANNEL_ACCESS_TOKEN to publish.")
        return
    if not IMAGE_PATH.exists():
        raise SystemExit(f"Missing image: {IMAGE_PATH}. Run generate_assets.py first.")

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    with httpx.Client(timeout=30) as client:
        response = client.post("https://api.line.me/v2/bot/richmenu", headers=headers, json=payload)
        response.raise_for_status()
        rich_menu_id = response.json()["richMenuId"]
        image_headers = {"Authorization": f"Bearer {token}", "Content-Type": "image/png"}
        response = client.post(
            f"https://api-data.line.me/v2/bot/richmenu/{rich_menu_id}/content",
            headers=image_headers,
            content=IMAGE_PATH.read_bytes(),
        )
        response.raise_for_status()
        response = client.post(
            f"https://api.line.me/v2/bot/user/all/richmenu/{rich_menu_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        response.raise_for_status()
    print(f"Published rich menu: {rich_menu_id}")


if __name__ == "__main__":
    main()
