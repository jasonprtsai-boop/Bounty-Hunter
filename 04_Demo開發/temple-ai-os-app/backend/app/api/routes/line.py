import logging
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, Request, status

from app.core.config import get_settings
from app.core.security import verify_line_signature
from app.db.supabase import get_repository
from app.schemas.common import ApiResponse
from app.services.line_client import LineClient, text_message
from app.services.rag_service import get_rag_service, record_chat_activity

router = APIRouter()
logger = logging.getLogger(__name__)


async def _process_line_webhook_events(payload: dict[str, Any]) -> None:
    try:
        repo = get_repository()
        rag = None
        line_client = None

        for event in payload.get("events", []):
            webhook_event_id = event.get("webhookEventId")
            if not repo.mark_line_event_processed(webhook_event_id):
                continue

            if event.get("type") != "message" or event.get("message", {}).get("type") != "text":
                continue

            if rag is None:
                rag = get_rag_service(repo)
            if line_client is None:
                line_client = LineClient()

            user_id = event.get("source", {}).get("userId", "demo_line_user")
            user_text = event["message"]["text"]
            reply = await rag.answer(user_text, user_id, record=False)
            messages = [text_message(reply.reply)]
            if reply.flex_message:
                messages = [reply.flex_message]
            reply_token = event.get("replyToken")
            if reply_token:
                await line_client.reply_message(reply_token, messages)
            await record_chat_activity(
                repo,
                user_id=user_id,
                channel="line",
                user_text=user_text,
                reply=reply,
                ensure_user=True,
            )
    except Exception:
        logger.exception("line_webhook_background_processing_failed")


@router.post("/webhook", response_model=ApiResponse[dict[str, Any]])
async def line_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_line_signature: str | None = Header(default=None, alias="x-line-signature"),
) -> ApiResponse[dict[str, Any]]:
    settings = get_settings()
    body = await request.body()
    signature_ok = verify_line_signature(body, x_line_signature, settings.line_channel_secret)
    if not signature_ok and not (settings.demo_mode and settings.line_skip_signature_validation):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid_line_signature")

    payload = await request.json()
    events = payload.get("events", [])
    if events:
        background_tasks.add_task(_process_line_webhook_events, payload)

    return ApiResponse(data={"accepted": len(events)})
