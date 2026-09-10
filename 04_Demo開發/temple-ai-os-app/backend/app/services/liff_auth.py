import httpx

from app.core.config import get_settings
from app.schemas.common import LiffSession


def _allows_demo_identity() -> bool:
    settings = get_settings()
    app_env = settings.app_env.strip().lower()
    return settings.demo_mode and app_env not in {"production", "prod"}


async def verify_liff_id_token(id_token: str) -> LiffSession:
    settings = get_settings()
    token = id_token.strip()
    if not token:
        raise ValueError("missing_liff_token")

    if _allows_demo_identity() and (token == "demo" or not settings.line_login_channel_id):
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
            data={"id_token": token, "client_id": settings.line_login_channel_id},
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


async def resolve_liff_user_id(id_token: str | None, fallback_user_id: str) -> str:
    token = (id_token or "").strip()
    if not token:
        if _allows_demo_identity():
            return fallback_user_id.strip() or "demo_u001"
        raise ValueError("missing_liff_token")
    session = await verify_liff_id_token(token)
    return session.user_id
