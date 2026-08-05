import httpx

from app.core.config import get_settings
from app.schemas.common import LiffSession


async def verify_liff_id_token(id_token: str) -> LiffSession:
    settings = get_settings()
    if settings.demo_mode and (id_token == "demo" or not settings.line_login_channel_id):
        return LiffSession(
            user_id="demo_u001",
            display_name="小安",
            picture_url=None,
            verified=True,
            demo_mode=True,
        )

    if not settings.line_login_channel_id:
        raise ValueError("LINE_LOGIN_CHANNEL_ID is not configured")

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(
            "https://api.line.me/oauth2/v2.1/verify",
            data={"id_token": id_token, "client_id": settings.line_login_channel_id},
        )
        response.raise_for_status()
        payload = response.json()

    return LiffSession(
        user_id=payload["sub"],
        display_name=payload.get("name", "LINE 使用者"),
        picture_url=payload.get("picture"),
        verified=True,
        demo_mode=False,
    )

