from dataclasses import dataclass
from pathlib import Path
import re

from app.core.config import get_settings
from app.db.supabase import Repository
from app.schemas.common import ChatReply, FAQRule
from app.services.flex_templates import events_carousel


@dataclass
class KnowledgeChunk:
    source: str
    title: str
    text: str
    source_type: str
    similarity: float | None = None


@dataclass
class RuleMatch:
    rule: FAQRule
    score: int


DEMO_NOTICE = "Temple AI OS 目前為示範系統，Demo 活動、報名與 Dashboard 非萬春宮官方營運資料。"
REQUIRED_RULE_INTENTS = {"safety_boundary", "event_query", "temple_location", "general"}


class RAGService:
    """Keyword-based FAQ service with fixed, reviewable replies."""

    def __init__(self, repository: Repository) -> None:
        self.repository = repository
        self.settings = get_settings()
        self.chunks = self._load_knowledge_chunks(self.settings.knowledge_dir)
        self.rules = self._load_rules()

    def _load_knowledge_chunks(self, knowledge_dir: Path) -> list[KnowledgeChunk]:
        if not knowledge_dir.exists():
            raise RuntimeError(f"knowledge_dir_missing: {knowledge_dir}")
        chunks: list[KnowledgeChunk] = []
        for path in sorted(knowledge_dir.glob("*.md")):
            text = path.read_text(encoding="utf-8")
            for section in [part.strip() for part in text.split("\n## ") if part.strip()]:
                lines = section.splitlines()
                title = lines[0].lstrip("# ").strip()
                body = "\n".join(lines[1:]).strip()
                source_type = "knowledge_base"
                for line in body.splitlines():
                    if line.startswith("來源類型："):
                        source_type = line.replace("來源類型：", "").strip()
                if body:
                    chunks.append(
                        KnowledgeChunk(
                            source=path.name,
                            title=title,
                            text=body,
                            source_type=source_type,
                        )
                    )
        return chunks

    def _load_rules(self) -> list[FAQRule]:
        rules: list[FAQRule] = []
        if hasattr(self.repository, "list_faq_rules"):
            rules = self.repository.list_faq_rules()
        if not self._rules_are_complete(rules):
            rules_path = self.settings.demo_data_dir / "demo_faq_rules.json"
            rules = [
                FAQRule.model_validate(item)
                for item in self._read_local_rules(rules_path)
                if item.get("enabled", True)
            ]
        return sorted(rules, key=lambda rule: (-rule.priority, rule.rule_id))

    @staticmethod
    def _read_local_rules(path: Path) -> list[dict[str, object]]:
        if not path.exists():
            raise RuntimeError(f"faq_rules_missing: {path}")
        import json

        data = json.loads(path.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []

    @staticmethod
    def _rules_are_complete(rules: list[FAQRule]) -> bool:
        intents = {rule.intent for rule in rules if rule.enabled}
        keyword_rule_count = sum(1 for rule in rules if rule.enabled and rule.keywords)
        return REQUIRED_RULE_INTENTS.issubset(intents) and keyword_rule_count >= 3

    @staticmethod
    def _normalized(message: str) -> str:
        return re.sub(r"\s+", "", message.lower())

    def _keyword_score(self, rule: FAQRule, message: str) -> int:
        text = self._normalized(message)
        if any(self._normalized(keyword) in text for keyword in rule.negative_keywords):
            return 0
        score = 0
        for keyword in rule.keywords:
            normalized_keyword = self._normalized(keyword)
            if normalized_keyword and normalized_keyword in text:
                score += max(10, len(normalized_keyword) * 3)
        return rule.priority + score if score > 0 else 0

    def match_rule(self, message: str) -> RuleMatch:
        matches = [
            RuleMatch(rule=rule, score=score)
            for rule in self.rules
            if (score := self._keyword_score(rule, message)) > 0
        ]
        if matches:
            return max(matches, key=lambda match: (match.score, match.rule.priority, match.rule.rule_id))
        fallback = next((rule for rule in self.rules if rule.intent == "general"), self.rules[-1])
        return RuleMatch(rule=fallback, score=fallback.priority)

    def classify_intent(self, message: str) -> str:
        return self.match_rule(message).rule.intent

    def _query_terms(self, message: str) -> set[str]:
        terms = set(re.findall(r"[a-z0-9]+", message.lower()))
        chinese = "".join(char for char in message if "\u4e00" <= char <= "\u9fff")
        for size in (2, 3, 4):
            terms.update(chinese[index : index + size] for index in range(len(chinese) - size + 1))
        for phrase in ["萬春宮", "天上聖母", "媽祖", "參拜", "地址", "電話", "活動", "報名", "交通"]:
            if phrase in message:
                terms.add(phrase)
        return {term for term in terms if term.strip()}

    def _lexical_search(self, message: str, limit: int = 3) -> list[KnowledgeChunk]:
        terms = self._query_terms(message)
        scored: list[tuple[int, KnowledgeChunk]] = []
        for chunk in self.chunks:
            score = 0
            haystack = f"{chunk.title}\n{chunk.text}".lower()
            for term in terms:
                if term in haystack:
                    score += max(3, len(term) * 2)
            if chunk.title and chunk.title in message:
                score += 12
            if score >= 4:
                scored.append((score, chunk))
        scored.sort(key=lambda item: item[0], reverse=True)
        return [chunk for _, chunk in scored[:limit]]

    async def search(self, message: str, limit: int = 3) -> list[KnowledgeChunk]:
        return self._lexical_search(message, limit=limit)

    def _sources_for_rule(self, rule: FAQRule, message: str) -> list[dict[str, str]]:
        if rule.source_refs:
            return [
                {key: str(value) for key, value in source.items()}
                for source in rule.source_refs
            ]
        return [
            {"source": chunk.source, "title": chunk.title, "source_type": chunk.source_type}
            for chunk in self._lexical_search(message)
        ]

    def _record_reply(self, message: str, user_id: str, reply: ChatReply) -> None:
        if not hasattr(self.repository, "record_message"):
            return
        try:
            self.repository.record_message(
                user_id=user_id,
                channel="line",
                user_text=message,
                intent=reply.intent,
                ai_reply=reply.reply,
                source_refs=reply.sources,
                demo_notice=reply.demo_notice,
            )
        except Exception:
            # Chat must remain available even if analytics logging is temporarily unavailable.
            return

    async def answer(self, message: str, user_id: str) -> ChatReply:
        match = self.match_rule(message)
        rule = match.rule

        if rule.intent == "event_query":
            events = self.repository.list_events()
            reply = ChatReply(
                intent=rule.intent,
                reply=rule.reply,
                sources=self._sources_for_rule(rule, message),
                events=events,
                flex_message=events_carousel(events),
                demo_notice=DEMO_NOTICE,
            )
            self._record_reply(message, user_id, reply)
            return reply

        reply = ChatReply(
            intent=rule.intent,
            reply=rule.reply,
            sources=self._sources_for_rule(rule, message),
            demo_notice=DEMO_NOTICE,
        )
        self._record_reply(message, user_id, reply)
        return reply
