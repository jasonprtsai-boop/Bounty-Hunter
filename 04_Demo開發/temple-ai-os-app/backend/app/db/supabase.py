import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx

from app.core.config import get_settings
from app.schemas.common import (
    DashboardSummary,
    Event,
    EventCreate,
    EventUpdate,
    FortuneSlip,
    LineUser,
    NotificationJob,
    NotificationJobCreate,
    NotificationJobUpdate,
    Registration,
    RegistrationCreate,
    SupportTicket,
    SupportTicketCreate,
    SupportTicketUpdate,
    TempleProfile,
    TourSpot,
)


TEMPLE_ID = "wcg_taichung_demo"


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
        self.initial_registration_count = len(self.registrations)
        self.dashboard = DashboardSummary.model_validate(
            _read_json(data_dir / "demo_dashboard_snapshot.json", {})
        )
        self.tickets = [
            SupportTicket.model_validate(item)
            for item in _read_json(data_dir / "demo_support_tickets.json", [])
        ]
        self.notification_jobs = [
            NotificationJob.model_validate(item)
            for item in _read_json(data_dir / "demo_notification_jobs.json", [])
        ]
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

    def create_event(self, payload: EventCreate) -> Event:
        event_id = payload.event_id or f"evt_admin_{uuid.uuid4().hex[:8]}"
        if self.get_event(event_id):
            raise ValueError("event_already_exists")
        if payload.capacity is not None and payload.registered_count > payload.capacity:
            raise ValueError("event_capacity_below_registrations")
        event = Event(event_id=event_id, **payload.model_dump(exclude={"event_id"}))
        self.events.append(event)
        return event

    def update_event(self, event_id: str, payload: EventUpdate) -> Event | None:
        event = self.get_event(event_id)
        if not event:
            return None
        updates = payload.model_dump(exclude_unset=True)
        next_capacity = updates.get("capacity", event.capacity)
        confirmed_total = self._confirmed_party_total(event_id)
        if next_capacity is not None and confirmed_total > next_capacity:
            raise ValueError("event_capacity_below_registrations")
        if "registered_count" in updates and next_capacity is not None:
            next_registered_count = int(updates["registered_count"] or 0)
            if next_registered_count > next_capacity:
                raise ValueError("event_capacity_below_registrations")
        for key, value in updates.items():
            setattr(event, key, value)
        return event

    def delete_event(self, event_id: str) -> bool:
        event = self.get_event(event_id)
        if not event:
            return False
        self.events = [item for item in self.events if item.event_id != event_id]
        self.registrations = [item for item in self.registrations if item.event_id != event_id]
        return True

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

        current_total = self._confirmed_party_total(event_id)
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

    def _confirmed_party_total(self, event_id: str) -> int:
        return sum(
            item.party_size
            for item in self.registrations
            if item.event_id == event_id and item.status in {"confirmed", "pending_review"}
        )

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

    def update_support_ticket(
        self, ticket_id: str, payload: SupportTicketUpdate
    ) -> SupportTicket | None:
        ticket = next((item for item in self.tickets if item.ticket_id == ticket_id), None)
        if not ticket:
            return None
        updates = payload.model_dump(exclude_unset=True)
        for key, value in updates.items():
            setattr(ticket, key, value)
        return ticket

    def delete_support_ticket(self, ticket_id: str) -> bool:
        ticket = next((item for item in self.tickets if item.ticket_id == ticket_id), None)
        if not ticket:
            return False
        self.tickets = [item for item in self.tickets if item.ticket_id != ticket_id]
        return True

    def list_notification_jobs(self) -> list[NotificationJob]:
        return self.notification_jobs

    def get_notification_job(self, job_id: str) -> NotificationJob | None:
        return next((item for item in self.notification_jobs if item.job_id == job_id), None)

    def create_notification_job(self, payload: NotificationJobCreate) -> NotificationJob:
        job_id = payload.job_id or f"job_admin_{uuid.uuid4().hex[:8]}"
        if self.get_notification_job(job_id):
            raise ValueError("notification_job_exists")
        job = NotificationJob(job_id=job_id, **payload.model_dump(exclude={"job_id"}))
        self.notification_jobs.append(job)
        return job

    def update_notification_job(
        self, job_id: str, payload: NotificationJobUpdate
    ) -> NotificationJob | None:
        job = self.get_notification_job(job_id)
        if not job:
            return None
        updates = payload.model_dump(exclude_unset=True)
        for key, value in updates.items():
            setattr(job, key, value)
        return job

    def delete_notification_job(self, job_id: str) -> bool:
        job = self.get_notification_job(job_id)
        if not job:
            return False
        self.notification_jobs = [item for item in self.notification_jobs if item.job_id != job_id]
        return True

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
        baseline_total = summary.headline_metrics.get("registrations_total", 0)
        session_delta = max(0, len(self.registrations) - self.initial_registration_count)
        summary.headline_metrics["registrations_total"] = baseline_total + session_delta
        return summary


