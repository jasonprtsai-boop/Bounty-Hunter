from __future__ import annotations

import json
import os
from pathlib import Path

import httpx


ROOT = Path(__file__).resolve().parents[1]
IMAGE_PATH = ROOT / "assets" / "rich-menu" / "main-2500x1686.png"


def rich_menu_payload(frontend_base_url: str) -> dict:
    base = frontend_base_url.rstrip("/")
    return {
        "size": {"width": 2500, "height": 1686},
        "selected": True,
        "name": "Temple AI OS 主選單",
        "chatBarText": "Temple AI OS",
        "areas": [
            {"bounds": {"x": 0, "y": 260, "width": 833, "height": 713}, "action": {"type": "message", "label": "AI 助手", "text": "我第一次來萬春宮，怎麼參拜？"}},
            {"bounds": {"x": 833, "y": 260, "width": 834, "height": 713}, "action": {"type": "uri", "label": "活動中心", "uri": f"{base}/events"}},
            {"bounds": {"x": 1667, "y": 260, "width": 833, "height": 713}, "action": {"type": "uri", "label": "文化抽籤", "uri": f"{base}/fortune"}},
            {"bounds": {"x": 0, "y": 973, "width": 833, "height": 713}, "action": {"type": "uri", "label": "宮廟導覽", "uri": f"{base}/tour/main-hall"}},
            {"bounds": {"x": 833, "y": 973, "width": 834, "height": 713}, "action": {"type": "uri", "label": "貼圖小舖", "uri": f"{base}/stickers"}},
            {"bounds": {"x": 1667, "y": 973, "width": 833, "height": 713}, "action": {"type": "uri", "label": "客服中心", "uri": f"{base}/support"}},
        ],
    }


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
