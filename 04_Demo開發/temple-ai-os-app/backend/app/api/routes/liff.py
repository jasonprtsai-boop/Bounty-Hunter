from fastapi import APIRouter, HTTPException, status

from app.db.supabase import get_repository
from app.schemas.common import (
    ApiResponse,
    FortuneSlip,
    LiffSession,
    LiffVerifyRequest,
    SupportTicket,
    SupportTicketCreate,
    TourSpot,
)
from app.services.liff_auth import verify_liff_id_token

router = APIRouter()


@router.post("/liff/session/verify", response_model=ApiResponse[LiffSession])
async def verify_session(payload: LiffVerifyRequest) -> ApiResponse[LiffSession]:
    try:
        session = await verify_liff_id_token(payload.id_token)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid_liff_token") from exc
    get_repository().get_or_create_line_user(session.user_id, session.display_name)
    return ApiResponse(data=session)


@router.post("/fortune/draw", response_model=ApiResponse[FortuneSlip])
async def draw_fortune() -> ApiResponse[FortuneSlip]:
    return ApiResponse(
        data=get_repository().draw_fortune(),
        meta={"demo_notice": "文化抽籤僅作文化解說與正向提醒，不做命運斷言。"},
    )


@router.get("/tour/spots/{code}", response_model=ApiResponse[TourSpot])
async def get_tour_spot(code: str) -> ApiResponse[TourSpot]:
    spot = get_repository().get_tour_spot(code)
    if not spot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="tour_spot_not_found")
    return ApiResponse(data=spot)


@router.post("/support/tickets", response_model=ApiResponse[SupportTicket])
async def create_support_ticket(payload: SupportTicketCreate) -> ApiResponse[SupportTicket]:
    ticket = get_repository().create_support_ticket(payload)
    return ApiResponse(
        data=ticket,
        meta={"demo_notice": "客服工單為 Demo 流程；正式案件仍需廟方人工確認。"},
    )

