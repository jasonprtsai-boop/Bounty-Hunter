import re
from datetime import UTC, datetime
from pathlib import Path

import httpx
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import get_settings
from app.core.security import (
    AdminPrincipal,
    authenticate_admin_credentials,
    create_admin_session,
    require_admin_token,
)
from app.db.supabase import get_repository
from app.schemas.common import (
    AdminAccount,
    AdminAccountCreate,
    AdminAccountUpdate,
    AdminCurrentUser,
    AdminLoginRequest,
    AdminLoginResponse,
    ApiResponse,
    DashboardSummary,
    Event,
    EventCreate,
    EventUpdate,
    KnowledgeDocument,
    KnowledgeDocumentCreate,
    KnowledgeDocumentUpdate,
    NotificationJob,
    NotificationJobCreate,
    NotificationJobUpdate,
    SupportTicket,
    SupportTicketUpdate,
)
from app.services.notification_service import NotificationService
from app.services.rich_menu_service import RichMenuService

auth_router = APIRouter()
router = APIRouter(dependencies=[Depends(require_admin_token)])
SAFE_DOCUMENT_ID = re.compile(r"^[A-Za-z0-9_\-\u4e00-\u9fff]+$")


def _require_owner(principal: AdminPrincipal) -> None:
    if principal.role != "owner":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="owner_role_required")


def _admin_account_error_status(detail: str) -> int:
    if detail == "admin_account_exists":
        return status.HTTP_409_CONFLICT
    if detail == "last_owner_account":
        return status.HTTP_409_CONFLICT
    return status.HTTP_422_UNPROCESSABLE_CONTENT


def _knowledge_path(document_id: str) -> Path:
    if not SAFE_DOCUMENT_ID.fullmatch(document_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="invalid_document_id")
    settings = get_settings()
    path = (settings.knowledge_dir / f"{document_id}.md").resolve()
    knowledge_root = settings.knowledge_dir.resolve()
    if not path.is_relative_to(knowledge_root):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="invalid_document_id")
    return path


def _document_id_from_title(title: str) -> str:
    candidate = re.sub(r"\s+", "_", title.strip())
    candidate = re.sub(r"[^A-Za-z0-9_\-\u4e00-\u9fff]", "", candidate)
    return candidate[:80] or "admin_knowledge"


def _read_knowledge_document(path: Path) -> KnowledgeDocument:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    title = path.stem
    if lines and lines[0].startswith("#"):
        title = lines[0].lstrip("# ").strip() or path.stem
    source_type = "demo_knowledge_base"
    for line in lines:
        if line.startswith("來源類型："):
            source_type = line.replace("來源類型：", "").strip()
            break
    return KnowledgeDocument(
        document_id=path.stem,
        title=title,
        body=text,
        source_type=source_type,
        status="published",
    )


def _write_knowledge_document(path: Path, title: str, body: str, source_type: str, status: str) -> None:
    normalized_body = body.strip()
    if not normalized_body.startswith("#"):
        normalized_body = f"# {title.strip()}\n\n來源類型：{source_type.strip()}\n\n{normalized_body}"
    if "來源類型：" not in normalized_body:
        normalized_body = f"{normalized_body}\n\n來源類型：{source_type.strip()}"
    if status != "published":
        normalized_body = f"{normalized_body}\n\n狀態：{status}"
    path.write_text(f"{normalized_body.rstrip()}\n", encoding="utf-8")


@auth_router.post("/auth/login", response_model=ApiResponse[AdminLoginResponse])
async def admin_login(payload: AdminLoginRequest) -> ApiResponse[AdminLoginResponse]:
    settings = get_settings()
    principal = authenticate_admin_credentials(payload.username, payload.password, settings)
    token, expires_at = create_admin_session(
        principal.actor,
        role=principal.role,
        display_name=principal.display_name,
        settings=settings,
    )
    return ApiResponse(
        data=AdminLoginResponse(
            access_token=token,
            actor=principal.actor,
            display_name=principal.display_name or principal.actor,
            role=principal.role,
            expires_at=datetime.fromtimestamp(expires_at, UTC).isoformat(),
            expires_in_seconds=settings.admin_session_ttl_seconds,
        )
    )


@router.get("/auth/me", response_model=ApiResponse[AdminCurrentUser])
async def admin_me(
    principal: AdminPrincipal = Depends(require_admin_token),
) -> ApiResponse[AdminCurrentUser]:
    return ApiResponse(
        data=AdminCurrentUser(
            actor=principal.actor,
            display_name=principal.display_name or principal.actor,
            role=principal.role,
        )
    )


@router.get("/accounts", response_model=ApiResponse[list[AdminAccount]])
async def admin_list_accounts(
    principal: AdminPrincipal = Depends(require_admin_token),
) -> ApiResponse[list[AdminAccount]]:
    _require_owner(principal)
    return ApiResponse(data=get_repository().list_admin_accounts())


