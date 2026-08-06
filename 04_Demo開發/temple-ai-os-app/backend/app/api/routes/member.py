from fastapi import APIRouter, Header, HTTPException, status

from app.db.supabase import get_repository
from app.schemas.common import ApiResponse, LineUser, Registration
from app.services.liff_auth import resolve_liff_user_id

router = APIRouter()


async def _user_id(header_user_id: str | None, id_token: str | None) -> str:
    try:
        return await resolve_liff_user_id(id_token, header_user_id or "demo_u001")
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid_liff_token") from exc


@router.get("/member/profile", response_model=ApiResponse[LineUser])
async def member_profile(
    x_line_user_id: str | None = Header(default=None),
    x_liff_id_token: str | None = Header(default=None, alias="X-LIFF-ID-Token"),
) -> ApiResponse[LineUser]:
    repo = get_repository()
    user = repo.get_or_create_line_user(await _user_id(x_line_user_id, x_liff_id_token))
    return ApiResponse(data=user)


@router.get("/member/registrations", response_model=ApiResponse[list[Registration]])
async def member_registrations(
    x_line_user_id: str | None = Header(default=None),
    x_liff_id_token: str | None = Header(default=None, alias="X-LIFF-ID-Token"),
) -> ApiResponse[list[Registration]]:
    user_id = await _user_id(x_line_user_id, x_liff_id_token)
    return ApiResponse(data=get_repository().list_registrations(user_id=user_id))
