from app.db.supabase import Repository
from app.schemas.common import Registration
from app.services.flex_templates import registration_confirmation
from app.services.line_client import LineClient, text_message


class NotificationService:
    def __init__(self, repository: Repository) -> None:
        self.repository = repository
        self.line = LineClient()

    async def send_registration_confirmation(self, registration: Registration) -> dict[str, object]:
        event = self.repository.get_event(registration.event_id)
        if not event:
            return {"sent": False, "reason": "event_not_found"}
        user = self.repository.get_user(registration.user_id)
        if not user or registration.user_id.startswith("demo_"):
            return {"sent": False, "reason": "demo_user_or_missing_line_id"}
        return await self.line.push_message(
            registration.user_id,
            [registration_confirmation(event, registration)],
        )

    async def send_test_notification(self, user_id: str, text: str) -> dict[str, object]:
        return await self.line.push_message(user_id, [text_message(text)])
