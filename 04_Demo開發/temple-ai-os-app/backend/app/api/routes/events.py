from fastapi import APIRouter, Header, HTTPException, status

from app.db.supabase import get_repository
from app.schemas.common import ApiResponse, Event, Registration, RegistrationCreate, TempleProfile
from app.services.notification_service import NotificationService
from app.services.liff_auth import resolve_liff_user_id

router = APIRouter()


@router.get("/temple/profile", response_model=ApiResponse[TempleProfile])
async def temple_profile() -> ApiResponse[TempleProfile]:
    return ApiResponse(data=get_repository().temple)


@router.get("/events", response_model=ApiResponse[list[Event]])
async def list_events() -> ApiResponse[list[Event]]:
    return ApiResponse(
        data=get_repository().list_events(),
        meta={"demo_notice": "活動含 Demo sample，不代表萬春宮官方報名資料。"},
    )


@router.get("/events/{event_id}", response_model=ApiResponse[Event])
async def get_event(event_id: str) -> ApiResponse[Event]:
    event = get_repository().get_event(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="event_not_found")
    return ApiResponse(data=event)


@router.post("/events/{event_id}/registrations", response_model=ApiResponse[Registration])
async def create_registration(
    event_id: str,
    payload: RegistrationCreate,
    x_liff_id_token: str | None = Header(default=None, alias="X-LIFF-ID-Token"),
) -> ApiResponse[Registration]:
    repo = get_repository()
    try:
        user_id = await resolve_liff_user_id(x_liff_id_token, payload.user_id)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid_liff_token") from exc
    payload = payload.model_copy(update={"user_id": user_id})
    repo.get_or_create_line_user(user_id)
    try:
        registration = repo.create_registration(event_id, payload)
    except ValueError as exc:
        detail = str(exc)
        status_code = status.HTTP_404_NOT_FOUND if detail == "event_not_found" else status.HTTP_409_CONFLICT
        if detail == "event_capacity_exceeded":
            notification = await NotificationService(repo).send_waitlist_notice(
                event_id=event_id,
                user_id=user_id,
                party_size=payload.party_size,
            )
            raise HTTPException(
                status_code=status_code,
                detail={"reason": detail, "notification": notification},
            ) from exc
        raise HTTPException(status_code=status_code, detail=detail) from exc

    notification = await NotificationService(repo).send_registration_confirmation(registration)
    return ApiResponse(
        data=registration,
        meta={
            "notification": notification,
            "demo_notice": "這是示範報名紀錄，不代表萬春宮官方報名資料。",
        },
    )
