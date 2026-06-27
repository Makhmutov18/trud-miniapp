from __future__ import annotations

import logging
import secrets

from fastapi import Header, HTTPException

from app.config import settings
from app.services.telegram_service import verify_init_data

logger = logging.getLogger(__name__)


async def get_current_user(x_telegram_init_data: str = Header(...)):
    """Extract and verify Telegram user from initData header."""
    user_data = verify_init_data(x_telegram_init_data)
    if not user_data:
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing Telegram authentication",
        )
    return user_data


async def optional_user(x_telegram_init_data: str | None = Header(default=None)):
    """Optionally extract Telegram user (does not fail if missing)."""
    if not x_telegram_init_data:
        return None
    return verify_init_data(x_telegram_init_data)


async def require_mutation_auth(
    x_telegram_init_data: str | None = Header(default=None),
    x_trud_smoke_token: str | None = Header(default=None),
):
    """Allow writes only from Telegram auth, local bypass, or smoke token."""
    if settings.auth_bypass:
        return {"authenticated": True, "auth": "bypass"}

    smoke_token = settings.smoke_test_token.strip()
    if smoke_token and x_trud_smoke_token and secrets.compare_digest(
        smoke_token, x_trud_smoke_token
    ):
        logger.info("telegram_auth auth_ok")
        return {"authenticated": True, "auth": "smoke"}

    if not x_telegram_init_data:
        logger.info("telegram_auth missing_init_data")
        raise HTTPException(
            status_code=401,
            detail="Missing Telegram authentication",
        )

    user_data = verify_init_data(x_telegram_init_data)
    if not user_data:
        raise HTTPException(
            status_code=403,
            detail="Invalid Telegram authentication",
        )

    return user_data
