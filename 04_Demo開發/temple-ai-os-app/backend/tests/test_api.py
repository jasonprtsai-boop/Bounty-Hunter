import base64
import hashlib
import hmac
import json

from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.db.supabase import get_repository
from app.main import app
from app.services.rich_menu_service import RichMenuService


client = TestClient(app)
ADMIN_HEADERS = {
    "Authorization": "Bearer temple-ai-os-admin-demo",
    "X-Admin-Actor": "pytest-admin",
}


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "ok"


def test_line_webhook_acknowledges_valid_empty_event_payload(monkeypatch) -> None:
    get_settings.cache_clear()
    monkeypatch.setenv("LINE_CHANNEL_SECRET", "test-secret")

    body = json.dumps({"destination": "Utest", "events": []}, separators=(",", ":")).encode(
        "utf-8"
    )
    signature = base64.b64encode(
        hmac.new(b"test-secret", body, hashlib.sha256).digest()
    ).decode("utf-8")

    response = client.post(
        "/api/line/webhook",
        content=body,
        headers={"Content-Type": "application/json", "X-Line-Signature": signature},
    )

    assert response.status_code == 200
    assert response.json()["data"] == {"accepted": 0}

    get_settings.cache_clear()


def test_events_are_loaded_from_demo_data() -> None:
    response = client.get("/api/events")
    assert response.status_code == 200
    events = response.json()["data"]
    assert len(events) >= 5
    assert any(event["event_id"] == "evt_20260827_zhongyuan" for event in events)


