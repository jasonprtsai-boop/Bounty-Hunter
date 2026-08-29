import base64
import hashlib
import hmac

import pytest
from fastapi import HTTPException

from app.core.config import Settings, get_settings
from app.core.security import (
    authenticate_admin_credentials,
    create_admin_session,
    require_admin_token,
    resolve_admin_principal,
    verify_line_signature,
)


def test_verify_line_signature_accepts_valid_signature() -> None:
    body = b'{"events":[]}'
    secret = "secret"
    signature = base64.b64encode(hmac.new(secret.encode(), body, hashlib.sha256).digest()).decode()
    assert verify_line_signature(body, signature, secret)


def test_verify_line_signature_rejects_invalid_signature() -> None:
    assert not verify_line_signature(b"{}", "bad", "secret")


def test_default_admin_token_is_rejected_in_production(monkeypatch: pytest.MonkeyPatch) -> None:
    get_settings.cache_clear()
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("ADMIN_DEMO_TOKEN", "temple-ai-os-admin-demo")
    monkeypatch.setenv("ADMIN_TOKENS", "")
    monkeypatch.setenv("ADMIN_ACCOUNTS", "")
    monkeypatch.setenv("ADMIN_USERNAME", "")
    monkeypatch.setenv("ADMIN_PASSWORD", "")

    with pytest.raises(HTTPException) as exc_info:
        require_admin_token("Bearer temple-ai-os-admin-demo")

    assert exc_info.value.status_code == 503
    assert exc_info.value.detail == "admin_token_not_configured"

    get_settings.cache_clear()


def test_named_admin_token_is_accepted_in_production(monkeypatch: pytest.MonkeyPatch) -> None:
    get_settings.cache_clear()
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("ADMIN_DEMO_TOKEN", "temple-ai-os-admin-demo")
    monkeypatch.setenv("ADMIN_TOKENS", "temple-staff:prod-secret,reviewer:review-secret")

    principal = resolve_admin_principal("Bearer review-secret")

    assert principal.actor == "reviewer"

    get_settings.cache_clear()


def test_admin_password_session_is_accepted_in_production(monkeypatch: pytest.MonkeyPatch) -> None:
    get_settings.cache_clear()
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("ADMIN_DEMO_TOKEN", "temple-ai-os-admin-demo")
    monkeypatch.setenv("ADMIN_TOKENS", "temple-staff:prod-secret")

    principal = authenticate_admin_credentials("temple-staff", "prod-secret")
    token, _ = create_admin_session(principal.actor)
    resolved = resolve_admin_principal(f"Bearer {token}")

    assert resolved.actor == "temple-staff"

    get_settings.cache_clear()


def test_settings_include_published_site_origins(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("ALLOWED_ORIGINS", "https://old.example.com")

    settings = Settings()

    assert "https://temple-ai-os-demo-20260828.jeremy40713.chatgpt.site" in settings.origins
    assert "https://temple-ai-os-admin-20260828.jeremy40713.chatgpt.site" in settings.origins


def test_default_admin_token_stays_rejected_when_password_login_is_configured(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    get_settings.cache_clear()
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("ADMIN_DEMO_TOKEN", "temple-ai-os-admin-demo")
    monkeypatch.setenv("ADMIN_ACCOUNTS", "temple-staff:prod-secret")

    with pytest.raises(HTTPException) as exc_info:
        resolve_admin_principal("Bearer temple-ai-os-admin-demo")

    assert exc_info.value.status_code == 403

    get_settings.cache_clear()
