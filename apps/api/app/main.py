from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router
from app.core.config import settings
from app.core.logging import configure_logging
from app.core.redis import redis_client
from app.db.base import Base
from app.db.session import check_database_connection, check_redis_connection, engine
import app.models.auth  # noqa: F401

configure_logging()

app = FastAPI(
    title="Lifeline India API",
    description="Production-ready emergency healthcare backend",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")


@app.on_event("startup")
async def startup_event() -> None:
    await redis_client.initialize()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.on_event("shutdown")
async def shutdown_event() -> None:
    await redis_client.close()


@app.get("/health")
async def health() -> dict[str, object]:
    db_ok = await check_database_connection()
    redis_ok = await check_redis_connection()
    return {
        "status": "ok" if db_ok and redis_ok else "degraded",
        "database": "ok" if db_ok else "unavailable",
        "redis": "ok" if redis_ok else "unavailable",
    }


@app.get("/api/v1/health")
async def health_v1() -> dict[str, object]:
    return await health()


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Lifeline India API is running"}
