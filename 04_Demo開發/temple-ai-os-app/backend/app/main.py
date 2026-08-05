from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import admin, chat, events, liff, line, member
from app.core.config import get_settings
from app.schemas.common import ApiResponse


settings = get_settings()

app = FastAPI(
    title="Temple AI OS API",
    version="0.1.0",
    description="Wan Chun Gong demo backend for LINE, LIFF, AI, and admin dashboard.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(line.router, prefix="/api/line", tags=["LINE"])
app.include_router(liff.router, prefix="/api", tags=["LIFF"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(events.router, prefix="/api", tags=["Events"])
app.include_router(member.router, prefix="/api", tags=["Member"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])


@app.get("/health", response_model=ApiResponse[dict[str, str]])
async def health() -> ApiResponse[dict[str, str]]:
    return ApiResponse(data={"status": "ok", "app_env": settings.app_env})

