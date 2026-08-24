from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "local"
    demo_mode: bool = True
    api_base_url: str = "http://localhost:8000"
    frontend_base_url: str = "http://localhost:5173"
    allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    line_channel_id: str | None = None
    line_channel_secret: str | None = None
    line_channel_access_token: str | None = None
    line_login_channel_id: str | None = None
    line_liff_id: str | None = None
    line_skip_signature_validation: bool = False

    openai_api_key: str | None = None
    openai_line_model: str = "gpt-5-mini"
    openai_quality_model: str = "gpt-5"
    openai_embedding_model: str = "text-embedding-3-large"

    supabase_url: str | None = None
    supabase_service_role_key: str | None = None
    supabase_anon_key: str | None = None
    supabase_fallback_to_demo: bool = True

    admin_demo_token: str = "temple-ai-os-admin-demo"
    admin_tokens: str = ""
    admin_accounts: str = ""
    admin_username: str = "admin"
    admin_password: str = ""
    admin_session_secret: str = ""
    admin_session_ttl_seconds: int = 12 * 60 * 60
    rag_service_cache_ttl_seconds: int = 300
    event_cache_ttl_seconds: int = 60
    project_root: Path = Field(default_factory=lambda: Path(__file__).resolve().parents[3])

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env", "../../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]

    @property
    def admin_token_map(self) -> dict[str, str]:
        tokens: dict[str, str] = {}
        for item in self.admin_tokens.split(","):
            actor, separator, token = item.partition(":")
            if separator and actor.strip() and token.strip():
                tokens[actor.strip()[:80]] = token.strip()
        return tokens

    @property
    def admin_account_map(self) -> dict[str, str]:
        accounts: dict[str, str] = {}
        for item in self.admin_accounts.split(","):
            username, separator, password = item.partition(":")
            if separator and username.strip() and password.strip():
                accounts[username.strip()[:80]] = password.strip()
        if self.admin_username.strip() and self.admin_password.strip():
            accounts[self.admin_username.strip()[:80]] = self.admin_password.strip()
        return accounts

    @property
    def demo_data_dir(self) -> Path:
        return self.app_data_dir / "demo"

    @property
    def app_data_dir(self) -> Path:
        return Path(__file__).resolve().parents[1] / "data"

    @property
    def temple_profile_path(self) -> Path:
        return self.app_data_dir / "temple_profile.json"

    @property
    def knowledge_dir(self) -> Path:
        return self.app_data_dir / "knowledge-base"


@lru_cache
def get_settings() -> Settings:
    return Settings()