@router.post(
    "/accounts",
    response_model=ApiResponse[AdminAccount],
    status_code=status.HTTP_201_CREATED,
)
async def admin_create_account(
    payload: AdminAccountCreate,
    principal: AdminPrincipal = Depends(require_admin_token),
) -> ApiResponse[AdminAccount]:
    _require_owner(principal)
    try:
        account = get_repository().create_admin_account(payload, created_by=principal.actor)
    except ValueError as exc:
        detail = str(exc)
        raise HTTPException(status_code=_admin_account_error_status(detail), detail=detail) from exc
    return ApiResponse(data=account)


@router.put("/accounts/{username}", response_model=ApiResponse[AdminAccount])
async def admin_update_account(
    username: str,
    payload: AdminAccountUpdate,
    principal: AdminPrincipal = Depends(require_admin_token),
) -> ApiResponse[AdminAccount]:
    _require_owner(principal)
    if username == principal.actor and payload.status == "disabled":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="cannot_disable_current_account")
    try:
        account = get_repository().update_admin_account(username, payload)
    except ValueError as exc:
        detail = str(exc)
        raise HTTPException(status_code=_admin_account_error_status(detail), detail=detail) from exc
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="admin_account_not_found")
    return ApiResponse(data=account)


@router.delete("/accounts/{username}", response_model=ApiResponse[dict[str, bool]])
async def admin_delete_account(
    username: str,
    principal: AdminPrincipal = Depends(require_admin_token),
) -> ApiResponse[dict[str, bool]]:
    _require_owner(principal)
    if username == principal.actor:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="cannot_delete_current_account")
    try:
        deleted = get_repository().delete_admin_account(username)
    except ValueError as exc:
        detail = str(exc)
        raise HTTPException(status_code=_admin_account_error_status(detail), detail=detail) from exc
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="admin_account_not_found")
    return ApiResponse(data={"deleted": True})


@router.get("/dashboard/summary", response_model=ApiResponse[DashboardSummary])
async def dashboard_summary() -> ApiResponse[DashboardSummary]:
    return ApiResponse(data=get_repository().dashboard_summary())


@router.get("/events", response_model=ApiResponse[list[Event]])
async def admin_list_events() -> ApiResponse[list[Event]]:
    return ApiResponse(data=get_repository().list_events())


@router.post("/events", response_model=ApiResponse[Event], status_code=status.HTTP_201_CREATED)
async def admin_create_event(payload: EventCreate) -> ApiResponse[Event]:
    try:
        event = get_repository().create_event(payload)
    except ValueError as exc:
        detail = str(exc)
        status_code = (
            status.HTTP_409_CONFLICT
            if detail == "event_already_exists"
            else status.HTTP_422_UNPROCESSABLE_CONTENT
        )
        raise HTTPException(status_code=status_code, detail=detail) from exc
    return ApiResponse(data=event)


@router.put("/events/{event_id}", response_model=ApiResponse[Event])
async def admin_update_event(event_id: str, payload: EventUpdate) -> ApiResponse[Event]:
    try:
        event = get_repository().update_event(event_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(exc)) from exc
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="event_not_found")
    return ApiResponse(data=event)


@router.delete("/events/{event_id}", response_model=ApiResponse[dict[str, bool]])
async def admin_delete_event(event_id: str) -> ApiResponse[dict[str, bool]]:
    deleted = get_repository().delete_event(event_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="event_not_found")
    return ApiResponse(data={"deleted": True})


@router.get("/support-tickets", response_model=ApiResponse[list[SupportTicket]])
async def admin_support_tickets() -> ApiResponse[list[SupportTicket]]:
    return ApiResponse(data=get_repository().list_support_tickets())


@router.patch("/support-tickets/{ticket_id}", response_model=ApiResponse[SupportTicket])
async def admin_update_support_ticket(
    ticket_id: str, payload: SupportTicketUpdate
) -> ApiResponse[SupportTicket]:
    ticket = get_repository().update_support_ticket(ticket_id, payload)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="support_ticket_not_found")
    return ApiResponse(data=ticket)


@router.delete("/support-tickets/{ticket_id}", response_model=ApiResponse[dict[str, bool]])
async def admin_delete_support_ticket(ticket_id: str) -> ApiResponse[dict[str, bool]]:
    deleted = get_repository().delete_support_ticket(ticket_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="support_ticket_not_found")
    return ApiResponse(data={"deleted": True})


@router.get("/knowledge-documents", response_model=ApiResponse[list[KnowledgeDocument]])
async def admin_knowledge_documents() -> ApiResponse[list[KnowledgeDocument]]:
    settings = get_settings()
    knowledge = [_read_knowledge_document(path) for path in sorted(settings.knowledge_dir.glob("*.md"))]
    return ApiResponse(data=knowledge)


