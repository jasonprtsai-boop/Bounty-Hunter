"""Read-only live checks and isolated fault injection for the system audit."""
import asyncio
import json
import os
import sys
import time
from pathlib import Path
from unittest.mock import AsyncMock, Mock, patch

import httpx

ROOT = Path(__file__).resolve().parents[2] / "04_Demo開發" / "temple-ai-os-app"
sys.path.insert(0, str(ROOT / "backend"))
OUT = Path(__file__).parent


def live_checks():
    bases = {
        "backend": "https://temple-ai-os-api.onrender.com",
        "public": "https://temple-ai-os-demo-20260828.jeremy40713.chatgpt.site",
        "admin": "https://temple-ai-os-admin-20260828.jeremy40713.chatgpt.site",
    }
    checks = []
    with httpx.Client(timeout=35, follow_redirects=True) as client:
        for surface, paths in {
            "backend": ["/health", "/api/events", "/api/deities", "/api/temple/profile", "/api/tour/spots/main-hall", "/api/admin/dashboard/summary", "/api/member/registrations", "/openapi.json"],
            "public": ["/", "/events", "/api/events", "/deities", "/fortune", "/support", "/privacy", "/terms", "/admin"],
            "admin": ["/admin", "/admin/settings", "/api/admin/auth/me"],
        }.items():
            for path in paths:
                started = time.perf_counter()
                row = {"surface": surface, "path": path}
                try:
                    response = client.get(bases[surface] + path)
                    row.update(status=response.status_code, seconds=round(time.perf_counter() - started, 3), final_url=str(response.url))
                    row["headers"] = {key: response.headers.get(key) for key in ["content-type", "cache-control", "content-security-policy", "x-frame-options", "x-content-type-options", "referrer-policy"]}
                    if "json" in response.headers.get("content-type", ""):
                        body = response.json()
                        data = body.get("data")
                        row["count"] = len(data) if isinstance(data, list) else None
                        if path == "/health":
                            row["data"] = data
                        if path == "/api/events" and isinstance(data, list):
                            row["events"] = [{k: x.get(k) for k in ["event_id", "date", "status", "requires_registration", "capacity", "registered_count"]} for x in data]
                        if path == "/openapi.json":
                            row["routes"] = {p: list(methods) for p, methods in body.get("paths", {}).items()}
                except Exception as exc:
                    row["error"] = type(exc).__name__
                checks.append(row)
                print(json.dumps(row, ensure_ascii=True), flush=True)
        for path, body in [
            ("/api/admin/auth/login", {"username": "audit-invalid-account", "password": "audit-invalid-password"}),
            ("/api/liff/session/verify", {"id_token": "demo"}),
        ]:
            response = client.post(bases["backend"] + path, json=body)
            row = {"surface": "backend", "path": path, "method": "POST", "status": response.status_code, "detail": response.json().get("detail")}
            checks.append(row)
            print(json.dumps(row), flush=True)
    (OUT / "live-results.json").write_text(json.dumps(checks, ensure_ascii=False, indent=2), encoding="utf-8")


