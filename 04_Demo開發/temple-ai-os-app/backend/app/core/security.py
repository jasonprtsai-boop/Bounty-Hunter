import base64
from dataclasses import dataclass
import hashlib
import hmac
from typing import Annotated

from fastapi import Header, HTTPException, status

from app.core.config import Settings, get_settings


DEFAULT_ADMIN_TOKEN = "temple-ai-os-admin-demo"


@dataclass(frozen=True)
class AdminPrincipal:
    actor: str


def verify_line_signature(body: bytes, signature: str | None, channel_secret: str | None) -> bool:
    if not channel_secret:
        return False
    if not signature:
        return False
    digest = hmac.new(channel_secret.encode("utf-8"), body, hashlib.sha256).digest()
    expected = base64.b64encode(digest).decode("utf-8")
    return hmac.compare_digest(expected, signature)


def resolve_admin_principal(
    authorization: str | None,
    settings: Settings | None = None,
) -> AdminPrincipal:
    settings = settings or get_settings()
    admin_token_map = settings.admin_token_map
    if (
        settings.app_env == "production"
        and not admin_token_map
        and settings.admin_demo_token == DEFAULT_ADMIN_TOKEN
    ):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="admin_token_not_configured",
        )
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1].strip()
    for actor, expected_token in admin_token_map.items():
        if hmac.compare_digest(token, expected_token):
            return AdminPrincipal(actor=actor)
    if not admin_token_map and hmac.compare_digest(token, settings.admin_demo_token):
        return AdminPrincipal(actor="admin")
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid admin token")


def require_admin_token(
    authorization: Annotated[str | None, Header(alias="Authorization")] = None,
) -> AdminPrincipal:
    return resolve_admin_principal(authorization)
