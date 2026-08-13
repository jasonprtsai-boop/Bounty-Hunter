from app.db.supabase import DemoRepository
from app.schemas.common import FAQRule
from app.services.rag_service import RAGService


class IncompleteFAQRepository(DemoRepository):
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
