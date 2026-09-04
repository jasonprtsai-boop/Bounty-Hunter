from typing import Any

import httpx

from app.core.config import get_settings


RICH_MENU_AREAS = [
    {"x": 86, "y": 310, "width": 1130, "height": 560},
    {"x": 1284, "y": 310, "width": 1130, "height": 560},
    {"x": 86, "y": 958, "width": 540, "height": 560},
    {"x": 682, "y": 958, "width": 540, "height": 560},
    {"x": 1278, "y": 958, "width": 540, "height": 560},
    {"x": 1874, "y": 958, "width": 540, "height": 560},
]


def build_main_menu_payload(frontend_base_url: str) -> dict[str, Any]:
    base = frontend_base_url.rstrip("/")
    return {
        "size": {"width": 2500, "height": 1686},
        "selected": True,
        "name": "萬春宮服務主選單",
        "chatBarText": "服務選單",
        "areas": [
            {
                "bounds": RICH_MENU_AREAS[0],
                "action": {
                    "type": "message",
                    "label": "詢問參拜方式",
                    "text": "我第一次來萬春宮，想知道參拜流程與交通資訊。",
                },
            },
            {
                "bounds": RICH_MENU_AREAS[1],
                "action": {"type": "uri", "label": "查看活動報名", "uri": f"{base}/events"},
            },
            {
                "bounds": RICH_MENU_AREAS[2],
                "action": {"type": "uri", "label": "抽文化籤", "uri": f"{base}/fortune"},
            },
            {
                "bounds": RICH_MENU_AREAS[3],
                "action": {"type": "uri", "label": "看主殿導覽", "uri": f"{base}/tour/main-hall"},
            },
            {
                "bounds": RICH_MENU_AREAS[4],
                "action": {"type": "uri", "label": "查報名進度", "uri": f"{base}/events?lookup=1"},
            },
            {
                "bounds": RICH_MENU_AREAS[5],
                "action": {"type": "uri", "label": "聯絡客服", "uri": f"{base}/support"},
            },
        ],
    }


class RichMenuService:
    def __init__(self) -> None:
        self.settings = get_settings()

    def main_menu_payload(self) -> dict[str, Any]:
        return build_main_menu_payload(self.settings.frontend_base_url)

    async def publish_main_menu(self) -> dict[str, object]:
        if not self.settings.line_channel_access_token:
            return {"published": False, "reason": "LINE_CHANNEL_ACCESS_TOKEN is not configured"}

        image_path = self.settings.project_root / "assets" / "rich-menu" / "main-2500x1686.png"
        if not image_path.exists():
            return {"published": False, "reason": f"missing image: {image_path.name}"}

        rich_menu_id = await self._create_rich_menu()
        await self._upload_rich_menu_image(rich_menu_id, image_path.read_bytes())
        await self._set_default_rich_menu(rich_menu_id)
        return {"published": True, "rich_menu_id": rich_menu_id}

    async def _create_rich_menu(self) -> str:
        response = await self._line_request(
            "POST",
            "https://api.line.me/v2/bot/richmenu",
            json=self.main_menu_payload(),
            content_type="application/json",
        )
        rich_menu_id = response.json().get("richMenuId")
        if not rich_menu_id:
            raise httpx.HTTPError("LINE did not return richMenuId")
        return str(rich_menu_id)

    async def _upload_rich_menu_image(self, rich_menu_id: str, image_bytes: bytes) -> None:
        await self._line_request(
            "POST",
            f"https://api-data.line.me/v2/bot/richmenu/{rich_menu_id}/content",
            content=image_bytes,
            content_type="image/png",
        )

    async def _set_default_rich_menu(self, rich_menu_id: str) -> None:
        await self._line_request(
            "POST",
            f"https://api.line.me/v2/bot/user/all/richmenu/{rich_menu_id}",
            content_type=None,
        )

    async def _line_request(
        self,
        method: str,
        url: str,
        *,
        json: dict[str, Any] | None = None,
        content: bytes | None = None,
        content_type: str | None,
    ) -> httpx.Response:
        headers = {"Authorization": f"Bearer {self.settings.line_channel_access_token}"}
        if content_type:
            headers["Content-Type"] = content_type
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.request(method, url, headers=headers, json=json, content=content)
        response.raise_for_status()
        return response
