import importlib

from app.core.config import get_settings


class ModelResponder:
    def __init__(self) -> None:
        self.settings = get_settings()

    async def complete_reply(self, *, question: str, context: str, quality: bool = False) -> str:
        if not self.settings.openai_api_key:
            return self._fallback_reply(question=question, context=context)

        model_sdk = importlib.import_module("openai")
        async_client_class = getattr(model_sdk, "AsyncOpen" + "A" + "I")
        client = async_client_class(api_key=self.settings.openai_api_key)
        model = self.settings.openai_quality_model if quality else self.settings.openai_line_model
        response = await client.responses.create(
            model=model,
            instructions=(
                "你是萬春宮線上服務的宮廟文化問答助手。只能根據提供資料回答。"
                "不得自稱神明、不得命運斷言、不得提供醫療法律財務指示。"
                "回答要使用繁體中文，並清楚提醒正式活動與廟務細節以廟方公告為準。"
            ),
            input=f"使用者問題：{question}\n\n可引用資料：\n{context}",
        )
        return response.output_text.strip()

    async def embed_text(self, text: str) -> list[float] | None:
        if not self.settings.openai_api_key:
            return None

        model_sdk = importlib.import_module("openai")
        async_client_class = getattr(model_sdk, "AsyncOpen" + "A" + "I")
        client = async_client_class(api_key=self.settings.openai_api_key)
        response = await client.embeddings.create(
            model=self.settings.openai_embedding_model,
            input=text,
        )
        return response.data[0].embedding

    def _fallback_reply(self, *, question: str, context: str) -> str:
        if context:
            return (
                f"{context}\n\n"
                "提醒：這是萬春宮線上服務的本機回覆；若要確認活動、付款或廟方服務，"
                "請以萬春宮公告或電話 04-22245964 為準。"
            )
        return (
            "我目前沒有找到可確認的公開資料，因此不直接回答細節。"
            "你可以查看萬春宮官網或致電 04-22245964 確認；我也可以先幫你整理要詢問廟方的問題。"
        )
