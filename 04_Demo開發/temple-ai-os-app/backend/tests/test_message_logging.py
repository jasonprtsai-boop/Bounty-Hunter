from app.db import supabase


class FakeResponse:
    def __init__(self, status_code: int, data: object | None = None) -> None:
        self.status_code = status_code
        self._data = data
        self.text = ""
        self.content = b"x" if data is not None else b""

    def json(self) -> object:
        return self._data


class FakeSupabaseClient:
    def __init__(self, *args: object, **kwargs: object) -> None:
        self.messages: list[object] = []

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
                        "name": "萬春宮線上服務",
                        "aliases": [],
                        "main_deity": "Mazu",
                        "address": "Taichung",
                        "phone": "04-0000-0000",
                        "coordinates": {"lat": 24.0, "lng": 120.0},
                        "demo_positioning": "Service profile",
                        "sources": [],
                    }
                ],
            )
        if method == "POST" and url.endswith("/messages"):
            self.messages.append(json)
            return FakeResponse(201)
        raise AssertionError(f"Unhandled request: {method} {url} {params} {json} {headers}")


def test_supabase_repository_records_chat_message(monkeypatch) -> None:
    monkeypatch.setattr(supabase.httpx, "Client", FakeSupabaseClient)

    repository = supabase.SupabaseRepository("https://example.supabase.co", "service-role")
    repository.record_message(
        user_id="line_user_1",
        channel="line",
        user_text="Where is the temple?",
        intent="temple_location",
        ai_reply="Taichung",
        source_refs=[{"source": "faq_rules", "source_type": "fixed_reply"}],
        demo_notice="service",
    )

    assert repository.client.messages == [
        {
            "user_id": "line_user_1",
            "channel": "line",
            "user_text": "Where is the temple?",
            "intent": "temple_location",
            "ai_reply": "Taichung",
            "source_refs": [{"source": "faq_rules", "source_type": "fixed_reply"}],
            "demo_notice": "service",
        }
    ]
