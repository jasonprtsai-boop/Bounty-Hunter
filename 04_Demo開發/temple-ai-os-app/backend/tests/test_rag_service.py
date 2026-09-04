from app.db.supabase import LocalRepository
from app.schemas.common import FAQRule
from app.services.rag_service import (
    RAGService,
    clear_rag_service_cache,
    get_rag_service,
    warm_fast_reply_cache,
)


class IncompleteFAQRepository(LocalRepository):
    def list_faq_rules(self) -> list[FAQRule]:
        return [
            FAQRule(
                rule_id="rule_remote_general_only",
                intent="general",
                title="Remote fallback only",
                keywords=[],
                reply="遠端只有 fallback，不應覆蓋內建規則。",
                priority=0,
                enabled=True,
                source_refs=[{"source": "remote", "source_type": "test"}],
            )
        ]


def test_rag_service_uses_local_rules_when_remote_rules_are_incomplete() -> None:
    service = RAGService(IncompleteFAQRepository())

    assert service.classify_intent("萬春宮在哪裡？") == "temple_location"
    assert service.classify_intent("我的投資財運會不會成功？") == "safety_boundary"


def test_rag_service_can_skip_synchronous_message_logging() -> None:
    repository = LocalRepository()
    service = RAGService(repository)

    import asyncio

    before_count = len(repository.messages)
    reply = asyncio.run(service.answer("萬春宮在哪裡？", "line_user_fast_path", record=False))

    assert reply.intent == "temple_location"
    assert len(repository.messages) == before_count


def test_event_query_without_public_events_returns_text_only() -> None:
    repository = LocalRepository()
    repository.events = [event.model_copy(update={"status": "draft"}) for event in repository.events]
    service = RAGService(repository)

    import asyncio

    reply = asyncio.run(service.answer("近期有什麼活動？", "line_user_no_public_events", record=False))

    assert reply.intent == "event_query"
    assert reply.events == []
    assert reply.flex_message is None
    assert "沒有公開活動" in reply.reply


def test_get_rag_service_reuses_cached_instance() -> None:
    clear_rag_service_cache()
    repository = LocalRepository()

    first = get_rag_service(repository)
    second = get_rag_service(repository)

    assert first is second
    clear_rag_service_cache()


def test_warm_fast_reply_cache_preloads_cached_service() -> None:
    clear_rag_service_cache()
    repository = LocalRepository()

    warmed = warm_fast_reply_cache(repository)
    reused = get_rag_service(repository)

    assert warmed is reused
    assert warmed.classify_intent("近期有什麼活動？") == "event_query"
    clear_rag_service_cache()
