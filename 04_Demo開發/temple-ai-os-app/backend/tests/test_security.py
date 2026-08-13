import base64
import hashlib
import hmac

import pytest
from fastapi import HTTPException

from app.core.config import get_settings
from app.core.security import require_admin_token, resolve_admin_principal, verify_line_signature


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
