from __future__ import annotations

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://localhost:5432/trud"
    bot_token: str = ""
    public_base_url: str = ""
    web_app_url: str = ""
    webhook_secret: str = "trud-local-dev"
    cors_origins: str = "*"

    model_config = {"env_prefix": "TRUD_"}


settings = Settings()