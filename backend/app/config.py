from __future__ import annotations

import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./trud-local.db"
    bot_token: str = ""
    public_base_url: str = ""
    web_app_url: str = ""
    webhook_secret: str = "trud-local-dev"
    cors_origins: str = "*"
    auth_bypass: bool = False
    smoke_test_token: str = ""

    model_config = {"env_prefix": "TRUD_"}


def _resolve_database_url() -> str:
    """Resolve database URL with priority:
    1. TRUD_DATABASE_URL (explicit)
    2. DATABASE_URL (Railway default) — auto-add +asyncpg scheme
    3. Local SQLite fallback for dev
    """
    trud_url = os.environ.get("TRUD_DATABASE_URL")
    if trud_url:
        return trud_url

    railway_url = os.environ.get("DATABASE_URL")
    if railway_url:
        # Railway gives postgresql://, we need postgresql+asyncpg://
        if railway_url.startswith("postgresql://"):
            return railway_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return railway_url

    return "sqlite+aiosqlite:///./trud-local.db"


# Override database_url with resolved value before creating settings
os.environ.setdefault("TRUD_DATABASE_URL", _resolve_database_url())

settings = Settings()
