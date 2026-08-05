from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import get_settings
from app.core.security import require_admin_token
from app.db.supabase import get_repository
from app.schemas.common import (
    ApiResponse,
    DashboardSummary,
    Event,
    SupportTicket,
)
from app.services.notification_service import NotificationService
from app.services.rich_menu_service import RichMenuService

router = APIRouter(dependencies=[Depends(require_admin_token)])


@router.get("/dashboard/summary", response_model=ApiResponse[DashboardSummary])
async def dashboard_summary() -> ApiResponse[DashboardSummary]:
    return ApiResponse(data=get_repository().dashboard_summary())


@router.get("/events", response_model=ApiResponse[list[Event]])
async def admin_list_events() -> ApiResponse[list[Event]]:
    return ApiResponse(data=get_repository().list_events())


@router.get("/support-tickets", response_model=ApiResponse[list[SupportTicket]])
async def admin_support_tickets() -> ApiResponse[list[SupportTicket]]:
    return ApiResponse(data=get_repository().list_support_tickets())


@router.get("/knowledge-documents", response_model=ApiResponse[list[dict[str, str]]])
async def admin_knowledge_documents() -> ApiResponse[list[dict[str, str]]]:
    settings = get_settings()
    knowledge = [
        {
            "document_id": path.stem,
            "title": path.stem,
            "status": "published",
            "source_type": "demo_knowledge_base",
        }
        for path in settings.knowledge_dir.glob("*.md")
    ]
    return ApiResponse(data=knowledge)


@router.get("/notification-jobs", response_model=ApiResponse[list[dict[str, str]]])
async def admin_notification_jobs() -> ApiResponse[list[dict[str, str]]]:
    return ApiResponse(
        data=[
            {
                "job_id": "demo_registration_confirmation",
                "type": "registration_confirmation",
                "status": "ready",
            },
            {
                "job_id": "demo_event_reminder",
                "type": "event_reminder",
                "status": "draft",
            },
        ]
    )


@router.post("/rich-menu/publish", response_model=ApiResponse[dict[str, object]])
async def publish_rich_menu_payload() -> ApiResponse[dict[str, object]]:
    return ApiResponse(
        data=RichMenuService().main_menu_payload(),
        meta={"next_step": "Use scripts/create_rich_menu.py to publish this payload to LINE."},
    )


@router.post("/notifications/{user_id}/send-test", response_model=ApiResponse[dict[str, object]])
async def send_test_notification(user_id: str) -> ApiResponse[dict[str, object]]:
    result = await NotificationService(get_repository()).send_test_notification(
        user_id,
        "Temple AI OS 測試推播：這是 Demo 訊息。",
    )
    if result.get("sent") is False and result.get("reason") != "LINE_CHANNEL_ACCESS_TOKEN is not configured":
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=result)
    return ApiResponse(data=result)
