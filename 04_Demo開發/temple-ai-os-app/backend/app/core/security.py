import base64
import binascii
from dataclasses import dataclass
import hashlib
import hmac
import json
import time
from typing import Annotated

from fastapi import Header, HTTPException, status

from app.core.admin_identity import normalize_admin_login_id
from app.core.config import Settings, get_settings


DEFAULT_ADMIN_TOKEN = "temple-ai-os-admin-demo"
ADMIN_SESSION_PREFIX = "taos_admin_session."


@dataclass(frozen=True)
class AdminPrincipal:
    actor: str
    role: str = "owner"
    display_name: str | None = None


def _urlsafe_b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _urlsafe_b64decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(f"{data}{padding}".encode("ascii"))


def verify_line_signature(body: bytes, signature: str | None, channel_secret: str | None) -> bool:
    if not channel_secret:
        return False
    if not signature:
        return False
    digest = hmac.new(channel_secret.encode("utf-8"), body, hashlib.sha256).digest()
    expected = base64.b64encode(digest).decode("utf-8")
    return hmac.compare_digest(expected, signature)


def _configured_admin_credentials(settings: Settings) -> dict[str, str]:
    credentials = settings.admin_token_map.copy()
    credentials.update(settings.admin_account_map)
    if settings.app_env != "production" and not credentials:
        credentials["admin"] = settings.admin_demo_token
    return credentials


def _repository_admin_principal(username: str, password: str) -> AdminPrincipal | None:
    try:
        from app.db.supabase import get_repository

        repository = get_repository()
        authenticate = getattr(repository, "authenticate_admin_account", None)
        if not authenticate:
            return None
        account = authenticate(username, password)
    except Exception:
        return None
    if not account:
        return None
    return AdminPrincipal(
        actor=account.username,
        role=account.role,
        display_name=account.display_name,
    )


def _refresh_repository_principal(principal: AdminPrincipal) -> AdminPrincipal:
    try:
        from app.db.supabase import get_repository

        repository = get_repository()
        get_account = getattr(repository, "get_admin_account", None)
        if not get_account:
            return principal
        account = get_account(principal.actor)
    except Exception:
        return principal
    if not account:
        return principal
    if account.status != "active":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin account disabled")
    return AdminPrincipal(
        actor=account.username,
        role=account.role,
        display_name=account.display_name,
    )


def _admin_session_secret(settings: Settings) -> bytes:
    material = (
        settings.admin_session_secret.strip()
        or settings.admin_accounts.strip()
        or settings.admin_tokens.strip()
        or settings.admin_demo_token.strip()
    )
    return hashlib.sha256(material.encode("utf-8")).digest()


def authenticate_admin_credentials(
    username: str,
    password: str,
    settings: Settings | None = None,
) -> AdminPrincipal:
    settings = settings or get_settings()
    repository_principal = _repository_admin_principal(username, password)
    if repository_principal:
        return repository_principal

    credentials = _configured_admin_credentials(settings)
    if settings.app_env == "production" and not credentials:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="admin_password_not_configured",
        )

    normalized_username = normalize_admin_login_id(username)
    normalized_password = password.strip()
    expected_password = credentials.get(normalized_username)
    if expected_password and hmac.compare_digest(normalized_password, expected_password):
        return AdminPrincipal(actor=normalized_username, role="owner", display_name=normalized_username)
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid admin credentials")


def create_admin_session(
    actor: str,
    role: str = "owner",
    display_name: str | None = None,
    settings: Settings | None = None,
) -> tuple[str, int]:
    settings = settings or get_settings()
    issued_at = int(time.time())
    expires_at = issued_at + settings.admin_session_ttl_seconds
    payload = {
        "actor": normalize_admin_login_id(actor) or "admin",
        "role": role if role in {"owner", "manager", "staff"} else "manager",
        "display_name": (display_name or actor).strip()[:80] or normalize_admin_login_id(actor) or "admin",
        "iat": issued_at,
        "exp": expires_at,
    }
    payload_b64 = _urlsafe_b64encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signature = hmac.new(_admin_session_secret(settings), payload_b64.encode("ascii"), hashlib.sha256)
    return f"{ADMIN_SESSION_PREFIX}{payload_b64}.{_urlsafe_b64encode(signature.digest())}", expires_at


def _resolve_admin_session(token: str, settings: Settings) -> AdminPrincipal | None:
    if not token.startswith(ADMIN_SESSION_PREFIX):
        return None

    session = token.removeprefix(ADMIN_SESSION_PREFIX)
    payload_b64, separator, signature_b64 = session.partition(".")
    if not separator or not payload_b64 or not signature_b64:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid admin session")

    expected_signature = hmac.new(
        _admin_session_secret(settings),
        payload_b64.encode("ascii"),
        hashlib.sha256,
    ).digest()
    try:
        supplied_signature = _urlsafe_b64decode(signature_b64)
        payload = json.loads(_urlsafe_b64decode(payload_b64))
    except (binascii.Error, ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid admin session") from exc

    if not hmac.compare_digest(supplied_signature, expected_signature):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid admin session")
    if int(payload.get("exp") or 0) < int(time.time()):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin session expired")
    actor = normalize_admin_login_id(str(payload.get("actor") or "admin")) or "admin"
    role = str(payload.get("role") or "owner")
    if role not in {"owner", "manager", "staff"}:
        role = "manager"
    display_name = str(payload.get("display_name") or actor).strip()[:80] or actor
    return _refresh_repository_principal(
        AdminPrincipal(actor=actor, role=role, display_name=display_name)
    )


def resolve_admin_principal(
    authorization: str | None,
    settings: Settings | None = None,
) -> AdminPrincipal:
    settings = settings or get_settings()
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1].strip()

    session_principal = _resolve_admin_session(token, settings)
    if session_principal:
        return session_principal

    admin_token_map = settings.admin_token_map
    if (
        settings.app_env == "production"
        and not admin_token_map
        and not _configured_admin_credentials(settings)
        and settings.admin_demo_token == DEFAULT_ADMIN_TOKEN
    ):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="admin_token_not_configured",
        )
    for actor, expected_token in admin_token_map.items():
        if hmac.compare_digest(token, expected_token):
            return AdminPrincipal(actor=actor, role="owner", display_name=actor)
    if (
        not admin_token_map
        and not (settings.app_env == "production" and settings.admin_demo_token == DEFAULT_ADMIN_TOKEN)
        and hmac.compare_digest(token, settings.admin_demo_token)
    ):
        return AdminPrincipal(actor="admin", role="owner", display_name="系統管理員")
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid admin token")


def require_admin_token(
    authorization: Annotated[str | None, Header(alias="Authorization")] = None,
) -> AdminPrincipal:
    return resolve_admin_principal(authorization)
