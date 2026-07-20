from functools import lru_cache
from typing import Literal

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    environment: Literal["development", "production", "test"] = "development"
    database_url: str = Field(default="postgresql+asyncpg://lifeline:lifeline@localhost:5432/lifeline")
    redis_url: str = Field(default="redis://localhost:6379/0")
    secret_key: str = Field(default="change-me-in-production")
    access_token_expire_minutes: int = Field(default=30)
    refresh_token_expire_days: int = Field(default=30)
    frontend_url: str = Field(default="http://localhost:3000")
    smtp_host: str | None = None
    smtp_port: int | None = None
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_from_email: str = Field(default="noreply@lifelineindia.in")
    smtp_use_tls: bool = Field(default=True)

    @model_validator(mode="before")
    @classmethod
    def coerce_empty_strings(cls, values: dict) -> dict:
        """Coerce empty strings to None for optional fields to avoid Pydantic type errors."""
        for field in ("smtp_host", "smtp_port", "smtp_username", "smtp_password"):
            if field in values and values[field] == "":
                values[field] = None
        return values


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
