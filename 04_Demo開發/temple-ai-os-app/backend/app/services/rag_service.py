from dataclasses import dataclass
from pathlib import Path

from app.core.config import get_settings
from app.db.supabase import DemoRepository
from app.schemas.common import ChatReply
from app.services.flex_templates import events_carousel
from app.services.openai_client import OpenAIResponder


@dataclass
class KnowledgeChunk:
    source: str
    title: str
    text: str
    source_type: str


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
    def __init__(self, repository: DemoRepository) -> None:
        self.repository = repository
        self.settings = get_settings()
        self.openai = OpenAIResponder()
        self.chunks = self._load_knowledge_chunks(self.settings.knowledge_dir)

    def _load_knowledge_chunks(self, knowledge_dir: Path) -> list[KnowledgeChunk]:
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

    def search(self, message: str, limit: int = 3) -> list[KnowledgeChunk]:
        terms = {term for term in message.replace("？", " ").replace("?", " ").split() if term}
        scored: list[tuple[int, KnowledgeChunk]] = []
        for chunk in self.chunks:
            score = 0
            haystack = f"{chunk.title}\n{chunk.text}"
            for term in terms:
                if term in haystack:
                    score += 3
            for char in message:
                if "\u4e00" <= char <= "\u9fff" and char in haystack:
                    score += 1
            if score:
                scored.append((score, chunk))
        scored.sort(key=lambda item: item[0], reverse=True)
        return [chunk for _, chunk in scored[:limit]]

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

        matches = self.search(message)
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

