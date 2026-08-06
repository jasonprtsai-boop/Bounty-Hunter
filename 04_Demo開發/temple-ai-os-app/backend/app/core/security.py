import base64
import hashlib
import hmac
from typing import Annotated

from fastapi import Header, HTTPException, status

from app.core.config import get_settings


DEFAULT_ADMIN_TOKEN = "temple-ai-os-admin-demo"


def verify_line_signature(body: bytes, signature: str | None, channel_secret: str | None) -> bool:
    if not channel_secret:
        return False
    if not signature:
        return False
    digest = hmac.new(channel_secret.encode("utf-8"), body, hashlib.sha256).digest()
    expected = base64.b64encode(digest).decode("utf-8")
    return hmac.compare_digest(expected, signature)


def require_admin_token(
    authorization: Annotated[str | None, Header(alias="Authorization")] = None,
) -> None:
    settings = get_settings()
    if settings.app_env == "production" and settings.admin_demo_token == DEFAULT_ADMIN_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="admin_token_not_configured",
        )
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1].strip()
    if token != settings.admin_demo_token:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid admin token")
