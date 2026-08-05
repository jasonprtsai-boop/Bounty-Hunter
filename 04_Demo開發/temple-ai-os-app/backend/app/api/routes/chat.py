from fastapi import APIRouter

from app.db.supabase import get_repository
from app.schemas.common import ApiResponse, ChatReply, ChatRequest
from app.services.rag_service import RAGService

router = APIRouter()


@router.post("/chat", response_model=ApiResponse[ChatReply])
async def chat(payload: ChatRequest) -> ApiResponse[ChatReply]:
    repo = get_repository()
    repo.get_or_create_line_user(payload.user_id)
    reply = await RAGService(repo).answer(payload.message, payload.user_id)
    return ApiResponse(data=reply)

