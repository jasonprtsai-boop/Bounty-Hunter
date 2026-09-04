from functools import lru_cache
from pathlib import Path

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.core.admin_identity import normalize_admin_login_id


DEFAULT_ALLOWED_SITE_ORIGINS = (
    "https://wanchun-gong-service.jasonprtsai.chatgpt.site",
    "https://temple-ai-os-admin-20260828.jeremy40713.chatgpt.site",
)


class Settings(BaseSettings):
    app_env: str = "local"
    demo_mode: bool = True
    wan_chun_gong_service_mode: str = ""
    api_base_url: str = "http://localhost:8000"
    frontend_base_url: str = "http://localhost:5173"
    allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174"

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
    model_api_key: str | None = None
    line_reply_model: str = ""
    quality_model: str = ""
    embedding_model: str = ""

    supabase_url: str | None = None
    supabase_service_role_key: str | None = None
    supabase_anon_key: str | None = None
    supabase_fallback_to_demo: bool = True
    supabase_fallback_to_local: bool | None = None

    admin_demo_token: str = "temple-ai-os-admin-demo"
    admin_bootstrap_token: str = ""
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

    @model_validator(mode="after")
    def apply_service_mode_aliases(self) -> "Settings":
        service_mode = self.wan_chun_gong_service_mode.strip().lower()
        if service_mode:
            database_modes = {"database", "supabase", "production", "live", "formal"}
            local_modes = {"local", "fallback", "sample", "offline"}
            if service_mode in database_modes:
                self.demo_mode = False
            elif service_mode in local_modes:
                self.demo_mode = True
            else:
                raise ValueError(
                    "WAN_CHUN_GONG_SERVICE_MODE must be one of: "
                    "database, supabase, production, live, formal, local, fallback, sample, offline"
                )
        if self.admin_bootstrap_token.strip():
            self.admin_demo_token = self.admin_bootstrap_token.strip()
        if self.model_api_key and not self.openai_api_key:
            self.openai_api_key = self.model_api_key
        if self.line_reply_model.strip():
            self.openai_line_model = self.line_reply_model.strip()
        if self.quality_model.strip():
            self.openai_quality_model = self.quality_model.strip()
        if self.embedding_model.strip():
            self.openai_embedding_model = self.embedding_model.strip()
        if self.supabase_fallback_to_local is not None:
            self.supabase_fallback_to_demo = self.supabase_fallback_to_local
        return self

    @property
    def origins(self) -> list[str]:
        origins: list[str] = []
        seen: set[str] = set()

        def add_origin(origin: str | None) -> None:
            value = (origin or "").strip().rstrip("/")
            if value and value not in seen:
                origins.append(value)
                seen.add(value)

        for origin in self.allowed_origins.split(","):
            add_origin(origin)
        add_origin(self.frontend_base_url)
        for origin in DEFAULT_ALLOWED_SITE_ORIGINS:
            add_origin(origin)
        return origins

    @property
    def admin_token_map(self) -> dict[str, str]:
        tokens: dict[str, str] = {}
        for item in self.admin_tokens.split(","):
            actor, separator, token = item.partition(":")
            if separator and actor.strip() and token.strip():
                tokens[normalize_admin_login_id(actor)] = token.strip()
        return tokens

    @property
    def admin_account_map(self) -> dict[str, str]:
        accounts: dict[str, str] = {}
        for item in self.admin_accounts.split(","):
            username, separator, password = item.partition(":")
            if separator and username.strip() and password.strip():
                accounts[normalize_admin_login_id(username)] = password.strip()
        if self.admin_username.strip() and self.admin_password.strip():
            accounts[normalize_admin_login_id(self.admin_username)] = self.admin_password.strip()
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
