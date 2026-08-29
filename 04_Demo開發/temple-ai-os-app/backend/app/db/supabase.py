import json
import logging
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx

from app.core.admin_identity import normalize_admin_login_id
from app.core.config import get_settings
from app.core.passwords import hash_admin_password, verify_admin_password
from app.schemas.common import (
    AdminAccount,
    AdminAccountCreate,
    AdminAccountUpdate,
    DashboardSummary,
    Event,
    EventCreate,
    EventUpdate,
    FAQRule,
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
logger = logging.getLogger(__name__)


def _read_json(path: Path, fallback: Any) -> Any:
    if not path.exists():
        raise RuntimeError(f"demo_data_missing: {path}")
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
        self.faq_rules = [
            FAQRule.model_validate(item) for item in _read_json(data_dir / "demo_faq_rules.json", [])
        ]
        self.admin_accounts = self._build_admin_accounts(settings)
        self.processed_line_event_ids: set[str] = set()
        self.audit_logs: list[dict[str, Any]] = []
        self.messages: list[dict[str, Any]] = []
        self.fortune_slips = self._build_fortune_slips()
        self.tour_spots = self._build_tour_spots()

    def _build_admin_accounts(self, settings) -> list[dict[str, Any]]:
        credentials = settings.admin_token_map.copy()
        credentials.update(settings.admin_account_map)
        if settings.app_env != "production" and not credentials:
            credentials["admin"] = settings.admin_demo_token

        now = datetime.now(timezone.utc).isoformat()
        accounts: list[dict[str, Any]] = []
        for index, (username, password) in enumerate(credentials.items()):
            role = "owner" if index == 0 else "manager"
            try:
                password_hash = hash_admin_password(password)
            except ValueError:
                password_hash = password
            accounts.append(
                {
                    "account_id": f"acct_{uuid.uuid5(uuid.NAMESPACE_DNS, username).hex[:12]}",
                    "username": username,
                    "display_name": "系統管理員" if role == "owner" else username,
                    "role": role,
                    "status": "active",
                    "password_hash": password_hash,
                    "created_at": now,
                    "updated_at": now,
                    "last_login_at": None,
                }
            )
        return accounts

    @staticmethod
    def _admin_account_from_record(record: dict[str, Any]) -> AdminAccount:
        return AdminAccount(
            account_id=record["account_id"],
            username=record["username"],
            display_name=record["display_name"],
            role=record["role"],
            status=record["status"],
            password_set=bool(record.get("password_hash")),
            created_at=record.get("created_at"),
            updated_at=record.get("updated_at"),
            last_login_at=record.get("last_login_at"),
        )

    def _admin_account_record(self, username: str) -> dict[str, Any] | None:
        normalized = normalize_admin_login_id(username)
        return next((account for account in self.admin_accounts if account["username"] == normalized), None)

    def _active_owner_count(self) -> int:
        return sum(
            1
            for account in self.admin_accounts
            if account["role"] == "owner" and account["status"] == "active"
        )

    def list_admin_accounts(self) -> list[AdminAccount]:
        return [
            self._admin_account_from_record(account)
            for account in sorted(self.admin_accounts, key=lambda item: item["username"])
        ]

    def get_admin_account(self, username: str) -> AdminAccount | None:
        account = self._admin_account_record(username)
        return self._admin_account_from_record(account) if account else None

    def authenticate_admin_account(self, username: str, password: str) -> AdminAccount | None:
        account = self._admin_account_record(username)
        if not account or account["status"] != "active":
            return None
        if not verify_admin_password(password, account["password_hash"]):
            return None
        account["last_login_at"] = datetime.now(timezone.utc).isoformat()
        return self._admin_account_from_record(account)

    def create_admin_account(
        self,
        payload: AdminAccountCreate,
        *,
        created_by: str,
    ) -> AdminAccount:
        if self._admin_account_record(payload.username):
            raise ValueError("admin_account_exists")
        now = datetime.now(timezone.utc).isoformat()
        account = {
            "account_id": f"acct_{uuid.uuid4().hex[:12]}",
            "username": payload.username,
            "display_name": payload.display_name,
            "role": payload.role,
            "status": payload.status,
            "password_hash": hash_admin_password(payload.password),
            "created_by": created_by,
            "created_at": now,
            "updated_at": now,
            "last_login_at": None,
        }
        self.admin_accounts.append(account)
        return self._admin_account_from_record(account)

    def update_admin_account(
        self,
        username: str,
        payload: AdminAccountUpdate,
    ) -> AdminAccount | None:
        account = self._admin_account_record(username)
        if not account:
            return None
        updates = payload.model_dump(exclude_unset=True)
        next_role = updates.get("role", account["role"])
        next_status = updates.get("status", account["status"])
        if (
            account["role"] == "owner"
            and account["status"] == "active"
            and (next_role != "owner" or next_status != "active")
            and self._active_owner_count() <= 1
        ):
            raise ValueError("last_owner_account")
        if "display_name" in updates and updates["display_name"] is not None:
            account["display_name"] = updates["display_name"]
        if "role" in updates and updates["role"] is not None:
            account["role"] = updates["role"]
        if "status" in updates and updates["status"] is not None:
            account["status"] = updates["status"]
        if "password" in updates and updates["password"]:
            account["password_hash"] = hash_admin_password(updates["password"])
        account["updated_at"] = datetime.now(timezone.utc).isoformat()
        return self._admin_account_from_record(account)

    def delete_admin_account(self, username: str) -> bool:
        account = self._admin_account_record(username)
        if not account:
            return False
        if account["role"] == "owner" and account["status"] == "active" and self._active_owner_count() <= 1:
            raise ValueError("last_owner_account")
        normalized_username = normalize_admin_login_id(username)
        self.admin_accounts = [item for item in self.admin_accounts if item["username"] != normalized_username]
        return True

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

        if any(
            item.event_id == event_id
            and item.user_id == payload.user_id
            and item.status in {"confirmed", "pending_review", "checked_in"}
            for item in self.registrations
        ):
            raise ValueError("duplicate_registration")

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

    def list_faq_rules(self) -> list[FAQRule]:
        return sorted(
            [rule for rule in self.faq_rules if rule.enabled],
            key=lambda rule: (-rule.priority, rule.rule_id),
        )

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

    def record_audit_log(
        self,
        *,
        actor_id: str,
        action: str,
        target_type: str,
        target_id: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        self.audit_logs.append(
            {
                "actor_id": actor_id,
                "action": action,
                "target_type": target_type,
                "target_id": target_id,
                "metadata": metadata or {},
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )

    def record_message(
        self,
        *,
        user_id: str,
        channel: str,
        user_text: str,
        intent: str,
        ai_reply: str,
        source_refs: list[dict[str, str]],
        demo_notice: str,
    ) -> None:
        self.messages.append(
            {
                "user_id": user_id,
                "channel": channel,
                "user_text": user_text,
                "intent": intent,
                "ai_reply": ai_reply,
                "source_refs": source_refs,
                "demo_notice": demo_notice,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )


class SupabaseRepository:
    """Supabase REST repository used when DEMO_MODE=false."""

    def __init__(self, supabase_url: str, service_role_key: str) -> None:
        self.rest_url = f"{supabase_url.rstrip('/')}/rest/v1"
        self.settings = get_settings()
        self._events_cache: list[Event] | None = None
        self._events_cache_expires_at = 0.0
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

    @staticmethod
    def _admin_accounts_table_missing(exc: RuntimeError) -> bool:
        text = str(exc)
        return "supabase_admin_accounts_404" in text or (
            "admin_accounts" in text and ("does not exist" in text or "Could not find" in text)
        )

    @staticmethod
    def _admin_account_from_row(row: dict[str, Any]) -> AdminAccount:
        return AdminAccount(
            account_id=row["account_id"],
            username=row["username"],
            display_name=row["display_name"],
            role=row["role"],
            status=row["status"],
            password_set=bool(row.get("password_hash")),
            created_at=row.get("created_at"),
            updated_at=row.get("updated_at"),
            last_login_at=row.get("last_login_at"),
        )

    def _active_owner_count(self) -> int:
        rows = self._select(
            "admin_accounts",
            {"role": "eq.owner", "status": "eq.active", "select": "account_id"},
        )
        return len(rows)

    def list_admin_accounts(self) -> list[AdminAccount]:
        rows = self._select("admin_accounts", {"order": "username.asc"})
        return [self._admin_account_from_row(row) for row in rows]

    def get_admin_account(self, username: str) -> AdminAccount | None:
        try:
            row = self._single("admin_accounts", "username", normalize_admin_login_id(username))
        except RuntimeError as exc:
            if self._admin_accounts_table_missing(exc):
                return None
            raise
        return self._admin_account_from_row(row) if row else None

    def authenticate_admin_account(self, username: str, password: str) -> AdminAccount | None:
        try:
            row = self._single("admin_accounts", "username", normalize_admin_login_id(username))
        except RuntimeError as exc:
            if self._admin_accounts_table_missing(exc):
                return None
            raise
        if not row or row.get("status") != "active":
            return None
        if not verify_admin_password(password, str(row.get("password_hash") or "")):
            return None
        self._patch_returning(
            "admin_accounts",
            "username",
            normalize_admin_login_id(username),
            {"last_login_at": datetime.now(timezone.utc).isoformat()},
        )
        return self._admin_account_from_row(row)

    def create_admin_account(
        self,
        payload: AdminAccountCreate,
        *,
        created_by: str,
    ) -> AdminAccount:
        row = {
            "account_id": f"acct_{uuid.uuid4().hex[:12]}",
            "username": payload.username,
            "display_name": payload.display_name,
            "role": payload.role,
            "status": payload.status,
            "password_hash": hash_admin_password(payload.password),
            "created_by": created_by,
        }
        try:
            return self._admin_account_from_row(self._insert_returning("admin_accounts", row))
        except RuntimeError as exc:
            if "duplicate key" in str(exc) or "23505" in str(exc):
                raise ValueError("admin_account_exists") from exc
            raise

    def update_admin_account(
        self,
        username: str,
        payload: AdminAccountUpdate,
    ) -> AdminAccount | None:
        normalized_username = normalize_admin_login_id(username)
        current = self._single("admin_accounts", "username", normalized_username)
        if not current:
            return None
        updates = payload.model_dump(exclude_unset=True)
        next_role = updates.get("role", current["role"])
        next_status = updates.get("status", current["status"])
        if (
            current["role"] == "owner"
            and current["status"] == "active"
            and (next_role != "owner" or next_status != "active")
            and self._active_owner_count() <= 1
        ):
            raise ValueError("last_owner_account")

        row_updates: dict[str, Any] = {}
        for key in ["display_name", "role", "status"]:
            if key in updates and updates[key] is not None:
                row_updates[key] = updates[key]
        if updates.get("password"):
            row_updates["password_hash"] = hash_admin_password(updates["password"])
        if not row_updates:
            return self._admin_account_from_row(current)
        row = self._patch_returning("admin_accounts", "username", normalized_username, row_updates)
        return self._admin_account_from_row(row) if row else None

    def delete_admin_account(self, username: str) -> bool:
        normalized_username = normalize_admin_login_id(username)
        current = self._single("admin_accounts", "username", normalized_username)
        if not current:
            return False
        if current["role"] == "owner" and current["status"] == "active" and self._active_owner_count() <= 1:
            raise ValueError("last_owner_account")
        return self._delete_returning("admin_accounts", "username", normalized_username)

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

    def _rpc(self, function_name: str, json_body: dict[str, Any]) -> Any:
        response = self.client.post(f"{self.rest_url}/rpc/{function_name}", json=json_body)
        if response.status_code >= 400:
            text = response.text[:500]
            for detail in [
                "event_not_found",
                "registration_not_required",
                "event_not_open",
                "invalid_user_id",
                "invalid_contact_name",
                "invalid_party_size",
                "duplicate_registration",
                "event_capacity_exceeded",
            ]:
                if detail in text:
                    raise ValueError(detail)
            raise RuntimeError(f"supabase_rpc_{function_name}_{response.status_code}: {text}")
        if response.status_code == 204 or not response.content:
            return []
        return response.json()

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

    def _events_cache_is_valid(self) -> bool:
        return self._events_cache is not None and time.monotonic() < self._events_cache_expires_at

    def _clear_event_cache(self) -> None:
        self._events_cache = None
        self._events_cache_expires_at = 0.0

    def list_events(self) -> list[Event]:
        if self._events_cache_is_valid():
            return self._events_cache or []
        rows = self._select("events", {"order": "event_date.asc,start_time.asc"})
        events = [self._event_from_row(row) for row in rows]
        ttl = max(0, self.settings.event_cache_ttl_seconds)
        if ttl > 0:
            self._events_cache = events
            self._events_cache_expires_at = time.monotonic() + ttl
        return events

    def get_event(self, event_id: str) -> Event | None:
        if self._events_cache_is_valid():
            cached_event = next(
                (event for event in self._events_cache or [] if event.event_id == event_id),
                None,
            )
            if cached_event:
                return cached_event
        row = self._single("events", "event_id", event_id)
        return self._event_from_row(row) if row else None

    def create_event(self, payload: EventCreate) -> Event:
        event_id = payload.event_id or f"evt_admin_{uuid.uuid4().hex[:8]}"
        if self.get_event(event_id):
            raise ValueError("event_already_exists")
        if payload.capacity is not None and payload.registered_count > payload.capacity:
            raise ValueError("event_capacity_below_registrations")
        event = self._event_from_row(self._insert_returning("events", self._event_row(payload, event_id)))
        self._clear_event_cache()
        return event

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
        self._clear_event_cache()
        return self._event_from_row(row) if row else None

    def delete_event(self, event_id: str) -> bool:
        deleted = self._delete_returning("events", "event_id", event_id)
        if deleted:
            self._clear_event_cache()
        return deleted

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
        rows = self._rpc(
            "register_for_event",
            {
                "p_event_id": event_id,
                "p_user_id": payload.user_id,
                "p_contact_name": payload.contact_name,
                "p_phone": payload.phone,
                "p_party_size": payload.party_size,
                "p_reminder_opt_in": payload.reminder_opt_in,
                "p_note": payload.note,
            },
        )
        if not rows:
            raise RuntimeError("supabase_registration_empty_rpc")
        registration = Registration.model_validate(rows[0] if isinstance(rows, list) else rows)
        self._clear_event_cache()
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

    def list_faq_rules(self) -> list[FAQRule]:
        try:
            rows = self._select(
                "faq_rules",
                {"enabled": "eq.true", "order": "priority.desc,rule_id.asc"},
            )
        except RuntimeError as exc:
            if "supabase_faq_rules_404" in str(exc) or "does not exist" in str(exc):
                return []
            raise
        return [FAQRule.model_validate(row) for row in rows]

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

    def search_knowledge_chunks(self, query_embedding: list[float], limit: int = 3) -> list[dict[str, Any]]:
        rows = self._rpc(
            "match_knowledge_chunks",
            {
                "query_embedding": query_embedding,
                "match_threshold": 0.15,
                "match_count": limit,
            },
        )
        return rows if isinstance(rows, list) else []

    def dashboard_summary(self) -> DashboardSummary:
        rows = self._select("dashboard_snapshots", {"order": "snapshot_date.desc", "limit": "1"})
        if not rows:
            raise RuntimeError("supabase_dashboard_snapshot_missing")
        return DashboardSummary.model_validate(rows[0])

    def record_message(
        self,
        *,
        user_id: str,
        channel: str,
        user_text: str,
        intent: str,
        ai_reply: str,
        source_refs: list[dict[str, str]],
        demo_notice: str,
    ) -> None:
        self._request(
            "POST",
            "messages",
            json_body={
                "user_id": user_id,
                "channel": channel,
                "user_text": user_text,
                "intent": intent,
                "ai_reply": ai_reply,
                "source_refs": source_refs,
                "demo_notice": demo_notice,
            },
            prefer="return=minimal",
        )

    def record_audit_log(
        self,
        *,
        actor_id: str,
        action: str,
        target_type: str,
        target_id: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        self._insert_returning(
            "audit_logs",
            {
                "actor_id": actor_id,
                "action": action,
                "target_type": target_type,
                "target_id": target_id,
                "metadata": metadata or {},
            },
        )


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
            try:
                _repo = SupabaseRepository(settings.supabase_url, settings.supabase_service_role_key)
            except Exception:
                if not settings.supabase_fallback_to_demo:
                    raise
                logger.exception("Supabase repository initialization failed; falling back to demo data")
                _repo = DemoRepository()
    return _repo
