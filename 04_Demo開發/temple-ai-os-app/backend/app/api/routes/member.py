from fastapi import APIRouter, Header

from app.db.supabase import get_repository
from app.schemas.common import ApiResponse, LineUser, Registration

router = APIRouter()


def _user_id(header_user_id: str | None) -> str:
    return header_user_id or "demo_u001"


@router.get("/member/profile", response_model=ApiResponse[LineUser])
async def member_profile(x_line_user_id: str | None = Header(default=None)) -> ApiResponse[LineUser]:
    repo = get_repository()
    user = repo.get_or_create_line_user(_user_id(x_line_user_id))
    return ApiResponse(data=user)


@router.get("/member/registrations", response_model=ApiResponse[list[Registration]])
async def member_registrations(
    x_line_user_id: str | None = Header(default=None),
) -> ApiResponse[list[Registration]]:
    user_id = _user_id(x_line_user_id)
    return ApiResponse(data=get_repository().list_registrations(user_id=user_id))

