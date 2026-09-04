from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import admin, chat, events, liff, line, member
from app.core.config import get_settings
from app.core.security import resolve_admin_principal
from app.db.supabase import get_repository
from app.schemas.common import ApiResponse
from app.services.rag_service import warm_fast_reply_cache


settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    try:
        warm_fast_reply_cache(get_repository())
    except Exception:
        pass
    yield


app = FastAPI(
    title="萬春宮線上服務 API",
    version="0.1.0",
    description="Wan Chun Gong service backend for LINE, LIFF, public pages, and admin dashboard.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def audit_admin_mutations(request, call_next):
    response = await call_next(request)
    if (
        request.url.path.startswith("/api/admin")
        and not request.url.path.startswith("/api/admin/auth/")
        and request.method in {"POST", "PUT", "PATCH", "DELETE"}
        and response.status_code < 400
    ):
        try:
            actor = resolve_admin_principal(request.headers.get("authorization")).actor
        except Exception:
            actor = "admin"
        if actor == "admin" and settings.demo_mode:
            actor = request.headers.get("x-admin-actor", "admin")[:80] or "admin"
        try:
            get_repository().record_audit_log(
                actor_id=actor,
                action=request.method,
                target_type=request.url.path,
                metadata={"status_code": response.status_code},
            )
        except Exception:
            pass
    return response

app.include_router(line.router, prefix="/api/line", tags=["LINE"])
app.include_router(liff.router, prefix="/api", tags=["LIFF"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(events.router, prefix="/api", tags=["Events"])
app.include_router(member.router, prefix="/api", tags=["Member"])
app.include_router(admin.auth_router, prefix="/api/admin", tags=["Admin"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])


@app.get("/health", response_model=ApiResponse[dict[str, str]])
async def health() -> ApiResponse[dict[str, str]]:
    return ApiResponse(data={"status": "ok", "app_env": settings.app_env})
