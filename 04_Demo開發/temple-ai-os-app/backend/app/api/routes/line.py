from typing import Any

from fastapi import APIRouter, Header, HTTPException, Request, status

from app.core.config import get_settings
from app.core.security import verify_line_signature
from app.db.supabase import get_repository
from app.schemas.common import ApiResponse
from app.services.line_client import LineClient, text_message
from app.services.rag_service import RAGService

router = APIRouter()


@router.post("/webhook", response_model=ApiResponse[dict[str, Any]])
async def line_webhook(
    request: Request,
    x_line_signature: str | None = Header(default=None, alias="x-line-signature"),
) -> ApiResponse[dict[str, Any]]:
    settings = get_settings()
    body = await request.body()
    signature_ok = verify_line_signature(body, x_line_signature, settings.line_channel_secret)
    if not signature_ok and not (settings.demo_mode and settings.line_skip_signature_validation):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid_line_signature")

    payload = await request.json()
    repo = get_repository()
    rag = RAGService(repo)
    line_client = LineClient()
    processed = 0
    skipped_duplicates = 0
    replies: list[dict[str, Any]] = []

    for event in payload.get("events", []):
        webhook_event_id = event.get("webhookEventId")
        if not repo.mark_line_event_processed(webhook_event_id):
            skipped_duplicates += 1
            continue
        processed += 1

        if event.get("type") != "message" or event.get("message", {}).get("type") != "text":
            continue

        user_id = event.get("source", {}).get("userId", "demo_line_user")
        repo.get_or_create_line_user(user_id)
        reply = await rag.answer(event["message"]["text"], user_id)
        messages = [text_message(reply.reply)]
        if reply.flex_message:
            messages = [reply.flex_message]
        reply_token = event.get("replyToken")
        send_result = {"sent": False, "reason": "missing_reply_token"}
        if reply_token:
            send_result = await line_client.reply_message(reply_token, messages)
        replies.append({"event_id": webhook_event_id, "intent": reply.intent, "send_result": send_result})

    return ApiResponse(
        data={"processed": processed, "skipped_duplicates": skipped_duplicates, "replies": replies}
    )

