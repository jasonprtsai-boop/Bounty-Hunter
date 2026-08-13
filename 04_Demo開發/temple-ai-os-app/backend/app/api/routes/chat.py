from fastapi import APIRouter, Header, HTTPException, Request, status

from app.core.rate_limit import InMemoryRateLimiter
from app.db.supabase import get_repository
from app.schemas.common import ApiResponse, ChatReply, ChatRequest
from app.services.liff_auth import resolve_liff_user_id
from app.services.rag_service import RAGService

router = APIRouter()
chat_rate_limiter = InMemoryRateLimiter(max_requests=12, window_seconds=60)


def _client_key(request: Request, user_id: str) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    client_ip = forwarded_for.split(",", 1)[0].strip() if forwarded_for else None
    if not client_ip and request.client:
        client_ip = request.client.host
    return f"{client_ip or 'unknown'}:{user_id}"


@router.post("/chat", response_model=ApiResponse[ChatReply])
async def chat(
    request: Request,
    payload: ChatRequest,
    x_liff_id_token: str | None = Header(default=None, alias="X-LIFF-ID-Token"),
) -> ApiResponse[ChatReply]:
    repo = get_repository()
    try:
        user_id = await resolve_liff_user_id(x_liff_id_token, payload.user_id)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid_liff_token") from exc
    if not chat_rate_limiter.allow(_client_key(request, user_id)):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="chat_rate_limited")
    repo.get_or_create_line_user(user_id)
    reply = await RAGService(repo).answer(payload.message, user_id)
    return ApiResponse(data=reply)