async def isolated_probes():
    from app.core.config import Settings, get_settings
    from app.db import supabase
    from app.api.routes import events, line
    from app.core import security
    from app.schemas.common import ChatReply, RegistrationCreate, Registration, NotificationJob
    from app.services.notification_service import NotificationService

    results = {}
    local_settings = Settings(_env_file=None, app_env="local", demo_mode=True)
    production = Settings(_env_file=None, app_env="production", demo_mode=False, supabase_url="https://audit.invalid", supabase_service_role_key="audit-nonsecret")
    with patch.object(supabase, "get_settings", return_value=production), patch.object(supabase, "SupabaseRepository", side_effect=RuntimeError("injected_database_outage")), patch.object(supabase, "_repo", None):
        repo = supabase.get_repository()
        results["production_database_failure"] = {"repository": type(repo).__name__, "fallback_default": production.supabase_fallback_to_demo}

    with patch.object(supabase, "get_settings", return_value=local_settings):
        repo = supabase.LocalRepository()
    failing_line = Mock(reply_message=AsyncMock(side_effect=RuntimeError("injected_line_outage")))
    rag = Mock(answer=AsyncMock(return_value=ChatReply(intent="general", reply="audit", demo_notice="test")))
    payload = {"events": [{"webhookEventId": "audit-event-1", "type": "message", "message": {"type": "text", "text": "audit"}, "source": {"userId": "audit-user"}, "replyToken": "audit-placeholder"}]}
    with patch.object(line, "get_repository", return_value=repo), patch.object(line, "get_rag_service", return_value=rag), patch.object(line, "LineClient", return_value=failing_line):
        await line._process_line_webhook_events(payload)
        await line._process_line_webhook_events(payload)
        results["failed_webhook_redelivery"] = {"deliveries": 2, "reply_attempts": failing_line.reply_message.await_count, "marked_processed": "audit-event-1" in repo.processed_line_event_ids}

    event = next(x for x in repo.events if x.requires_registration and x.status in {"open", "published"})
    before = len(repo.registrations)
    with patch.object(events, "get_repository", return_value=repo), patch.object(events, "resolve_liff_user_id", new=AsyncMock(return_value="audit-registration-user")), patch.object(NotificationService, "send_registration_confirmation", new=AsyncMock(side_effect=RuntimeError("injected_push_failure"))):
        try:
            await events.create_registration(event.event_id, RegistrationCreate(user_id="audit-registration-user", contact_name="Audit", phone="0000000000", party_size=1), None)
            outcome = "success"
        except Exception as exc:
            outcome = type(exc).__name__
        results["registration_push_failure"] = {"handler_outcome": outcome, "registrations_added": len(repo.registrations) - before}

    original = Registration(registration_id="reg_audit", event_id=event.event_id, user_id="audit-owner", status="confirmed", party_size=1, reminder_opt_in=False, contact_name="Audit", phone="0000000000")
    repo.registrations.append(original)
    with patch.object(events, "get_repository", return_value=repo):
        result = await events.lookup_registrations(phone="0000000000", registration_id=None)
        results["anonymous_phone_lookup"] = {"records_returned": len(result.data), "authentication_required": False}

    job = NotificationJob(job_id="audit-job", job_type="custom", target_user_id="audit-user", status="ready", scheduled_at="2026-01-01T00:00:00Z", payload={"text": "audit"})
    isolated_repo = Mock(list_notification_jobs=Mock(return_value=[job]), update_notification_job=Mock())
    service = NotificationService(isolated_repo)
    async def fake_send(_job):
        await asyncio.sleep(0)
        return {"sent": True}
    with patch.object(service, "send_notification_job", new=AsyncMock(side_effect=fake_send)) as send:
        await asyncio.gather(service.send_due_notification_jobs(), service.send_due_notification_jobs())
        results["notification_concurrent_dispatch"] = {"jobs": 1, "dispatchers": 2, "send_calls": send.await_count}

    prod_auth = Settings(_env_file=None, app_env="production", demo_mode=False, admin_username="owner", admin_password="audit-password", admin_session_secret="")
    default_auth = Settings(_env_file=None)
    results["missing_session_secret"] = {"username_password_configured": bool(prod_auth.admin_account_map), "uses_known_default_secret": security._admin_session_secret(prod_auth) == security._admin_session_secret(default_auth)}
    with patch.object(supabase, "get_repository", side_effect=RuntimeError("injected_database_outage")):
        principal = security._refresh_repository_principal(security.AdminPrincipal("revoked-audit-user", "owner"), production)
        results["account_revocation_database_failure"] = {"accepted_actor": principal.actor, "role": principal.role}
    (OUT / "isolated-results.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(results, indent=2), flush=True)


if __name__ == "__main__":
    if "--live" in sys.argv:
        live_checks()
    else:
        asyncio.run(isolated_probes())
