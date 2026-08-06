from fastapi import APIRouter, Header, HTTPException, status

from app.db.supabase import get_repository
from app.schemas.common import ApiResponse, ChatReply, ChatRequest
from app.services.liff_auth import resolve_liff_user_id
from app.services.rag_service import RAGService

router = APIRouter()


@router.post("/chat", response_model=ApiResponse[ChatReply])
async def chat(
    payload: ChatRequest,
    x_liff_id_token: str | None = Header(default=None, alias="X-LIFF-ID-Token"),
) -> ApiResponse[ChatReply]:
    repo = get_repository()
    try:
        user_id = await resolve_liff_user_id(x_liff_id_token, payload.user_id)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid_liff_token") from exc
    repo.get_or_create_line_user(user_id)
    reply = await RAGService(repo).answer(payload.message, user_id)
    return ApiResponse(data=reply)
