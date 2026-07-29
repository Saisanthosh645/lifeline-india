import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.database_url, echo=False)
    async with engine.connect() as conn:
        for table in ['users','refresh_sessions','email_otp_verifications','roles']:
            result = await conn.execute(text("select column_name, data_type from information_schema.columns where table_name=:table order by ordinal_position"), {'table': table})
            print(table)
            for row in result.fetchall():
                print(row)
            print()
    await engine.dispose()

asyncio.run(main())
