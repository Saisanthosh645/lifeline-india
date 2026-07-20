import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import router
from app.core.config import settings
from app.core.logging import configure_logging
from app.core.redis import redis_client
from app.db.base import Base
from app.db.session import check_database_connection, check_redis_connection, engine
import app.models.auth  # noqa: F401

logger = logging.getLogger(__name__)
configure_logging()

app = FastAPI(
    title="Lifeline India API",
    description="Production-ready emergency healthcare backend",
    version="0.1.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────
# In production, restrict to the actual frontend URL.
# In development, allow localhost origins.
if settings.environment == "production":
    cors_origins = [settings.frontend_url]
else:
    cors_origins = [settings.frontend_url, "http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")


# ── Global exception handler ──────────────────────────────────────────────
# In production, never leak stack traces to the client.
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    if settings.environment == "production":
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )
    # In development, re-raise so FastAPI's debug handler shows the traceback.
    raise exc


@app.on_event("startup")
async def startup_event() -> None:
    logger.info("Starting Lifeline India API (environment=%s)", settings.environment)
    await redis_client.initialize()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Startup complete")


@app.on_event("shutdown")
async def shutdown_event() -> None:
    logger.info("Shutting down Lifeline India API")
    await redis_client.close()


@app.get("/health")
async def health() -> dict[str, object]:
    db_ok = await check_database_connection()
    redis_ok = await check_redis_connection()
    status = "ok" if db_ok and redis_ok else "degraded"
    return {
        "status": status,
        "database": "ok" if db_ok else "unavailable",
        "redis": "ok" if redis_ok else "unavailable",
    }


@app.get("/api/v1/health")
async def health_v1() -> dict[str, object]:
    return await health()


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Lifeline India API is running"}
