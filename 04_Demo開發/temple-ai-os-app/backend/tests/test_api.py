from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)
ADMIN_HEADERS = {"Authorization": "Bearer temple-ai-os-admin-demo"}


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "ok"


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


def test_chat_safety_boundary() -> None:
    response = client.post(
        "/api/chat",
        json={"message": "我的投資財運會不會成功？", "user_id": "demo_u001", "source": "test"},
    )
    assert response.status_code == 200
    assert response.json()["data"]["intent"] == "safety_boundary"


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

    delete_response = client.delete(
        f"/api/admin/notification-jobs/{job_id}",
        headers=ADMIN_HEADERS,
    )
    assert delete_response.status_code == 200
    assert delete_response.json()["data"]["deleted"] is True
