from dataclasses import dataclass
from pathlib import Path
import re

from app.core.config import get_settings
from app.db.supabase import Repository
from app.schemas.common import ChatReply
from app.services.flex_templates import events_carousel
from app.services.openai_client import OpenAIResponder


@dataclass
class KnowledgeChunk:
    source: str
    title: str
    text: str
    source_type: str
    similarity: float | None = None


SAFETY_KEYWORDS = {
    "投資",
    "股票",
    "借錢",
    "法律",
    "告",
    "疾病",
    "藥",
    "考試會不會上",
    "感情會不會",
    "財運",
    "命運",
    "神明告訴",
}


class RAGService:
    def __init__(self, repository: Repository) -> None:
        self.repository = repository
        self.settings = get_settings()
        self.openai = OpenAIResponder()
        self.chunks = self._load_knowledge_chunks(self.settings.knowledge_dir)

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

    def classify_intent(self, message: str) -> str:
        text = message.lower()
        if any(keyword in message for keyword in SAFETY_KEYWORDS):
            return "safety_boundary"
        if any(keyword in message for keyword in ["活動", "報名", "法會", "講堂", "近期"]):
            return "event_query"
        if any(keyword in message for keyword in ["地址", "在哪", "交通", "電話", "停車"]):
            return "temple_location"
        if any(keyword in message for keyword in ["拜", "參拜", "第一次", "流程"]):
            return "worship_process"
        if any(keyword in message for keyword in ["歷史", "文化", "媽祖", "主祀", "故事"]):
            return "history_culture"
        if "客服" in message or "真人" in message or "聯絡" in message:
            return "support"
        return "general"

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
        if not self.settings.demo_mode and self.settings.openai_api_key:
            embedding = await self.openai.embed_text(message)
            if embedding and hasattr(self.repository, "search_knowledge_chunks"):
                rows = self.repository.search_knowledge_chunks(embedding, limit=limit)
                if rows:
                    return [
                        KnowledgeChunk(
                            source=str(row["document_id"]),
                            title=str(row["title"]),
                            text=str(row["content"]),
                            source_type=str(row["source_type"]),
                            similarity=float(row.get("similarity") or 0),
                        )
                        for row in rows
                    ]
        return self._lexical_search(message, limit=limit)

    async def answer(self, message: str, user_id: str) -> ChatReply:
        intent = self.classify_intent(message)
        demo_notice = "Temple AI OS 目前為示範系統，Demo 活動、報名與 Dashboard 非萬春宮官方營運資料。"

        if intent == "safety_boundary":
            return ChatReply(
                intent=intent,
                reply=(
                    "這類問題可能涉及命運、醫療、法律或財務等重大判斷，我不能斷言結果。"
                    "我可以提供公開資料、文化背景與一般參拜資訊，但不能代表神明或廟方作出指示。"
                ),
                sources=[{"source": "04_AI安全回覆規則.md", "source_type": "demo_policy"}],
                demo_notice=demo_notice,
            )

        if intent == "event_query":
            events = self.repository.list_events()
            reply = "目前可展示的近期活動如下；其中報名與統計為 Demo 示範資料。"
            return ChatReply(
                intent=intent,
                reply=reply,
                events=events,
                flex_message=events_carousel(events),
                demo_notice=demo_notice,
            )

        if intent == "support":
            return ChatReply(
                intent=intent,
                reply="若問題涉及報名狀態、付款、失物或廟方決策，建議建立客服工單由人工確認。",
                demo_notice=demo_notice,
            )

        matches = await self.search(message)
        context = "\n\n".join(f"{chunk.title}\n{chunk.text}" for chunk in matches)
        reply = await self.openai.complete_reply(question=message, context=context)
        return ChatReply(
            intent=intent,
            reply=reply,
            sources=[
                {"source": chunk.source, "title": chunk.title, "source_type": chunk.source_type}
                for chunk in matches
            ],
            demo_notice=demo_notice,
        )