@router.get("/knowledge-documents/{document_id}", response_model=ApiResponse[KnowledgeDocument])
async def admin_get_knowledge_document(document_id: str) -> ApiResponse[KnowledgeDocument]:
    path = _knowledge_path(document_id)
    if not path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="knowledge_document_not_found")
    return ApiResponse(data=_read_knowledge_document(path))


@router.post(
    "/knowledge-documents",
    response_model=ApiResponse[KnowledgeDocument],
    status_code=status.HTTP_201_CREATED,
)
async def admin_create_knowledge_document(
    payload: KnowledgeDocumentCreate,
) -> ApiResponse[KnowledgeDocument]:
    document_id = payload.document_id or _document_id_from_title(payload.title)
    path = _knowledge_path(document_id)
    if path.exists():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="knowledge_document_exists")
    _write_knowledge_document(path, payload.title, payload.body, payload.source_type, payload.status)
    return ApiResponse(data=_read_knowledge_document(path))


@router.put("/knowledge-documents/{document_id}", response_model=ApiResponse[KnowledgeDocument])
async def admin_update_knowledge_document(
    document_id: str, payload: KnowledgeDocumentUpdate
) -> ApiResponse[KnowledgeDocument]:
    path = _knowledge_path(document_id)
    if not path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="knowledge_document_not_found")
    current = _read_knowledge_document(path)
    title = payload.title if payload.title is not None else current.title
    body = payload.body if payload.body is not None else current.body
    source_type = payload.source_type if payload.source_type is not None else current.source_type
    status_value = payload.status if payload.status is not None else current.status
    _write_knowledge_document(path, title, body, source_type, status_value)
    return ApiResponse(data=_read_knowledge_document(path))


@router.delete("/knowledge-documents/{document_id}", response_model=ApiResponse[dict[str, bool]])
async def admin_delete_knowledge_document(document_id: str) -> ApiResponse[dict[str, bool]]:
    path = _knowledge_path(document_id)
    if not path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="knowledge_document_not_found")
    path.unlink()
    return ApiResponse(data={"deleted": True})


@router.get("/notification-jobs", response_model=ApiResponse[list[NotificationJob]])
async def admin_notification_jobs() -> ApiResponse[list[NotificationJob]]:
    return ApiResponse(data=get_repository().list_notification_jobs())


@router.post(
    "/notification-jobs",
    response_model=ApiResponse[NotificationJob],
    status_code=status.HTTP_201_CREATED,
)
async def admin_create_notification_job(payload: NotificationJobCreate) -> ApiResponse[NotificationJob]:
    try:
        job = get_repository().create_notification_job(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return ApiResponse(data=job)


@router.put("/notification-jobs/{job_id}", response_model=ApiResponse[NotificationJob])
async def admin_update_notification_job(
    job_id: str, payload: NotificationJobUpdate
) -> ApiResponse[NotificationJob]:
    job = get_repository().update_notification_job(job_id, payload)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="notification_job_not_found")
    return ApiResponse(data=job)


@router.delete("/notification-jobs/{job_id}", response_model=ApiResponse[dict[str, bool]])
async def admin_delete_notification_job(job_id: str) -> ApiResponse[dict[str, bool]]:
    deleted = get_repository().delete_notification_job(job_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="notification_job_not_found")
    return ApiResponse(data={"deleted": True})


@router.post("/notification-jobs/{job_id}/send-test", response_model=ApiResponse[dict[str, object]])
async def admin_send_notification_job_test(job_id: str) -> ApiResponse[dict[str, object]]:
    repo = get_repository()
    job = repo.get_notification_job(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="notification_job_not_found")
    result = await NotificationService(repo).send_notification_job(job)
    return ApiResponse(data=result, meta={"job_id": job_id, "target_user_id": job.target_user_id})


@router.post("/notification-jobs/send-due", response_model=ApiResponse[dict[str, object]])
async def admin_send_due_notification_jobs() -> ApiResponse[dict[str, object]]:
    result = await NotificationService(get_repository()).send_due_notification_jobs()
    return ApiResponse(data=result)


@router.post("/rich-menu/publish", response_model=ApiResponse[dict[str, object]])
async def publish_rich_menu_payload() -> ApiResponse[dict[str, object]]:
    try:
        result = await RichMenuService().publish_main_menu()
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={
                "reason": "line_api_error",
                "status_code": exc.response.status_code,
                "message": exc.response.text[:500],
            },
        ) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"reason": "line_api_error", "message": str(exc)[:500]},
        ) from exc
    if result.get("published") is False:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=result)
    return ApiResponse(data=result)


@router.post("/notifications/{user_id}/send-test", response_model=ApiResponse[dict[str, object]])
async def send_test_notification(user_id: str) -> ApiResponse[dict[str, object]]:
    result = await NotificationService(get_repository()).send_test_notification(
        user_id,
        "Temple AI OS 測試推播：這是 Demo 訊息。",
    )
    if result.get("sent") is False and result.get("reason") != "LINE_CHANNEL_ACCESS_TOKEN is not configured":
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=result)
    return ApiResponse(data=result)
