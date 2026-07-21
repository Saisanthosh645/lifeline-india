from sqlalchemy import text

from app.db.session import engine


async def init_db() -> str:
    async with engine.begin() as conn:
        await conn.run_sync(lambda sync_conn: sync_conn.execute(text("SELECT 1")))
    return "ok"
