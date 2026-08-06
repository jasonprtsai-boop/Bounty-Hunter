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
    openai_line_model: str = "gpt-5.6-luna"
    openai_quality_model: str = "gpt-5.6-terra"
    openai_embedding_model: str = "text-embedding-3-large"

    supabase_url: str | None = None
    supabase_service_role_key: str | None = None
    supabase_anon_key: str | None = None

    admin_demo_token: str = "temple-ai-os-admin-demo"
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
    def demo_data_dir(self) -> Path:
        return self.project_root.parent / "data" / "temple-ai-os-demo"

    @property
    def temple_profile_path(self) -> Path:
        return self.project_root.parents[1] / "00_資料來源" / "宮廟資料" / "萬春宮資料包" / "temple_profile.json"

    @property
    def knowledge_dir(self) -> Path:
        return self.project_root.parents[1] / "05_資料庫與RAG" / "knowledge-base" / "萬春宮"


@lru_cache
def get_settings() -> Settings:
    return Settings()