class SupabaseRepository:
    """Supabase REST repository used when DEMO_MODE=false."""

    def __init__(self, supabase_url: str, service_role_key: str) -> None:
        self.rest_url = f"{supabase_url.rstrip('/')}/rest/v1"
        self.client = httpx.Client(
            timeout=20,
            headers={
                "apikey": service_role_key,
                "Authorization": f"Bearer {service_role_key}",
                "Content-Type": "application/json",
            },
        )
        self.temple = self._get_temple()

    def _request(
        self,
        method: str,
        table: str,
        *,
        params: dict[str, str] | None = None,
        json_body: Any | None = None,
        prefer: str | None = None,
        allow_not_found: bool = False,
    ) -> Any:
        headers = {"Prefer": prefer} if prefer else None
        response = self.client.request(
            method,
            f"{self.rest_url}/{table}",
            params=params,
            json=json_body,
            headers=headers,
        )
        if allow_not_found and response.status_code == 404:
            return []
        if response.status_code >= 400:
            raise RuntimeError(f"supabase_{table}_{response.status_code}: {response.text[:300]}")
        if response.status_code == 204 or not response.content:
            return []
        return response.json()

    def _select(self, table: str, params: dict[str, str] | None = None) -> list[dict[str, Any]]:
        rows = self._request("GET", table, params={"select": "*", **(params or {})})
        return rows if isinstance(rows, list) else []

    def _single(self, table: str, column: str, value: str) -> dict[str, Any] | None:
        rows = self._select(table, {column: f"eq.{value}", "limit": "1"})
        return rows[0] if rows else None

    def _insert_returning(self, table: str, row: dict[str, Any]) -> dict[str, Any]:
        rows = self._request("POST", table, json_body=row, prefer="return=representation")
        if not rows:
            raise RuntimeError(f"supabase_{table}_empty_insert")
        return rows[0]

    def _patch_returning(
        self,
        table: str,
        key: str,
        value: str,
        updates: dict[str, Any],
    ) -> dict[str, Any] | None:
        rows = self._request(
            "PATCH",
            table,
            params={key: f"eq.{value}"},
            json_body=updates,
            prefer="return=representation",
        )
        return rows[0] if rows else None

    def _delete_returning(self, table: str, key: str, value: str) -> bool:
        rows = self._request(
            "DELETE",
            table,
            params={key: f"eq.{value}"},
            prefer="return=representation",
        )
        return bool(rows)

    def _get_temple(self) -> TempleProfile:
        row = self._single("temples", "temple_id", TEMPLE_ID)
        if not row:
            raise RuntimeError("supabase_temple_profile_missing")
        return TempleProfile.model_validate(row)

    @staticmethod
    def _event_from_row(row: dict[str, Any]) -> Event:
        data = dict(row)
        data["date"] = data.pop("event_date")
        return Event.model_validate(data)

    @staticmethod
    def _event_row(payload: EventCreate | EventUpdate, event_id: str | None = None) -> dict[str, Any]:
        data = payload.model_dump(exclude_unset=isinstance(payload, EventUpdate))
        if event_id is not None:
            data["event_id"] = event_id
        if "date" in data:
            data["event_date"] = data.pop("date")
        if "event_id" in data:
            data["temple_id"] = TEMPLE_ID
        return {key: value for key, value in data.items() if value is not None}

    def list_events(self) -> list[Event]:
        rows = self._select("events", {"order": "event_date.asc,start_time.asc"})
        return [self._event_from_row(row) for row in rows]

    def get_event(self, event_id: str) -> Event | None:
        row = self._single("events", "event_id", event_id)
        return self._event_from_row(row) if row else None

    def create_event(self, payload: EventCreate) -> Event:
        event_id = payload.event_id or f"evt_admin_{uuid.uuid4().hex[:8]}"
        if self.get_event(event_id):
            raise ValueError("event_already_exists")
        if payload.capacity is not None and payload.registered_count > payload.capacity:
            raise ValueError("event_capacity_below_registrations")
        return self._event_from_row(self._insert_returning("events", self._event_row(payload, event_id)))

    def update_event(self, event_id: str, payload: EventUpdate) -> Event | None:
        event = self.get_event(event_id)
        if not event:
            return None
        updates = self._event_row(payload)
        next_capacity = updates.get("capacity", event.capacity)
        confirmed_total = self._confirmed_party_total(event_id)
        if next_capacity is not None and confirmed_total > int(next_capacity):
            raise ValueError("event_capacity_below_registrations")
        row = self._patch_returning("events", "event_id", event_id, updates)
        return self._event_from_row(row) if row else None

    def delete_event(self, event_id: str) -> bool:
        return self._delete_returning("events", "event_id", event_id)

    def list_users(self) -> list[LineUser]:
        return [LineUser.model_validate(row) for row in self._select("line_users")]

    def get_user(self, user_id: str) -> LineUser | None:
        row = self._single("line_users", "user_id", user_id)
        return LineUser.model_validate(row) if row else None

    def get_or_create_line_user(self, user_id: str, display_name: str = "LINE user") -> LineUser:
        row = {
            "user_id": user_id,
            "line_display_name": display_name,
            "segment": "line_friend",
        }
        rows = self._request(
            "POST",
            "line_users",
            params={"on_conflict": "user_id"},
            json_body=row,
            prefer="resolution=merge-duplicates,return=representation",
        )
        return LineUser.model_validate(rows[0])

    def list_registrations(self, user_id: str | None = None) -> list[Registration]:
        params = {"order": "created_at.desc"}
        if user_id:
            params["user_id"] = f"eq.{user_id}"
        return [Registration.model_validate(row) for row in self._select("event_registrations", params)]

    def create_registration(self, event_id: str, payload: RegistrationCreate) -> Registration:
        event = self.get_event(event_id)
        if not event:
            raise ValueError("event_not_found")
        if not event.requires_registration:
            raise ValueError("registration_not_required")
        current_total = self._confirmed_party_total(event_id)
        if event.capacity is not None and current_total + payload.party_size > event.capacity:
            raise ValueError("event_capacity_exceeded")

        row = {
            "registration_id": f"reg_{uuid.uuid4().hex[:8]}",
            "event_id": event_id,
            "user_id": payload.user_id,
            "status": "confirmed",
            "party_size": payload.party_size,
            "reminder_opt_in": payload.reminder_opt_in,
            "contact_name": payload.contact_name,
            "phone": payload.phone,
            "note": payload.note,
        }
        registration = Registration.model_validate(
            self._insert_returning("event_registrations", row)
        )
        self._patch_returning(
            "events",
            "event_id",
            event_id,
            {"registered_count": current_total + payload.party_size},
        )
        return registration

    def _confirmed_party_total(self, event_id: str) -> int:
        rows = self._select(
            "event_registrations",
            {
                "event_id": f"eq.{event_id}",
                "status": "in.(confirmed,pending_review)",
                "select": "party_size",
            },
        )
        return sum(int(row.get("party_size") or 0) for row in rows)

    def create_support_ticket(self, payload: SupportTicketCreate) -> SupportTicket:
        row = payload.model_dump(exclude={"contact_name", "phone"})
        row.update(
            {
                "ticket_id": f"ticket_{uuid.uuid4().hex[:8]}",
                "status": "open",
                "priority": "payment" if payload.category == "payment" else "general",
            }
        )
        row = {key: value for key, value in row.items() if value is not None}
        return SupportTicket.model_validate(self._insert_returning("support_tickets", row))

    def list_support_tickets(self) -> list[SupportTicket]:
        rows = self._select("support_tickets", {"order": "created_at.desc"})
        return [SupportTicket.model_validate(row) for row in rows]

    def update_support_ticket(
        self, ticket_id: str, payload: SupportTicketUpdate
    ) -> SupportTicket | None:
        row = self._patch_returning(
            "support_tickets",
            "ticket_id",
            ticket_id,
            payload.model_dump(exclude_unset=True),
        )
        return SupportTicket.model_validate(row) if row else None

    def delete_support_ticket(self, ticket_id: str) -> bool:
        return self._delete_returning("support_tickets", "ticket_id", ticket_id)

    def list_notification_jobs(self) -> list[NotificationJob]:
        rows = self._select("notification_jobs", {"order": "created_at.desc"})
        return [NotificationJob.model_validate(row) for row in rows]

    def get_notification_job(self, job_id: str) -> NotificationJob | None:
        row = self._single("notification_jobs", "job_id", job_id)
        return NotificationJob.model_validate(row) if row else None

    def create_notification_job(self, payload: NotificationJobCreate) -> NotificationJob:
        job_id = payload.job_id or f"job_admin_{uuid.uuid4().hex[:8]}"
        if self.get_notification_job(job_id):
            raise ValueError("notification_job_exists")
        row = payload.model_dump(exclude={"job_id"})
        row["job_id"] = job_id
        return NotificationJob.model_validate(self._insert_returning("notification_jobs", row))

    def update_notification_job(
        self, job_id: str, payload: NotificationJobUpdate
    ) -> NotificationJob | None:
        row = self._patch_returning(
            "notification_jobs",
            "job_id",
            job_id,
            payload.model_dump(exclude_unset=True),
        )
        return NotificationJob.model_validate(row) if row else None

    def delete_notification_job(self, job_id: str) -> bool:
        return self._delete_returning("notification_jobs", "job_id", job_id)

    def draw_fortune(self) -> FortuneSlip:
        rows = self._select("fortune_slips", {"status": "eq.published", "order": "slip_id.asc"})
        if not rows:
            raise RuntimeError("supabase_fortune_slips_missing")
        return FortuneSlip.model_validate(rows[datetime.now().second % len(rows)])

    def get_tour_spot(self, code: str) -> TourSpot | None:
        row = self._single("tour_spots", "code", code)
        return TourSpot.model_validate(row) if row else None

    def mark_line_event_processed(self, event_id: str | None) -> bool:
        if not event_id:
            return True
        response = self.client.post(
            f"{self.rest_url}/line_webhook_events",
            json={"event_id": event_id},
            headers={"Prefer": "return=minimal"},
        )
        if response.status_code == 409:
            return False
        if response.status_code >= 400:
            raise RuntimeError(f"supabase_line_webhook_events_{response.status_code}")
        return True

    def dashboard_summary(self) -> DashboardSummary:
        rows = self._select("dashboard_snapshots", {"order": "snapshot_date.desc", "limit": "1"})
        if not rows:
            raise RuntimeError("supabase_dashboard_snapshot_missing")
        return DashboardSummary.model_validate(rows[0])


Repository = DemoRepository | SupabaseRepository

_repo: Repository | None = None


def get_repository() -> Repository:
    global _repo
    if _repo is None:
        settings = get_settings()
        if settings.demo_mode:
            _repo = DemoRepository()
        else:
            if not settings.supabase_url or not settings.supabase_service_role_key:
                raise RuntimeError("supabase_not_configured")
            _repo = SupabaseRepository(settings.supabase_url, settings.supabase_service_role_key)
    return _repo
