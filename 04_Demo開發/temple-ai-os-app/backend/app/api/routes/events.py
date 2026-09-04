from fastapi import APIRouter, Header, HTTPException, Query, status

from app.db.supabase import get_repository
from app.schemas.common import (
    ApiResponse,
    Deity,
    Event,
    Registration,
    RegistrationCreate,
    RegistrationLookupResult,
    TempleProfile,
)
from app.services.notification_service import NotificationService
from app.services.liff_auth import resolve_liff_user_id
from app.services.event_visibility import (
    is_public_event,
    is_registration_open,
    public_events,
    resolve_public_event,
)

router = APIRouter()


@router.get("/deities", response_model=ApiResponse[list[Deity]])
async def list_deities() -> ApiResponse[list[Deity]]:
    deities = [item for item in get_repository().list_deities() if item.status == "published"]
    return ApiResponse(
        data=deities,
        meta={"notice": "神佛資料依公開資訊整理，正式內容與參拜安排請以廟方公告為準。"},
    )


@router.get("/deities/{deity_id}", response_model=ApiResponse[Deity])
async def get_deity(deity_id: str) -> ApiResponse[Deity]:
    deity = get_repository().get_deity(deity_id)
    if not deity or deity.status != "published":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="deity_not_found")
    return ApiResponse(data=deity)


def _masked_phone(value: str | None) -> str | None:
    digits = "".join(character for character in value or "" if character.isdigit())
    if len(digits) < 7:
        return None
    return f"{digits[:4]}***{digits[-3:]}"


def _registration_lookup_result(registration: Registration) -> RegistrationLookupResult | None:
    event = get_repository().get_event(registration.event_id)
    if not event:
        return None
    return RegistrationLookupResult(
        registration_id=registration.registration_id,
        event_id=registration.event_id,
        event_title=event.title,
        event_date=event.date,
        event_time=f"{event.start_time}-{event.end_time}",
        event_location=event.location,
        status=registration.status,
        party_size=registration.party_size,
        reminder_opt_in=registration.reminder_opt_in,
        masked_phone=_masked_phone(registration.phone),
        created_at=registration.created_at,
    )


@router.get("/temple/profile", response_model=ApiResponse[TempleProfile])
async def temple_profile() -> ApiResponse[TempleProfile]:
    return ApiResponse(data=get_repository().temple)


@router.get("/events", response_model=ApiResponse[list[Event]])
async def list_events() -> ApiResponse[list[Event]]:
    return ApiResponse(
        data=public_events(get_repository().list_events()),
        meta={"demo_notice": "活動資訊與報名狀態請以廟方公告為準。"},
    )


@router.get("/events/registrations/lookup", response_model=ApiResponse[list[RegistrationLookupResult]])
async def lookup_registrations(
    phone: str | None = Query(default=None, min_length=6, max_length=32),
    registration_id: str | None = Query(default=None, min_length=3, max_length=64),
) -> ApiResponse[list[RegistrationLookupResult]]:
    phone_key = phone.strip() if phone else None
    registration_key = registration_id.strip() if registration_id else None
    if not phone_key and not registration_key:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="lookup_key_required")

    results = [
        result
        for item in get_repository().lookup_registrations(phone_key, registration_key)
        if (result := _registration_lookup_result(item)) is not None
    ]
    return ApiResponse(
        data=results,
        meta={"demo_notice": "此查詢只顯示報名狀態；正式活動資訊請以廟方公告為準。"},
    )


@router.get("/events/{event_id}", response_model=ApiResponse[Event])
async def get_event(event_id: str) -> ApiResponse[Event]:
    event = resolve_public_event(get_repository(), event_id)
    if not event or not is_public_event(event):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="event_not_found")
    return ApiResponse(data=event)


@router.post("/events/{event_id}/registrations", response_model=ApiResponse[Registration])
async def create_registration(
    event_id: str,
    payload: RegistrationCreate,
    x_liff_id_token: str | None = Header(default=None, alias="X-LIFF-ID-Token"),
) -> ApiResponse[Registration]:
    repo = get_repository()
    event = resolve_public_event(repo, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="event_not_found")
    event_id = event.event_id
    if not event.requires_registration:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="registration_not_required")
    if not is_registration_open(event):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="registration_not_open")
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
        if detail == "event_capacity_exceeded" and event.waitlist_enabled:
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
            "demo_notice": "報名紀錄已建立；正式活動資訊仍以廟方公告為準。",
        },
    )
