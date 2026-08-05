import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.core.config import get_settings
from app.schemas.common import (
    DashboardSummary,
    Event,
    FortuneSlip,
    LineUser,
    Registration,
    RegistrationCreate,
    SupportTicket,
    SupportTicketCreate,
    TempleProfile,
    TourSpot,
)


def _read_json(path: Path, fallback: Any) -> Any:
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


class DemoRepository:
    """Local demo repository; keeps the app usable before external accounts are configured."""

    def __init__(self) -> None:
        settings = get_settings()
        data_dir = settings.demo_data_dir
        self.temple = TempleProfile.model_validate(_read_json(settings.temple_profile_path, {}))
        self.events = [
            Event.model_validate(item) for item in _read_json(data_dir / "demo_events.json", [])
        ]
        self.users = [
            LineUser.model_validate(item) for item in _read_json(data_dir / "demo_users.json", [])
        ]
        self.registrations = [
            Registration.model_validate(item)
            for item in _read_json(data_dir / "demo_registrations.json", [])
        ]
        self.dashboard = DashboardSummary.model_validate(
            _read_json(data_dir / "demo_dashboard_snapshot.json", {})
        )
        self.tickets: list[SupportTicket] = []
        self.processed_line_event_ids: set[str] = set()
        self.fortune_slips = self._build_fortune_slips()
        self.tour_spots = self._build_tour_spots()

    def _build_fortune_slips(self) -> list[FortuneSlip]:
        return [
            FortuneSlip(
                slip_id="fortune_culture_001",
                title="靜心觀路",
                poem="香煙一縷照初心，行到廟前問本心。",
                plain_language="先把問題拆小，再決定下一步。這不是命運判斷，而是文化式的自我整理。",
                cultural_note="籤詩在民間文化中常被用來提醒人沉澱心緒；本 Demo 只提供文化解說。",
                reminder="不保證吉凶，不替代醫療、法律、財務或人生重大決策建議。",
            ),
            FortuneSlip(
                slip_id="fortune_culture_002",
                title="循序成事",
                poem="一階一履過前庭，風來仍聽鼓聲清。",
                plain_language="事情適合分階段處理，先確認資訊來源，再安排時間與資源。",
                cultural_note="以宮廟建築動線作比喻，提醒使用者按部就班。",
                reminder="若問題涉及報名、付款或廟方決策，請以廟方公告為準。",
            ),
            FortuneSlip(
                slip_id="fortune_culture_003",
                title="問清再行",
                poem="燈前莫急定行藏，問得分明路自長。",
                plain_language="資訊不足時不要急著下結論，可以先列出要確認的問題。",
                cultural_note="這是以傳統籤詩語感寫成的正向提醒，不代表神諭。",
                reminder="AI 不能代表神明或廟方作出指示。",
            ),
        ]

    def _build_tour_spots(self) -> list[TourSpot]:
        image_url = self.temple.image["url"] if self.temple.image else None
        return [
            TourSpot(
                code="main-hall",
                title="萬春宮正殿",
                category="參拜動線",
                summary="示範點位：第一次到訪者可從正殿認識主祀天上聖母與基本參拜動線。",
                cultural_note="此內容依公開資料與 Demo 摘要整理，現場細節仍以廟方公告為準。",
                image_url=image_url,
                source_type="open_data_plus_demo_summary",
            ),
            TourSpot(
                code="history-wall",
                title="宮廟文化故事牆",
                category="文化導覽",
                summary="示範點位：用 LINE LIFF 呈現萬春宮歷史、城市信仰與文化脈絡摘要。",
                cultural_note="正式導入前，歷史文字與圖片應由廟方審核或採用明確授權素材。",
                image_url=image_url,
                source_type="demo_sample",
            ),
        ]

    def list_events(self) -> list[Event]:
        return sorted(self.events, key=lambda event: (event.date, event.start_time))

    def get_event(self, event_id: str) -> Event | None:
        return next((event for event in self.events if event.event_id == event_id), None)

    def list_users(self) -> list[LineUser]:
        return self.users

    def get_user(self, user_id: str) -> LineUser | None:
        return next((user for user in self.users if user.user_id == user_id), None)

    def get_or_create_line_user(self, user_id: str, display_name: str = "LINE 使用者") -> LineUser:
        user = self.get_user(user_id)
        if user:
            return user
        user = LineUser(
            user_id=user_id,
            line_display_name=display_name,
            segment="line_friend",
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        self.users.append(user)
        return user

    def list_registrations(self, user_id: str | None = None) -> list[Registration]:
        if user_id:
            return [item for item in self.registrations if item.user_id == user_id]
        return self.registrations

    def create_registration(self, event_id: str, payload: RegistrationCreate) -> Registration:
        event = self.get_event(event_id)
        if not event:
            raise ValueError("event_not_found")
        if not event.requires_registration:
            raise ValueError("registration_not_required")

        current_total = sum(
            item.party_size
            for item in self.registrations
            if item.event_id == event_id and item.status in {"confirmed", "pending_review"}
        )
        if event.capacity is not None and current_total + payload.party_size > event.capacity:
            raise ValueError("event_capacity_exceeded")

        registration = Registration(
            registration_id=f"reg_{uuid.uuid4().hex[:8]}",
            event_id=event_id,
            user_id=payload.user_id,
            status="confirmed",
            party_size=payload.party_size,
            reminder_opt_in=payload.reminder_opt_in,
            created_at=datetime.now(timezone.utc).isoformat(),
            contact_name=payload.contact_name,
            phone=payload.phone,
            note=payload.note,
        )
        self.registrations.append(registration)
        event.registered_count += payload.party_size
        return registration

    def create_support_ticket(self, payload: SupportTicketCreate) -> SupportTicket:
        priority = "payment" if payload.category == "payment" else "general"
        ticket = SupportTicket(
            ticket_id=f"ticket_{uuid.uuid4().hex[:8]}",
            user_id=payload.user_id,
            category=payload.category,
            subject=payload.subject,
            message=payload.message,
            status="open",
            priority=priority,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        self.tickets.append(ticket)
        return ticket

    def list_support_tickets(self) -> list[SupportTicket]:
        return self.tickets

    def draw_fortune(self) -> FortuneSlip:
        index = datetime.now().second % len(self.fortune_slips)
        return self.fortune_slips[index]

    def get_tour_spot(self, code: str) -> TourSpot | None:
        return next((spot for spot in self.tour_spots if spot.code == code), None)

    def mark_line_event_processed(self, event_id: str | None) -> bool:
        if not event_id:
            return True
        if event_id in self.processed_line_event_ids:
            return False
        self.processed_line_event_ids.add(event_id)
        return True

    def dashboard_summary(self) -> DashboardSummary:
        summary = self.dashboard.model_copy(deep=True)
        summary.headline_metrics["registrations_total"] = len(self.registrations)
        return summary


_repo: DemoRepository | None = None


def get_repository() -> DemoRepository:
    global _repo
    if _repo is None:
        _repo = DemoRepository()
    return _repo

