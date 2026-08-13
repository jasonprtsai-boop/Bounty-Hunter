from datetime import UTC, datetime
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field, field_validator

T = TypeVar("T")


class ApiError(BaseModel):
    code: str
    message: str


class ApiResponse(BaseModel, Generic[T]):
    data: T | None = None
    error: ApiError | None = None
    meta: dict[str, Any] = Field(default_factory=dict)


class TempleProfile(BaseModel):
    temple_id: str
    name: str
    aliases: list[str] = Field(default_factory=list)
    main_deity: str
    address: str
    phone: str
    coordinates: dict[str, float] = Field(default_factory=dict)
    image: dict[str, str] | None = None
    demo_positioning: str
    sources: list[dict[str, Any]] = Field(default_factory=list)


class Event(BaseModel):
    event_id: str
    title: str
    category: str
    source_type: str
    date: str
    start_time: str
    end_time: str
    location: str
    address: str
    summary: str
    requires_registration: bool
    capacity: int | None = None
    registered_count: int = 0
    status: str
    registration_fields: list[str] = Field(default_factory=list)
    payment_policy: str | None = None
    demo_note: str


class EventCreate(BaseModel):
    event_id: str | None = None
    title: str
    category: str
    source_type: str = "team_demo_sample"
    date: str
    start_time: str
    end_time: str
    location: str
    address: str
    summary: str
    requires_registration: bool = False
    capacity: int | None = Field(default=None, ge=1)
    registered_count: int = Field(default=0, ge=0)
    status: str = "draft"
    registration_fields: list[str] = Field(default_factory=list)
    payment_policy: str | None = None
    demo_note: str = "後台建立的 Demo 活動，不代表萬春宮官方活動。"


class EventUpdate(BaseModel):
    title: str | None = None
    category: str | None = None
    source_type: str | None = None
    date: str | None = None
    start_time: str | None = None
    end_time: str | None = None
    location: str | None = None
    address: str | None = None
    summary: str | None = None
    requires_registration: bool | None = None
    capacity: int | None = Field(default=None, ge=1)
    registered_count: int | None = Field(default=None, ge=0)
    status: str | None = None
    registration_fields: list[str] | None = None
    payment_policy: str | None = None
    demo_note: str | None = None


class LineUser(BaseModel):
    user_id: str
    line_display_name: str
    segment: str = "visitor"
    consent_status: str = "demo_consented"
    interests: list[str] = Field(default_factory=list)
    created_at: str | None = None


class Registration(BaseModel):
    registration_id: str
    event_id: str
    user_id: str
    status: str = "confirmed"
    party_size: int = 1
    reminder_opt_in: bool = True
    created_at: str | None = None
    contact_name: str | None = None
    phone: str | None = None
    note: str | None = None


class RegistrationCreate(BaseModel):
    user_id: str = "demo_u001"
    contact_name: str
    phone: str | None = None
    party_size: int = Field(default=1, ge=1, le=10)
    reminder_opt_in: bool = True
    note: str | None = None


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=500)
    user_id: str = Field(default="demo_u001", max_length=128)
    source: str = Field(default="liff", max_length=32)

    @field_validator("message")
    @classmethod
    def normalize_message(cls, value: str) -> str:
        message = value.strip()
        if not message:
            raise ValueError("message_empty")
        return message


class FAQRule(BaseModel):
    rule_id: str
    intent: str
    title: str
    keywords: list[str] = Field(default_factory=list)
    negative_keywords: list[str] = Field(default_factory=list)
    reply: str
    priority: int = 100
    enabled: bool = True
    source_type: str = "fixed_reply"
    source_refs: list[dict[str, str]] = Field(default_factory=list)


class ChatReply(BaseModel):
    intent: str
    reply: str
    sources: list[dict[str, str]] = Field(default_factory=list)
    events: list[Event] = Field(default_factory=list)
    flex_message: dict[str, Any] | None = None
    demo_notice: str


class LiffVerifyRequest(BaseModel):
    id_token: str


class LiffSession(BaseModel):
    user_id: str
    display_name: str
    picture_url: str | None = None
    verified: bool
    demo_mode: bool


class SupportTicketCreate(BaseModel):
    user_id: str = "demo_u001"
    category: str = "general"
    subject: str
    message: str
    contact_name: str | None = None
    phone: str | None = None


class SupportTicket(BaseModel):
    ticket_id: str
    user_id: str
    category: str
    subject: str
    message: str
    status: str
    priority: str
    created_at: str
    model_config = ConfigDict(from_attributes=True)


class SupportTicketUpdate(BaseModel):
    status: str | None = None
    priority: str | None = None
    subject: str | None = None
    message: str | None = None


class FortuneSlip(BaseModel):
    slip_id: str
    title: str
    poem: str
    plain_language: str
    cultural_note: str
    reminder: str


class TourSpot(BaseModel):
    code: str
    title: str
    category: str
    summary: str
    cultural_note: str
    image_url: str | None = None
    source_type: str = "demo_sample"


class DashboardSummary(BaseModel):
    snapshot_date: str
    notice: str
    headline_metrics: dict[str, int]
    event_metrics: list[dict[str, Any]]
    top_ai_intents: list[dict[str, Any]]
    knowledge_gaps: list[str]
    generated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class KnowledgeDocument(BaseModel):
    document_id: str
    title: str
    body: str
    source_type: str = "demo_knowledge_base"
    status: str = "published"


class KnowledgeDocumentCreate(BaseModel):
    document_id: str | None = None
    title: str
    body: str
    source_type: str = "admin_demo_knowledge"
    status: str = "published"


class KnowledgeDocumentUpdate(BaseModel):
    title: str | None = None
    body: str | None = None
    source_type: str | None = None
    status: str | None = None


class NotificationJob(BaseModel):
    job_id: str
    job_type: str
    target_user_id: str | None = None
    event_id: str | None = None
    status: str = "draft"
    scheduled_at: str | None = None
    payload: dict[str, Any] = Field(default_factory=dict)


class NotificationJobCreate(BaseModel):
    job_id: str | None = None
    job_type: str
    target_user_id: str | None = None
    event_id: str | None = None
    status: str = "draft"
    scheduled_at: str | None = None
    payload: dict[str, Any] = Field(default_factory=dict)


class NotificationJobUpdate(BaseModel):
    job_type: str | None = None
    target_user_id: str | None = None
    event_id: str | None = None
    status: str | None = None
    scheduled_at: str | None = None
    payload: dict[str, Any] | None = None
