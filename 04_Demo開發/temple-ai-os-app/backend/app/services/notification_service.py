from datetime import UTC, datetime

from app.db.supabase import Repository
from app.schemas.common import NotificationJob, NotificationJobUpdate, Registration
from app.services.flex_templates import (
    registration_cancellation,
    registration_confirmation,
    registration_reminder,
    registration_waitlist_notice,
)
from app.services.line_client import LineClient, text_message


REGISTRATION_JOB_TYPES = {
    "registration_confirmation",
    "event_reminder",
    "event_reminder_day_before",
    "event_reminder_day_of",
    "registration_cancellation",
}
WAITLIST_JOB_TYPES = {"registration_waitlist", "event_capacity_full"}


def _parse_scheduled_at(value: str) -> datetime:
    scheduled = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if scheduled.tzinfo is None:
        scheduled = scheduled.replace(tzinfo=UTC)
    return scheduled


class NotificationService:
    def __init__(self, repository: Repository) -> None:
        self.repository = repository
        self.line = LineClient()

    def _should_push_to_user(self, user_id: str) -> bool:
        user = self.repository.get_user(user_id)
        return bool(user and not user_id.startswith("demo_"))

    def _registration_by_id(self, registration_id: str) -> Registration | None:
        return next(
            (
                registration
                for registration in self.repository.list_registrations()
                if registration.registration_id == registration_id
            ),
            None,
        )

    def _registration_for_job(self, job: NotificationJob) -> Registration | None:
        registration_id = str(job.payload.get("registration_id") or "").strip()
        if registration_id:
            return self._registration_by_id(registration_id)
        registrations = self.repository.list_registrations(job.target_user_id)
        if job.event_id:
            registrations = [item for item in registrations if item.event_id == job.event_id]
        return registrations[0] if registrations else None

    async def _push_or_skip(
        self,
        user_id: str,
        message: dict,
        *,
        message_type: str,
    ) -> dict[str, object]:
        if not self._should_push_to_user(user_id):
            return {
                "sent": False,
                "reason": "demo_user_or_missing_line_id",
                "message_type": message_type,
            }
        result = await self.line.push_message(user_id, [message])
        return {**result, "message_type": message_type}

    async def send_registration_confirmation(self, registration: Registration) -> dict[str, object]:
        event = self.repository.get_event(registration.event_id)
        if not event:
            return {"sent": False, "reason": "event_not_found"}
        return await self._push_or_skip(
            registration.user_id,
            registration_confirmation(event, registration),
            message_type="registration_confirmation",
        )

    async def send_registration_reminder(
        self,
        registration: Registration,
        *,
        reminder_type: str,
    ) -> dict[str, object]:
        event = self.repository.get_event(registration.event_id)
        if not event:
            return {"sent": False, "reason": "event_not_found"}
        return await self._push_or_skip(
            registration.user_id,
            registration_reminder(event, registration, reminder_type=reminder_type),
            message_type=f"event_reminder_{reminder_type}",
        )

    async def send_registration_cancellation(self, registration: Registration) -> dict[str, object]:
        event = self.repository.get_event(registration.event_id)
        if not event:
            return {"sent": False, "reason": "event_not_found"}
        return await self._push_or_skip(
            registration.user_id,
            registration_cancellation(event, registration),
            message_type="registration_cancellation",
        )

    async def send_waitlist_notice(
        self,
        *,
        event_id: str,
        user_id: str,
        party_size: int = 1,
    ) -> dict[str, object]:
        event = self.repository.get_event(event_id)
        if not event:
            return {"sent": False, "reason": "event_not_found"}
        return await self._push_or_skip(
            user_id,
            registration_waitlist_notice(event, user_id=user_id, party_size=party_size),
            message_type="registration_waitlist",
        )

    async def send_notification_job(self, job: NotificationJob) -> dict[str, object]:
        job_type = job.job_type
        if job_type in REGISTRATION_JOB_TYPES:
            registration = self._registration_for_job(job)
            if not registration:
                return {"sent": False, "reason": "registration_not_found", "message_type": job_type}
            if job_type == "registration_confirmation":
                return await self.send_registration_confirmation(registration)
            if job_type == "registration_cancellation":
                return await self.send_registration_cancellation(registration)
            reminder_type = str(job.payload.get("reminder_type") or "").strip()
            if not reminder_type:
                reminder_type = "day_of" if job_type == "event_reminder_day_of" else "day_before"
            return await self.send_registration_reminder(registration, reminder_type=reminder_type)

        if job_type in WAITLIST_JOB_TYPES:
            if not job.event_id or not job.target_user_id:
                return {"sent": False, "reason": "event_id_or_target_user_missing", "message_type": job_type}
            try:
                party_size = int(job.payload.get("party_size") or 1)
            except (TypeError, ValueError):
                party_size = 1
            return await self.send_waitlist_notice(
                event_id=job.event_id,
                user_id=job.target_user_id,
                party_size=party_size,
            )

        target_user_id = job.target_user_id or "demo_u001"
        text = str(job.payload.get("text") or "Temple AI OS 測試推播：這是 Demo 訊息。")
        result = await self.send_test_notification(target_user_id, text)
        return {**result, "message_type": "text"}

    async def send_due_notification_jobs(
        self,
        *,
        now: datetime | None = None,
        limit: int = 50,
    ) -> dict[str, object]:
        now = now or datetime.now(UTC)
        due_jobs: list[NotificationJob] = []
        for job in self.repository.list_notification_jobs():
            if job.status != "ready" or not job.scheduled_at:
                continue
            try:
                scheduled_at = _parse_scheduled_at(job.scheduled_at)
            except ValueError:
                continue
            if scheduled_at <= now:
                due_jobs.append(job)

        due_jobs.sort(key=lambda job: job.scheduled_at or "")
        results: list[dict[str, object]] = []
        for job in due_jobs[: max(0, limit)]:
            result = await self.send_notification_job(job)
            next_status = "sent" if result.get("sent") is True else "failed"
            self.repository.update_notification_job(
                job.job_id,
                NotificationJobUpdate(
                    status=next_status,
                    payload={**job.payload, "last_send_result": result},
                ),
            )
            results.append({"job_id": job.job_id, "status": next_status, "result": result})

        return {"processed": len(results), "results": results}

    async def send_test_notification(self, user_id: str, text: str) -> dict[str, object]:
        return await self.line.push_message(user_id, [text_message(text)])
