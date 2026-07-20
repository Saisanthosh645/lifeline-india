import logging

from redis.asyncio import Redis
from redis.exceptions import RedisError

from app.core.config import settings


logger = logging.getLogger(__name__)


class RedisClient:
    def __init__(self) -> None:
        self.client = Redis.from_url(settings.redis_url, decode_responses=True)
        self.connected = False

    async def initialize(self) -> None:
        try:
            self.connected = await self.client.ping() is True
        except RedisError as exc:
            self.connected = False
            logger.warning("Redis initialization failed: %s", exc)

    async def ping(self) -> bool:
        if not self.connected:
            return False
        try:
            return await self.client.ping() is True
        except RedisError:
            self.connected = False
            return False

    async def close(self) -> None:
        try:
            await self.client.close()
        except RedisError:
            logger.warning("Redis close failed")


redis_client = RedisClient()


async def get_redis_client() -> Redis:
    return redis_client.client
