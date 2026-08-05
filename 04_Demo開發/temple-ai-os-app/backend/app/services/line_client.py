from typing import Any

import httpx

from app.core.config import get_settings


class LineClient:
    def __init__(self) -> None:
        self.settings = get_settings()

    @property
    def enabled(self) -> bool:
        return bool(self.settings.line_channel_access_token)

    async def reply_message(self, reply_token: str, messages: list[dict[str, Any]]) -> dict[str, Any]:
        if not self.enabled:
            return {"sent": False, "reason": "LINE_CHANNEL_ACCESS_TOKEN is not configured"}
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                "https://api.line.me/v2/bot/message/reply",
                headers={
                    "Authorization": f"Bearer {self.settings.line_channel_access_token}",
                    "Content-Type": "application/json",
                },
                json={"replyToken": reply_token, "messages": messages},
            )
            response.raise_for_status()
            return {"sent": True}

    async def push_message(self, user_id: str, messages: list[dict[str, Any]]) -> dict[str, Any]:
        if not self.enabled:
            return {"sent": False, "reason": "LINE_CHANNEL_ACCESS_TOKEN is not configured"}
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                "https://api.line.me/v2/bot/message/push",
                headers={
                    "Authorization": f"Bearer {self.settings.line_channel_access_token}",
                    "Content-Type": "application/json",
                },
                json={"to": user_id, "messages": messages},
            )
            response.raise_for_status()
            return {"sent": True}


def text_message(text: str) -> dict[str, str]:
    return {"type": "text", "text": text[:5000]}