def test_create_demo_registration() -> None:
    response = client.post(
        "/api/events/evt_demo_worship_intro/registrations",
        json={
            "user_id": "demo_u001",
            "contact_name": "小安",
            "party_size": 1,
            "reminder_opt_in": True,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["data"]["event_id"] == "evt_demo_worship_intro"
    assert payload["meta"]["demo_notice"]


def test_liff_token_overrides_client_user_id_for_registration() -> None:
    response = client.post(
        "/api/events/evt_demo_worship_intro/registrations",
        headers={"X-LIFF-ID-Token": "demo"},
        json={
            "user_id": "spoofed_user",
            "contact_name": "小安",
            "party_size": 1,
            "reminder_opt_in": True,
        },
    )
    assert response.status_code == 200
    assert response.json()["data"]["user_id"] == "demo_u001"


def test_registration_capacity_exceeded_returns_waitlist_notification_meta() -> None:
    event_id = "evt_test_full_capacity"
    delete_existing = client.delete(f"/api/admin/events/{event_id}", headers=ADMIN_HEADERS)
    assert delete_existing.status_code in {200, 404}

    create_event = client.post(
        "/api/admin/events",
        headers=ADMIN_HEADERS,
        json={
            "event_id": event_id,
            "title": "額滿測試活動",
            "category": "測試",
            "source_type": "test",
            "date": "2026-10-01",
            "start_time": "10:00",
            "end_time": "11:00",
            "location": "萬春宮",
            "address": "臺中市中區成功路212號",
            "summary": "用於驗證名額已滿通知。",
            "requires_registration": True,
            "capacity": 1,
            "registered_count": 0,
            "status": "open",
            "registration_fields": ["姓名", "參加人數"],
            "demo_note": "測試活動。",
        },
    )
    assert create_event.status_code == 201

    response = client.post(
        f"/api/events/{event_id}/registrations",
        json={
            "user_id": "demo_u001",
            "contact_name": "小安",
            "party_size": 2,
            "reminder_opt_in": True,
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"]["reason"] == "event_capacity_exceeded"
    assert response.json()["detail"]["notification"]["message_type"] == "registration_waitlist"

    delete_response = client.delete(f"/api/admin/events/{event_id}", headers=ADMIN_HEADERS)
    assert delete_response.status_code == 200


def test_chat_safety_boundary() -> None:
    response = client.post(
        "/api/chat",
        json={"message": "我的投資財運會不會成功？", "user_id": "demo_u001", "source": "test"},
    )
    assert response.status_code == 200
    assert response.json()["data"]["intent"] == "safety_boundary"


def test_event_query_returns_flex_with_hero_image() -> None:
    response = client.post(
        "/api/chat",
        json={"message": "近期有什麼活動？", "user_id": "demo_flex_user", "source": "test"},
    )
    assert response.status_code == 200
    flex = response.json()["data"]["flex_message"]
    first_bubble = flex["contents"]["contents"][0]
    assert first_bubble["hero"]["type"] == "image"
    assert first_bubble["hero"]["url"].endswith("/assets/flex/event-card.png")


def test_chat_retrieves_relevant_knowledge_for_location() -> None:
    response = client.post(
        "/api/chat",
        json={"message": "萬春宮在哪裡？", "user_id": "demo_location_user", "source": "test"},
    )
    assert response.status_code == 200
    payload = response.json()["data"]
    assert payload["intent"] == "temple_location"
    assert "成功路212號" in payload["reply"]
    assert any(source["source"] == "01_基本問答.md" for source in payload["sources"])


def test_chat_unknown_question_uses_fixed_safe_fallback() -> None:
    response = client.post(
        "/api/chat",
        json={"message": "請問今天附近晚餐推薦？", "user_id": "demo_unknown_user", "source": "test"},
    )
    assert response.status_code == 200
    payload = response.json()["data"]
    assert payload["intent"] == "general"
    assert "目前我只能回答萬春宮公開資料" in payload["reply"]
    assert payload["sources"][0]["source"] == "固定安全回覆規則"


def test_chat_rejects_overlong_message() -> None:
    response = client.post(
        "/api/chat",
        json={"message": "廟" * 501, "user_id": "demo_u001", "source": "test"},
    )
    assert response.status_code == 422


def test_chat_rate_limit() -> None:
    from app.api.routes.chat import chat_rate_limiter

    chat_rate_limiter.reset()
    try:
        for _ in range(12):
            response = client.post(
                "/api/chat",
                json={"message": "地址在哪裡？", "user_id": "demo_rate_limit", "source": "test"},
            )
            assert response.status_code == 200

        blocked = client.post(
            "/api/chat",
            json={"message": "地址在哪裡？", "user_id": "demo_rate_limit", "source": "test"},
        )
        assert blocked.status_code == 429
        assert blocked.json()["detail"] == "chat_rate_limited"
    finally:
        chat_rate_limiter.reset()


def test_liff_token_overrides_client_user_id_for_support_ticket() -> None:
    response = client.post(
        "/api/support/tickets",
        headers={"X-LIFF-ID-Token": "demo"},
        json={
            "user_id": "spoofed_user",
            "category": "general",
            "subject": "LIFF 身分測試",
            "message": "確認後端不採信前端 userId。",
        },
    )
    assert response.status_code == 200
    assert response.json()["data"]["user_id"] == "demo_u001"


def test_admin_events_require_token() -> None:
    response = client.get("/api/admin/events")
    assert response.status_code == 401


def test_admin_login_returns_session_for_named_credentials(monkeypatch) -> None:
    get_settings.cache_clear()
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("ADMIN_DEMO_TOKEN", "temple-ai-os-admin-demo")
    monkeypatch.setenv("ADMIN_TOKENS", "temple-staff:prod-secret")

    response = client.post(
        "/api/admin/auth/login",
        json={"username": "temple-staff", "password": "prod-secret"},
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["actor"] == "temple-staff"
    assert data["access_token"].startswith("taos_admin_session.")

    protected = client.get(
        "/api/admin/dashboard/summary",
        headers={"Authorization": f"Bearer {data['access_token']}"},
    )
    assert protected.status_code == 200

    get_settings.cache_clear()


def test_admin_event_crud() -> None:
    event_id = "evt_test_admin_crud"
    create_response = client.post(
        "/api/admin/events",
        headers=ADMIN_HEADERS,
        json={
            "event_id": event_id,
            "title": "後台測試活動",
            "category": "測試",
            "date": "2026-10-01",
            "start_time": "10:00",
            "end_time": "11:00",
            "location": "萬春宮",
            "address": "臺中市中區成功路212號",
            "summary": "用於驗證後台活動 CRUD。",
            "requires_registration": True,
            "capacity": 12,
            "registration_fields": ["姓名", "參加人數"],
        },
    )
    assert create_response.status_code == 201
    assert create_response.json()["data"]["event_id"] == event_id

    update_response = client.put(
        f"/api/admin/events/{event_id}",
        headers=ADMIN_HEADERS,
        json={"status": "open", "capacity": 20},
    )
    assert update_response.status_code == 200
    assert update_response.json()["data"]["status"] == "open"
    assert update_response.json()["data"]["capacity"] == 20

    delete_response = client.delete(f"/api/admin/events/{event_id}", headers=ADMIN_HEADERS)
    assert delete_response.status_code == 200
    assert delete_response.json()["data"]["deleted"] is True


def test_admin_event_capacity_cannot_drop_below_registrations() -> None:
    response = client.put(
        "/api/admin/events/evt_20260827_zhongyuan",
        headers=ADMIN_HEADERS,
        json={"capacity": 1},
    )
    assert response.status_code == 422
    assert response.json()["detail"] == "event_capacity_below_registrations"


def test_admin_mutation_records_audit_log() -> None:
    repo = get_repository()
    before_count = len(repo.audit_logs) if hasattr(repo, "audit_logs") else 0
    event_id = "evt_test_audit_log"
    create_response = client.post(
        "/api/admin/events",
        headers={**ADMIN_HEADERS, "X-Admin-Actor": "audit-admin"},
        json={
            "event_id": event_id,
            "title": "稽核測試活動",
            "category": "測試",
            "date": "2026-10-02",
            "start_time": "10:00",
            "end_time": "11:00",
            "location": "萬春宮",
            "address": "臺中市中區成功路212號",
            "summary": "用於驗證後台操作紀錄。",
            "requires_registration": False,
            "registration_fields": [],
        },
    )
    assert create_response.status_code == 201

    delete_response = client.delete(f"/api/admin/events/{event_id}", headers=ADMIN_HEADERS)
    assert delete_response.status_code == 200
    assert hasattr(repo, "audit_logs")
    assert len(repo.audit_logs) >= before_count + 2
    assert any(
        item["actor_id"] == "audit-admin"
        and item["action"] == "POST"
        and item["target_type"] == "/api/admin/events"
        for item in repo.audit_logs
    )


def test_admin_rich_menu_publish(monkeypatch) -> None:
    async def fake_publish(self) -> dict[str, object]:
        return {"published": True, "rich_menu_id": "richmenu-test"}

    monkeypatch.setattr(RichMenuService, "publish_main_menu", fake_publish)
    response = client.post("/api/admin/rich-menu/publish", headers=ADMIN_HEADERS)
    assert response.status_code == 200
    assert response.json()["data"] == {"published": True, "rich_menu_id": "richmenu-test"}


def test_rich_menu_payload_links_to_sticker_shop() -> None:
    payload = RichMenuService().main_menu_payload()
    actions = [area["action"] for area in payload["areas"]]

    assert any(
        action["type"] == "uri"
        and action["label"] == "貼圖小舖"
        and action["uri"].endswith("/stickers")
        for action in actions
    )


def test_rich_menu_payload_uses_current_image_card_bounds() -> None:
    payload = RichMenuService().main_menu_payload()
    bounds = [area["bounds"] for area in payload["areas"]]

    assert payload["size"] == {"width": 2500, "height": 1686}
    assert bounds == [
        {"x": 86, "y": 340, "width": 699, "height": 590},
        {"x": 900, "y": 340, "width": 700, "height": 590},
        {"x": 1715, "y": 340, "width": 699, "height": 590},
        {"x": 86, "y": 1020, "width": 699, "height": 590},
        {"x": 900, "y": 1020, "width": 700, "height": 590},
        {"x": 1715, "y": 1020, "width": 699, "height": 590},
    ]
    for area in bounds:
        assert area["x"] >= 0
        assert area["y"] >= 0
        assert area["x"] + area["width"] <= payload["size"]["width"]
        assert area["y"] + area["height"] <= payload["size"]["height"]


def test_support_ticket_admin_flow() -> None:
    create_response = client.post(
        "/api/support/tickets",
        json={
            "user_id": "demo_u001",
            "category": "event_registration",
            "subject": "測試客服工單",
            "message": "用於驗證客服後台處理流程。",
        },
    )
    assert create_response.status_code == 200
    ticket_id = create_response.json()["data"]["ticket_id"]

    update_response = client.patch(
        f"/api/admin/support-tickets/{ticket_id}",
        headers=ADMIN_HEADERS,
        json={"status": "resolved", "priority": "general"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["data"]["status"] == "resolved"

    delete_response = client.delete(
        f"/api/admin/support-tickets/{ticket_id}",
        headers=ADMIN_HEADERS,
    )
    assert delete_response.status_code == 200
    assert delete_response.json()["data"]["deleted"] is True


def test_admin_knowledge_document_crud() -> None:
    document_id = "admin_test_knowledge_doc"
    delete_existing = client.delete(
        f"/api/admin/knowledge-documents/{document_id}",
        headers=ADMIN_HEADERS,
    )
    assert delete_existing.status_code in {200, 404}

    create_response = client.post(
        "/api/admin/knowledge-documents",
        headers=ADMIN_HEADERS,
        json={
            "document_id": document_id,
            "title": "後台測試知識文件",
            "body": "這是用於驗證知識庫 CRUD 的 Demo 文件。",
            "source_type": "admin_test",
        },
    )
    assert create_response.status_code == 201
    assert create_response.json()["data"]["document_id"] == document_id

    update_response = client.put(
        f"/api/admin/knowledge-documents/{document_id}",
        headers=ADMIN_HEADERS,
        json={"body": "更新後的 Demo 知識內容。"},
    )
    assert update_response.status_code == 200
    assert "更新後" in update_response.json()["data"]["body"]

    delete_response = client.delete(
        f"/api/admin/knowledge-documents/{document_id}",
        headers=ADMIN_HEADERS,
    )
    assert delete_response.status_code == 200
    assert delete_response.json()["data"]["deleted"] is True


def test_admin_knowledge_document_rejects_unsafe_id() -> None:
    response = client.get(
        "/api/admin/knowledge-documents/bad$id",
        headers=ADMIN_HEADERS,
    )
    assert response.status_code == 400


def test_admin_notification_job_flow() -> None:
    job_id = "job_test_admin_flow"
    delete_existing = client.delete(
        f"/api/admin/notification-jobs/{job_id}",
        headers=ADMIN_HEADERS,
    )
    assert delete_existing.status_code in {200, 404}

    create_response = client.post(
        "/api/admin/notification-jobs",
        headers=ADMIN_HEADERS,
        json={
            "job_id": job_id,
            "job_type": "event_reminder",
            "target_user_id": "demo_u001",
            "event_id": "evt_demo_worship_intro",
            "status": "draft",
            "payload": {"text": "Demo 測試推播"},
        },
    )
    assert create_response.status_code == 201
    assert create_response.json()["data"]["job_id"] == job_id

    update_response = client.put(
        f"/api/admin/notification-jobs/{job_id}",
        headers=ADMIN_HEADERS,
        json={"status": "ready"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["data"]["status"] == "ready"

    send_response = client.post(
        f"/api/admin/notification-jobs/{job_id}/send-test",
        headers=ADMIN_HEADERS,
    )
    assert send_response.status_code == 200
    assert send_response.json()["data"]["sent"] is False
    assert send_response.json()["data"]["message_type"] == "event_reminder_day_before"

    delete_response = client.delete(
        f"/api/admin/notification-jobs/{job_id}",
        headers=ADMIN_HEADERS,
    )
    assert delete_response.status_code == 200
    assert delete_response.json()["data"]["deleted"] is True


def test_admin_notification_job_can_send_waitlist_notice() -> None:
    job_id = "job_test_waitlist_notice"
    delete_existing = client.delete(
        f"/api/admin/notification-jobs/{job_id}",
        headers=ADMIN_HEADERS,
    )
    assert delete_existing.status_code in {200, 404}

    create_response = client.post(
        "/api/admin/notification-jobs",
        headers=ADMIN_HEADERS,
        json={
            "job_id": job_id,
            "job_type": "registration_waitlist",
            "target_user_id": "demo_u001",
            "event_id": "evt_demo_worship_intro",
            "status": "draft",
            "payload": {"party_size": 2},
        },
    )
    assert create_response.status_code == 201

    send_response = client.post(
        f"/api/admin/notification-jobs/{job_id}/send-test",
        headers=ADMIN_HEADERS,
    )
    assert send_response.status_code == 200
    assert send_response.json()["data"]["sent"] is False
    assert send_response.json()["data"]["message_type"] == "registration_waitlist"

    delete_response = client.delete(
        f"/api/admin/notification-jobs/{job_id}",
        headers=ADMIN_HEADERS,
    )
    assert delete_response.status_code == 200


def test_admin_can_send_due_notification_jobs() -> None:
    job_id = "job_test_due_reminder"
    delete_existing = client.delete(
        f"/api/admin/notification-jobs/{job_id}",
        headers=ADMIN_HEADERS,
    )
    assert delete_existing.status_code in {200, 404}

    create_response = client.post(
        "/api/admin/notification-jobs",
        headers=ADMIN_HEADERS,
        json={
            "job_id": job_id,
            "job_type": "event_reminder_day_before",
            "target_user_id": "demo_u001",
            "event_id": "evt_demo_worship_intro",
            "status": "ready",
            "scheduled_at": "2020-01-01T00:00:00+00:00",
            "payload": {"registration_id": "reg_0002", "reminder_type": "day_before"},
        },
    )
    assert create_response.status_code == 201

    send_due_response = client.post(
        "/api/admin/notification-jobs/send-due",
        headers=ADMIN_HEADERS,
    )
    assert send_due_response.status_code == 200
    assert send_due_response.json()["data"]["processed"] >= 1

    job_response = client.get("/api/admin/notification-jobs", headers=ADMIN_HEADERS)
    job = next(item for item in job_response.json()["data"] if item["job_id"] == job_id)
    assert job["status"] == "failed"
    assert job["payload"]["last_send_result"]["message_type"] == "event_reminder_day_before"

    delete_response = client.delete(
        f"/api/admin/notification-jobs/{job_id}",
        headers=ADMIN_HEADERS,
    )
    assert delete_response.status_code == 200
