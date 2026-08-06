import pytest

from app.core.config import get_settings
from app.db import supabase


class FakeResponse:
    def __init__(self, status_code: int, data: object | None = None, text: str = "") -> None:
        self.status_code = status_code
        self._data = data
        self.text = text
        self.content = b"x" if data is not None else b""

    def json(self) -> object:
        return self._data


class FakeSupabaseClient:
    def __init__(self, *args: object, **kwargs: object) -> None:
        self.inserted_webhook_ids: set[str] = set()

    def request(
        self,
        method: str,
        url: str,
        *,
        params: dict[str, str] | None = None,
        json: object | None = None,
        headers: dict[str, str] | None = None,
    ) -> FakeResponse:
        if method == "GET" and url.endswith("/temples"):
            return FakeResponse(
                200,
                [
                    {
                        "temple_id": supabase.TEMPLE_ID,
                        "name": "Temple AI OS Demo",
                        "aliases": ["Demo Temple"],
                        "main_deity": "Mazu",
                        "address": "Taichung",
                        "phone": "04-0000-0000",
                        "coordinates": {"lat": 24.0, "lng": 120.0},
                        "demo_positioning": "Demo profile",
                        "sources": [],
                    }
                ],
            )
        if method == "GET" and url.endswith("/events"):
            return FakeResponse(
                200,
                [
                    {
                        "event_id": "evt_supabase_test",
                        "title": "Supabase event",
                        "category": "demo",
                        "source_type": "test",
                        "event_date": "2026-09-01",
                        "start_time": "10:00",
                        "end_time": "11:00",
                        "location": "Main hall",
                        "address": "Taichung",
                        "summary": "Demo event",
                        "requires_registration": True,
                        "capacity": 20,
                        "registered_count": 0,
                        "status": "open",
                        "registration_fields": [],
                        "payment_policy": None,
                        "demo_note": "test row",
                    }
                ],
            )
        raise AssertionError(f"Unhandled request: {method} {url} {params} {json} {headers}")

    def post(
        self,
        url: str,
        *,
        json: dict[str, str],
        headers: dict[str, str] | None = None,
    ) -> FakeResponse:
        event_id = json["event_id"]
        if event_id in self.inserted_webhook_ids:
            return FakeResponse(409, {"message": "duplicate"})
        self.inserted_webhook_ids.add(event_id)
        return FakeResponse(201, None)


def reset_repository_state() -> None:
    supabase._repo = None
    get_settings.cache_clear()


def test_get_repository_requires_supabase_config_when_not_demo(monkeypatch: pytest.MonkeyPatch) -> None:
    reset_repository_state()
    monkeypatch.setenv("DEMO_MODE", "false")
    monkeypatch.delenv("SUPABASE_URL", raising=False)
    monkeypatch.delenv("SUPABASE_SERVICE_ROLE_KEY", raising=False)
    get_settings.cache_clear()

    with pytest.raises(RuntimeError, match="supabase_not_configured"):
        supabase.get_repository()

    reset_repository_state()


def test_get_repository_uses_supabase_when_not_demo(monkeypatch: pytest.MonkeyPatch) -> None:
    class DummySupabaseRepository:
        def __init__(self, supabase_url: str, service_role_key: str) -> None:
            self.supabase_url = supabase_url
            self.service_role_key = service_role_key

    reset_repository_state()
    monkeypatch.setenv("DEMO_MODE", "false")
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "service-role")
    monkeypatch.setattr(supabase, "SupabaseRepository", DummySupabaseRepository)
    get_settings.cache_clear()

    repository = supabase.get_repository()

    assert isinstance(repository, DummySupabaseRepository)
    assert repository.supabase_url == "https://example.supabase.co"
    assert repository.service_role_key == "service-role"

    reset_repository_state()


def test_supabase_repository_maps_events_and_dedupes_webhooks(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(supabase.httpx, "Client", FakeSupabaseClient)

    repository = supabase.SupabaseRepository("https://example.supabase.co", "service-role")

    events = repository.list_events()
    assert events[0].event_id == "evt_supabase_test"
    assert events[0].date == "2026-09-01"
    assert repository.mark_line_event_processed("evt_1") is True
    assert repository.mark_line_event_processed("evt_1") is False
