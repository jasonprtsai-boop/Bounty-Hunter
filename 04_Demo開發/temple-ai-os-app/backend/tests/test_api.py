from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


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


def test_chat_safety_boundary() -> None:
    response = client.post(
        "/api/chat",
        json={"message": "我的投資財運會不會成功？", "user_id": "demo_u001", "source": "test"},
    )
    assert response.status_code == 200
    assert response.json()["data"]["intent"] == "safety_boundary"

